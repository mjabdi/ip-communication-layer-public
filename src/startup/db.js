const config = require('config');
const logger = require('./../utils/logger')();
const r = require('rethinkdb');
const application = require('./../utils/application');
const Message = require('./../models/message');

let _connection;


const initDB = () => {

    if (_connection) {
        logger.console.warn("Trying to init DB again!");
        return;
    }

    r.connect({
        host : config.DBHost,
        port : config.DBPort,
        db: config.DBName
    }, function(err, conn) {
        if (err) {
            logger.fatal('could not connect to the DB!');
            application.shutdown();
        }
        else
        {
            logger.info(`DB Initialized : connected to ${config.DBHost}:${config.DBPort}:${config.DBName}`);
            
            r.dbCreate(config.DBName).run(conn,(result) => {
                _connection = conn;
                conn.on('close', function() {
                    logger.fatal('connection lost to the DB!');
                    application.shutdown();
                });
            });
        }
    });
}

const getConnection = () =>
{
    return _connection;
}

const registerRealtimeMessageFeed = (bank ,socketConnection, callback) =>
{
    var table = bank + '_in';

    if (!_connection)
    {
        logger.fatal('trying to register for changefeed but DB is disconnected!');
        application.shutdown();
        return;
    }

    r.db(config.DBName).tableCreate(table).run(_connection, (result) => {
        r.db(config.DBName).table(table).changes().run(_connection, function (err, cursor) {
            if (err) throw err;
            socketConnection.Cursor = cursor;
            logger.info(' Bank ' + socketConnection.Bank + ' changefeed subscribed.');
            cursor.each(function (err, row) {
              if (err) throw err;

              if (row.new_val && !row.old_val)
                callback(socketConnection.Bank, row.new_val);
            });
          });
    });
}

const processAllNeworPendingMessages = (bank ,socketConnection, callback) =>
{
    var table = bank + '_in';

    if (!_connection)
    {
        logger.fatal('trying to get pending messages but DB is disconnected!');
        application.shutdown();
        return;
    }

    r.db(config.DBName).tableCreate(table).run(_connection, (result) => {
        r.db(config.DBName).table(table).filter(r.row('status').eq('sent').not()).run(_connection, function (err, cursor) {
            if (err) throw err;
            logger.info(`'${bank}' : checking for pending messages...`);
            cursor.each(function (err, row) {
                if (err) throw err;
                logger.info(`processing pending message : '${JSON.stringify(row)}'`);
                callback(socketConnection.Bank, row);
            });
            logger.info(`'${bank}' : checking for pending messages done.`);
          });
    });
}

const addNewMessageToQueue = (payload , bank) => {
    return new Promise((resolve, reject) => {
        var table = bank + '_in';
        var message = new Message(payload);
        r.db(config.DBName).table(table).insert(message).run(_connection,(err,result) =>
        {
            if (err) 
            {
                reject(err);
            }
            else{
                if (result.errors > 0)
                {
                    reject(result);
                }
                else
                {
                    resolve({id : result.generated_keys[0]});
                }
            }
        });
    });
}

const markMessageAsPending = (id , bank) => {
    return new Promise((resolve, reject) => {
        var table = bank + '_in';
        r.db(config.DBName).table(table).get(id).update({status: 'pending'}).run(_connection,(err,result) =>
        {
            if (err) 
            {
                reject(err);
            }
            else{
                resolve(result.new_val);
            }
        });
    });
}

const markMessageAsSent = (id , bank) => {
    return new Promise((resolve, reject) => {
        var table = bank + '_in';
        r.db(config.DBName).table(table).get(id).update({status: 'sent'}).run(_connection,(err,result) =>
        {
            if (err) 
            {
                reject(err);
            }
            else{
                resolve(result.new_val);
            }
        });
    });
}




module.exports = {
    getConnection,
    initDB,
    registerRealtimeMessageFeed,
    processAllNeworPendingMessages,
    addNewMessageToQueue,
    markMessageAsPending,
    markMessageAsSent
}




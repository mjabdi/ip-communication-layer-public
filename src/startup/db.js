const config = require('config');
const logger = require('./../utils/logger')();
const r = require('rethinkdb');
const application = require('./../utils/application');

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

const registerRealtimeMessageFeed = (table ,callback ,socketConnection) =>
{
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
              callback(socketConnection.Bank, JSON.stringify(row));
            });
          });
    });
}


module.exports = {
    getConnection,
    initDB,
    registerRealtimeMessageFeed
}




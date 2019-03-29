const config = require('config');
const logger = require('./../utils/logger')();
const r = require('rethinkdb');
const application = require('./../utils/application');

let _connection;

module.exports = {
    getConnection,
    initDB
}

function initDB(){

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
            _connection = conn;
            conn.on('close', function() {
                logger.fatal('connection lost to the DB!');
                application.shutdown();
            });
        }
    });
}

function getConnection()
{
    return _connection;
}

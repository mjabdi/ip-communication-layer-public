const publisher = {};

const config = require('config');
const logger = require('./../utils/logger')();
const aesWrapper = require('./../utils/aes-wrapper');
const bankConnections = require('./bankconnections');
const redis = require('./../utils/redis');

//const io = require('socket.io-emitter')(`redis://:${config.RedisPass}@${config.RedisHost}:${config.RedisPort}`);
const io = require('socket.io-emitter')(redis.client());


publisher.sendMessage = async (bank, msg) =>
{
    var conn = await redis.client().getAsync(`banks:${bank}`);
    if (conn != null)
    {
        var socket_id = JSON.parse(conn).id;
        io.to(socket_id).emit('message' , msg);
        logger.info(`socket : ${socket_id}`);
        logger.info(`sending ${JSON.stringify(msg)} to ${bank}`);
    }else
    {
        var count = 0;
        var timer = setInterval(async () => { 
            count++; 
            conn = await redis.client().getAsync(`banks:${bank}`);
            if (conn != null)
            {
                socket_id = JSON.parse(conn).id;
                io.to(socket_id).emit('message' , msg);
                logger.info(`socket : ${socket_id}`);
                logger.info(`sending ${JSON.stringify(msg)} to ${bank}`);
                clearInterval(timer); 
            }
            else if (count > 5) { 
                clearInterval(timer); 
                logger.error(`could not send ${JSON.stringify(msg)} to ${bank}`);
            } 
        }, 2000);  

        logger.error(`could not send ${JSON.stringify(msg)} to ${bank}`);
    }
}

module.exports = publisher;
const publisher = {};

const logger = require('./../utils/logger')();
const aesWrapper = require('./../utils/aes-wrapper');
const redis = require('./../utils/redis');

const io = require('socket.io-emitter')(redis.client());

publisher.sendMessage = async (bank, msg) =>
{
    var conn = await redis.client().getAsync(`banks:${bank}`);
    if (conn != null && JSON.parse(conn).key !== 'null')
    {
        const msg_enc = aesWrapper.encrypt(JSON.parse(conn).key, JSON.parse(conn).iv, JSON.stringify(msg));
        var socket_id = JSON.parse(conn).id;
        io.to(socket_id).emit('message' , msg_enc);
        logger.info(`sending ${JSON.stringify(msg)} to ${bank}`);
    }else
    {
        var count = 0;
        var timer = setInterval(async () => { 
            count++; 
            conn = await redis.client().getAsync(`banks:${bank}`);
            if (conn != null && JSON.parse(conn).key !== 'null')
            {
                const msg_enc = aesWrapper.encrypt(JSON.parse(conn).key, JSON.parse(conn).iv, JSON.stringify(msg));
                socket_id = JSON.parse(conn).id;
                io.to(socket_id).emit('message' , msg_enc);
                logger.info(`sending ${JSON.stringify(msg)} to ${bank}`);
                clearInterval(timer); 
            }
            else if (count > 5) { 
                clearInterval(timer); 
                logger.error(`could not send ${JSON.stringify(msg)} to ${bank}`);
            } 
        }, 2000);  
    }
}

module.exports = publisher;
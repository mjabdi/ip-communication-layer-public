const host = require('./../utils/application').hostname();
const logger = require('./../utils/logger')();
const handleMessage = require('./messagehandler').handleMessage;

const handleRequest = (request) =>
{
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        logger.info(`Connection from origin ${request.origin} rejected.`);
        return;
    }
    
    // var connection = request.accept('echo-protocol', request.origin);
    var connection = request.accept();
    logger.info(`connection accepted from origin :  ${request.origin}`);
    logger.info(`remote_address : ${request.remoteAddress}  with key : ${request.key}`);

    connection.on('message', handleMessage(connection,request));

    connection.on('close', function(reasonCode, description) {
        if (connection.Bank)
        {
            logger.info(' Bank ' + connection.Bank + ' disconnected.');
            if (connection.Cursor)
            {
                connection.Cursor.close();
                logger.info(' Bank ' + connection.Bank + ' changefeed unsubscribed.');
            }
        }
        else
        {
            logger.info(' Peer ' + request.key + ' disconnected.');
        }
    });
}


function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
 }


 module.exports = {
    handleRequest
}

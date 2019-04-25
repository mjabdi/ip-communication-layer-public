const config = require('config');
const logger = require('./../utils/logger')();
const handleMessage = require('./messagehandler').handleMessage;
const bankconnections = require('./bankconnections');
const coreProxy = require('./coreproxy');

const handleRequest = (request) =>
{
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        logger.info(`Connection from origin ${request.origin} rejected.`);
        return;
    }
    
    var connection = request.accept();
    //logger.info(`connection accepted from remote_address : ${request.remoteAddress}  with key : ${request.key}`);

    setTimeout(() => {
        if (!connection.Authenticated)
        {
            connection.sendUTF(JSON.stringify({type: 'error', payload: 'Handshake Timeout : Connection Closed By Server'})); 
            logger.warn('Handshake Timeout : Connection Closed By Server');
            request.socket.end();
        }
    }, config.HandshakeTimeout || 5000);

    /* session timeout */
    setTimeout(() => {
        try{
            connection.sendUTF(JSON.stringify({type: 'info', payload: 'Session Timeout : Connection Closed By Server'})); 
            logger.info('Session Timeout : Connection Closed By Server');
            request.socket.end();
        }catch(err) {}
    }, config.SessionTimeout || 60000);
    /** */
    
    connection.on('message', handleMessage(connection,request));

    connection.on('close', async (reasonCode, description) => {
        if (connection.Bank)
        {
            logger.info(' Bank ' + connection.Bank + ' disconnected.');
            bankconnections.removeConnection(connection.Bank);
            coreProxy.publishBankConnection(connection.Bank, false);
            coreProxy.unRegisterRealtimeFeed(connection.Bank);
            logger.info(`Bank '${connection.Bank}' message feed unsubscribed.`);
        }
        else
        {
            //logger.info(`remote peer with key '${request.key}' disconnected.`);
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

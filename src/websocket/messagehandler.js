const host = require('./../utils/application').hostname();
const logger = require('./../utils/logger')();
const HandshakeManager = require('./handshakemanager');
const TransactionHandler = require('./transactionhandler');

module.exports = (connection,request) => {

    return (message) => {
        
        if (message.type === 'utf8') {
            if (!connection.Authenticated)
            {
                return HandshakeManager.doHandshake(connection,request,message);
            }
            else
            {
                TransactionHandler.processTransaction(connection,request,message);
            }

        }
        else if (message.type === 'binary') {
            connection.sendUTF('Invalid Data : Connection Closed By Server');
            request.socket.end();
        }
    }
}
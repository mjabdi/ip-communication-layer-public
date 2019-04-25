const logger = require('./../utils/logger')();
const HandshakeManager = require('./handshakemanager');
const messageReceivedFromCore = require('./../messageprocessor/coretobanks/index').messageReceivedFromCore;
const messageReceivedFromBank = require('./../messageprocessor/bankstocore/index').messageReceivedFromBank;
const bankconnections = require('./bankconnections');
const aesWrapper = require('./../utils/aes-wrapper');
const coreProxy = require('./coreproxy');

const handleMessage = (connection, request) =>
{
    return (message) =>
    {
        if (message.type === 'utf8') {
            if (!connection.Authenticated)
            {
                return HandshakeManager(connection, request, message, initializeConnection);
            }
            else
            {
                messageReceivedFromBank(connection.Bank , aesWrapper.decrypt(connection.Key, connection.Iv ,message.utf8Data));
            }
        }
        else if (message.type === 'binary') {
            connection.sendUTF('Invalid Format : Connection Closed By Server');
            request.socket.end();
        }
    }
}

const initializeConnection = (bank, socketConnection) =>
{
    bankconnections.addConnection(bank, socketConnection);
    coreProxy.publishBankConnection(bank, true);
    coreProxy.registerRealtimeFeed(bank, socketConnection, messageReceivedFromCore , () =>
    {
        logger.info(`Bank '${bank}' subscribed for message feed from core.`);
    });
}

module.exports = {
    handleMessage
}

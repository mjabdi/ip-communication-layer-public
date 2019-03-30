const logger = require('./../../utils/logger')();
const sendMessage = require('./../../websocket/publisher').sendMessage;
const sendMessageToAll = require('./../../websocket/publisher').sendMessageToAll;

const messageReceivedFromCore = (bank, msg) =>
{
    logger.info(`message received from core for bank '${bank}' : ${JSON.stringify(msg)}`);
    sendMessageToAll(msg);
}

module.exports = {
    messageReceivedFromCore
}

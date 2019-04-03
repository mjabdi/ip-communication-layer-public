const logger = require('./../../utils/logger')();
const sendMessage = require('./../../websocket/publisher').sendMessage;
const sendMessageToAll = require('./../../websocket/publisher').sendMessageToAll;


const messageReceivedFromBank = (bank, msg) =>
{
    logger.info(`message received from bank '${bank}': ${msg}`);
    sendMessage(bank, `message from core to bank : ${msg}`);
}

module.exports = {
    messageReceivedFromBank
}

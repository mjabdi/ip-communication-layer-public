const logger = require('./../../utils/logger')();
const publisher = require('./../../websocket/publisher');
const acks = require('./../../websocket/acks');

const messageReceivedFromCore = (bank, msg) => // msg : {type , msg , id}
{
    const message = JSON.parse(msg);
    if (message.type === 'message')
    {
        logger.info(`new message received from core to bank '${bank}' : ${msg}`);
        publisher.sendMessage(bank, msg);
    }
    else if (message.type === 'rcvd')
    {
        acks.idReceived(message.bank , message.payload);
    }
}

module.exports = {
    messageReceivedFromCore
}

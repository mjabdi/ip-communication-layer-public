const logger = require('./../../utils/logger')();
const publisher = require('./../../websocket/publisher');

const messageReceivedFromCore = (bank, msg) => // msg : {type , msg , id}
{
    publisher.sendMessage(bank, msg);
}

module.exports = {
    messageReceivedFromCore
}

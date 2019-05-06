const logger = require('./../../utils/logger')();
const publisher = require('./../../websocket/publisher');

const messageReceivedFromCore = (bank, msg) => 
{
    publisher.sendMessage(bank, {payload: msg});
}

module.exports = {
    messageReceivedFromCore
}

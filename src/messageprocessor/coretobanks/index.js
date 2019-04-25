const logger = require('./../../utils/logger')();
const publisher = require('./../../websocket/publisher');
const acks = require('./../../websocket/acks');
const clusterBankconnections = require('./../../websocket/clusterbankconnections');

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
    else if (message.type === 'bankconnectionstatus')
    {
        if (message.connected)
        {
            clusterBankconnections.addConnection(message.bank, message.hostname);
        }
        else
        {
            clusterBankconnections.removeConnection(message.bank);
        }
    }
}

module.exports = {
    messageReceivedFromCore
}

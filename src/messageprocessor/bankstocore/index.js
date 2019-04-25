const logger = require('./../../utils/logger')();
const config = require('config');
const request = require('requestretry');
const coreProxy = require('./../../websocket/coreproxy');
const publisher = require('./../../websocket/publisher');
const acks = require('./../../websocket/acks');

const messageReceivedFromBank = (bank, msg) =>
{
    logger.info(`message received from bank '${bank}': ${msg}`);

    var message = JSON.parse(msg);
    if (message.type === 'message')
    {
        if (!acks.containsId(message.id))
        {
            request({
                url: config.IPCoreRestAPI,
                json: true,
                method : 'POST',
                body : {
                    sender : bank,
                    receiver : message.receiver,
                    payload : message.payload
                },
                // The below parameters are specific to request-retry
                maxAttempts: 10,   // (default) try 5 times
                retryDelay: 1000,  // (default) wait for 5s before trying again
                retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors
            }, (err, response, body) => {
                // this callback will only be called when the request succeeded or after maxAttempts or on error
                if (err)
                {
                    logger.error(`could not call Core API : error : ${err}`);
                } else if (response) {
                    if (response.attempts > 1)
                    {
                        logger.warn('The number of request attempts: ' + response.attempts);
                    }
                }
            });
            coreProxy.sendRcvdId(bank, message.id);
            publisher.sendAcktoBank(bank, message.id);
        }
    }
    else if (message.type === 'ack')
    {
        coreProxy.sendAcknowledge(bank, message.payload);
        // acks.ackReceived(bank, message.payload);
    }
}

module.exports = {
    messageReceivedFromBank
}

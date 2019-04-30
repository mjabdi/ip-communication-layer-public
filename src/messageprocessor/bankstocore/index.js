const logger = require('./../../utils/logger')();
const config = require('config');
const request = require('requestretry');

const messageReceivedFromBank = (bank, msg, ack) =>
{
    logger.info(`message received from bank '${bank}': ${msg}`);

    request({
        url: config.IPCoreRestAPI,
        json: true,
        method : 'POST',
        body : {
            sender : bank,
            receiver : msg.receiver,
            payload : msg.payload
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
            ack(msg);
            if (response.attempts > 1)
            {
                logger.warn('The number of request attempts: ' + response.attempts);
            }
        }
    });
}

module.exports = {
    messageReceivedFromBank
}

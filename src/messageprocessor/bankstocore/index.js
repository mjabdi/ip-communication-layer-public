const logger = require('./../../utils/logger')();
const config = require('config');
const request = require('requestretry');
const redis = require('./../../utils/redis');

const messageReceivedFromBank = (bank, msg, data, ack) =>
{
    logger.info(`message received from bank '${bank}': ${JSON.stringify(msg)}`);

    var d = new Date();

    redis.client()
    .incr(`bank_incoming_messages:${bank}:${d.getSeconds()}`, (err,id) =>
    {
        if (id === 1)
        {
            redis.client()
            .expire(`bank_incoming_messages:${bank}:${d.getSeconds()}`, 5);
        }
    });

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
            ack(data);
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

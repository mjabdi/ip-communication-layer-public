const logger = require('./../../utils/logger')();
const publisher = require('./../../websocket/publisher');
const redis = require('./../../utils/redis');

const messageReceivedFromCore = async (bank, msg) => 
{
    var d = new Date();
    redis.client()
        .incr(`bank_outgoing_messages:${bank}:${d.getSeconds()}`, (err,id) =>
        {
            if (id === 1)
            {
                redis.client()
                .expire(`bank_outgoing_messages:${bank}:${d.getSeconds()}`, 5);
            }
        });

    await publisher.sendMessage(bank, {payload: msg});
}

module.exports = {
    messageReceivedFromCore
}

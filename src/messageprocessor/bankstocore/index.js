const logger = require('./../../utils/logger')();
const redis = require('./../../utils/redis');
const grpcClient = require('./../../grpc/grpcclient');

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

    grpcClient.sendToCore(bank, msg.receiver, msg.payload, ack, data);
}

module.exports = {
    messageReceivedFromBank
}

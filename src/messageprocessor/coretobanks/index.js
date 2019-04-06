const logger = require('./../../utils/logger')();
const publisher = require('./../../websocket/publisher');
const db = require('./../../startup/db');

const messageReceivedFromCore = async (bank, msg) =>
{
    logger.info(`new message received from core to bank '${bank}' : ${JSON.stringify(msg)}`);
    try
    {
        /** Mark the message as pending */
        await db.markMessageAsPending(msg.id,bank);
        /***/

        publisher.sendMessage(bank, msg.payload);

        /** Mark the message as sent */
        await db.markMessageAsSent(msg.id,bank);
        /***/
    }
    catch(err)
    {
        logger.error(`error in messageReceivedFromCore : ${err}`);
    }
}

module.exports = {
    messageReceivedFromCore
}

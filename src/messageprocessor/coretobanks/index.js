const logger = require('./../../utils/logger')();
const sendMessage = require('./../../websocket/publisher').sendMessage;
const sendMessageToAll = require('./../../websocket/publisher').sendMessageToAll;
const db = require('./../../startup/db');

const messageReceivedFromCore = async (bank, msg) =>
{
    logger.info(`new message received from core to bank '${bank}' : ${JSON.stringify(msg)}`);

    try
    {
        /** Mark the message as pending */
        await db.markMessageAsPending(msg.id,bank);
        /***/

        sendMessage(bank, msg.payload);

        /** Mark the message as sent */
        await db.markMessageAsSent(msg.id,bank);
        /***/
    }
    catch(err)
    {
        logger.error(err);
    }
}

module.exports = {
    messageReceivedFromCore
}

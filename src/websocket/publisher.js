const publisher = {};

const SimpleHashTable = require('simple-hashtable');
const logger = require('./../utils/logger')();
const aesWrapper = require('./../utils/aes-wrapper');
const db = require('./../startup/db');

const _socketConnections = new SimpleHashTable();

publisher.sendMessage = (bank, msg) =>
{
    if (_socketConnections.containsKey(bank))
    {
        var msg_enc = aesWrapper.encrypt(_socketConnections.get(bank).Key, _socketConnections.get(bank).Iv, msg);
        _socketConnections.get(bank).sendUTF(msg_enc);
        logger.info(`msg : '${msg}' sent to bank : '${bank}'`);
    }
    else
    {
        throw new Error(`cannot send any message to bank '${bank}' : connection to bank does not exist!`);
    }
}

publisher.sendMessageToAll = (msg) =>
{
    _socketConnections.values().forEach( (conn) =>
    {
        var msg_enc = aesWrapper.encrypt(conn.Key, conn.Iv, msg);
        conn.sendUTF(msg_enc);
    });
    logger.info(`msg : '${msg}' sent to all banks`);
}

publisher.addConnection = async (bank ,connection) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
    else
    {
        _socketConnections.put(bank ,connection);
        try{
            await db.incrementConnectionCounter(bank);
        }
        catch(err)
        {
            logger.error(err);
            throw err;
        }
    }
}

publisher.removeConnection = async (bank) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
    
    await db.decrementConnectionCounter(bank);
}

module.exports = publisher;
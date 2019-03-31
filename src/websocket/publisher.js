const SimpleHashTable = require('simple-hashtable');
const logger = require('./../utils/logger')();

const _socketConnections = new SimpleHashTable();

const sendMessage = (bank, msg) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.get(bank).sendUTF(msg);
        logger.info(`msg : '${msg}' sent to bank : '${bank}'`);
    }
    else
    {
        throw new Error(`cannot send any message to bank '${bank}' : connection to bank does not exist!`);
    }
}

const sendMessageToAll = (msg) =>
{
    _socketConnections.values().forEach( (conn) =>
    {
        conn.sendUTF(msg);
    });
    logger.info(`msg : '${msg}' sent to all banks`);
}

const addConnection = (bank ,connection) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
    _socketConnections.put(bank ,connection);
}

const removeConnection = (bank) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
}

module.exports = {
    sendMessage,
    sendMessageToAll,
    addConnection,
    removeConnection
}
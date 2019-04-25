const bankConnections = {};

const SimpleHashTable = require('simple-hashtable');

const _socketConnections = new SimpleHashTable();

bankConnections.addConnection = (bank, connection) =>
{
    if (_socketConnections.containsKey(bank))
    {
        throw new Error(`Bank ${bank} already has a connection!`);
    }
    else
    {
        _socketConnections.put(bank, connection);
    }
}

bankConnections.removeConnection = (bank) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
}

bankConnections.bankExists = (bank) =>
{
    return _socketConnections.containsKey(bank) || (bank.indexOf('XXXX',0) === 0);
}

bankConnections.getBank = (bank) =>
{
    return _socketConnections.get(bank);
}

module.exports = bankConnections;
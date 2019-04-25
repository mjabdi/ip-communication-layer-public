const clusterBankConnections = {};

const SimpleHashTable = require('simple-hashtable');
const coreProxy = require('./coreproxy');

const _socketConnections = new SimpleHashTable();

clusterBankConnections.addConnection = (bank , hostname) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections(bank) = hostname;
    }
    else
    {
        _socketConnections.put(bank ,hostname);
    }
}

clusterBankConnections.removeConnection = (bank) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
}

clusterBankConnections.bankExists = (bank) =>
{
    return _socketConnections.containsKey(bank);
}

module.exports = clusterBankConnections;
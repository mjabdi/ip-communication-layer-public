const bankConnections = {};

const SimpleHashTable = require('simple-hashtable');
const db = require('./../startup/db');

const _socketConnections = new SimpleHashTable();

bankConnections.addConnection = (bank ,connection) =>
{
    return new Promise( (resolve, reject) =>
    {
        if (_socketConnections.containsKey(bank))
        {
            reject(new Error(`Bank ${bank} already has a connection!`));
        }
        else
        {
            _socketConnections.put(bank ,connection);
             db.incrementConnectionCounter(bank).then( (result) => 
             {
                resolve();
             });
        }
    });
}

bankConnections.removeConnection = async (bank) =>
{
    if (_socketConnections.containsKey(bank))
    {
        _socketConnections.remove(bank);
    }
    
    await db.decrementConnectionCounter(bank);
}

bankConnections.bankExists = (bank) =>
{
    return _socketConnections.containsKey(bank);
}


bankConnections.getBank = (bank) =>
{
    return _socketConnections.get(bank);
}

module.exports = bankConnections;
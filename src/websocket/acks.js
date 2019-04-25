const SimpleHashTable = require('simple-hashtable');
const acks = {};

const _acks = new SimpleHashTable();
const _rcvd = new SimpleHashTable();

acks.ackReceived = (bank , ack) =>
{
    if (_acks.containsKey(bank))
    {
        _acks.get(bank).push(ack);
    }
    else
    {
        _acks.put(bank, [ack]);
    }
}

acks.containsAck = (bank, ack) =>
{
    if (_acks.containsKey(bank))
    {
        return _acks.get(bank).indexOf(ack) > -1;
    }
    return false;
}

acks.idReceived = (bank , id) =>
{
    if (_rcvd.containsKey(bank))
    {
        _rcvd.get(bank).push(id);
    }
    else
    {
        _rcvd.put(bank, [id]);
    }
}

acks.containsId = (bank, id) =>
{
    if (_rcvd.containsKey(bank))
    {
        return _rcvd.get(bank).indexOf(id) > -1;
    }
    return false;
}

module.exports = acks;
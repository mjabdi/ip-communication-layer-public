const banks = {};

const SimpleHashTable = require('simple-hashtable');
const logger = require('./logger')();
const _banks = new SimpleHashTable();

banks.init = () =>
{
    if (_banks.size() > 0)
    {
        logger.warn('trying to call banks.init() again!');
        return;
    }
    _banks.put('MELI' , {name : 'MELI Bank' , cert : null});
    _banks.put('BSIR' , {name : 'SADERAT Bank' , cert : null});
}

banks.getAllBanks = () =>
{
    return _banks.keys();
}

banks.getBank = (bank) =>
{
    return _banks.get(bank);
}

banks.exists = (bank) =>
{
    return _banks.containsKey(bank);
}

banks.getPublicKeyFilename = (bank) =>
{
    return `${bank}.public.pem`;
}

module.exports = banks;
const SimpleHashTable = require('simple-hashtable');
const logger = require('./logger')();
const _banks = new SimpleHashTable();

const init = () =>
{
    if (_banks.size() > 0)
    {
        logger.warn('trying to call banks.init() again!');
        return;
    }
    _banks.put('MELI' , {name : '' , cert : null});
    _banks.put('BSIR' , {name : '' , cert : null});
}

const getAllBanks = () =>
{
    return _banks.keys();
}

const getBank = (bank) =>
{
    return _banks.get(bank);
}

const exists = (bank) =>
{
    return _banks.containsKey(bank);
}

const getPublicKeyFilename = (bank) =>
{
    return `${bank}.public.pem`;
}

module.exports = {
    init,
    getAllBanks,
    exists,
    getPublicKeyFilename,
    getBank
}

const logger = require('./../../utils/logger')();


const messageReceivedFromBank = (bank, msg) =>
{
    logger.info(`message received from bank '${bank}': ${msg}`);
}

module.exports = {
    messageReceivedFromBank
}

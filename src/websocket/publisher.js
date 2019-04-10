const publisher = {};

const logger = require('./../utils/logger')();
const aesWrapper = require('./../utils/aes-wrapper');
const coreProxy = require('./coreproxy');
const bankConnections = require('./bankconnections');


publisher.sendMessage = (bank, msg) =>
{
    if (bankConnections.bankExists(bank))
    {
        var msg_enc = aesWrapper.encrypt(bankConnections.getBank(bank).Key, bankConnections.getBank(bank).Iv, msg);
        bankConnections.getBank(bank).sendUTF(msg_enc);
        logger.info(`msg : '${msg}' sent to bank : '${bank}'`);
    }
    else
    {
        //throw new Error(`cannot send any message to bank '${bank}' : connection to bank does not exist!`);
        setTimeout(() => {
            coreProxy.sendBackMessage(bank, msg);
        }, 2000);
    }
}

// publisher.sendMessageToAll = (msg) =>
// {
//     _socketConnections.values().forEach( (conn) =>
//     {
//         var msg_enc = aesWrapper.encrypt(conn.Key, conn.Iv, msg);
//         conn.sendUTF(msg_enc);
//     });
//     logger.info(`msg : '${msg}' sent to all banks`);
// }


module.exports = publisher;
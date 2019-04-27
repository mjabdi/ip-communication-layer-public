const publisher = {};

const logger = require('./../utils/logger')();
const aesWrapper = require('./../utils/aes-wrapper');
const coreProxy = require('./coreproxy');
const bankConnections = require('./bankconnections');

publisher.sendMessage = (bank, msg) =>
{
    var message = JSON.parse(msg);
    if (!bankConnections.bankConnected(bank))
    {
        //** do nothing, core-proxy will send it agian itself */
        // setTimeout(() => {
        //     coreProxy.sendBackMessage(bank, message.msg, message.id);   
        // }, 1000);
    }
    else 
    {
        try
        {
            var msg_enc = aesWrapper.encrypt(bankConnections.getBank(bank).Key, bankConnections.getBank(bank).Iv, message.msg);
            bankConnections.getBank(bank).sendUTF(JSON.stringify({type:'message' , id : message.id, msg : msg_enc}));
            logger.info(`msg : '${msg}' sent to bank : '${bank}'`);
        }catch(err)
        {
            //** do nothing, core-proxy will send it agian itself */
            // logger.error(err);
            // setTimeout(() => {
            //     coreProxy.sendBackMessage(bank, message.msg , message.id);
            // }, 1000);    
        }
    }
}

publisher.sendAcktoBank = (bank , ack) =>
{
    try
    {
        bankConnections.getBank(bank).sendUTF(JSON.stringify({type:'ack' , payload : ack}));
    }catch(err) {}
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
const logger = require('./../utils/logger')();
const banks = require('./../utils/banks');
const aesWrapper = require('./../utils/aes-wrapper');
const rsaWrapper = require('./../utils/rsa-wrapper');
const randomstring = require("randomstring");
const clusterBankConnections = require('./clusterbankconnections');

module.exports = async (connection, message, callback) => {
    if (!connection.Bank)
        {
            const bank = message.utf8Data.trim();
            if (!banks.exists(bank))
            {
                connection.sendUTF(JSON.stringify({type: 'error', payload: 'Invalid Bank : Connection Closed By Server'})); 
                logger.warn(`'${bank} : 'Invalid Bank : Connection Closed By Server`);
                connection.close();
                return;
            }

            if (clusterBankConnections.bankExists(bank))
            {
                connection.sendUTF(JSON.stringify({type: 'error', payload: 'Too Many Connections : Connection Closed By Server'})); 
                logger.warn(`'${bank} : 'Too Many Connections : Connection Closed By Server`);
                connection.close();
                return; 
            }

            connection.Bank = bank;
            connection.Question = randomstring.generate(64);

            const enc = rsaWrapper.encrypt(banks.getBank(bank).cert,connection.Question);
            const signature = rsaWrapper.createSignature(rsaWrapper.serverPrivate,connection.Question);

            const msg = {
                question : enc,
                signature : signature
            };
            connection.sendUTF(JSON.stringify(msg));
            return;
        }
     if (!connection.Answer)
     {
        try
        { 
            const msg = JSON.parse(message.utf8Data);

            const answer_enc = msg.answer;
            const signature = msg.signature;
            
            const answer = rsaWrapper.decrypt(rsaWrapper.serverPrivate,answer_enc);
            const verified = rsaWrapper.verifySignature(banks.getBank(connection.Bank).cert, answer, signature);

            if (answer !== connection.Question || !verified)
            {
                connection.sendUTF(JSON.stringify({type: 'error', payload: 'Invalid Handshake : Connection Closed By Server'})); 
                logger.wanr(`'${connection.Bank}' : Invalid Handshake : Connection Closed By Server`);
                connection.close();
                return;
            }

            connection.Key = aesWrapper.generateKey();
            connection.Iv = aesWrapper.generateIv();

            const signature_key = rsaWrapper.createSignature(rsaWrapper.serverPrivate,connection.Key.toString('base64'));
            const signature_iv = rsaWrapper.createSignature(rsaWrapper.serverPrivate,connection.Iv.toString('base64'));

            const send_msg = {
                key : rsaWrapper.encrypt(banks.getBank(connection.Bank).cert,connection.Key.toString('base64')),
                iv : rsaWrapper.encrypt(banks.getBank(connection.Bank).cert,connection.Iv.toString('base64')),
                signature_key : signature_key,
                signature_iv : signature_iv
            }

            connection.Authenticated = true;
            callback(connection.Bank,connection);
            logger.info(`bank '${connection.Bank}' connetced.`);
            connection.sendUTF(JSON.stringify(send_msg));
        }
        catch(err)
        {
            connection.sendUTF(JSON.stringify({type: 'error', payload: 'Invalid Handshake : Connection Closed By Server'})); 
            logger.warn(`'${connection.Bank}' : Invalid Handshake : Connection Closed By Server`);
            connection.close();
            return;
        }
    }
}


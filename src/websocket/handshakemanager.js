const host = require('./../utils/application').hostname();
const logger = require('./../utils/logger')();
const banks = require('./../utils/banks');
const aesWrapper = require('./../utils/aes-wrapper');
const rsaWrapper = require('./../utils/rsa-wrapper');
var randomstring = require("randomstring");

const doHandshake = (connection ,request ,message ,callback) => {

    if (!connection.Bank)
        {
            const bank = message.utf8Data.trim();
            if (!banks.exists(bank))
            {
                connection.sendUTF('Invalid Bank : Connection Closed By Server');
                logger.info(`'${bank} : 'Invalid Bank : Connection Closed By Server`);
                request.socket.end();
                return;
            }
            connection.Bank = bank;
            connection.Question = randomstring.generate(64);

            const enc = rsaWrapper.encrypt(banks.getBank(bank).cert,connection.Question);

            const signature = rsaWrapper.createSignature(rsaWrapper.serverPrivate,connection.Question);
            // logger.info('signature : ' + signature);

            // const verified = rsaWrapper.verifySignature(rsaWrapper.serverPub, connection.Question, signature);
            // logger.info('verified : ' + verified);

            // let dec = rsaWrapper.decrypt(banks.getBank(bank).key,enc);

            // logger.info('original : ' +  connection.Question);
            // logger.info('encrypted : ' + enc);
            // logger.info('decrypted : ' + dec);

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
                connection.sendUTF('Invalid Handshake : Connection Closed By Server');
                logger.info(`'${connection.Bank}' : Invalid Handshake : Connection Closed By Server`);
                request.socket.end();
                return;
            }

            connection.Key = aesWrapper.generateKey();
            connection.Iv = aesWrapper.generateIv();

            // logger.info('Key : ' + connection.Key.toString('base64'));
            // logger.info('Iv : ' + connection.Iv.toString('base64'));


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
            connection.sendUTF('Invalid Handshake : Connection Closed By Server');
            logger.info(`'${connection.Bank}' : Invalid Handshake : Connection Closed By Server`);
            request.socket.end();
            return;
        }
    }
}

module.exports = {
    doHandshake
}

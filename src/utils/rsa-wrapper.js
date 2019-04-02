const path = require('path');
const rsaWrapper = {};
const fs = require('fs');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const banks = require('./../utils/banks');
const logger = require('./logger')();

// load keys from file
rsaWrapper.initLoadServerKeys = () => {

    let privateKeyPath = path.resolve(__dirname, '../../keys' , 'server',  'server.private.pem');
    let publicKeyPath = path.resolve(__dirname, '../../keys' , 'server', 'server.public.pem');

    rsaWrapper.serverPub = fs.readFileSync(publicKeyPath);
    rsaWrapper.serverPrivate = fs.readFileSync(privateKeyPath);

    banks.getAllBanks().forEach( (bank) => {
        let bankPublicKeyPath = path.resolve(__dirname, '../../keys' , 'banks', banks.getPublicKeyFilename(bank));
        banks.getBank(bank).cert = fs.readFileSync(bankPublicKeyPath);
    });
};

rsaWrapper.generateBankCerts = () => {

    logger.info('gerenating banks certificates, please wait...');
    banks.getAllBanks().forEach( (bank) => 
    {
        let key = new NodeRSA();
        key.generateKeyPair(2048, 65537);
        let privateKeyPath = path.resolve(__dirname, '../../keys' , 'banks', bank + '.private.pem');
        let publicKeyPath = path.resolve(__dirname, '../../keys' , 'banks', bank + '.public.pem');
        if (!fs.existsSync(privateKeyPath))
        {
            fs.writeFileSync(privateKeyPath, key.exportKey('pkcs8-private-pem'));       
            logger.info(`private key generated :  ${privateKeyPath}`);
        }
        if (!fs.existsSync(publicKeyPath))
        {
            fs.writeFileSync(publicKeyPath, key.exportKey('pkcs8-public-pem'));
            logger.info(`private key generated :  ${publicKeyPath}`);
        }
    });
    logger.info('banks certificates generated successfully.');
};

rsaWrapper.generateServerCert = () => {
    let key = new NodeRSA();
    key.generateKeyPair(2048, 65537);
    let privateKeyPath = path.resolve(__dirname, '../../keys' , 'server' , 'server.private.pem');
    let publicKeyPath = path.resolve(__dirname, '../../keys' , 'server',  'server.public.pem');
    if (!fs.existsSync(privateKeyPath))
    {
        fs.writeFileSync(privateKeyPath, key.exportKey('pkcs8-private-pem'));       
        logger.info(`private key generated :  ${privateKeyPath}`);
    }
    if (!fs.existsSync(publicKeyPath))
    {
        fs.writeFileSync(publicKeyPath, key.exportKey('pkcs8-public-pem'));
        logger.info(`private key generated :  ${publicKeyPath}`);
    }
};

rsaWrapper.serverExampleEncrypt = () => {
    console.log('Server public encrypting');

    let enc = rsaWrapper.encrypt(rsaWrapper.serverPub, 'Server init hello');
    console.log('Encrypted RSA string ', '\n', enc);
    let dec = rsaWrapper.decrypt(rsaWrapper.serverPrivate, enc);
    console.log('Decrypted RSA string ...');
    console.log(dec);
};

rsaWrapper.encrypt = (publicKey, message) => {
    let enc = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message));

    return enc.toString('base64');
};

rsaWrapper.decrypt = (privateKey, message) => {
    let enc = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message, 'base64'));

    return enc.toString();
};

module.exports = rsaWrapper;
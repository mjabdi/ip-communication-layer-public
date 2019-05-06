const connectionManager = {}
const logger = require('./../utils/logger')();
const redis = require('./../utils/redis');
const banks = require('./../utils/banks');
const aesWrapper = require('./../utils/aes-wrapper');
const rsaWrapper = require('./../utils/rsa-wrapper');
const randomstring = require("randomstring");
const application = require('./../utils/application');
const config = require('config');
const messageReceivedFromBank = require('./../messageprocessor/bankstocore').messageReceivedFromBank;

connectionManager.authenticate = async (socket, data, callback) => {
    const { bank } = data;

    try {
      logger.info(`bank '${bank} trying to connect...'`);  
      await verifyBank(bank);
      socket.Key = 'null';
      socket.Iv = 'null';
      const canConnect = await redis.client()
        .setAsync(`banks:${bank}`, JSON.stringify({ id: socket.id, host: application.hostname(), key: socket.Key.toString('base64'), iv: socket.Iv.toString('base64') }), 'NX', 'EX', 30);

      if (!canConnect) {
        return callback({ message: 'ALREADY_LOGGED_IN' });
      }
      
      socket.Bank = bank;

      return callback(null, true);
    } catch (e) {
      logger.info(`Socket ${socket.id} unauthorized.`);
      logger.error(e);
      return callback({ message: e });
    }
}

connectionManager.postAuthenticate = async (socket) => {
    logger.info(`Bank ${socket.Bank} connected.`);
    logger.info(`Bank ${socket.Bank} trying to authenticate...`);

    socket.Question = randomstring.generate(64);

    const question_enc = rsaWrapper.encrypt(banks.getBank(socket.Bank).cert,socket.Question);
    const signature = rsaWrapper.createSignature(rsaWrapper.serverPrivate,socket.Question);

    socket.emit('handshake' , { question: question_enc, signature: signature });

    setTimeout(() => {
        if (!socket.Authenticated)
        {
            socket.disconnect();
        }
    }, config.HandshakeTimeout || (10 * 1000));

    socket.conn.on('packet', async (packet) => {
        if (socket.auth && packet.type === 'ping') {
            await redis.client().setAsync(`banks:${socket.Bank}`, JSON.stringify({ id: socket.id, host: application.hostname(), key: socket.Key.toString('base64'), iv: socket.Iv.toString('base64') }), 'XX', 'EX', 30);
        }
    });

    socket.on('handshake', async (data) =>
    {
        if (socket.Authenticated)
        {
            // just ignore it
        }
        else
        {
            // logger.info(`message received from bank '${socket.Bank}' : ${JSON.stringify(data)}`);
            const answer_enc = data.answer;
            const signature = data.signature;
            
            const answer = rsaWrapper.decrypt(rsaWrapper.serverPrivate, answer_enc);
            const verified = rsaWrapper.verifySignature(banks.getBank(socket.Bank).cert, answer, signature);

            if (answer !== socket.Question || !verified)
            {
                socket.emit('unauthorized' , {message : 'INVALID_HANDSHAKE'});
                logger.warn(`'${socket.Bank}' : Invalid Handshake : Connection Closed By Server`);
                socket.disconnect();
                return;
            }

            socket.Key = aesWrapper.generateKey();
            socket.Iv = aesWrapper.generateIv();
            socket.Authenticated = true;

            const signature_key = rsaWrapper.createSignature(rsaWrapper.serverPrivate,socket.Key.toString('base64'));
            const signature_iv = rsaWrapper.createSignature(rsaWrapper.serverPrivate,socket.Iv.toString('base64'));

            const send_msg = {
                key : rsaWrapper.encrypt(banks.getBank(socket.Bank).cert, socket.Key.toString('base64')),
                iv : rsaWrapper.encrypt(banks.getBank(socket.Bank).cert, socket.Iv.toString('base64')),
                signature_key : signature_key,
                signature_iv : signature_iv
            }

            await redis.client().setAsync(`banks:${socket.Bank}`, JSON.stringify({ id: socket.id, host: application.hostname(), key: socket.Key.toString('base64'), iv: socket.Iv.toString('base64') }), 'XX', 'EX', 30);

            socket.emit('authorized', send_msg);
            logger.info(`Bank ${socket.Bank} authenticated.`);

            setTimeout(() => {
                socket.disconnect();
            }, config.SessionTimeout || (20 * 60 * 1000));
        }
    });

    socket.on('message', async (data, ack) =>
    {
        if (!socket.Authenticated)
        {
            socket.emit('unauthorized' , {message : 'NOT_AUTHORIZED'});
            socket.disconnect();
        }
        else
        {
            var msg = null;
            try
            {
                msg = aesWrapper.decrypt(socket.Key, socket.Iv, data);
            }
            catch(err)
            {
                logger.warn(`invalid message received from bank '${socket.Bank}'`);
                socket.emit('unauthorized' , {message : 'NOT_AUTHORIZED'});
                socket.disconnect();
                return;
            }
            messageReceivedFromBank(socket.Bank, JSON.parse(msg), data, ack)
        }
    });


}

connectionManager.disconnect = async (socket) => {
    if (!socket.Bank)  
    {
      logger.info(`Socket ${socket.id} disconnected.`);
    }
    else
    {
      logger.info(`Bank ${socket.Bank} disconnected.`);
      await redis.client().delAsync(`banks:${socket.Bank}`);
    }
}

async function verifyBank (bank) {
    return new Promise((resolve, reject) => {
        if (!banks.exists(bank)) {
          return reject('BANK_NOT_FOUND');
        }
        return resolve(bank);
    });
}

module.exports = connectionManager;










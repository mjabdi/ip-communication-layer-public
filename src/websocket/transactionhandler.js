const host = require('./../utils/application').hostname();
const logger = require('./../utils/logger')();


module.exports = {

    processTransaction :  (connection, request, message) => {
        logger.info('Received Message: ' + message.utf8Data + ' from : ' + connection.Bank);
        connection.sendUTF('Reply to "' + message.utf8Data + '" from server : ' + host);
    }

}


const host = require('./../utils/application').hostname();
const logger = require('./../utils/logger')();

const doHandshake = (connection ,request ,message ,callback) => {

    if (!connection.Hello)
        {
            if (message.utf8Data != 'Hello')
            {
                connection.sendUTF('Invalid Request : Connection Closed By Server');
                logger.info('Handshake Failed! : Connection Closed By Server');
                request.socket.end();
                return;
            }
            connection.Hello = true;
            logger.info('Hello Received');
            connection.sendUTF('Hello Accepted' + ' from server : ' + host);
            return;
        }

        if (!connection.Bank)
        {
            connection.Bank = message.utf8Data;
            logger.info(connection.Bank + ' is connected' );
            connection.sendUTF('Bank Name Accepted' + ' from server : ' + host);
            connection.Authenticated = true;
            callback(connection.Bank, connection);
            return;
        }
}

module.exports = {
    doHandshake
}

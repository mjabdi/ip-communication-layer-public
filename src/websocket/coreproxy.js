const coreProxy = {};

const WebSocketClient = require('websocket').client;
const config = require('config');
const logger = require('./../utils/logger')();

const _socketConnectionArray = [];

coreProxy.registerRealtimeFeed = (bank, socketConnection, messageRecievedCallback, subscribedCallback) =>
{
    socketConnection.proxyConnectionsCount = 0;
    socketConnection.proxyConnectionMonitor = setInterval(() => {
        
        if (socketConnection.proxyConnectionsCount < config.CoreProxyNodes)
        {
                var client = new WebSocketClient();
                // client.on('connectFailed', (error) => {
                //    logger.error('Connect Error: ' + error.toString());
                // });

                client.on('connect', (connection) => {
                        connection.sendUTF(bank);
                        connection.on('close',  () => {
                            if (connection.opened)
                            {
                                socketConnection.proxyConnectionsCount --;
                                logger.warn(`bank '${bank}' one connection to core-proxy closed! : ${socketConnection.proxyConnectionsCount}/${config.CoreProxyNodes} connections available`);
                            }
                        });
                        connection.on('message', (message) => {
                            if (message.type === 'utf8') {
                                if (message.utf8Data === 'failed')
                                {
                                    //do nothing
                                }
                                else if (message.utf8Data === 'ok')
                                {
                                    connection.opened = true;
                                    socketConnection.proxyConnectionsCount ++;
                                    connection.Bank = bank;
                                    _socketConnectionArray.push(connection);
                                    if (socketConnection.proxyConnectionsCount >= config.CoreProxyNodes)
                                    {
                                        subscribedCallback();
                                    }
                                }
                                else
                                {
                                    messageRecievedCallback(bank, message.utf8Data);
                                }
                            }
                        });
                });

                client.connect(config.CoreProxyAddress);
        }
    }, 10);
}

coreProxy.unRegisterRealtimeFeed = (bank) =>
{
    _socketConnectionArray.forEach( (conn) => {
        if (conn.Bank === bank)
        {
            try{
                conn.request.socket.end();
            }catch(err)
            {
            }
        }
    });
}



module.exports = coreProxy;
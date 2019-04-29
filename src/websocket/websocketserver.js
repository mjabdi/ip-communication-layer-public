const WSSModule = {};

const config = require('config');
const logger = require('./../utils/logger')();
const http = require('http');
const io = require('socket.io')();
const socketAuth = require('socketio-auth');
const adapter = require('socket.io-redis');
const connectionManager = require('./connectionmanager');

WSSModule.start = () => {
    const wsPort = config.WebsocketPort;
    const websocketServer = http.createServer((request, response) => {
        logger.info(`Received request for ${request.url}`);
        response.writeHead(404);
        response.end();
    });

    const redisAdapter = adapter({
        host: config.RedisHost,
        port: config.RedisPort,
        password: config.REDIS_PASS
    });

    io.attach(websocketServer);
    io.adapter(redisAdapter);

    socketAuth(io, connectionManager);
      
    websocketServer.listen(wsPort , () =>
    {logger.info(`WebSocket server started listening on port : ${wsPort}`);});
}

WSSModule.close = (callback) => {
    io.close(callback);
}



module.exports = WSSModule;
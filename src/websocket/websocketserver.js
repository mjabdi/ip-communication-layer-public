const WSSModule = {};
const config = require('config');
const logger = require('./../utils/logger')();
const http = require('http');
const io = require('socket.io')();
const socketAuth = require('socketio-auth');
const redisAdapter = require('socket.io-redis');
const connectionManager = require('./connectionmanager');
const redis = require('./../utils/redis');

WSSModule.start = () => {
    const wsPort = config.WebsocketPort;
    const websocketServer = http.createServer((request, response) => {
        logger.info(`Received request for ${request.url}`);
        response.writeHead(404);
        response.end();
    });

    const pub = redis.newClient();
    const sub = redis.newClient();

    io.attach(websocketServer);
    io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));

    socketAuth(io, connectionManager);
      
    websocketServer.listen(wsPort , () =>
    {
      logger.info(`WebSocket server started listening on port : ${wsPort}`);
      console.log(`WebSocket server started listening on port : ${wsPort}`);
    });
}

WSSModule.close = (callback) => {
    io.close(callback);
}



module.exports = WSSModule;
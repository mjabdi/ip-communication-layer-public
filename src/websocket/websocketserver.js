const config = require('config');
const logger = require('./../utils/logger')();
const http = require('http');
const WebSocketServer = require('websocket').server;
const handleRequest = require('./requesthandler');

function startServer()
{
    const wsPort = config.WebsocketPort || 8080;
    const websocketServer = http.createServer(function(request, response) {
    logger.info(`Received request for ${request.url}`);
    response.writeHead(404);
    response.end();
    });

    websocketServer.listen(wsPort, function() {
    logger.info(`WebSocket server is listening on ws://localhost:${wsPort}`);
    });

    const wsServer = new WebSocketServer({
    httpServer: websocketServer,
    autoAcceptConnections: false
    });

    wsServer.on('request', handleRequest() );
}

module.exports.start = startServer;
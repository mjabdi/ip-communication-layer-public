
const config = require('config');
const log4js = require('log4js');
const http = require('http');
const express = require('express');
const app = express();
const logger = require('./utils/logger')();
const websocketServer = require('./websocket/websocketserver');


//** initialize HTTP server on port : ${HttpPort} */
const httpServer = http.createServer(app);
app.use(log4js.connectLogger(logger, { level: logger.level }));
require('./startup/routes')(app);
require('./startup/config')();
const httpPort = config.HttpPort || 3000;
httpServer.listen(httpPort, function(){
  logger.info(`Http server is listening on http://localhost:${httpPort}`);
});
//** end of HTTP server initialization */


//** initialaize WebSocket server on port : ${WebsocketPort} */
  websocketServer.start();
//** end of WebSocket server initialaization */


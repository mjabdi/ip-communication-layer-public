
require('events').EventEmitter.defaultMaxListeners = 0;
const config = require('config');
const log4js = require('log4js');
const http = require('http');
const express = require('express');
const app = express();
const logger = require('./utils/logger')();
const websocketServer = require('./websocket/websocketserver');
const initDB =  require('./startup/db').initDB;
const checkConfig =  require('./startup/config');
const banks = require('./utils/banks');
const rsaWrapper = require('./utils/rsa-wrapper');

let ready = false;



checkConfig();

//** initialize Database */
 initDB();
//** end of Database initialization */

//** initialize Banks */
banks.init();
//** end of Banks initialization */

//** load certificates */
// rsaWrapper.generateServerCert();
// rsaWrapper.generateBankCerts();
rsaWrapper.initLoadServerKeys();
//** */

//** initialize HTTP server on port : ${HttpPort} */
const httpServer = http.createServer(app);
// app.use(log4js.connectLogger(logger, { level: logger.level }));
require('./startup/routes')(app);
const httpPort = config.HttpPort || 3000;
httpServer.listen(httpPort, function(){
  logger.info(`Http server is listening on http://localhost:${httpPort}`);
});
//** end of HTTP server initialization */


//** initialaize WebSocket server on port : ${WebsocketPort} */
websocketServer.start();
//** end of WebSocket server initialaization */

ready = true;



module.exports.ready = () => {return ready};
module.exports.live = () => {return true};

require('events').EventEmitter.defaultMaxListeners = 0;
const websocketServer = require('./websocket/websocketserver');
const checkConfig =  require('./startup/config');
const banks = require('./utils/banks');
const rsaWrapper = require('./utils/rsa-wrapper');
const application = require('./utils/application');
const httpServer = require('./startup/httpserver');
const grpcServer = require('./grpc/grpcserver');

let ready = false;

async function run()
{
  //** Gobal Error Handling */
  application.registerGlobalErrorHandler();
  //** */

  //** checking for required configs */
  checkConfig();
  //** */

  //** initialize Banks */
  banks.init();
  //** end of Banks initialization */

  //** load certificates */
  // rsaWrapper.generateServerCert();
  // rsaWrapper.generateBankCerts();
  rsaWrapper.loadCertificates();
  //** */

  //** initialize HTTP server on port : ${HttpPort} */
  await httpServer.start();
  //** end of HTTP server initialization */

  grpcServer.start();

  //** initialaize WebSocket server on port : ${WebsocketPort} */
  websocketServer.start();
  //** end of WebSocket server initialization */

  //** doing all the neccessary things and cleanup procedures before shutdown  */
  application.registerForGracefulShutdown(httpServer,websocketServer);
  //** */

  ready = true;
}

run();

module.exports.ready = () => {return ready};
module.exports.live = () => {return true};
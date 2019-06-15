const grpcServer = {};
const {createServer} = require('grpc-kit');
const messageReceivedFromCore = require('./../messageprocessor/coretobanks').messageReceivedFromCore;
const logger = require('./../utils/logger')();
const config = require('config');

let server;
grpcServer.start = () =>
{
    server = createServer();

    server.use({
        protoPath:  __dirname + '/coretobank.proto',
        packageName: 'coretobank',
        serviceName: 'CoreToBank',
        routes: {
            SendMessage: async (call, callback) => {
            await messageReceivedFromCore(call.request.bank, call.request.payload);
            callback(null, { refcode : 1 });
          }
        },
        options: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      });
      
      const port = config.GRPCListenPort;
      server.listen(`0.0.0.0:${port}`);
      logger.info(`gRPC server is now listening on port : ${port}`);
}

grpcServer.close = (callback) =>
{
  if (server)
  {
    server.server.tryShutdown(callback);
  }
} 

module.exports = grpcServer;
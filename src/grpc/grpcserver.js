const grpcServer = {};
const {createServer} = require('grpc-kit');
const messageReceivedFromCore = require('./../messageprocessor/coretobanks').messageReceivedFromCore;
const logger = require('./../utils/logger')();

grpcServer.start = () =>
{
    const server = createServer();

    server.use({
        protoPath:  __dirname + '/coretobank.proto',
        packageName: 'coretobank',
        serviceName: 'CoreToBank',
        routes: {
            SendMessage: (call, callback) => {
            messageReceivedFromCore(call.request.bank, call.request.payload, 1);
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
      
      const port = 50055;
      server.listen(`0.0.0.0:${port}`);
      logger.info(`gRPC server is now listening on port : ${port}`);
}

module.exports = grpcServer;
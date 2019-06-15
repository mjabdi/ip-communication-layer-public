const grpcClient = {};
const {createClient} = require("grpc-kit");
const config = require('config');
const logger = require('./../utils/logger')();

grpcClient.sendToCore = (sender, receiver, payload, ack, data) => {
     
    const client = createClient({
        protoPath: __dirname + '/banktocore.proto',
        packageName: 'banktocore',
        serviceName: 'IPCoreService',
        options: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      }
      , config.GRPCEndpoint);

      client.processMessage({ message: payload, type: 'message', senderBic: sender, refId:1 }, (err, result) => {
        if(!err) 
        {
          ack(data);
        }
        else
        {
          logger.fatal(`gRPC server unavailable : ${err}`);
          throw err;
        }
      });
}

module.exports = grpcClient;


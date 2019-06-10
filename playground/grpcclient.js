const grpcClient = {};
const {createClient} = require("grpc-kit");
const logger = require('./../src/utils/logger')();

grpcClient.sendToCore = (message, type, senderBic, refId) => {
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
    , process.env.GRPC_ENDPOINT);
    
    client.processMessage({ message, type, senderBic, refId }, (err, result) => {
      if(!err)
        logger.info({result});
      else
        logger.error(err);  
    });
}

module.exports = grpcClient;


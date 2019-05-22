const grpcClient = {};
const {createClient} = require("grpc-kit");


grpcClient.sendToCore = (sender, receiver, payload) => {
   
    const client = createClient({
        protoPath: __dirname + '/banktocore.proto',
        packageName: 'banktocore',
        serviceName: 'BankToCore',
        options: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true
        }
      }
      , 'localhost:50052');
      
      client.SendMessage({ sender, receiver, payload }, (err, result) => {
        if(err) throw err;
        // console.log(result);
      });
}

module.exports = grpcClient;


const grpcClient = require('./grpcclient');
const grpcServer = require('./grpcserver');
const logger = require('./../src/utils/logger')();

function startServer()
{
    grpcServer.start();
}

let counter = 0;
function sendTestMessages()
{
    counter++;
    grpcClient.sendToCore(`Test Messasge${counter}`,'PAYMENT_ORDER', 'MELIIRTHXXX' , `${counter}`);
    setTimeout(() => {
        sendTestMessages();
    }, process.env.SEND_RATE);
}

function checkConfigs()
{
    if (!process.env.GRPC_ENDPOINT)
    {
        logger.fatal('GRPC_ENDPOINT NOT SET!');
        process.exit(1);
    }
    if (!process.env.GRPC_PORT)
    {
        logger.fatal('GRPC_PORT NOT SET!');
        process.exit(1);
    }
    if (!process.env.GRPC_PORT)
    {
        logger.fatal('SEND_RATE NOT SET!');
        process.exit(1);
    }
}

function registerGracefullShutdown()
{
    process.on('SIGTERM', () => {
        logger.info('SIGTERM signal received. shutting down...');
        grpcServer.stop();
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });

    process.on('SIGINT', () => {
        logger.info('SIGINT signal received. shutting down...');
        grpcServer.stop();
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
}

registerGracefullShutdown();
checkConfigs();
startServer();
sendTestMessages();
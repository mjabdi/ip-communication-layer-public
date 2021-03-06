const config = require('config');
const logger = require('./../utils/logger')();
const application = require('./../utils/application');

module.exports = () => {

    const requiredConfigs = [
        'IPCoreRestAPI',
        'HttpPort',
        'WebsocketPort',
        'CoreProxyNodes',
        'CoreProxyAddress',
        'RedisHost',
        'RedisPort',
        'RedisPass',
        'GRPCEndpoint',
        'GRPCListenPort'
    ];

    let error = false;
    requiredConfigs.forEach((param) => {
        if (!config.get(param)) {
            logger.fatal(`FATAL ERROR: Config: '${param}' is not set.`);
            error = true;
        }
    });

    if (error) {
        application.shutdown();
    }
}
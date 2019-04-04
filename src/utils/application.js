
const application = {};

const log4js = require('log4js');
const host = require('os').hostname();

application.shutdown = () =>
{
    log4js.shutdown(function() { process.exit(1); });
}

application.hostname = () =>
{
    return host;
}

module.exports = application;

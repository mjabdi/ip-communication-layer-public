
const log4js = require('log4js');
const host = require('os').hostname();

function shutdown()
{
    log4js.shutdown(function() { process.exit(1); });
}

function hostname()
{
    return host;
}

module.exports.shutdown = shutdown;
module.exports.hostname = hostname;
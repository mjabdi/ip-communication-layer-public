
const log4js = require('log4js');
const host = require('os').hostname();

const shutdown = () =>
{
    log4js.shutdown(function() { process.exit(1); });
}

const hostname = () =>
{
    return host;
}

module.exports = 
{
    shutdown,
    hostname

}

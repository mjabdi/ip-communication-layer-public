const httpServer = {};

const config = require('config');
const Fastify = require('fastify');
const routes = require('./routes');
const logger = require('./../utils/logger')();
const application = require('./../utils/application');

let server = null;

httpServer.start = async () =>
{
    server = Fastify({
        ignoreTrailingSlash: true
    });

    //** add routes */

    routes.setupRoutes(server);

    try {
        await server.listen(config.HttpPort,'0.0.0.0');
        httpServer.started = true;
        logger.info(`Http server listening on port:${config.HttpPort}`);
      } catch (err) {
        logger.error(err);
        application.shutdown();
      }
}

httpServer.close = (callback) =>
{
    if (server)
    {
        server.close().then(callback);
    }
}

module.exports = httpServer;
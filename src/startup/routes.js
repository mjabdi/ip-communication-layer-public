const routes = {};
const health = require('../routes/health');
const index = require('../routes/index');

routes.setupRoutes = (server) => {
 server.get('/', index);
 server.get('/health/ready', health.ready);
 server.get('/health/live', health.live);
}

module.exports = routes;
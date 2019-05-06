const appName = require('./../../package').name;
const config = require('config');
const pino = require('pino')({
  //prettyPrint: (process.env.NODE_ENV != 'production'),
  level : config.LogLevel
});

module.exports = () =>
{
  return pino;
} 
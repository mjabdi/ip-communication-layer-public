const bluebird = require('bluebird');
const redis = require('redis');
const config = require('config');

bluebird.promisifyAll(redis);

const client = redis.createClient({
  protocol: 'redis',  
  host: config.RedisHost,
  port: config.RedisPort,
  password: config.RedisPass
});

module.exports = client;
const bluebird = require('bluebird');
const redis = require('redis');
const config = require('config');

bluebird.promisifyAll(redis);

const client = redis.createClient(config.RedisPort, config.RedisHost, {
  protocol: 'redis',  
  password: config.RedisPass
});

module.exports = client;
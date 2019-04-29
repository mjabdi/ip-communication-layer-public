const bluebird = require('bluebird');
const redis = require('redis');
const config = require('config');

bluebird.promisifyAll(redis);

const client = redis.createClient(config.RedisPort,{
  host: config.RedisHost,  
  password: config.RedisPass
});

module.exports = client;
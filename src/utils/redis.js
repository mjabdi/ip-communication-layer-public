const bluebird = require('bluebird');
const redis = require('redis');
const config = require('config');

bluebird.promisifyAll(redis);

const client = redis.createClient({
  host: config.RedisHost|| 'localhost',
  port: config.RedisPort || 6379,
  password: config.RedisPass || 'password',
});

module.exports = client;
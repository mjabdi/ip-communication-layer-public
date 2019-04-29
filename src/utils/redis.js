
const bluebird = require('bluebird');
const redis = require('redis');
const config = require('config');

bluebird.promisifyAll(redis);

let _client = null;

function getClient()
{
    if (!_client)
    {
        _client = redis.createClient(config.RedisPort,{
            host: config.RedisHost,  
            password: config.RedisPass
          });
    }
    return _client;
}


module.exports = { client : getClient };
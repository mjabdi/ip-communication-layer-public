
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
            password: config.RedisPass,
            
          });
    }
    return _client;
}

function getNewClient()
{
    return redis.createClient(config.RedisPort,{
        host: config.RedisHost,  
        password: config.RedisPass
      });
}


module.exports = { client : getClient , newClient : getNewClient};
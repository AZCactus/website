var redis = require('redis');
var redisClient = redis.createClient('redis-lively-77028').on('connect', function() {
     console.log('connected to redis in helper');
 }); //creates a new client

var export_redisClient = require('../exporters/export_redisClient.js');
export_redisClient.setRedisClient(redisClient);


const Redis = require('ioredis');
const logger = require('./logger');
const config = require('config');

const { host, port, shost, sport, password } = config.get('redis');
const uri = `redis://${host}:${port}`;
let redis = null;

if (!shost || host === shost) {
  redis = new Redis({
    host,
    port,
    lazyconnect: true,
    password,
    name: "myRedis"
  });
} else {
  redis = new Redis({
    sentinels: [{ host, port }, { host: shost, port: sport }], // fast fail-over config
    name: "myRedis"
  });
}


Redis.Promise.onPossiblyUnhandledRejection((error) => {
  // you can log the error here.
  // error.command.name is the command name, here is 'set'
  // error.command.args is the command arguments, here is ['foo']
  logger.redis(error);
});

/*
redis.monitor(function (err, monitor) {
  monitor.on('monitor', function (time, args, source, database) {
    doDebug(time,args,source,database)
  });
});
*/

redis.on("connect", () => {
  logger.redis(`${uri} connect success`);
});

redis.on("ready", () => {
  logger.redis(`${uri} connect ready`);
});

redis.on("error", (err) => {
  logger.redis(`${uri} connect error`);
});

redis.on("close", () => {
  logger.redis(`${uri} connect close`);
});

redis.on("reconnecting", () => {
  logger.redis(`${uri} connect reconnecting`);
});

module.exports = redis;
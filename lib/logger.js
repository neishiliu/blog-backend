const winston = require('winston');

const [Console, File] = [winston.transports.Console, winston.transports.File];
const logdir = 'logs';
const myLeavels = {
  levels: {
    error: 0,
    warn: 1,
    mongo: 2,
    info: 4,
    http: 3,
    api: 4,
    bull: 2,
    redis: 2,
    email: 2,
    wechat: 2,
    raven: 0,
  },
  colors: {
    mongo: 'blue',
    http: 'green',
    warn: 'yellow',
    error: 'red',
    info: 'blue',
    api: 'green',
    bull: 'blue',
    redis: 'blue',
    email: 'blue',
    wechat: 'blue',
    raven: 'red',
  }
};
winston.addColors(myLeavels.colors);

const logger = new (winston.Logger)({
  levels: myLeavels.levels,
  transports: [
    new Console({
      colorize: true,
      level: "info",
      timestamp: false,
      stringify: obj => JSON.stringify(obj, null, 0).replace(/\n/g, "")
    }),
    new File({
      colorize: true,
      json: false,
      filename: `${logdir}/out.log`,
      timestamp: false,
      stringify: obj => JSON.stringify(obj, null, 0).replace(/\n/g, "")
    })
  ]
});

module.exports = logger;
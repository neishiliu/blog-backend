const mongoose = require('mongoose');
const config = require('config');
const logger = require('../lib/logger')

const { uname, pwd, host, dbname, rs_name, auth_source } = config.get('mongo');

// mongo链接地址
const connArr = ["mongodb://"];
if (uname && pwd) {
  connArr.push(`${uname}:${pwd}@`);
}
connArr.push(`${host}/`);
connArr.push(dbname);
const uri = connArr.join("");

// Mongo链接配置
const options = {
    useNewUrlParser: true,
    autoReconnect: true,
    autoIndex: false
};

// 打印日志
logger.mongo('Connecting: %s %o', uri, JSON.stringify(options));
mongoose.set('debug', (coll, method, query, doc) => {
  logger.mongo(coll, method, JSON.stringify(query), JSON.stringify(doc));
});

// 链接mongo
mongoose.connect(uri, options);
const db = mongoose.connection;

// 监听Mongo事件
db.on('open', () => {
    logger.mongo(`${uri} success`);
  });
db.on('error', (err) => {
  logger.mongo(`${uri} error %o`, err);
});

db.on('connected', () => {
  logger.mongo(`${uri} connected`);
});

db.on('index', (err) => {
  if (err) logger.mongo(`${uri} index ${err}`);
});

db.on('disconnected', () => {
  logger.mongo(`${uri} disconnected`);
});

db.on('reconnected', () => {
  logger.mongo(`${uri} reconnected`);
});

db.on('close', () => {
  logger.mongo(`${uri} closed`);
});

module.exports = db;
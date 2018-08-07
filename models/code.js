const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const codeSchema = new Schema({
  code: String,  // 激活码
  system: String, // 系统编号
  account: String,  // 账号
  status:  {  // 状态 1有效 2过期 3作废 4已激活
    type: Number,
    default: 1
  },
  delete_date: Date
}, {
  toJSON: { getters: true },
  toObject: { getters: true },
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
})
codeSchema.index({code: 1})
codeSchema.index({account: 1})

const codeModel = db.model('code', codeSchema)

codeModel.on('index', function(error) {
  logger.error(error.message);
});

module.exports = codeModel

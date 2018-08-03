const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const codeSchema = new Schema({
  code: String,  // 激活码
  system: String, // 系统编号
  account: String,  // 账号
  isBinding:  {  // 是否已使用 0 未使用  1已使用
    type: Number,
    default: 0
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

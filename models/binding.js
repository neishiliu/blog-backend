const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const bindingSchema = new Schema({
    nickname: String, // 用户昵称
    sex: String, // 用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
    country: String, // 国家，如中国为CN
    province: String,  // 用户个人资料填写的省份
    city: String, // 普通用户个人资料填写的城市
    openid: String, // 用户的唯一标识
    headimgurl: String, // 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像）
    privilege: String, // 用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）
    account: String,  // 绑定账号
    system_no: String, // 绑定系统
    delete_date: Date
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  })
  bindingSchema.index({nickname: 1})
  bindingSchema.index({openid: 1})

const bindingModel = db.model('binding', bindingSchema)

bindingModel.on('index', function(error) {
    logger.error(error.message);
  });

module.exports = bindingModel

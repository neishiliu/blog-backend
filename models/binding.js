const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const bindingSchema = new Schema({
    nickname: String,
    sex: String,
    country: String,
    province: String,
    city: String,
    openid: String,
    account: String,
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
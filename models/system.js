const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const systemSchema = new Schema({
    name: {
        type: String,
        required: '{PATH} is required'
    },
    system_no: {
        type: String,
        required: '{PATH} is required'
    },
    redirect_url: {
        type: String,
        required: '{PATH} is required'
    },
    delete_date: Date
},  {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
})

systemSchema.index({name: 1})

const systemModel = db.model('system', systemSchema)

systemModel.on('index', function(error) {
    logger.error(error.message)
})

module.exports = systemModel
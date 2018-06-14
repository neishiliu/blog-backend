const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const userSchema = new Schema({
    user_name: {
        type: String,
        required: '{PATH} is required'
    },
    password: {
        type: String,
        required: '{PATH} is required'
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: "roles"
    },
    status: {
        type: Number,
        default: 1
    },
    delete_date: Date,
    salt: String
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
})

userSchema.index({user_name: 1, role: 1})

const userModel = db.model('user', userSchema)

userModel.on('index', function(error) {
    logger.error(error.message)
})

module.exports = userModel
const db = require('../lib/mongo')
const Schema = require('mongoose').Schema
const logger = require('../lib/logger')

const productSchema = new Schema({
    name: String,
    price: {
        type: Number,
        min: [66, '价格太低'],
        max: [999, '超出最大价格限制']
    },
    delete_date: Date
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  })
  productSchema.index({name: 1})

const productModel = db.model('product', productSchema)

productModel.on('index', function(error) {
    logger.error(error.message);
  });

module.exports = productModel
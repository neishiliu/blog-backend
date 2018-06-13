const db = require('../lib/mongo')
const Schema = require('mongoose').Schema

const productModel = new Schema({
    name: String,
    price: {
        type: Number,
        min: [66, '价格太低'],
        max: [999, '超出最大价格限制']
    },
    delete_date: Date,
    city: {
        type: String,
        required: '{PATH} is required'
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  })
productModel.index({name: 1})

const product = db.model('product', productModel)

product.on('index', function(error) {
    // "_id index cannot be sparse"
    console.log(error.message);
  });

module.exports = product
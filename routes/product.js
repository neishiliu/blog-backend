const productModel = require('../models/product')

module.exports =  (router) => {
    router.post('/', async (ctx, next) => {
        const pro = {
            name: ctx.request.body.name,
            price: ctx.request.body.price,
            delete_date: ctx.request.body.delete_date
        }
        const newPro = await productModel.create(pro)
        ctx.return(0, newPro);
    }),
    router.get('/', async (ctx, next) => {
        // const list = await productModel.find({delete_date:{$exists:false}}).lean()
        ctx.return(0, {a: 111});
    }),
    router.delete('/', async (ctx, next) => {
        const body = ctx.request.body;
        const del = await productModel.findOneAndUpdate({name: body.name}, {delete_date: Date.now()}, {new: true, runValidators: true})
        ctx.return(0, del);
    })
  } 

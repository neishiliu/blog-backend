"use strict"
const unit = require('../lib/unit')
const passport = require('../lib/passport_config')
const systemModel = require('../models/system')

module.exports =  (router) => {
  // 获取所有系统
  router.get('/', async function (ctx, next) {
    const systems = await systemModel.find({delete_date:{$exists:false}})
    ctx.return(0, systems)
  }),

  // 新增系统
  router.post('/', async function (ctx, next) {
    const body = ctx.request.body
    const system = {
        name: body.name,
        system_no: body.system_no,
        redirect_url: body.redirect_url
    }
    const haveNo = await systemModel.find({system_no: body.system_no})
    if (haveNo.length > 0) {
      ctx.return(-2, '该系统编号已存在')
    } else {
      const newSystem = await systemModel.create(system)
      ctx.return(0, newSystem);
    }
  }),

  // 编辑系统
  router.put('/', async function (ctx, next) {
    const body = ctx.request.body
    const system = await systemModel.find({system_no: body.system_no})
    if (system.length === 0) {
      ctx.return(-2, '该系统不存在')
    } else {
      const upSystem = {
        name: body.name,
        system_no: body.system_no,
        redirect_url: body.redirect_url
    }
      const newSystem = await systemModel.findOneAndUpdate({system_no: body.system_no}, upSystem,  {new: true, runValidators: true})
      ctx.return(0, newSystem);
    }
  }),

  // 删除系统
  router.delete('/:id', async function (ctx, next) {
    const { id } = ctx.params;
    const system = await systemModel.findOneAndRemove({_id: id})
    if (!system) {
      return ctx.return(-2, "删除的系统不存在！");
    }
    ctx.return(0, {});
  })
}
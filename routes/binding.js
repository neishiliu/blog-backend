"use strict"
const unit = require('../lib/unit')
const passport = require('../lib/passport_config')
const bindingModel = require('../models/binding')
const moment = require('moment-timezone');

module.exports =  (router) => {
  // 获取所有绑定用户
  router.get('/', async function (ctx, next) {
    const { skip, limit, account, system, date_from, date_to } = ctx.query
    
    console.log(skip, limit, account, system, date_from, date_to)
    const query = {delete_date:{$exists:false}};
    Object.assign(query, ...[account && { account }])
    Object.assign(query, ...[system && { system_no: system }])
    // Object.assign(query.created_at, ...[date_from && { $gte: moment(date_from).startOf('day') }])
    // Object.assign(query.created_at, ...[date_to && { $lte: moment(date_to).endOf('day') }])

    const users = await bindingModel
      .find(query)
      .sort({ created_at: -1 })
      .skip(Number(skip || 0))
      .limit(Number(limit || 10))
    ctx.return(0, users)
  }),
  router.delete('/:id', async function (ctx, next) {
    const { id } = ctx.params;
    const binding = await bindingModel.findOneAndRemove({_id: id})
    if (!binding) {
      return ctx.return(-2, "删除的绑定账户不存在！");
    }
    ctx.return(0, {});
  })
}
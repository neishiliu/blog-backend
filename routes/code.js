const codeModel = require('../models/code')
const redis = require('../lib/redis')
const randomstring = require('randomstring')
const options = require('../status/code_status.json')
const unit = require('../lib/unit')

module.exports = (router) => {
    // 生成激活码
    router.post('/', async (ctx) => {
      const {accounts, system} = ctx.request.body
      if (!accounts) {
        ctx.return(-2, '账号不可为空')
        return false
      }
      if (!system) {
        ctx.return(-2, '系统不可为空')
        return false
      }
      const accountArr = accounts.split(',').filter(item => item.trim())
      const arr = []
      for(let account of accountArr) {
        // const code = randomstring.generate(16)
        const code = unit.md5sum(Date.now() + '')
        const dbcode = await codeModel.create({code, account, system})
        arr.push(dbcode)
      }
      ctx.return(0, arr)
    }),
    // 获取激活码列表
    router.get('/', async (ctx) => {
      const { skip, limit, account, system} = ctx.query

      console.log(skip, limit, account, system)
      const query = {delete_date:{$exists:false}};
      Object.assign(query, ...[account && { account }])
      Object.assign(query, ...[system && { system }])

      const total = await codeModel.count(query);
      const codes = await codeModel
        .find(query)
        .sort({ created_at: -1 })
        .skip(Number(skip || 0))
        .limit(Number(limit || 10))
      ctx.return(0, {total, codes})
    }),
    // 删除激活码
    router.delete('/:id', async function (ctx, next) {
      const { id } = ctx.params;
      const code = await codeModel.findOneAndRemove({_id: id})
      if (!code) {
        return ctx.return(-2, "删除的激活码不存在！");
      }
      ctx.return(0, {});
    }),
    // 获取激活码状态数组
    router.get('/options', async function (ctx) {
      ctx.return(0, options)
    }),
    // 更新激活码状态
    router.put('/', async function (ctx) {
      const {id, status} = ctx.request.body
      const newCode = await codeModel.findOneAndUpdate({_id: id}, {status}, {new: true, runValidators: true})
      if (newCode) {
        ctx.return(0, newCode)
      } else {
        ctx.return(-2, '未找到该激活码')
      }
    })
}

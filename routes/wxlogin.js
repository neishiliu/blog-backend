const rq = require('../lib/request')
const bindingModel = require('../models/binding')
const systemModel = require('../models/system')
const codeModel = require('../models/code')
const redis = require('../lib/redis')
const randomstring = require('randomstring')
const {appid, secret} = require('config').get('wx')

module.exports = (router) => {
    router.get('/', async (ctx, next) => {
        const { system } = ctx.query
        const redirectUrl = require('config').get('url').redirect
        if (system) {
            const dbsystem = await systemModel.findOne({system_no: system})
            if (dbsystem) {
                const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=${system}&connect_redirect=1#wechat_redirect`
                ctx.redirect(url)
            } else {
                ctx.return(-2, '未找到对应系统')
            }
        } else {
            ctx.return(-2, '请携带系统标识')
        }
    }),
    router.get('/info', async (ctx, next) => {
        const { code, state } = ctx.query
        const system = state
        if (code) {
            try {
                const res = await rq({
                    method: "GET",
                    url: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`,
                    header: { "Content-Type": "application/x-www-form-urlencoded" },
                })
                if (res.access_token) {
                    const info = await rq({
                        method: 'GET',
                        url: `https://api.weixin.qq.com/sns/userinfo?access_token=${res.access_token}&openid=${res.openId}&lang=zh_CN`
                    })
                    console.log(info)
                    if (info.openid) {
                        /**
                         * 查询是否有绑定账号
                         */
                        const opendid = info.openid
                        const binding = await bindingModel.findOne({openid: opendid, system_no: system, delete_date: {$exists:false}}).lean()
                        // if (binding) {
                        //     const dbsystem = await systemModel.findOne({system_no: system})
                        //     const system_redeirect = dbsystem.redirect_url
                        //     const resultCode = randomstring.generate(32)
                        //     await redis.setex(resultCode, 60 * 2, JSON.stringify(binding))
                        //     ctx.redirect(`${system_redeirect}?resultCode=${resultCode}`)
                        // } else {
                        //     ctx.return(0, '该微信号未找到绑定账号')
                        // }
                        const dbsystem = await systemModel.findOne({system_no: system})
                        const system_redeirect = dbsystem.redirect_url
                        const resultCode = randomstring.generate(32)
                        if (binding) {
                            await redis.setex(resultCode, 60 * 2, JSON.stringify({result: 1, data: binding}))
                            ctx.return(0, {url: `${system_redeirect}?resultCode=${resultCode}`})
                        } else {
                            await redis.setex(resultCode, 60 * 2, JSON.stringify({result: 0, data: info}))
                            ctx.return(0, {resultCode})
                        }
                    } else {
                        ctx.return(0, info)
                    }
                } else {
                    ctx.return(-2, res)
                }
            } catch (e) {
                ctx.return(-2, e)
            }
        } else {
            ctx.return(-2, '获取微信授权失败')
        }
    }),
    router.get('/result', async (ctx, next) => {
        const { resultCode } = ctx.query
        const info = JSON.parse(await redis.get(resultCode))
        if (info) {
          ctx.return(0, info)
        } else {
          ctx.return(-2, 'resultCode不存在或已过期')
        }
    }),
    router.post('/binding', async (ctx, next) => {
        const {account, resultCode, system_no, code} = ctx.request.body
        const dbcode = await codeModel.findOne({code})
        // 检验激活码有效性
        if (!dbcode) {
          ctx.return(-2, '激活码不存在')
          return false
        } else {
          if (dbcode.account !== account) {
            ctx.return(-2, '激活码与账号不匹配')
            return false
          }
          if (dbcode.system !== system_no) {
            ctx.return(-2, '激活码与系统不匹配')
            return false
          }
          if (dbcode.status !== 1) {
            ctx.return(-2, '无效的激活码')
            return false
          }
        }

        // 检查账号是否已绑定
        const binding = await bindingModel.findOne({account: account, system_no: system_no, delete_date: {$exists:false}}).lean()
        if (binding) {
            ctx.return(-2, '该账号已绑定')
        } else {
            // 将账号信息加入微信用户信息完成绑定
            const info = JSON.parse(await redis.get(resultCode))
            if (info && info.data) {
                const newBinding = await bindingModel.create(Object.assign(info.data, {account, system_no}))
                // 绑定完成后更新激活码状态
                await codeModel.findOneAndUpdate({code}, {status: 4}, {new: true, runValidators: true})

                // 更新Redis结果数据，返回回调地址
                const dbsystem = await systemModel.findOne({system_no: system_no})
                const system_redeirect = dbsystem.redirect_url
                await redis.setex(resultCode, 60 * 2, JSON.stringify({result: 1, data: newBinding}))
                ctx.return(0, {url: `${system_redeirect}?resultCode=${resultCode}`})
            } else {
                ctx.return(-2, 'resultCode不存在或已过期')
            }
        }
    })
}

const rq = require('../lib/request')
const bindingModel = require('../models/binding')
const systemModel = require('../models/system')
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
                            await redis.setex(resultCode, 60 * 2, JSON.stringify(binding))
                            ctx.return(0, {url: `${system_redeirect}?resultCode=${resultCode}`})
                        } else {
                            await redis.setex(resultCode, 60 * 2, JSON.stringify(info))
                            ctx.return(0, {url: `${system_redeirect}?resultCode=${resultCode}`})
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
        ctx.return(0, info)
    }),
    router.post('/binding', async (ctx, next) => {
        const {account, resultCode, system_no} = ctx.request.body
        const binding = await bindingModel.findOne({account: account, system_no: system_no, delete_date: {$exists:false}}).lean()
        if (binding) {
            ctx.return(-2, '该账号已绑定')
        } else {
            const info = JSON.parse(await redis.get(resultCode))
            if (info) {
                const newBinding = await bindingModel.create(Object.assign(info, {account, system_no}))
                ctx.return(0, newBinding)
            } else {
                ctx.return(-2, 'resultCode不存在或已过期')
            }
        }
    })
}
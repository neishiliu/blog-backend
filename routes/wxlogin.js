const rq = require('../lib/request')
const bindingModel = require('../models/binding')
const {appid, secret} = require('config').get('wx')

module.exports = (router) => {
    router.get('/', async (ctx, next) => {
        const { system } = ctx.query
        const redirectUrl = 'http://140.143.99.241:8000/wxlogin/info'
        if (system) {
            const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_userinfo&state=${system}&connect_redirect=1#wechat_redirect`
            ctx.redirect(url)
        } else {
            ctx.return(-2, '请携带系统标识')
        }
    }),
    router.get('/info', async (ctx, next) => {
        const { code } = ctx.query
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
                    if (info.openid) {
                        /**
                         * 查询是否有绑定账号
                         */
                        const opendid = info.openid
                        const binding = await bindingModel.findOne({openid: opendid, delete_date: {$exists:false}}).lean()
                        if (binding) {
                            ctx.return(0, binding)
                        } else {
                            ctx.return(0, '该微信号未找到绑定账号')
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
    })
}
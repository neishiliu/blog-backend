const appid = 'wx306ad53dc6897d22'
const secret = 'c1e6c294422dfd340c7bd1da534db488'
const rq = require('../lib/request')

module.exports = (router) => {
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
                    ctx.return(0, info)
                } else {
                    ctx.return(-2, '获取微信授权失败')
                }
            } catch (e) {
                ctx.return(-2, e)
            }
        } else {
            ctx.return(-2, '获取微信授权失败')
        }
    })
}
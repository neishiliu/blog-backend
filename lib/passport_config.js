const passport = require('koa-passport')
const LocalStrategy = require('passport-local')
const userModel = require('../models/user')
const unit = require('../lib/unit')

// 用户名密码验证策略
passport.use(new LocalStrategy(
    {
        usernameField: 'user_name',
        passwordField: 'password'
      },
    /**
     * @param username 用户输入的用户名
     * @param password 用户输入的密码
     * @param done 验证验证完成后的回调函数，由passport调用
     */
    async function (username, password, done) {
        const datauser = await userModel.findOne({user_name: username}).lean()
        if (datauser != null) {
            if (datauser.password !== unit.md5sum(datauser.salt + password)) {
                return done(null, false, '密码错误')
            } else {
                return done(null, datauser)
            }
        } else {
            return done(null, false, '未知用户')
        }
    }
))

// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeUser(function (user, done) {
    done(null, user)
})

// deserializeUser 在每次请求的时候将从 session 中读取用户对象
passport.deserializeUser(function (user, done) {
    return done(null, user)
})

module.exports = passport
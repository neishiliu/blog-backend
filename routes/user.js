"use strict"
const userModel = require('../models/user')
const unit = require('../lib/unit')
const passport = require('../lib/passport_config')

module.exports =  (router) => {
  // 获取所有用户
  router.get('/', async function (ctx, next) {
    const users = await userModel.find({delete_date:{$exists:false}}, '-salt -password')
    ctx.return(0, users)
  }),
  // 新建用户
  router.post('/', async (ctx, next) => {
    const user = ctx.request.body
    if (user.password.trim() !== user.confirm_password.trim()) {
      ctx.return(-2, '两次输入密码不一致')
    } else {
      const u = await userModel.findOne({user_name: user.user_name})
      if (u) {
        ctx.return(-2, '用户名已存在')
      } else {
        const salt = unit.getSalt()
        user.salt = salt
        user.password = unit.md5sum(salt + user.password)
        const newuser = await userModel.create(user)
        ctx.return(0, newuser)
      }
    }
  }),
  // 用户登录
  router.post('/login', async (ctx, next) => {
    // const user = ctx.request.body
    // const datauser = await userModel.findOne({user_name: user.user_name})
    // if (datauser) {
    //   if (datauser.password !== unit.md5sum(datauser.salt + user.password)) {
    //     ctx.return(-2, '用户名或密码不正确')
    //   } else {
    //     delete datauser.password
    //     delete datauser.salt
    //     ctx.return(0, datauser)
    //   }
    // } else {
    //   ctx.return(-2, '用户名或密码不正确')
    // }
    return passport.authenticate('local', function (err, user, info, status) {
      if (user) {
        delete user.password
        delete user.salt
        ctx.login(user)
        return ctx.return(0, user)
      } else {
        ctx.return(-2, info)
      }
    })(ctx, next)
  }),
  // 用户登出
  router.get('/logout', function (ctx, next) {
    
  })
}
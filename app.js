const Koa = require('koa')
const { default: Router } = require('lark-router');
const app = new Koa()
const router = new Router()

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('./lib/logger')
const log = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')
const errorRes = require('./middleware/error-res')
const returnRes = require('./middleware/return-res')

const config = require('config')

const port = process.env.PORT || 3000

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
  .use(json())
  .use(log())
  .use(require('koa-static')(__dirname + '/public'))
  .use(views(path.join(__dirname, '/views'), {
    options: {settings: {views: path.join(__dirname, 'views')}},
    map: {'njk': 'nunjucks'},
    extension: 'njk'
  }))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 错误和返回格式化
app.use(errorRes);
app.use(returnRes);

// router.get('/', async (ctx, next) => {
//   // ctx.body = 'Hello World'
//   ctx.state = {
//     title: 'Koa2'
//   }
//   await ctx.render('index', ctx.state)
// })

// router
router.load(path.join(__dirname, 'routes'));
app.use(router.routes());

// 错误监听
app.on('error', function(err, ctx) {
  logger.error('server error', err, ctx)
})

module.exports = app.listen(port, () => {
  logger.info('Server listening on http://localhost:%d', port);
})

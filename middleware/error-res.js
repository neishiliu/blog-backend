const logger = require("../lib/logger")
module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    
    if (err == null) {
      err = new Error('Null or undefined error');
    }
    // some errors will have .status
    // however this is not a guarantee
    ctx.status = err.statusCode || 500;
    ctx.type = 'application/json';
    ctx.body = {
      err_code: -3,
      error: err.error,
      msg: err.message
    };
    ctx.app.emit('error', err, this);
    logger.info((ctx.user && ctx.user.username) || (ctx.user && ctx.user.account), ctx.method, ctx.status, ctx.href, JSON.stringify(ctx.request.body), '--->', JSON.stringify(ctx.body));
  }
};

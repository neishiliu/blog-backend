/**
 * 统一返回格式
 * 使用 `ctx.return(dataObj)` or `ctx.return('msg 提示消息',dataObj)`
 */
const logger = require('../lib/logger');

module.exports = async (ctx, next) => {
  ctx.return = (err_code, data, message, lang) => {
    ctx.status = 200;
    const ctxBody = {
      err_code
    };

    if (typeof data === "string") {
      ctxBody.msg = data;
    } else {
      // FormatDate(data);
      ctxBody.data = data;
      // 附带信息
      if (message) {
        ctxBody.msg = message;
      }
    }

    ctx.body = ctxBody;
    logger.http((ctx.user && ctx.user.username) || (ctx.user && ctx.user.account), ctx.method, ctx.status, ctx.href, JSON.stringify(ctx.request.body), '--->', JSON.stringify(ctx.body));
  };
  await next();
};

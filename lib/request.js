const rp = require('request-promise')

const _expo = rp.defaults({
    json: true,
    timeout: 10000,
    transform: (body) => {
      if (body.data && (body.code === 'SUCCESS')) {
        return body.data;
      }
      return body;
    }
});

module.exports = _expo;

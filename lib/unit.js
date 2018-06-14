const {createHash, randomBytes} = require('crypto')

module.exports.getSalt = function() {
    return randomBytes(16).toString('base64');
}
module.exports.md5sum = function (str) {
    return createHash('md5').update(str).digest("hex");
}

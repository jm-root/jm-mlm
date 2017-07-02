
/**
 * mlm服务
 * @class mlm
 * @param {Object} [opts={}] 参数
 * @example
 * opts参数:{
 *  db:(必填)
 *  disableAutoInit: (可选, 禁止自动初始化, 默认为false，检测到未初始化时，自动初始化)
 *  tableNamePrefix: (可选, 表名前缀, 默认为'')
 * }
 * @returns {Object}
 * @example
 * 返回结果:{
 * }
 */

var mlm = function (opts) {
    opts = opts || {};
    ['db', 'disableAutoInit', 'tableNamePrefix'].forEach(function (key) {
        process.env[key] && (opts[key] = process.env[key]);
    });
    var o = require('./service')(opts);
    o.router = require('./router');
    return o;
};
module.exports = mlm;

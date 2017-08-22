const error = require('jm-err')
const Err = error.Err
const MS = require('jm-ms-core')
const _ms = new MS()
var ms = _ms.router
const log = require('jm-log4js')
var logger = log.getLogger('jm-mlm')

/**
 * @apiDefine Error
 *
 * @apiSuccess (Error 200) {Number} err 错误代码
 * @apiSuccess (Error 200) {String} msg 错误信息
 *
 * @apiSuccessExample {json} 错误:
 * {
 *   err: 错误代码
 *   msg: 错误信息
 * }
 */

module.exports = function (opts) {
  var service = this
  var t = function (doc, lng) {
    if (lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }
  var router = ms()
  if (service.debug) {
    router.use(function (opts, cb, next) {
      logger.debug(opts)
      next()
    })
  }
  service.routes || (service.routes = {})
  router.use(require('./help')(service))

  router.use(function (opts, cb, next) {
    if (!service.ready) {
      return cb(null, t(Err.FA_NOTREADY, opts.lng))
    }
    next()
  })

  service.onReady()
    .then(function () {
      router
        .use('/teamTypes', require('./teamType')(service))
        .use('/teams', require('./team')(service))
    })

  return router
}

var _ = require('lodash')
var event = require('jm-event')
var daorouter = require('jm-ms-daorouter')
const MS = require('jm-ms-core')
const error = require('jm-err')
const log = require('jm-log4js')
var logger = log.getLogger('jm-mlm')
const Err = error.Err
const _ms = new MS()
var ms = _ms.router
module.exports = function (service, opts) {
  opts || (opts = {})
  var team = service.team
  var router = ms()
  event.enableEvent(team)

  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }

  var listOpts = opts.list || {
    conditions: {},

    options: {
      sort: [{'code': 1}]
    },

    fields: {},

    populations: [
      {
        path: 'type',
        select: 'name price'
      },
      {
        path: 'users.user',
        select: 'uid nick mobile'
      }
    ]
  }

  var getOpts = opts.get || {
    fields: {},

    populations: [
      {
        path: 'type',
        select: 'name price'
      },
      {
        path: 'users.user',
        select: 'uid nick mobile'
      }
    ]
  }

  var done = function (cb, lng, err, doc) {
    if (err) {
      logger.error(err.stack)
      if (!doc) doc = Err.FAIL
      if (err.code) {
        doc = {
          err: err.code,
          msg: err.message
        }
      }
    }
    cb(err, t(doc, lng))
  }

  router
    .add('/', 'get', function (opts, cb, next) {
      var data = opts.data
      opts.conditions || (opts.conditions = {})
      if (data.status !== undefined) {
        opts.conditions.status = data.status
      }
      if (data.type) {
        opts.conditions.type = data.type
      }
      if (data.code) {
        opts.conditions.code = data.code
      }
      if (data.status) {
        opts.conditions.status = data.status
      }
      if (data.search) {
        var search = data.search
        var ary = []
        // 格式化特殊字符
        search = search.replace(/([`~!@#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]])/g, "\\$1")
        var pattern = ".*?" + search + ".*?"
        if (!isNaN(search)) {
          ary.push({code: {$regex: pattern, $options: "i"}})
        }
        opts.conditions.$or = ary
      }

      if (data.userId) {
        team
          .findByUserId(data.userId, _.cloneDeep(listOpts))
          .then(function (doc) {
            doc && (doc = {rows: doc})
            cb(null, doc || {})
          })
          .catch(function (err) {
            done(cb, opts.lng, err)
          })

        return
      }
      next()
    })
    .add('/:id/users', 'post', function (opts, cb, next) {
      team
        .addUser(opts.params.id, opts.data.userId, opts.data.sp)
        .then(function (doc) {
          cb(null, {ret: doc})
        })
        .catch(function (err) {
          done(cb, opts.lng, err)
        })
    })
    .add('/:id/users', 'delete', function (opts, cb, next) {
      team
        .delUser(opts.params.id, opts.data.userId)
        .then(function (doc) {
          cb(null, doc || {})
        })
        .catch(function (err) {
          done(cb, opts.lng, err)
        })
    })
    .add('/:id/users/:userId', 'post', function (opts, cb, next) {
      team
        .updateUserById(opts.params.id, opts.params.userId, opts.data.sp)
        .then(function (doc) {
          cb(null, doc || {})
        })
        .catch(function (err) {
          done(cb, opts.lng, err)
        })
    })
    .add('/:id/users/:userId', 'delete', function (opts, cb, next) {
      team
        .delUserById(opts.params.id, opts.params.userId)
        .then(function (doc) {
          cb(null, doc || {})
        })
        .catch(function (err) {
          done(cb, opts.lng, err)
        })
    })
    .use(daorouter(
      team,
      {
        list: listOpts,
        get: getOpts
      }
    ))

  return router
}

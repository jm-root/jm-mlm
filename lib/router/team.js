var _ = require('lodash')
var event = require('jm-event')
var daorouter = require('jm-ms-daorouter')
const MS = require('jm-ms-core')
const error = require('jm-err')
const Err = error.Err
const _ms = new MS()
var ms = _ms.router
module.exports = function (service, opts) {
  opts || (opts = {})
  var team = service.team
  var router = ms()
  event.enableEvent(team)

  var listOpts = opts.list || {
    conditions: {},

    options: {
      sort: [{'crtime': -1}]
    },

    fields: {
      code: 1,
      title: 1,
      type: 1
    }
  }

  var getOpts = opts.get || {
    fields: {
      code: 1,
      title: 1,
      type: 1,
      users: 1
    },

    populations: [
      {
        path: 'teamType',
        select: 'name price'
      },
      {
        path: 'users.user',
        select: 'uid nick mobile'
      }
    ]
  }

  router.add('/', 'get', function (opts, cb, next) {
    var data = opts.data
    if (data.userId) {
      team
        .findByUserId(data.userId, _.cloneDeep(listOpts))
        .then(function (doc) {
          doc && (doc = {rows: doc})
          cb(null, doc || {})
        })
        .catch(function (err) {
          cb(null, Err.FAIL)
        })

      return
    }
    next()
  })

  router.add('/:id/users/:userId', 'post', function (opts, cb, next) {
    team
      .addUser(opts.params.id, opts.params.userId)
      .then(function (doc) {
        cb(null, {ret: doc})
      })
      .catch(function (err) {
        console.error(err.stack)
        cb(err, Err.FAIL)
      })
  })

  router
    .use(daorouter(
      team,
      {
        list: listOpts,
        get: getOpts
      }
    ))

  return router
}

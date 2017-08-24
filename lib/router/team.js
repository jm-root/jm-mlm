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
    .add('/:id/users/:userId', 'post', function (opts, cb, next) {
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
    .use(daorouter(
      team,
      {
        list: listOpts,
        get: getOpts
      }
    ))

  return router
}

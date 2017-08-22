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
  var teamType = service.teamType
  var router = ms()
  event.enableEvent(teamType)

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

    populations: {
      path: 'users.user',
      select: 'nick'
    }
  }

  router
    .use(daorouter(
      teamType,
      {
        list: listOpts,
        get: getOpts
      }
    ))

  return router
}

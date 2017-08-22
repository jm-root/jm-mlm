var event = require('jm-event')
var daorouter = require('jm-ms-daorouter')
const MS = require('jm-ms-core')
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
      description: 0
    }
  }

  var getOpts = opts.get || {
    fields: {
    },

    populations: {
      path: 'creator',
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

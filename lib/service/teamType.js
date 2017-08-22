const dao = require('jm-dao')
const event = require('jm-event')

module.exports = function (service, opts) {
  opts || (opts = {})
  opts.modelName || (opts.modelName = 'teamType')
  opts.schema || (opts.schema = require('../schema/teamType')())

  var model = dao.dao(opts)
  event.enableEvent(model)

  return model
}

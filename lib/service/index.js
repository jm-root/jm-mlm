const dao = require('jm-dao')

module.exports = function (opts) {
  opts || (opts = {})
  var tableNamePrefix = opts.tableNamePrefix || null
  tableNamePrefix === '' && (tableNamePrefix = null)

  var o = require('jm-user')(opts)
  o.onReady().then(function () {
    o.sq = dao.sequence({db: o.db})
    o.teamType = require('./teamType')(o, {db: o.db, prefix: tableNamePrefix})
    o.team = require('./team')(o, {db: o.db, prefix: tableNamePrefix})
  })
  return o
}

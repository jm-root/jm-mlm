const Promise = require('bluebird');
const _ = require('lodash');
const dao = require('jm-dao');
const log = require('jm-log4js');
const event = require('jm-event');
var logger = log.getLogger('jm-mlm');

module.exports = function (opts) {
    opts || (opts = {});
    var debug = opts.debug || false;
    var tableNamePrefix = opts.tableNamePrefix || null;
    tableNamePrefix === '' && (tableNamePrefix = null);

    var o = require('jm-user')(opts);
    o.onReady().then(function(){
        o.team = require('./team')(o, {db: o.db, prefix: tableNamePrefix});
    });
    return o;
};

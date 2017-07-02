const async = require('async');
const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');
const error = require('jm-err');
const ERR = error.Err;
const MS = require('jm-ms-core');
const _ms = new MS();
var ms = _ms.router;
const log = require('jm-log4js');
var logger = log.getLogger('jm-mlm');


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
    var service = this;
    var router = ms();
    if (service.debug) {
        router.use(function (opts, cb, next) {
            logger.debug(opts);
            next();
        });
    }
    service.routes || ( service.routes = {} );
    var routes = service.routes;
    var role = service.role;
    router.use(require('./help')(service));

    router.use(function (opts, cb, next) {
        if (!service.ready) return cb(null, ERR.FA_NOTREADY);
        next();
    });

    service.onReady()
        .then(function(){
            router.use('/teams', require('./team')(service));
        });

    return router;
};
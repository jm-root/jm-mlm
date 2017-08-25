const dao = require('jm-dao')
const event = require('jm-event')
const error = require('jm-err')
const consts = require('../consts')
const log = require('jm-log4js')
var logger = log.getLogger('jm-mlm')
var Err = consts.Err

module.exports = function (service, opts) {
  opts || (opts = {})
  opts.modelName || (opts.modelName = 'team')
  opts.schema || (opts.schema = require('../schema/team')())
  var schema = opts.schema
  schema.pre('save', function (next) {
    let self = this
    if (self.code !== undefined) return next()
    service.sq.next('teamId')
      .then(function (val) {
        self.code = '' + val
        next()
      })
      .catch(function (err) {
        throw err
      })
  })

  // 处理 teamType
  schema.pre('save', function (next) {
    let self = this
    service.teamType.findById(self.type)
      .then(function (doc) {
        if (!doc) throw error.err(error.Err.FA_PARAMS)
        self.price = doc.price
        next()
      })
      .catch(function (err) {
        throw err
      })
  })

  var model = dao.dao(opts)
  event.enableEvent(model)

  model.findByUserId = function (id, opts) {
    opts || (opts = {})
    opts.conditions = {'users.user': id}
    return this.find2(opts)
  }

  model.addUser = function (id, userId) {
    if (!id || !userId) return Promise.reject(error.err(error.Err.FA_PARAMS))
    return this.findById(id)
      .then(function (doc) {
        if (doc.status === 0) return Promise.reject(error.err(Err.FA_INVALID_TEAM))
        if (doc.status === 2) return Promise.reject(error.err(Err.FA_TEAM_FULL))
        // for (var key in doc.users) {
        //   if (doc.users[key].user == userId) {
        //     throw error.err(Err.FA_USER_EXISTS_IN_TEAM)
        //   }
        // }
        return model.findByIdAndUpdate(
          id,
          {'$push': {'users': {'user': userId}}},
          {
            'new': true
          })
      })
      .then(function (doc) {
        var length = doc.users.length
        if (length === 15) {
          return model
            .findByIdAndUpdate(id, {'status': 2})
            .then(function () {
              // 自动分组
              var idx = 1
              var t1 = []
              var t2 = []
              for (var i = 0; i < 7; i++) {
                t1.push(doc.users[idx++])
                t2.push(doc.users[idx++])
              }
              var type = doc.type

              return model
                .create({
                  type: type,
                  users: t1
                })
                .then(function (doc) {
                  return model.create({
                    type: type,
                    users: t2
                  })
                })
                .then(function (doc) {
                  return length
                })
            })
        }
        return length
      })
  }

  /**
   * 删除小组中指定用户的所有位置
   * @param id
   * @param userId
   * @returns {Promise.<TResult>}
   */
  model.delUser = function (id, userId) {
    if (!id || !userId) return Promise.reject(error.err(error.Err.FA_PARAMS))
    var ret = null
    return this.findById(id)
      .then(function (doc) {
        if (doc.status === 0) return Promise.reject(error.err(Err.FA_INVALID_TEAM))
        if (doc.status === 2) return Promise.reject(error.err(Err.FA_TEAM_FULL))
        let sp = 0
        doc.users.forEach(function (user) {
          if (user.user == userId) {
            sp += user.sp
          }
        })
        ret = {userId: userId, sp: sp}
        return model.findByIdAndUpdate(
          id,
          {'$pull': {'users': {'user': userId}}},
          {
            'new': true
          })
      })
      .then(function (doc) {
        if (ret) {
          model.emit('delUser', ret)
          logger.info('delUser %j', ret)
        }
        return ret
      })
  }

  /**
   * 删除小组中指定位置的用户
   * @param id
   * @param userId
   * @returns {Promise.<TResult>}
   */
  model.delUserById = function (id, userId) {
    if (!id || !userId) return Promise.reject(error.err(error.Err.FA_PARAMS))
    var ret = null
    return this.findById(id)
      .then(function (doc) {
        if (doc.status === 0) return Promise.reject(error.err(Err.FA_INVALID_TEAM))
        if (doc.status === 2) return Promise.reject(error.err(Err.FA_TEAM_FULL))
        var user = doc.users.id(userId)
        if (!user) return doc
        user.remove()
        ret = {userId: user.user, sp: user.sp}
        return doc.save()

        // return model.findByIdAndUpdate(
        //   id,
        //   {'$pull': {'users': {'_id': userId}}},
        //   {
        //     'new': true
        //   })
      })
      .then(function (doc) {
        if (ret) {
          model.emit('delUser', ret)
          logger.info('delUser %j', ret)
        }
        return ret
      })
  }

  model
    .findOne()
    .then(function (doc) {
      if (!doc) {
        model.create({})
          .then(function (doc) {
            console.log('inited.')
          })
      }
    })

  return model
}

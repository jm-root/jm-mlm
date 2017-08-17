var chai = require('chai')
var expect = chai.expect
var config = require('../config')
var $ = require('../lib')
var ObjectId = require('bson').ObjectId

let service = $(config)
let router = service.router()

let team = {
  code: 'test',
  title: '创富一组'
}

let log = (err, doc) => {
  err && console.error(err.stack)
}

let init = function () {
  return new Promise(function (resolve, reject) {
    service.onReady().then(() => {
      resolve(service.team.findOneAndRemove({code: team.code}))
    })
  })
}

let prepare = function () {
  return init()
    .then(function () {
      return service.team.create(team)
    })
    .then(function (team) {
      return service.user.findOne()
        .then(function (user) {
          return service.team.addUser(team.id, user.id)
        })
    })
    .catch(function (err) {
      console.error(err.stack)
    })
}

let prepare2 = function () {
  return init()
    .then(function () {
      return service.team.create(team)
    })
    .then(function (team) {
      return service.user.findOne()
        .then(function (user) {
          for (var i = 0; i < 14; i++) {
            service.team.addUser(team.id, new ObjectId())
              .then(function (doc) {
                console.log(doc)
              })
          }
          return service.team.addUser(team.id, user.id)
        })
    })
    .catch(function (err) {
      console.error(err.stack)
    })
}

describe('service', function () {
  it('find team by userId', function (done) {
    prepare2()
      .then(function () {
        return service.team.findOne({code: team.code})
      })
      .then(function (doc) {
        service.team.findByUserId(doc.users[0].user).then(function (doc) {
          expect(doc).to.be.ok
          done()
        })
      })
      .catch(function (err) {
        console.error(err.stack)
      })
  })

  it('team full', function (done) {
    prepare2()
      .then(function () {
        done()
      })
      .catch(function (err) {
        console.error(err.stack)
      })
  })

  it('router teams', function (done) {
    prepare().then(function () {
      router.get('/teams', {rows: 2}, function (err, doc) {
        expect(doc && doc.page).to.be.ok
        done()
      })
    })
  })

  it('router team', function (done) {
    prepare().then(function () {
      service.team.findOne().then(function (doc) {
        router.get('/teams/' + doc.id, function (err, doc) {
          expect(doc).to.be.ok
          done()
        })
      })
        .catch(function (err) {
          console.error(err.stack)
        })
    })
  })
})

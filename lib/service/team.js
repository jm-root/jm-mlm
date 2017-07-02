const dao = require('jm-dao');
const event = require('jm-event');
const error = require('jm-err');
const Err = error.Err;

module.exports = function (service, opts) {
    opts || (opts = {});
    opts.modelName || (opts.modelName = 'team');
    opts.schema || (opts.schema = require('../schema/team')());
    var schema = opts.schema;
    schema.pre('save', function (next) {
        let self = this;
        if (self.code !== undefined) return next();
        service.sq.next('teamId')
            .then(function (val) {
                self.code = '' + val;
                next();
            })
            .catch(function (err) {
                throw err;
            })
        ;
    });

    var model = dao.dao(opts);
    event.enableEvent(model);

    model.findByUserId = function (id, opts) {
        opts || (opts = {});
        opts.conditions = {'users.user': id};
        return this.find2(opts);
    };

    model.addUser = function (id, userId) {
        var length = 0;
        return this.findById(id)
            .then(function (doc) {
                length = doc.users.length;
                for (var key in doc.users) {
                    if (doc.users[key].user == userId) {
                        throw(new Error('user already exists in team'));
                    }
                }
                return model.findByIdAndUpdate(
                    id,
                    {'$push': {'users': {'user': userId}}},
                    {
                        'new': true
                    });
                //return model.update({_id: id}, {'$push': {'users':{ 'user': userId}}});
            })
            .then(function (doc) {
                if (doc.users.length === 15) {
                    model
                        .findByIdAndUpdate(id, {'status': 2})
                        .then(function () {
                        })
                    ;
                    //自动分组
                    var idx = 1;
                    var t1 = [];
                    var t2 = [];
                    for (var i = 0; i < 7; i++) {
                        t1.push(doc.users[idx++]);
                        t2.push(doc.users[idx++]);
                    }
                    model.create({users: t1})
                        .then(function (doc) {
                        })
                    ;
                    model.create({users: t2})
                        .then(function (doc) {
                        })
                    ;
                }
                return doc.users.length;
            })
            ;
    };

    model
        .findOne()
        .then(function (doc) {
            if (!doc) {
                model.create({})
                    .then(function (doc) {
                        console.log('inited.');
                    })
                ;
            }
        })
    ;

    return model;
};

const dao = require('jm-dao');
const event = require('jm-event');

module.exports = function (service, opts) {
    opts || (opts = {});
    opts.modelName || (opts.modelName = 'team');
    opts.schema || (opts.schema = require('../schema/team')());
    var model = dao.dao(opts);
    event.enableEvent(model);

    model.findByUserId = function (id, opts) {
        opts || (opts = {});
        opts.conditions = {'users.user': id};
        return this.find2(opts);
    };

    model.addUser = function (id, userId) {
        return this.findById(id)
            .then(function (doc) {
                doc.users.push({
                    user: userId
                });
                return doc.save();
            });
    };

    return model;
};

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'user'},
    crtime: {type: Date,  default: Date.now},
});

//Team
var schemaDefine = {
    type: {type:Number, default: 0},            //种类
    users: [userSchema]     //组员
};

module.exports = function(schema, opts) {
    schema = schema ||  require('./doc')(null, opts);
    schema.add(schemaDefine);
    return schema;
};

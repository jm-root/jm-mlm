var mongoose = require('mongoose')
var Schema = mongoose.Schema

var userSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'user'},
  sp: {type: Number, default: 0}, // 分享分
  crtime: {type: Date, default: Date.now}
})

// Team
var schemaDefine = {
  type: {type: Schema.Types.ObjectId, ref: 'teamType'},
  price: {type: Number, default: 0}, // 价格
  users: [userSchema] // 组员
}

module.exports = function (schema, opts) {
  schema = schema || require('./doc')(null, opts)
  schema.add(schemaDefine)
  return schema
}

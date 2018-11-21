const mongoose = require('mongoose')
const Schema = mongoose.Schema
const appSchema = new Schema({
  // appId: Schema.Types.ObjectId,
  appSecret: String,
  appName: String,
  description: String
})
module.exports = mongoose.model('App', appSchema)

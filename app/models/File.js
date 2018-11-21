const mongoose = require('mongoose')
const Schema = mongoose.Schema
const fileSchema = new Schema({
  appId: Schema.Types.ObjectId,
  userId: String,
  originalName: String,
  name: String,
  fullUrl: String,
  created_at: Date
})
module.exports = mongoose.model('File', fileSchema)

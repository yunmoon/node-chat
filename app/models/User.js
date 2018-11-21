const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
  userId: String,
  name: String,
  avatarUri: String,
  token: String,
  appId: Schema.Types.ObjectId,
  isOnline: {
    type: Boolean,
    default: false
  }
})
module.exports = mongoose.model('User', userSchema)

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userGroupSchema = new Schema({
  name: {
    type: String
  },
  groupId: {
    type: String
  },
  avatarUri: String,
  appId: Schema.Types.ObjectId,
  users: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ]
})

module.exports = mongoose.model('UserGroup', userGroupSchema)

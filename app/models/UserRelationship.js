const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userRelationshipSchema = new Schema({
  appId: Schema.Types.ObjectId,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  targetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model('UserRelationship', userRelationshipSchema)

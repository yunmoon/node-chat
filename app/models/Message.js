const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { PRIVATE, GROUP } = require('../constant/ConversationType')
const { FILE_MESSAGE, LOCATION_MESSAGE, TEXT_MESSAGE, VOICE_MESSAGE, IMAGE_MESSAGE, CUSTOM_MESSAGE } = require('../constant/MessageContentType')
const messageSchema = new Schema({
  appId: Schema.Types.ObjectId,
  content: Object,
  type: {
    type: Number,
    enum: [PRIVATE, GROUP] // 1 为单聊 2为群组
  },
  senderUserId: String,
  senderUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sentTime: Date,
  targetId: String, // 目标 Id
  messageType: {
    type: Number,
    enum: [FILE_MESSAGE, LOCATION_MESSAGE, TEXT_MESSAGE, VOICE_MESSAGE, IMAGE_MESSAGE, CUSTOM_MESSAGE]
  },
  mainSession: {
    type: Schema.Types.ObjectId,
    ref: 'MessageMainSession'
  }
})
module.exports = mongoose.model('Message', messageSchema)

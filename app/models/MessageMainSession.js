const mongoose = require('mongoose')
const Schema = mongoose.Schema
const messageMainSession = new Schema({
  appId: Schema.Types.ObjectId,
  groupId: {
    type: String
  },
  latestMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }, // 最后一条消息ID
  sentTime: Date // 最后一条消息发送时间
})
module.exports = mongoose.model('MessageMainSession', messageMainSession)

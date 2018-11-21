const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { PRIVATE, GROUP } = require('../constant/ConversationType')

const messageSessionSchema = new Schema({
  appId: Schema.Types.ObjectId,
  userId: String, // 某用户的会话
  mainSession: {
    type: Schema.Types.ObjectId,
    ref: 'MessageMainSession'
  }, // 主会话
  type: {
    type: Number,
    enum: [PRIVATE, GROUP] // 1 为单聊 2为群组
  },
  // title: String, // 回话标题
  targetId: String, // 根据 conversationType 的不同，可能是用户 Id、 群组 Id
  unreadMessageCount: Number, // 未读消息数
  createdMessage: Schema.Types.ObjectId // 会话创建时的消息ID，获取历史消息仅到此
  // latestMessage: Object // 最后消息内容
})
module.exports = mongoose.model('MessageSession', messageSessionSchema)

const User = require('../models/User')
const Message = require('../models/Message')
// const MessageSession = require('../models/MessageSession')
// const MessageMainSession = require('../models/MessageMainSession')
const subscribeType = require('../constant/SubscribeType')
const socketMessageType = require('../constant/SocketMessageType')
const socketEvents = require('../constant/SocketEvents')
const messageUtils = require('../services/MessageUtils')
const messageContentTypes = require('../constant/MessageContentType')
module.exports = (socket) => {
  const token = socket.handshake.query.token
  const appId = socket.handshake.query.appId
  const redisClient = require('../services/redisClient')()
  User.findOne({ token: token, appId: appId }).exec().then(result => {
    redisClient.subscribe(token)
    User.updateOne({ _id: result._id }, { isOnline: true }, (err) => {
      if (err) {
        console.log(err)
      }
    })
    socket.on(socketEvents.SESSION_LIST, (fn) => {
      messageUtils.getUserMessageSession({ userId: result.userId, appId }).then(sessions => {
        fn(null, sessions)
      }).catch(error => {
        fn(error)
      })
    })
    socket.on(socketEvents.SESSION_MESSAGE_LIST, ({ sid, limit, lastmsgId }, fn) => {
      messageUtils.getSessionMessages(sid, limit, lastmsgId).then((messages) => {
        fn(null, messages)
      }).catch(error => {
        fn(error)
      })
    })
    socket.on(socketEvents.SEND_PRIVATE_MESSAGE, (message, fn) => {
      if (!message.senderUserId) {
        fn(new Error('发送用户不能为空'))
        return false
      }
      if (!message.targetId) {
        fn(new Error('发送对象不能为空'))
        return false
      }
      if (!message.messageType) {
        fn(new Error('消息类型不能为空'))
        return false
      }
      if (Object.values(messageContentTypes).indexOf(parseInt(message.messageType)) === -1) {
        fn(new Error('消息类型不支持'))
        return false
      }
      message.app_id = appId
      messageUtils.sendPrivateMessage(message).then(messageRes => {
        fn(null, messageRes)
      }).catch(error => {
        fn(error)
      })
    })
    socket.on(socketEvents.SEND_GROUP_MESSAGE, (message, fn) => {
      if (!message.senderUserId) {
        fn(new Error('发送用户不能为空'))
        return false
      }
      if (!message.targetId) {
        fn(new Error('发送对象不能为空'))
        return false
      }
      if (!message.messageType) {
        fn(new Error('消息类型不能为空'))
        return false
      }
      if (Object.values(messageContentTypes).indexOf(parseInt(message.messageType)) === -1) {
        fn(new Error('消息类型不支持'))
        return false
      }
      message.app_id = appId
      messageUtils.sendGroupMessage(message).then(messageRes => {
        fn(null, messageRes)
      }).catch(error => {
        fn(error)
      })
    })
    socket.on(socketEvents.SET_SESSION_READ, (sid, fn) => {
      messageUtils.setMessageSessionRead(sid).then(() => {
        fn()
      }).catch(error => {
        fn(error)
      })
    })
    socket.on(socketEvents.DISCONNECT, reason => {
      User.updateOne({ _id: result._id }, { isOnline: false }, (err) => {
        if (err) {
          console.log(err)
        }
      })
    })
  }).catch(err => {
    console.log(err)
  })
  redisClient.on('message', function (channel, dataStr) {
    const data = JSON.parse(dataStr)
    switch (data.type) {
      case subscribeType.SEND_MESSAGE:
        socket.emit('message', { message: '', status: 1, data: data.data, type: socketMessageType.USER_MESSAGE })
        break
    }
  })
}

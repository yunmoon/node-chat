const { PRIVATE, GROUP } = require('../constant/ConversationType')
const { SEND_MESSAGE } = require('../constant/SubscribeType')
const RequestError = require('../exceptions/RequestError')
function MessageUtils () {
  // 发送单人消息
  this.sendPrivateMessage = (body) => {
    return new Promise((resolve, reject) => {
      const Message = require('../models/Message')
      const User = require('../models/User')
      const MessageSession = require('../models/MessageSession')
      const MessageMainSession = require('../models/MessageMainSession')
      const appId = body.app_id
      let targetSession
      async.waterfall([(cb) => {
        async.parallel({
          targetUser (cb) {
            User.findOne({ appId: appId, userId: body.targetId }).exec(cb)
          },
          senderUser (cb) {
            User.findOne({ appId: appId, userId: body.senderUserId }).exec(cb)
          }
        }, (err, { targetUser, senderUser }) => {
          if (err) {
            return cb(err)
          }
          if (!targetUser || !senderUser) {
            return cb(new RequestError(1002, '参数错误'))
          }
          return cb(null, { targetUser, senderUser })
        })
      }, ({ targetUser, senderUser }, cb) => {
        async.parallel({
          sendMessageSession (callback) {
            MessageSession.findOne({ appId: appId, userId: body.senderUserId, type: PRIVATE, targetId: body.targetId }).populate('mainSession').exec((error, messageSession) => {
              if (error) {
                return callback(error)
              }
              callback(null, messageSession)
            })
          },
          targetMessageSession (callback) {
            MessageSession.findOne({ appId: appId, userId: body.targetId, type: PRIVATE, targetId: body.senderUserId }).populate('mainSession').exec((error, messageSession) => {
              if (error) {
                return callback(error)
              }
              callback(null, messageSession)
            })
          }
        }, (error, { sendMessageSession, targetMessageSession }) => {
          return cb(error, { targetUser, senderUser, sendMessageSession, targetMessageSession })
        })
      }, ({ targetUser, senderUser, targetMessageSession, sendMessageSession }, cb) => {
        async.waterfall([(callback) => {
          if (!sendMessageSession && !targetMessageSession) {
            MessageMainSession.create({
              appId: appId
            }, callback)
          } else if (sendMessageSession) {
            callback(null, sendMessageSession.mainSession)
          } else {
            callback(null, targetMessageSession.mainSession)
          }
        }, (mainSession, callback) => {
          Message.create({
            appId: appId,
            content: body.content,
            type: PRIVATE,
            senderUserId: body.senderUserId,
            sentTime: new Date(),
            targetId: body.targetId, // 目标 Id
            messageType: body.messageType,
            mainSession: mainSession._id,
            senderUser: senderUser._id
          }, (error, message) => {
            return callback(error, { mainSession, message })
          })
        }], (error, { mainSession, message }) => {
          if (error) {
            return cb(error)
          }
          return cb(null, { targetUser, senderUser, targetMessageSession, sendMessageSession, message, mainSession })
        })
      }, ({ targetUser, senderUser, targetMessageSession, sendMessageSession, message, mainSession }, cb) => {
        async.parallel([(doing) => {
          if (!sendMessageSession) {
            MessageSession.create({
              appId: appId,
              userId: body.senderUserId,
              type: PRIVATE,
              targetId: body.targetId,
              mainSession: mainSession._id,
              // title: targetUser.name,
              unreadMessageCount: 0,
              createdMessage: message._id
            }, doing)
          } else {
            doing(null, sendMessageSession)
          }
        }, (doing) => {
          if (!targetMessageSession) {
            MessageSession.create({
              appId: appId,
              userId: body.targetId,
              type: PRIVATE,
              targetId: body.senderUserId,
              mainSession: mainSession._id,
              // title: senderUser.name,
              unreadMessageCount: 0,
              createdMessage: message._id
            }, doing)
          } else {
            doing(null, targetMessageSession)
          }
        }], (error, result) => {
          targetSession = result[1]
          cb(error, { mainSession, targetUser, senderUser, message })
        })
      }, ({ mainSession, targetUser, senderUser, message }, cb) => {
        async.parallel([(callback) => {
          MessageMainSession.updateOne({ _id: mainSession._id }, { latestMessage: message._id, sentTime: new Date() }, callback)
        }, (callback) => {
          MessageSession.updateOne({ appId: appId, userId: body.targetId, type: PRIVATE, targetId: body.senderUserId }, { $inc: { unreadMessageCount: 1 } }, callback)
        }], (error) => {
          return cb(error, { message, senderUser, targetUser })
        })
      }], (error, result) => {
        if (error) {
          console.log(error)
          return reject(error)
        }
        const { message, senderUser, targetUser } = result
        const data = this.formatMessage(message)
        data.sendSession = {
          sid: targetSession._id,
          title: targetUser.name,
          avatar: targetUser.avatarUri
        } // 接收方 sendSid 就是发送消息的target
        data.sendUser = {
          name: senderUser.name,
          avatarUri: senderUser.avatarUri
        }
        const redisClient = require('../services/redisClient')()
        redisClient.publish(targetUser.token, JSON.stringify({ type: SEND_MESSAGE, data: data }))
        return resolve(data)
      })
    })
  }
  // 发送群组消息
  this.sendGroupMessage = (body) => {
    const self = this
    return new Promise((resolve, reject) => {
      const Message = require('../models/Message')
      const User = require('../models/User')
      const UserGroup = require('../models/UserGroup')
      const MessageSession = require('../models/MessageSession')
      const MessageMainSession = require('../models/MessageMainSession')
      const appId = body.app_id
      async.waterfall([(cb) => {
        async.parallel({
          targetGroup (cb) {
            UserGroup.findOne({ appId: appId, groupId: body.targetId }).populate('users').exec(cb)
          },
          senderUser (cb) {
            User.findOne({ appId: appId, userId: body.senderUserId }).exec(cb)
          }
        }, (err, { targetGroup, senderUser }) => {
          if (err) {
            return cb(err)
          }
          if (!targetGroup || !senderUser) {
            return cb(new RequestError(1002, '参数错误'))
          }
          return cb(null, { targetGroup, senderUser })
        })
      }, ({ targetGroup, senderUser }, cb) => {
        const groupUsers = targetGroup.users
        const thisGroupUser = _.find(groupUsers, (item) => {
          return item._id === senderUser._id
        })
        if (!thisGroupUser) {
          return cb(new RequestError(1000, '此用户已不再当前群组'))
        }
        MessageMainSession.findOne({ appId: appId, groupId: body.targetId }).exec((error, mainSession) => {
          if (error) {
            cb(error)
          } else {
            if (mainSession) {
              cb(null, { targetGroup, senderUser, mainSession })
            } else {
              MessageMainSession.create({
                appId: appId,
                groupId: body.targetId
              }, (error, mainSession) => {
                if (error) {
                  cb(error)
                } else {
                  cb(null, { targetGroup, senderUser, mainSession })
                }
              })
            }
          }
        })
      }, ({ targetGroup, senderUser, mainSession }, cb) => {
        Message.create({
          appId: appId,
          content: body.content,
          type: GROUP,
          senderUserId: body.senderUserId,
          sentTime: new Date(),
          targetId: body.targetId, // 目标 Id
          messageType: body.messageType,
          mainSession: mainSession._id,
          senderUser: senderUser._id
        }, (error, message) => {
          if (error) {
            cb(error)
          } else {
            cb(null, { targetGroup, senderUser, mainSession, message })
          }
        })
      }, ({ targetGroup, senderUser, mainSession, message }, cb) => {
        MessageMainSession.update({ _id: mainSession._id }, { latestMessage: message._id, sentTime: message.sentTime }, (error) => {
          if (error) {
            console.log(error)
          }
        })
        const users = targetGroup.users
        const redisClient = require('../services/redisClient')()
        const msgData = self.formatMessage(message)
        let sendUserSid
        msgData.sendUser = {
          name: senderUser.name,
          avatarUri: senderUser.avatarUri
        }
        async.each(users, (user, callback) => {
          async.waterfall([(doing) => {
            MessageSession.findOne({ appId: appId, userId: user.userId, type: GROUP, targetId: targetGroup.groupId }).exec(doing)
          }, (messageSession, doing) => {
            if (messageSession) {
              doing(null, messageSession)
            } else {
              MessageSession.create({
                appId: appId,
                userId: user.userId,
                type: GROUP,
                targetId: targetGroup.groupId,
                mainSession: mainSession._id,
                unreadMessageCount: 0,
                createdMessage: message._id
              }, doing)
            }
          }, (messageSession, doing) => {
            if (senderUser.userId !== user.userId) {
              msgData.sendSession = {
                sid: messageSession._id,
                title: targetGroup.name,
                avatar: targetGroup.avatarUri
              }
              redisClient.publish(user.token, JSON.stringify({ type: SEND_MESSAGE, data: msgData }))
              MessageSession.updateOne({ _id: messageSession._id }, { $inc: { unreadMessageCount: 1 } }, doing)
            } else {
              sendUserSid = messageSession._id
              doing()
            }
          }], callback)
        }, (error) => {
          if (error) {
            cb(error)
          } else {
            msgData.sendSid = sendUserSid
            cb(null, msgData)
          }
        })
      }], (error, msgData) => {
        if (error) {
          console.log(error)
          return reject(error)
        }
        return resolve(msgData)
      })
    })
  }
  this.formatMessage = (message) => {
    const data = {
      msgId: message._id,
      content: message.content,
      conversationType: message.type,
      senderUserId: message.senderUserId,
      targetId: message.targetId, // 目标 Id
      messageType: message.messageType
    }
    if (moment(message.sentTime).startOf('day').unix() === moment().startOf('day').unix()) {
      data.date = moment(message.sentTime).format('HH:mm')
    } else {
      data.date = moment(message.sentTime).format('YY/MM/DD')
    }
    return data
  }
  this.formatMessageSession = (item) => {
    const self = this
    const data = {
      sid: item._id,
      conversationType: item.type,
      targetId: item.targetId,
      unread: item.unreadMessageCount
    }
    const MessageMainSession = require('../models/MessageMainSession')
    return new Promise((resolve, reject) => {
      async.parallel({
        targetObj (callback) {
          self.getTargetObject({ type: item.type, appId: item.appId, targetId: item.targetId }).then(targetObj => {
            callback(null, targetObj)
          }).catch(err => {
            callback(err)
          })
        },
        mainSession (callback) {
          MessageMainSession.findOne({ _id: item.mainSession }).populate('latestMessage').exec((err, mainSession) => {
            if (err) {
              return callback(err)
            }
            callback(null, mainSession)
          })
        }
      }, (error, { targetObj, mainSession }) => {
        if (error) {
          return reject(error)
        }
        if (!targetObj) {
          return reject(new Error('参数错误'))
        }
        data.title = targetObj.name
        data.avatar = targetObj.avatarUri
        if (mainSession.latestMessage) {
          data.lastMsg = {
            content: mainSession.latestMessage.content.content,
            messageType: mainSession.latestMessage.messageType
          }
          if (moment(mainSession.latestMessage.sentTime).startOf('day').unix() === moment().startOf('day').unix()) {
            data.lastMsg.date = moment(mainSession.latestMessage.sentTime).format('HH:mm')
          } else {
            data.lastMsg.date = moment(mainSession.latestMessage.sentTime).format('YY/MM/DD')
          }
        }
        return resolve(data)
      })
    })
  }
  this.getTargetObject = ({ type, targetId, appId }) => {
    const User = require('../models/User')
    const UserGroup = require('../models/UserGroup')
    return new Promise((resolve, reject) => {
      switch (type) {
        case PRIVATE:
          User.findOne({ userId: targetId, appId: appId }).exec((err, user) => {
            if (err) {
              return reject(err)
            }
            return resolve(user)
          })
          break
        case GROUP:
          UserGroup.findOne({ groupId: targetId, appId: appId }).exec((err, group) => {
            if (err) {
              return reject(err)
            }
            return resolve(group)
          })
          break
      }
    })
  }
  this.getUserMessageSession = ({ userId, appId }) => {
    const self = this
    const MessageSession = require('../models/MessageSession')
    return new Promise((resolve, reject) => {
      async.waterfall([(cb) => {
        MessageSession.find({ userId: userId, appId: appId }, '-__v').exec(cb)
      }, (sessions, cb) => {
        async.map(sessions, (item, callback) => {
          self.formatMessageSession(item).then(data => {
            callback(null, data)
          }).catch(callback)
        }, cb)
      }], (error, sessions) => {
        if (error) {
          return reject(error)
        }
        return resolve(_.compact(sessions))
      })
    })
  }
  this.getSessionMessages = (sid, limit = 0, lastmsgId = null) => {
    const Message = require('../models/Message')
    const MessageSession = require('../models/MessageSession')
    const User = require('../models/User')
    return new Promise((resolve, reject) => {
      async.waterfall([(cb) => {
        MessageSession.findOne({ _id: sid }).exec(cb)
      }, (messageSession, cb) => {
        if (!messageSession) {
          return cb(new Error('参数错误'))
        }
        let query = Message.find({ mainSession: messageSession.mainSession }).populate('senderUser').sort({ sentTime: -1 })
        if (limit > 0) {
          query = query.limit(limit)
        }
        if (lastmsgId) {
          query = query.where({ _id: { $lt: lastmsgId } })
        }
        query.exec(cb)
      }, (messages, cb) => {
        const list = messages.map(message => {
          const data = this.formatMessage(message)
          if (message.senderUser) {
            data.sendUser = {
              name: message.senderUser.name,
              avatarUri: message.senderUser.avatarUri
            }
          }
          return data
        })
        cb(null, list)
      }], (error, messages) => {
        if (error) {
          return reject(error)
        }
        return resolve(messages)
      })
    })
  }
  this.setMessageSessionRead = (sid) => {
    const MessageSession = require('../models/MessageSession')
    return MessageSession.updateOne({ _id: sid }, { unreadMessageCount: 0 })
  }
  this.getSendUserSession = ({ senderUserId, targetId, appId, conversationType }) => {
    const MessageSession = require('../models/MessageSession')
    const MessageMainSession = require('../models/MessageMainSession')
    return new Promise((resolve, reject) => {
      MessageSession.findOne({ appId: appId, userId: senderUserId, type: conversationType, targetId: targetId }).exec((error, messageSession) => {
        if (error) {
          return reject(error)
        }
        if (messageSession) {
          return resolve(messageSession)
        } else {
          async.waterfall([(cb) => {
            MessageSession.findOne({ appId: appId, userId: targetId, type: conversationType, targetId: senderUserId }).exec(cb)
          }, (targetMessageSession, cb) => {
            if (targetMessageSession) {
              cb(null, targetMessageSession.mainSession)
            } else {
              MessageMainSession.create({
                appId: appId
              }, (err, mainSession) => {
                if (err) {
                  cb(err)
                } else {
                  cb(null, mainSession._id)
                }
              })
            }
          }, (mainSessionId, cb) => {
            MessageSession.create({
              appId: appId,
              userId: senderUserId,
              type: conversationType,
              targetId: targetId,
              mainSession: mainSessionId,
              unreadMessageCount: 0
            }, cb)
          }], (error, messageSession) => {
            if (error) {
              return reject(error)
            }
            return resolve(messageSession)
          })
        }
      })
    })
  }
}
module.exports = new MessageUtils()

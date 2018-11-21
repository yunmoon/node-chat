const router = require('express').Router()
const { check, validationResult } = require('express-validator/check')
const { sendPrivateMessage, getSessionMessages, sendGroupMessage } = require('../services/MessageUtils')
const conversationTypes = require('../constant/ConversationType')
const messageContentTypes = require('../constant/MessageContentType')
// 发送私聊消息
router.post('/private/send/message', [
  check('senderUserId').custom(val => {
    if (!val) {
      throw new Error('发送用户不能为空')
    }
    return true
  }),
  check('targetId').custom(val => {
    if (!val) {
      throw new Error('发送对象不能为空')
    }
    return true
  }),
  check('messageType').custom(val => {
    if (!val) {
      throw new Error('消息类型不能为空')
    }
    if (Object.values(messageContentTypes).indexOf(parseInt(val)) === -1) {
      throw new Error('消息类型不支持')
    }
    return true
  })
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 1002, message: errors.array().pop().msg })
  }
  sendPrivateMessage(req.body).then(message => {
    return res.json({ status: 1, message: '发送成功', data: message })
  }).catch(error => {
    next(error)
  })
})
// 发送群聊消息
router.post('/group/send/message', [
  check('senderUserId').custom(val => {
    if (!val) {
      throw new Error('发送用户不能为空')
    }
    return true
  }),
  check('targetId').custom(val => {
    if (!val) {
      throw new Error('发送对象不能为空')
    }
    return true
  }),
  check('messageType').custom(val => {
    if (!val) {
      throw new Error('消息类型不能为空')
    }
    if (Object.values(messageContentTypes).indexOf(parseInt(val)) === -1) {
      throw new Error('消息类型不支持')
    }
    return true
  })
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new Error(errors.array().pop().msg))
  }
  sendGroupMessage(req.body).then(message => {
    return res.json({ status: 1, message: '发送成功', data: message })
  }).catch(error => {
    next(error)
  })
})
// 获取会话历史消息
router.get('/session/messages', [
  check('userId').custom(val => {
    if (!val) {
      throw new Error('发送用户不能为空')
    }
    return true
  }),
  check('targetId').custom(val => {
    if (!val) {
      throw new Error('发送对象不能为空')
    }
    return true
  }),
  check('conversationType').custom(val => {
    if (!val) {
      throw new Error('发送对象类型不能为空')
    }
    if (Object.values(conversationTypes).indexOf(parseInt(val)) === -1) {
      throw new Error('发送对象类型错误')
    }
    return true
  })], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 1002, message: errors.array().pop().msg })
  }
  const MessageSession = require('../models/MessageSession')
  MessageSession.findOne({ appId: req.query.app_id, targetId: req.query.targetId, userId: req.query.userId, type: req.query.conversationType }).exec().then(messageSession => {
    if (!messageSession) {
      return Promise.resolve([])
    }
    return getSessionMessages(messageSession._id, req.query.limit ? parseInt(req.query.limit) : 0, req.query.lastmsgId)
  }).then(messages => {
    return res.json({ status: 1, message: '获取成功', data: messages })
  }).catch(error => {
    next(error)
  })
})

module.exports = router

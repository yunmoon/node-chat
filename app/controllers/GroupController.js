const router = require('express').Router()
const { check, validationResult } = require('express-validator/check')
const UserGroup = require('../models/UserGroup')
const User = require('../models/User')
const { GROUP } = require('../constant/ConversationType')
const MessageSession = require('../models/MessageSession')
router.post('/group/create', [
  check('groupId').custom(val => {
    if (!val) {
      throw new Error('群组ID不能为空')
    }
    return true
  }),
  check('userIds').custom(val => {
    if (!val || !val.length) {
      throw new Error('用户ID不能为空')
    }
    return true
  }),
  check('name').custom(val => {
    if (!val) {
      throw new Error('群组名称不能为空')
    }
    return true
  })
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new Error(errors.array().pop().msg))
  }
  const body = req.body
  async.waterfall([(cb) => {
    UserGroup.findOne({ appId: body.app_id, groupId: body.groupId }).exec(cb)
  }, (userGroup, cb) => {
    async.map(body.userIds, (userId, callback) => {
      User.findOne({ appId: body.app_id, userId: userId }).exec((error, user) => {
        if (error) {
          callback(error)
        } else {
          if (user) {
            callback(null, user._id)
          } else {
            callback()
          }
        }
      })
    }, (error, userIds) => {
      cb(error, { userGroup, userIds: _.compact(userIds) })
    })
  }, ({ userGroup, userIds }, cb) => {
    if (userGroup) {
      UserGroup.update({ _id: userGroup._id }, { name: body.name, $addToSet: { users: { $each: userIds } } }, cb)
    } else {
      UserGroup.create({
        appId: body.app_id,
        groupId: body.groupId,
        avatarUri: body.avatarUri,
        name: body.name,
        users: userIds
      }, cb)
    }
  }], (error) => {
    if (error) {
      return next(error)
    }
    return res.json({ status: 1, message: '创建成功' })
  })
})
router.post('/group/join', [
  check('groupId').custom(val => {
    if (!val) {
      throw new Error('群组ID不能为空')
    }
    return true
  }),
  check('userIds').custom(val => {
    if (!val || !val.length) {
      throw new Error('用户ID不能为空')
    }
    return true
  })
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new Error(errors.array().pop().msg))
  }
  const body = req.body
  async.waterfall([(cb) => {
    UserGroup.findOne({ appId: body.app_id, groupId: body.groupId }).exec(cb)
  }, (userGroup, cb) => {
    if (!userGroup) {
      return cb(new Error('群组不存在'))
    }
    async.map(body.userIds, (userId, callback) => {
      User.findOne({ appId: body.app_id, userId: userId }).exec((error, user) => {
        if (error) {
          callback(error)
        } else {
          if (user) {
            callback(null, user._id)
          } else {
            callback()
          }
        }
      })
    }, (error, userIds) => {
      cb(error, { userGroup, userIds: _.compact(userIds) })
    })
  }, ({ userGroup, userIds }, cb) => {
    UserGroup.update({ _id: userGroup._id }, { $addToSet: { users: { $each: userIds } } }, cb)
  }], (error) => {
    if (error) {
      return next(error)
    }
    return res.json({ status: 1, message: '加入成功' })
  })
})
router.post('/group/remove', [
  check('groupId').custom(val => {
    if (!val) {
      throw new Error('群组ID不能为空')
    }
    return true
  }),
  check('userIds').custom(val => {
    if (!val || !val.length) {
      throw new Error('用户ID不能为空')
    }
    return true
  })
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new Error(errors.array().pop().msg))
  }
  const body = req.body
  async.waterfall([(cb) => {
    UserGroup.findOne({ appId: body.app_id, groupId: body.groupId }).exec(cb)
  }, (userGroup, cb) => {
    if (!userGroup) {
      return cb(new Error('群组不存在'))
    }
    async.map(body.userIds, (userId, callback) => {
      User.findOne({ appId: body.app_id, userId: userId }).exec((error, user) => {
        if (error) {
          callback(error)
        } else {
          if (user) {
            callback(null, user._id)
          } else {
            callback()
          }
        }
      })
    }, (error, userIds) => {
      cb(error, { userGroup, userIds: _.compact(userIds) })
    })
  }, ({ userGroup, userIds }, cb) => {
    MessageSession.deleteMany({ appId: body.app_id, userId: { $in: userIds }, type: GROUP, targetId: body.groupId }, (error) => {
      cb(error, { userGroup, userIds })
    })
  }, ({ userGroup, userIds }, cb) => {
    UserGroup.update({ _id: userGroup._id }, { $pullAll: { users: userIds } }, cb)
  }], (error) => {
    if (error) {
      return next(error)
    }
    return res.json({ status: 1, message: '移除成功' })
  })
})
module.exports = router

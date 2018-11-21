const router = require('express').Router()
const { check, validationResult } = require('express-validator/check')
const User = require('../models/User')
// const ObjectId = require('mongoose').Schema.ObjectId
router.post('/user/getToken', [
  check('userId').custom(val => {
    if (!val) {
      throw new Error('用户ID不能为空')
    }
    return true
  }),
  check('name').custom(val => {
    if (!val) {
      throw new Error('用户昵称不能为空')
    }
    return true
  })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 1002, message: errors.array().pop().msg })
  }
  const body = req.body
  User.findOneAndUpdate({ userId: body.userId, appId: body.app_id }, { name: body.name, avatarUri: body.avatarUri }).exec().then(result => {
    if (!result) {
      return User.create({
        userId: body.userId,
        name: body.name,
        avatarUri: body.avatarUri,
        token: Buffer.from(body.app_id + new Date().getTime() + body.userId).toString('base64'),
        appId: body.app_id
      })
    } else {
      return Promise.resolve(result)
    }
  }).then(result => {
    console.log(result)
    return res.json({ status: 1, message: '获取成功', data: { token: result.token } })
  }).catch(err => {
    return res.status(422).json({ status: err.status ? err.status : 1000, message: err.message })
  })
})
module.exports = router

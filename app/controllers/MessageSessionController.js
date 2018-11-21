const router = require('express').Router()
const { check, validationResult } = require('express-validator/check')
const { getUserMessageSession } = require('../services/MessageUtils')
router.get('/user/sessions', [
  check('userId').custom(val => {
    if (!val) {
      throw new Error('用户Id不能为空')
    }
    return true
  })
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 1002, message: errors.array().pop().msg })
  }
  getUserMessageSession({ userId: req.query.userId, appId: req.query.app_id }).then(sessions => {
    return res.json({ status: 1, message: '获取成功', data: sessions })
  }).catch(error => {
    next(error)
  })
})
module.exports = router

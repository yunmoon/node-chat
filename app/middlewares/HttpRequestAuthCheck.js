const User = require('../models/User')
module.exports = (req, res, next) => {
  const data = _.extend(req.query, req.body)
  const token = data.token
  const appId = data.appId
  User.findOne({ token: token, appId: appId }).exec().then(result => {
    if (result) {
      req.user = result
      next()
    } else {
      return next(new Error('用户认证错误'))
    }
  })
}

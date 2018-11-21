const User = require('../models/User')
module.exports = (socket, next) => {
  const token = socket.handshake.query.token
  const appId = socket.handshake.query.appId
  User.findOne({ token: token, appId: appId }).exec().then(result => {
    if (result) {
      next()
    } else {
      return next(new Error('用户认证错误'))
    }
  })
}

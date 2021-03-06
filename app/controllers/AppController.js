const router = require('express').Router()
const crypto = require('crypto')
const App = require('../models/App')
router.post('/app/create', (req, res) => {
  const app = req.body
  const buf = crypto.randomBytes(16)
  App.create({
    appSecret: buf.toString('hex'),
    appName: app.appName,
    description: app.description
  }, (err, app) => {
    if (err) {
      return res.status(400).send(err)
    }
    return res.json({ status: 1, message: '创建成功', data: { appName: app.appName, appSecret: app.appSecret, appId: app._id } })
  })
})
module.exports = router

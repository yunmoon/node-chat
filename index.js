const express = require('express')
const app = express()
const path = require('path')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const routers = require('./routers')
const { checkSign } = require('./app/services/apiUtils')
const socketCtl = require('./app/controllers/SocketController')

const redisClient = global.redisClient = require('./app/services/redisClient')()

const mongoose = global.mongoose = require('mongoose')
global.moment = require('moment')
global._ = require('lodash')
global.async = require('async')

mongoose.connect(require('./configs/connection').url)

io.use(require('./app/middlewares/SocketAuthCheck')).on('connection', socketCtl)

redisClient.on('error', (err) => {
  console.error('Error' + err)
})
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}))

app.use((req, res, next) => {
  const whiteList = ['/app/create', '/file/upload']
  if (whiteList.indexOf(req.path) !== -1) {
    next()
  } else {
    let data = req.query
    if (req.method === 'POST') {
      data = _.extend(data, req.body)
    }
    checkSign(data).then(() => {
      next()
    }, err => {
      return res.status(400).json({ status: err.status, message: err.message })
    })
  }
}, routers)
app.use((err, req, res, next) => {
  console.error(err.stack)
  if (err instanceof require('./app/exceptions/RequestError')) {
    res.status(400)
  } else {
    res.status(500)
  }
  return res.json({ status: err.status ? err.status : 1000, message: err.message })
})
// redisClient.set('string key', 'string val', console.log)

http.listen(3000, () => {
  console.log('listening on *:3000')
})

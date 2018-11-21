const userController = require('./app/controllers/UserController')
const appController = require('./app/controllers/AppController')
const messageController = require('./app/controllers/MessageController')
const messageSessionController = require('./app/controllers/MessageSessionController')
const groupController = require('./app/controllers/GroupController')
const fileController = require('./app/controllers/FileController')

module.exports = [userController, appController,
  messageController, messageSessionController,
  groupController, fileController]

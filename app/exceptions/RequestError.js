function RequestError (status = -1, message = '请求错误') {
  this.name = 'RequestError'
  this.status = status
  this.message = message
  this.stack = (new Error()).stack
}

RequestError.prototype = Object.create(Error.prototype)
RequestError.prototype.constructor = RequestError

module.exports = RequestError

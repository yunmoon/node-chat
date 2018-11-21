const mime = require('mime-types')
const types = ['image', 'audio', 'video', 'file']
function getDestination (req, file, cb) {
  console.log(mime.extension(file.mimetype))
  console.log(req.query)
  cb(null, '/dev/null')
}

function OssStorage (opts = {}) {
  this.getDestination = (opts.destination || getDestination)
}
OssStorage.prototype._handleFile = function (req, file, cb) {
  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err)
  })
}
OssStorage.prototype._removeFile = function (req, file, cb) {
}
module.exports = function (opts) {
  return new OssStorage(opts)
}

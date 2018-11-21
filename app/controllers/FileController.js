const router = require('express').Router()
const multer = require('multer')
const ossStorage = require('multer-oss-storage')({
  oss: require('../../configs/filesystem').oss,
  allowed: ['jpeg', 'jpg', 'png', 'zip']
})
const File = require('../models/File')
const cors = require('cors')
router.options('/file/upload', cors())
router.post('/file/upload', [cors(), require('../middlewares/HttpRequestAuthCheck'), multer({ storage: ossStorage }).single('up_file')], (req, res, next) => {
  if (!req.file) {
    return next(new Error('请上传文件'))
  }
  File.create({
    appId: req.query.appId,
    originalName: req.file.originalname,
    name: req.file.name,
    fullUrl: req.file.url,
    created_at: new Date(),
    userId: req.user.userId
  }, (error, result) => {
    if (error) {
      return next(error)
    }
    return res.json({ status: 1, message: '上传成功', data: { fid: result._id, fullUrl: result.fullUrl } })
  })
})
module.exports = router

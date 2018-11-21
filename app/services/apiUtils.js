const crypto = require('crypto')
const RequestError = require('../exceptions/RequestError')
function ApiUtils () {
  this.objectSort = (obj) => {
    const keys = Object.keys(obj).sort()
    let newObj = {}
    keys.forEach((val) => {
      newObj[val] = obj[val]
    })
    return newObj
  }
  this.formatStr = (obj) => {
    const strs = []
    Object.keys(obj).forEach((val) => {
      strs.push(`${val}=${encodeURIComponent(obj[val])}`)
    })
    return strs.join('&')
  }
  this.getReqSign = (str, appkey) => {
    str += `&app_key=${appkey}`
    const md5 = crypto.createHash('md5')
    return md5.update(str).digest('hex')
  }
  this.checkSign = (data) => {
    const self = this
    return new Promise((resolve, reject) => {
      if (!data.time_stamp || !data.app_id || !data.nonce_str || !data.sign) {
        return reject(new RequestError(1002, '参数错误'))
      }
      const now = new Date().getTime()
      if (now - parseInt(data.time_stamp) > 5 * 60 * 1000) {
        return reject(new RequestError(1002, '接口已过期'))
      }
      const App = require('../models/App')
      App.findById(data.app_id).exec().then(result => {
        if (!result) {
          return Promise.reject(new RequestError(1006, 'App 被锁定或删除'))
        }
        return Promise.resolve(result)
      }).then((result) => {
        const appSecret = result.appSecret
        const cpData = _.clone(data)
        delete cpData.sign
        const sign = self.getReqSign(self.formatStr(self.objectSort(cpData)), appSecret)
        console.log(sign)
        if (sign !== data.sign) {
          return Promise.reject(new RequestError(1004, '验证签名错误'))
        }
        resolve()
      }).catch(err => {
        if (err instanceof RequestError === false) {
          err.status = 1000
        }
        reject(err)
      })
    })
  }
}
module.exports = new ApiUtils()

const redisConfigs = require('../../configs/redis')
const redis = require('redis')

module.exports = () => {
  if (redisConfigs.url) {
    return redis.createClient({ url: redisConfigs.url })
  }
  Object.keys(redisConfigs).forEach((val) => {
    if (!redisConfigs[val]) {
      delete redisConfigs[val]
    }
  })
  if (redisConfigs.path) {
    delete redisConfigs.host
    delete redisConfigs.port
    return redis.createClient(redisConfigs)
  }
  return redis.createClient(redisConfigs)
}

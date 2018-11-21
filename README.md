## 众望智慧IM服务系统
支持 用户单聊，群聊。

### 使用文档
#### 安装配置说明
```bash
# 安装扩展包
npm install
```
配置相关参数
```javascript
// 配置mongodb 数据库连接参数 configs/connection.js
module.exports = {
  // mongodb://username:password@host:port/database?options...
  url: 'mongodb://127.0.0.1:27017/chat'
}
// 配置redis 连接参数 configs/redis.js
module.exports = {
  url: '',
  host: '127.0.0.1',
  port: 6379,
  path: '',
  password: '',
  db: 0,
  prefix: 'chat_'
}
// 配置阿里云文件上传参数 configs/filesystem.js
module.exports = {
  oss: {
    region: '',
    // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
    accessKeyId: '',
    accessKeySecret: '',
    bucket: ''
  }
}
```
运行程序
```bash
npm start
```
#### http接口
##### 1\. 创建应用接口
###### 接口功能 
> 创建应用 获取appId 和 appSecret
###### URL地址
> /app/create
###### HTTP请求方式
> POST 
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |appName    |ture    |string|应用名称 |
> |description    |ture    |string|应用描述 |
###### 返回结果
```json
{
    "status": 1,
    "message": "创建成功",
    "data": {
        "appName": "appName",
        "appSecret": "appSecret",
        "appId": "appId"
    }
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|appName   |string    |应用名称 |
>|appSecret   |string    |应用appSecret |
>|appId   |string    |应用appId |

##### 2\. 获取User token
###### 接口功能 
> 根据userId 获取用户的 token
###### URL地址
> /user/getToken
###### HTTP请求方式
> POST 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |userId    |ture    |string|userId |
> |name    |ture    |string|用户昵称 |
> |avatarUri    |ture    |string|用户头像 |
###### 返回结果
```json
{
    "status": 1,
    "message": "获取成功",
    "data": {
        "token": "NWJiYzgxYzU0MTgwNDkyNGViMmU2ZDU3MTU0MDM2OTgyMTc0ODM="
    }
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|token   |string    |用户token |

##### 3\. 获取User会话列表
###### 接口功能 
> 根据userId 获取用户的历史会话列表
###### URL地址
> /user/sessions
###### HTTP请求方式
> GET 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |userId    |ture    |string|userId |
###### 返回结果
```json
{
    "status": 1,
    "message": "获取成功",
    "data": [
        {
            "sid": "5bc053d1d7745643263a22fa",
            "conversationType": 1,
            "targetId": "2",
            "unread": 0,
            "title": "小李",
            "avatar": "https://han960619.github.io/Vue-chat/static/images/%E5%B0%8F%E5%A7%A8%E5%A6%88.jpg",
            "lastMsg": {
                "content": "搜索",
                "messageType": 1,
                "date": "18/11/05"
            }
        },
        {
            "sid": "5bd2bc6acca08418a83792f3",
            "conversationType": 2,
            "targetId": "1",
            "unread": 0,
            "title": "测试群",
            "avatar": "https://avatars1.githubusercontent.com/u/15651299?s=64&v=4",
            "lastMsg": {
                "content": "请求",
                "messageType": 1,
                "date": "18/11/05"
            }
        }
    ]
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|sid   |string    |会话ID |
>|conversationType   |number    |会话类型，参考会话类型说明 |
>|targetId   |string    |发送对象ID |
>|unread   |number    |消息未读数 |
>|title   |string    |会话标题 |
>|avatar   |string    |会话头像 |
>|lastMsg.content   |string    |最后一条消息内容 |
>|lastMsg.messageType   |number    |最后一条消息类型，参考消息类型说明 |
>|lastMsg.date   |string    |最后一条消息发送时间 |
##### 4\. 创建群组
###### 接口功能 
> 创建聊天群组
###### URL地址
> /group/create
###### HTTP请求方式
> POST 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |groupId    |ture    |string|群组ID |
> |userIds    |ture    |array|用户IDS |
> |name    |ture    |string|群组名称 |
> |avatarUri    |false    |string|群组头像 |
###### 返回结果
```json
{
    "status": 1,
    "message": "创建成功"
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
##### 5\. 用户加入群组
###### 接口功能 
> 用户加入群组
###### URL地址
> /group/join
###### HTTP请求方式
> POST 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |groupId    |ture    |string|群组ID |
> |userIds    |ture    |array|用户IDS |
###### 返回结果
```json
{
    "status": 1,
    "message": "加入成功"
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |

##### 6\. 移除群组用户
###### 接口功能 
> 移除群组用户
###### URL地址
> /group/remove
###### HTTP请求方式
> POST 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |groupId    |ture    |string|群组ID |
> |userIds    |ture    |array|用户IDS |
###### 返回结果
```json
{
    "status": 1,
    "message": "移除成功"
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |

##### 7\. 发送单聊消息
###### 接口功能 
> 发送单聊消息
###### URL地址
> /private/send/message
###### HTTP请求方式
> POST 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |senderUserId    |ture    |string|发送用户ID |
> |targetId    |ture    |string|接受用户ID |
> |content    |ture    |object|消息体，不同类型的消息参数不一样 |
> |messageType    |ture    |number|消息类型 参考消息类型说明|
###### 返回结果
```json
{
    "status": 1,
    "message": "发送成功",
    "data": {
        "msgId": "5be3df8958a3a67c1aeafe2e",
        "content": {
            "content": "沙发斯蒂芬斯蒂芬"
        },
        "conversationType": 1,
        "senderUserId": "2",
        "targetId": "1",
        "messageType": 1,
        "date": "15:02",
        "sendSession": {
            "sid": "5bc053d1d7745643263a22fa",
            "title": "小明",
            "avatar": "https://avatars3.githubusercontent.com/u/12846955?s=40&v=4"
        },
        "sendUser": {
            "name": "小李",
            "avatarUri": "https://han960619.github.io/Vue-chat/static/images/%E5%B0%8F%E5%A7%A8%E5%A6%88.jpg"
        }
    }
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |string| 会话类型 参考会话类型说明|
>|senderUserId    |string| 发送用户ID |
>|targetId    |string| 接收用户ID |
>|messageType    |string| 消息类型 参考消息类型说明 |
>|date    |string| 发送时间 |
>|sendSession.sid    |string| 发送方会话ID |
>|sendSession.title    |string| 发送方会话标题 |
>|sendSession.avatar    |string| 发送方会话头像 |
>|sendUser.name    |string| 发送用户名称 |
>|sendUser.avatarUri    |string| 发送用户头像 |

##### 8\. 发送群聊消息
###### 接口功能 
> 发送单聊消息
###### URL地址
> /group/send/message
###### HTTP请求方式
> POST 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |senderUserId    |ture    |string|发送用户ID |
> |targetId    |ture    |string|接收群组ID |
> |content    |ture    |object|消息体，不同类型的消息参数不一样 |
> |messageType    |ture    |number|消息类型 参考消息类型说明|
###### 返回结果
```json
{
    "status": 1,
    "message": "发送成功",
    "data": {
        "msgId": "5be3df8958a3a67c1aeafe2e",
        "content": {
            "content": "沙发斯蒂芬斯蒂芬"
        },
        "conversationType": 2,
        "senderUserId": "2",
        "targetId": "1",
        "messageType": 1,
        "date": "15:02",
        "sendSession": {
            "sid": "5bc053d1d7745643263a22fa",
            "title": "小明",
            "avatar": "https://avatars3.githubusercontent.com/u/12846955?s=40&v=4"
        },
        "sendUser": {
            "name": "小李",
            "avatarUri": "https://han960619.github.io/Vue-chat/static/images/%E5%B0%8F%E5%A7%A8%E5%A6%88.jpg"
        }
    }
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |int| 会话类型 参考会话类型说明|
>|senderUserId    |string| 发送用户ID |
>|targetId    |string| 接收群组ID |
>|messageType    |int| 消息类型 参考消息类型说明 |
>|date    |string| 发送时间 |
>|sendSession.sid    |string| 发送方会话ID |
>|sendSession.title    |string| 发送方会话标题 |
>|sendSession.avatar    |string| 发送方会话头像 |
>|sendUser.name    |string| 发送用户名称 |
>|sendUser.avatarUri    |string| 发送用户头像 |

##### 9\. 获取会话内的历史消息
###### 接口功能 
> 获取会话内的历史消息
###### URL地址
> /session/messages
###### HTTP请求方式
> GET 
###### 签名方法
> 请参考通用 API 接口签名规则
###### 请求参数
> |参数|必选|类型|说明|
> |:-----  |:-------|:-----|-----  |
> |app_id    |ture    |string|应用ID |
> |time_stamp    |ture    |string|时间戳 |
> |nonce_str    |ture    |string|随机数 |
> |sign    |ture    |string|签名 |
> |userId    |ture    |string|用户ID |
> |targetId    |ture    |string|接受用户ID |
> |conversationType    |ture    |int|会话类型 参考会话类型说明 |
> |limit    |false    |int|接口返回数据条数 |
> |lastmsgId    |false    |string|消息ID 分页查询时获取小于它的消息 |
###### 返回结果
```json
{
    "status": 1,
    "message": "获取成功",
    "data": [
        {
            "msgId": "5bf3a987abebf055ff62a5d6",
            "content": {
                "content": "哈哈哈哈"
            },
            "conversationType": 1,
            "senderUserId": "1",
            "targetId": "2",
            "messageType": 1,
            "date": "14:28",
            "sendUser": {
                "name": "小王",
                "avatarUri": "https://avatars0.githubusercontent.com/u/1073262?s=88&v=4"
            }
        }
    ]
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |int| 会话类型 参考会话类型说明|
>|senderUserId    |string| 发送用户ID |
>|targetId    |string| 接收方ID |
>|messageType    |int| 消息类型 参考消息类型说明 |
>|date    |string| 发送时间 |
>|sendUser.name    |string| 发送用户昵称 |
>|sendUser.avatarUri    |string| 发送用户头像 |

##### 10\. 文件上传接口
###### 接口功能 
> 图片语音等文件上传接口
###### URL地址
> /file/upload
###### HTTP请求方式
> POST 
###### 请求参数
- query
```json
{
  "token": "用户Token",
  "appId": "应用AppId"
}
```
- form-data
```json
{
  "up_file": "File文件"
}
```
###### 返回结果
```json
{
    "status": 1,
    "message": "获取成功",
    "data": [
        {
            "msgId": "5bf3a987abebf055ff62a5d6",
            "content": {
                "content": "哈哈哈哈"
            },
            "conversationType": 1,
            "senderUserId": "1",
            "targetId": "2",
            "messageType": 1,
            "date": "14:28",
            "sendUser": {
                "name": "小王",
                "avatarUri": "https://avatars0.githubusercontent.com/u/1073262?s=88&v=4"
            }
        }
    ]
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |int| 会话类型 参考会话类型说明|
>|senderUserId    |string| 发送用户ID |
>|targetId    |string| 接收方ID |
>|messageType    |int| 消息类型 参考消息类型说明 |
>|date    |string| 发送时间 |
>|sendUser.name    |string| 发送用户昵称 |
>|sendUser.avatarUri    |string| 发送用户头像 |

#### socket 事件

##### 1\. socketEvents.SESSION_LIST
###### 事件描述
> 获取会话列表
###### 事件标识
> 'session-list'
###### 传递参数
> 无
###### 返回结果
```json
[
    {
        "sid": "5bc053d1d7745643263a22fa",
        "conversationType": 1,
        "targetId": "2",
        "unread": 0,
        "title": "小李",
        "avatar": "https://han960619.github.io/Vue-chat/static/images/%E5%B0%8F%E5%A7%A8%E5%A6%88.jpg",
        "lastMsg": {
            "content": "搜索",
            "messageType": 1,
            "date": "18/11/05"
        }
    },
    {
        "sid": "5bd2bc6acca08418a83792f3",
        "conversationType": 2,
        "targetId": "1",
        "unread": 0,
        "title": "测试群",
        "avatar": "https://avatars1.githubusercontent.com/u/15651299?s=64&v=4",
        "lastMsg": {
            "content": "请求",
            "messageType": 1,
            "date": "18/11/05"
        }
    }
]
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|sid   |string    |会话ID |
>|conversationType   |number    |会话类型，参考会话类型说明 |
>|targetId   |string    |发送对象ID |
>|unread   |number    |消息未读数 |
>|title   |string    |会话标题 |
>|avatar   |string    |会话头像 |
>|lastMsg.content   |string    |最后一条消息内容 |
>|lastMsg.messageType   |number    |最后一条消息类型，参考消息类型说明 |
>|lastMsg.date   |string    |最后一条消息发送时间 |

##### 2\. socketEvents.SESSION_MESSAGE_LIST
###### 事件描述
> 获取会话内的消息记录
###### 事件标识
> 'session-message-list'
###### 传递参数
```json
{
  "sid": "会话ID",
  "limit": "接口返回数据条数",
  "lastmsgId": "消息ID 分页查询时获取小于它的消息 为空时从最新的获取" 
}
```
###### 返回结果
```json
[
    {
        "msgId": "5bf3a987abebf055ff62a5d6",
        "content": {
            "content": "哈哈哈哈"
        },
        "conversationType": 1,
        "senderUserId": "1",
        "targetId": "2",
        "messageType": 1,
        "date": "14:28",
        "sendUser": {
            "name": "小王",
            "avatarUri": "https://avatars0.githubusercontent.com/u/1073262?s=88&v=4"
        }
    }
]
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |int| 会话类型 参考会话类型说明|
>|senderUserId    |string| 发送用户ID |
>|targetId    |string| 接收方ID |
>|messageType    |int| 消息类型 参考消息类型说明 |
>|date    |string| 发送时间 |
>|sendUser.name    |string| 发送用户昵称 |
>|sendUser.avatarUri    |string| 发送用户头像 |

##### 3\. socketEvents.SEND_PRIVATE_MESSAGE
###### 事件描述
> 发送单聊消息
###### 事件标识
> 'send-private-message'
###### 传递参数
```json
{
  "senderUserId": "发送用户",
  "targetId": "接收用户",
  "messageType": "消息类型",
  "content": "消息内容 object"
}
```
###### 返回结果
```json
{
    "msgId": "5be3df8958a3a67c1aeafe2e",
    "content": {
        "content": "沙发斯蒂芬斯蒂芬"
    },
    "conversationType": 1,
    "senderUserId": "2",
    "targetId": "1",
    "messageType": 1,
    "date": "15:02",
    "sendSession": {
        "sid": "5bc053d1d7745643263a22fa",
        "title": "小明",
        "avatar": "https://avatars3.githubusercontent.com/u/12846955?s=40&v=4"
    },
    "sendUser": {
        "name": "小李",
        "avatarUri": "https://han960619.github.io/Vue-chat/static/images/%E5%B0%8F%E5%A7%A8%E5%A6%88.jpg"
    }
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |string| 会话类型 参考会话类型说明|
>|senderUserId    |string| 消息ID，数据库唯一索引 |
>|targetId    |string| 消息ID，数据库唯一索引 |
>|messageType    |string| 消息ID，数据库唯一索引 |
>|date    |string| 消息ID，数据库唯一索引 |
>|sendSession.sid    |string| 消息ID，数据库唯一索引 |
>|sendSession.title    |string| 消息ID，数据库唯一索引 |
>|sendSession.avatar    |string| 消息ID，数据库唯一索引 |
>|sendUser.name    |string| 消息ID，数据库唯一索引 |
>|sendUser.avatarUri    |string| 消息ID，数据库唯一索引 |


##### 4\. socketEvents.SEND_GROUP_MESSAGE
###### 事件描述
> 发送群聊消息
###### 事件标识
> 'send-group-message'
###### 传递参数
```json
{
  "senderUserId": "发送用户",
  "targetId": "接收群组",
  "messageType": "消息类型",
  "content": "消息内容 object"
}
```
###### 返回结果
```json
{
    "msgId": "5be3df8958a3a67c1aeafe2e",
    "content": {
        "content": "沙发斯蒂芬斯蒂芬"
    },
    "conversationType": 2,
    "senderUserId": "2",
    "targetId": "1",
    "messageType": 1,
    "date": "15:02",
    "sendSession": {
        "sid": "5bc053d1d7745643263a22fa",
        "title": "群组",
        "avatar": "https://avatars3.githubusercontent.com/u/12846955?s=40&v=4"
    },
    "sendUser": {
        "name": "小李",
        "avatarUri": "https://han960619.github.io/Vue-chat/static/images/%E5%B0%8F%E5%A7%A8%E5%A6%88.jpg"
    }
}
```
###### 返回参数
>|返回字段|字段类型|说明                              |
>|:-----   |:------|:-----------------------------   |
>|msgId    |string| 消息ID，数据库唯一索引 |
>|content.content    |string| 消息内容 |
>|conversationType    |string| 会话类型 参考会话类型说明|
>|senderUserId    |string| 消息ID，数据库唯一索引 |
>|targetId    |string| 消息ID，数据库唯一索引 |
>|messageType    |string| 消息ID，数据库唯一索引 |
>|date    |string| 消息ID，数据库唯一索引 |
>|sendSession.sid    |string| 消息ID，数据库唯一索引 |
>|sendSession.title    |string| 消息ID，数据库唯一索引 |
>|sendSession.avatar    |string| 消息ID，数据库唯一索引 |
>|sendUser.name    |string| 消息ID，数据库唯一索引 |
>|sendUser.avatarUri    |string| 消息ID，数据库唯一索引 |


##### 5\. socketEvents.SET_SESSION_READ
###### 事件描述
> 标记会话已读消息
###### 事件标识
> 'set-session-read'
###### 传递参数
> sid: 会话ID
###### 返回结果
> 无
###### 返回参数
> 无
#### 接口签名说明
##### 1\.计算步骤
> 用于计算签名的参数在不同接口之间会有差异，但算法过程固定如下4个步骤。

- 1.将<key, value>请求参数对按key进行字典升序排序，得到有序的参数对列表N

- 2.将列表N中的参数对按URL键值对的格式拼接成字符串，得到字符串T（如：key1=value1&key2=value2），URL键值拼接过程value部分需要URL编码，URL编码算法用大写字母，例如%E8，而不是小写%e8

- 3.将应用密钥以app_key为键名，组成URL键值拼接到字符串T末尾，得到字符串S（如：key1=value1&key2=value2&app_key=密钥)

- 4.对字符串S进行MD5运算，将得到的MD5值所有字符转换成大写，得到接口请求签名

##### 2\.注意事项
- 1.不同接口要求的参数对不一样，计算签名使用的参数对也不一样
- 2.参数名区分大小写，参数值为空不参与签名
- 3.URL键值拼接过程value部分需要URL编码
- 4.签名有效期5分钟，需要请求接口时刻实时计算签名信息

##### 3\.参考代码（php）
```php
// getReqSign ：根据 接口请求参数 和 应用密钥 计算 请求签名
// 参数说明
//   - $params：接口请求参数（特别注意：不同的接口，参数对一般不一样，请以具体接口要求为准）
//   - $appkey：应用密钥
// 返回数据
//   - 签名结果
function getReqSign($params /* 关联数组 */, $appkey /* 字符串*/)
{
    // 1. 字典升序排序
    ksort($params);

    // 2. 拼按URL键值对
    $str = '';
    foreach ($params as $key => $value)
    {
        if ($value !== '')
        {
            $str .= $key . '=' . urlencode($value) . '&';
        }
    }

    // 3. 拼接app_key
    $str .= 'app_key=' . $appkey;

    // 4. MD5运算，得到请求签名
    return md5($str);
}
```
#### 会话类型说明
- PRIVATE: 单聊
- GROUP: 群聊
```json
{
  "PRIVATE": 1,
  "GROUP": 2
}
```
#### 消息类型说明
- TEXT_MESSAGE：文本消息
- VOICE_MESSAGE 语音消息
- IMAGE_MESSAGE 图片消息
- FILE_MESSAGE 文件消息
- LOCATION_MESSAGE 位置消息
- CUSTOM_MESSAGE 自定义消息
```json
{
  "TEXT_MESSAGE": 1,
  "VOICE_MESSAGE": 2,
  "IMAGE_MESSAGE": 3,
  "FILE_MESSAGE": 4,
  "LOCATION_MESSAGE": 5,
  "CUSTOM_MESSAGE": 6
}
```
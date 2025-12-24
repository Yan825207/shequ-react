
# 社区APP前后端交互API设计

## 1. API设计原则

### 1.1 RESTful设计风格
- 使用HTTP动词表示操作类型（GET、POST、PUT、DELETE、PATCH）
- 使用名词表示资源（如 /users、/posts）
- 使用复数形式表示集合资源
- 使用嵌套URL表示资源关系（如 /posts/{postId}/comments）

### 1.2 版本控制
- 通过URL前缀进行版本控制：`/api/v1/`
- 版本号使用数字，如 v1、v2
- 不兼容的API变更需要升级版本

### 1.3 认证与授权
- 使用JWT（JSON Web Token）进行认证
- Token放在HTTP请求头的Authorization字段中：`Bearer {token}`
- 基于角色的访问控制（RBAC）
- 敏感操作需要二次验证

### 1.4 错误处理
- 统一的错误响应格式
- 使用HTTP状态码表示错误类型
- 详细的错误信息和错误码

### 1.5 响应格式
- 统一的JSON响应格式
- 包含状态码、消息和数据
- 分页数据包含总数、页码、每页数量等信息

## 2. 通用响应格式

### 2.1 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

### 2.2 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      // 数据列表
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "pages": 10
    }
  }
}
```

### 2.3 错误响应
```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "field": "username",
    "detail": "用户名不能为空"
  }
}
```

## 3. 核心API设计

### 3.1 用户API

#### 3.1.1 注册
- **URL**: `/api/v1/users/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "phone": "13800138000",
    "password": "password123",
    "code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "username": "user123",
        "phone": "13800138000",
        "avatar": "https://example.com/avatar.jpg",
        "nickname": "用户123",
        "role": "user",
        "status": "active"
      }
    }
  }
  ```

#### 3.1.2 登录
- **URL**: `/api/v1/users/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "phone": "13800138000",
    "password": "password123"
  }
  ```
- **Response**: 同注册响应

#### 3.1.3 获取用户信息
- **URL**: `/api/v1/users/{userId}`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "_id": "60d0fe4f5311236168a109ca",
      "username": "user123",
      "avatar": "https://example.com/avatar.jpg",
      "nickname": "用户123",
      "gender": "male",
      "bio": "这是我的个人简介",
      "location": "北京",
      "interests": ["美食", "旅游"],
      "level": 1,
      "points": 100,
      "followers_count": 10,
      "following_count": 20,
      "posts_count": 50
    }
  }
  ```

#### 3.1.4 更新用户信息
- **URL**: `/api/v1/users/{userId}`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "nickname": "新昵称",
    "avatar": "https://example.com/new_avatar.jpg",
    "gender": "female",
    "bio": "更新后的个人简介",
    "interests": ["美食", "旅游", "摄影"]
  }
  ```
- **Response**: 同获取用户信息响应

#### 3.1.5 关注用户
- **URL**: `/api/v1/users/{userId}/follow`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "关注成功",
    "data": {
      "follower_id": "60d0fe4f5311236168a109ca",
      "following_id": "60d0fe4f5311236168a109cb",
      "created_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.1.6 取消关注
- **URL**: `/api/v1/users/{userId}/follow`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "取消关注成功",
    "data": null
  }
  ```

### 3.2 内容API

#### 3.2.1 发布动态
- **URL**: `/api/v1/posts`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "content": "这是一条新动态",
    "media": [
      {
        "type": "image",
        "url": "https://example.com/image.jpg",
        "width": 1080,
        "height": 1920
      }
    ],
    "location": {
      "name": "北京天安门",
      "coordinates": [116.397428, 39.90923]
    },
    "topics": ["#北京", "#旅游"],
    "visibility": "public"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "发布成功",
    "data": {
      "_id": "60d0fe4f5311236168a109cc",
      "user_id": "60d0fe4f5311236168a109ca",
      "user_info": {
        "username": "user123",
        "avatar": "https://example.com/avatar.jpg",
        "nickname": "用户123"
      },
      "content": "这是一条新动态",
      "media": [...],
      "location": {...},
      "topics": [...],
      "visibility": "public",
      "likes_count": 0,
      "comments_count": 0,
      "shares_count": 0,
      "created_at": "2023-06-23T10:00:00.000Z",
      "updated_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.2.2 获取动态列表
- **URL**: `/api/v1/posts`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认10
  - `sortBy`: 排序字段，默认created_at
  - `sortOrder`: 排序顺序，asc/desc，默认desc
  - `userId`: 用户ID，可选，用于获取指定用户的动态
  - `topic`: 话题标签，可选
  - `visibility`: 可见性，可选
- **Response**: 分页响应，包含动态列表

#### 3.2.3 获取动态详情
- **URL**: `/api/v1/posts/{postId}`
- **Method**: `GET`
- **Response**: 同发布动态响应

#### 3.2.4 更新动态
- **URL**: `/api/v1/posts/{postId}`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "content": "更新后的动态内容",
    "topics": ["#北京", "#旅游", "#美食"]
  }
  ```
- **Response**: 同获取动态详情响应

#### 3.2.5 删除动态
- **URL**: `/api/v1/posts/{postId}`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

### 3.3 互动API

#### 3.3.1 点赞
- **URL**: `/api/v1/likes`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "target_id": "60d0fe4f5311236168a109cc",
    "target_type": "post"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "点赞成功",
    "data": {
      "_id": "60d0fe4f5311236168a109cd",
      "user_id": "60d0fe4f5311236168a109ca",
      "target_id": "60d0fe4f5311236168a109cc",
      "target_type": "post",
      "created_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.3.2 取消点赞
- **URL**: `/api/v1/likes`
- **Method**: `DELETE`
- **Query Parameters**:
  - `target_id`: 目标ID
  - `target_type`: 目标类型
- **Response**:
  ```json
  {
    "code": 200,
    "message": "取消点赞成功",
    "data": null
  }
  ```

#### 3.3.3 发表评论
- **URL**: `/api/v1/comments`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "post_id": "60d0fe4f5311236168a109cc",
    "parent_id": null,
    "content": "这是一条评论"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "评论成功",
    "data": {
      "_id": "60d0fe4f5311236168a109ce",
      "post_id": "60d0fe4f5311236168a109cc",
      "user_id": "60d0fe4f5311236168a109ca",
      "user_info": {
        "username": "user123",
        "avatar": "https://example.com/avatar.jpg",
        "nickname": "用户123"
      },
      "parent_id": null,
      "content": "这是一条评论",
      "likes_count": 0,
      "created_at": "2023-06-23T10:00:00.000Z",
      "updated_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.3.4 获取评论列表
- **URL**: `/api/v1/posts/{postId}/comments`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认10
  - `sortBy`: 排序字段，默认created_at
  - `sortOrder`: 排序顺序，asc/desc，默认asc
- **Response**: 分页响应，包含评论列表

### 3.4 消息API

#### 3.4.1 获取消息列表
- **URL**: `/api/v1/messages`
- **Method**: `GET`
- **Query Parameters**:
  - `type`: 消息类型（system/interaction/chat）
  - `is_read`: 是否已读（true/false）
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
- **Response**: 分页响应，包含消息列表

#### 3.4.2 标记消息为已读
- **URL**: `/api/v1/messages/{messageId}/read`
- **Method**: `PUT`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "标记成功",
    "data": null
  }
  ```

#### 3.4.3 发送私信
- **URL**: `/api/v1/messages/chat`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "receiver_id": "60d0fe4f5311236168a109cb",
    "message_type": "text",
    "content": "你好，这是一条私信"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "发送成功",
    "data": {
      "_id": "60d0fe4f5311236168a109cf",
      "conversation_id": "60d0fe4f5311236168a109ca_60d0fe4f5311236168a109cb",
      "sender_id": "60d0fe4f5311236168a109ca",
      "receiver_id": "60d0fe4f5311236168a109cb",
      "message_type": "text",
      "content": "你好，这是一条私信",
      "is_read": false,
      "status": "sent",
      "created_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.4.4 获取聊天记录
- **URL**: `/api/v1/messages/chat/{conversationId}`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
- **Response**: 分页响应，包含聊天记录

### 3.5 活动API

#### 3.5.1 发布活动
- **URL**: `/api/v1/activities`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "社区线下活动",
    "description": "这是一个社区线下活动，欢迎大家参加",
    "cover": "https://example.com/activity_cover.jpg",
    "start_time": "2023-07-01T14:00:00.000Z",
    "end_time": "2023-07-01T16:00:00.000Z",
    "location": {
      "name": "社区活动中心",
      "address": "北京市朝阳区XX街道XX号",
      "coordinates": [116.407428, 39.90923]
    },
    "type": "offline",
    "category": "social",
    "max_participants": 50,
    "fee": 0
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "发布成功",
    "data": {
      "_id": "60d0fe4f5311236168a109d0",
      "title": "社区线下活动",
      "description": "...",
      "organizer_id": "60d0fe4f5311236168a109ca",
      "organizer_info": {
        "username": "user123",
        "avatar": "https://example.com/avatar.jpg",
        "nickname": "用户123"
      },
      "cover": "...",
      "start_time": "...",
      "end_time": "...",
      "location": {...},
      "type": "offline",
      "category": "social",
      "max_participants": 50,
      "current_participants": 0,
      "fee": 0,
      "status": "published",
      "participants": [],
      "likes_count": 0,
      "comments_count": 0,
      "created_at": "2023-06-23T10:00:00.000Z",
      "updated_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.5.2 获取活动列表
- **URL**: `/api/v1/activities`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认10
  - `type`: 活动类型（offline/online）
  - `category`: 活动分类
  - `status`: 活动状态（published/cancelled/finished）
  - `start_time`: 开始时间范围（如 2023-07-01,2023-07-31）
- **Response**: 分页响应，包含活动列表

#### 3.5.3 获取活动详情
- **URL**: `/api/v1/activities/{activityId}`
- **Method**: `GET`
- **Response**: 同发布活动响应

#### 3.5.4 报名活动
- **URL**: `/api/v1/activities/{activityId}/register`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "报名成功",
    "data": {
      "activity_id": "60d0fe4f5311236168a109d0",
      "user_id": "60d0fe4f5311236168a109ca",
      "status": "registered",
      "created_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

### 3.6 分类信息API

#### 3.6.1 发布分类信息
- **URL**: `/api/v1/classifieds`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "二手手机出售",
    "description": "iPhone 13 Pro Max，99新，无拆无修",
    "category": "secondhand",
    "sub_category": "electronics",
    "price": 8000,
    "contact_info": "13800138000",
    "location": "北京",
    "images": [
      "https://example.com/phone1.jpg",
      "https://example.com/phone2.jpg"
    ]
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "发布成功",
    "data": {
      "_id": "60d0fe4f5311236168a109d1",
      "title": "二手手机出售",
      "description": "...",
      "user_id": "60d0fe4f5311236168a109ca",
      "user_info": {
        "username": "user123",
        "avatar": "https://example.com/avatar.jpg",
        "nickname": "用户123"
      },
      "category": "secondhand",
      "sub_category": "electronics",
      "price": 8000,
      "contact_info": "13800138000",
      "location": "北京",
      "images": [...],
      "is_top": false,
      "status": "published",
      "views_count": 0,
      "likes_count": 0,
      "created_at": "2023-06-23T10:00:00.000Z",
      "updated_at": "2023-06-23T10:00:00.000Z"
    }
  }
  ```

#### 3.6.2 获取分类信息列表
- **URL**: `/api/v1/classifieds`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认10
  - `category`: 分类
  - `sub_category`: 子分类
  - `price_min`: 最低价格
  - `price_max`: 最高价格
  - `location`: 所在地
  - `is_top`: 是否置顶
- **Response**: 分页响应，包含分类信息列表

### 3.7 搜索API

#### 3.7.1 全局搜索
- **URL**: `/api/v1/search`
- **Method**: `GET`
- **Query Parameters**:
  - `keyword`: 搜索关键词
  - `type`: 搜索类型（all/post/user/activity/classified）
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认10
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "posts": [...],
      "users": [...],
      "activities": [...],
      "classifieds": [...],
      "pagination": {
        "total": 100,
        "page": 1,
        "pageSize": 10,
        "pages": 10
      }
    }
  }
  ```

#### 3.7.2 获取热门搜索
- **URL**: `/api/v1/search/hot`
- **Method**: `GET`
- **Query Parameters**:
  - `limit`: 数量限制，默认10
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {"keyword": "北京", "count": 1000},
      {"keyword": "旅游", "count": 800},
      {"keyword": "美食", "count": 600}
    ]
  }
  ```

## 4. WebSocket API

### 4.1 连接地址
- **URL**: `wss://example.com/ws`
- **认证**: 在连接时携带JWT token

### 4.2 主要事件

#### 4.2.1 发送消息
```json
{
  "type": "message",
  "data": {
    "receiver_id": "60d0fe4f5311236168a109cb",
    "message_type": "text",
    "content": "你好，这是一条实时消息"
  }
}
```

#### 4.2.2 接收消息
```json
{
  "type": "message",
  "data": {
    "_id": "60d0fe4f5311236168a109d2",
    "conversation_id": "60d0fe4f5311236168a109ca_60d0fe4f5311236168a109cb",
    "sender_id": "60d0fe4f5311236168a109cb",
    "receiver_id": "60d0fe4f5311236168a109ca",
    "message_type": "text",
    "content": "你好，这是一条实时消息",
    "is_read": false,
    "status": "delivered",
    "created_at": "2023-06-23T10:00:00.000Z"
  }
}
```

#### 4.2.3 在线状态更新
```json
{
  "type": "online_status",
  "data": {
    "user_id": "60d0fe4f5311236168a109cb",
    "status": "online",
    "last_active_at": "2023-06-23T10:00:00.000Z"
  }
}
```

## 5. API文档管理

- 使用Swagger或Postman自动生成API文档
- 定期更新API文档
- 提供详细的API使用示例
- 包含API变更历史

## 6. API测试策略

- 单元测试：测试单个API端点
- 集成测试：测试API之间的交互
- 性能测试：测试API的响应时间和并发能力
- 安全测试：测试API的安全性，包括认证、授权、输入验证等

## 7. API版本升级策略

- 不兼容的API变更需要升级版本
- 旧版本API需要保持一段时间的支持（如6个月）
- 提供API迁移指南
- 逐步废弃旧版本API

## 8. 总结

本API设计文档详细定义了社区APP的前后端交互接口，包括用户管理、内容管理、互动功能、消息系统、活动管理、分类信息和搜索功能等。通过RESTful设计风格、统一的响应格式和完善的错误处理，确保了API的易用性、可扩展性和安全性。

在实际开发过程中，应根据业务需求和技术实现情况，对API设计进行适当的调整和优化。同时，需要定期更新API文档，确保文档与实际实现保持一致。
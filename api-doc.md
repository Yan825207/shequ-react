# 小区社交平台 API 文档

## 1. 项目概述

小区社交平台是一个为社区居民提供交流互动的平台，支持用户发布帖子、评论、点赞、关注等功能。本API文档详细描述了平台提供的所有后端接口。

### 1.1 基础URL

```
http://localhost:5000/api/v1
```

### 1.2 响应格式

所有API响应均采用统一的JSON格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 1.3 状态码说明

| 状态码 | 描述 |
|-------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问，没有权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 2. 用户相关API

### 2.1 注册用户

**请求路径**: `/users/register`
**请求方法**: `POST`
**接口类型**: 公共接口
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 (至少8位) |
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |

**请求示例**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "nickname": "测试用户"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20avatar&size=100x100",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.2 用户登录

**请求路径**: `/users/login`
**请求方法**: `POST`
**接口类型**: 公共接口
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**请求示例**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "nickname": "管理员",
      "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100",
      "bio": "小区管理员",
      "followers_count": 10,
      "following_count": 5
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 获取个人资料

**请求路径**: `/users/profile`
**请求方法**: `GET`
**接口类型**: 私有接口 (需要登录)
**请求参数**: 无
**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "code": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "nickname": "管理员",
    "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100",
    "bio": "小区管理员",
    "followers_count": 10,
    "following_count": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.4 更新个人资料

**请求路径**: `/users/profile`
**请求方法**: `PUT`
**接口类型**: 私有接口 (需要登录)
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL |
| bio | string | 否 | 个人简介 |
| password | string | 否 | 新密码 (至少8位) |

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```json
{
  "nickname": "超级管理员",
  "bio": "小区超级管理员"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "nickname": "超级管理员",
    "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100",
    "bio": "小区超级管理员",
    "followers_count": 10,
    "following_count": 5
  }
}
```

### 2.5 根据ID获取用户信息

**请求路径**: `/users/:id`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:
- `id` (路径参数): 用户ID

**响应示例**:
```json
{
  "code": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "nickname": "管理员",
    "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100",
    "bio": "小区管理员",
    "followers_count": 10,
    "following_count": 5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 3. 帖子相关API

### 3.1 获取所有帖子

**请求路径**: `/posts`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| page | number | 否 | 页码 (默认: 1) |
| pageSize | number | 否 | 每页数量 (默认: 10) |
| category | string | 否 | 分类筛选 |
| user_id | number | 否 | 用户ID筛选 |

**响应示例**:
```json
{
  "code": 200,
  "message": "Posts retrieved successfully",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "欢迎加入小区社交平台",
        "content": "这是一个测试帖子...",
        "category": "公告",
        "user_id": 1,
        "likes_count": 5,
        "comments_count": 3,
        "images": [
          {
            "filename": "image1_123456789.jpg",
            "url": "http://localhost:5000/uploads/image1_123456789.jpg",
            "size": 102400,
            "mimetype": "image/jpeg"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "author": {
          "id": 1,
          "username": "admin",
          "nickname": "管理员",
          "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100"
        },
        "is_liked": false,
        "is_followed": false
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "pageSize": 10,
      "pages": 2
    }
  }
}
```

### 3.2 获取单个帖子

**请求路径**: `/posts/:id`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:
- `id` (路径参数): 帖子ID

**响应示例**:
```json
{
  "code": 200,
  "message": "Post retrieved successfully",
  "data": {
    "id": 1,
    "title": "欢迎加入小区社交平台",
    "content": "这是一个测试帖子...",
    "category": "公告",
    "user_id": 1,
    "likes_count": 5,
    "comments_count": 3,
    "images": [
      {
        "filename": "image1_123456789.jpg",
        "url": "http://localhost:5000/uploads/image1_123456789.jpg",
        "size": 102400,
        "mimetype": "image/jpeg"
      },
      {
        "filename": "image2_123456789.jpg",
        "url": "http://localhost:5000/uploads/image2_123456789.jpg",
        "size": 153600,
        "mimetype": "image/jpeg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员",
      "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100"
    },
    "is_liked": false,
    "is_followed": false
  }
}
```

### 3.3 获取用户帖子

**请求路径**: `/posts/user/:userId`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:
- `userId` (路径参数): 用户ID
- `page` (查询参数): 页码 (默认: 1)
- `pageSize` (查询参数): 每页数量 (默认: 10)

**响应示例**:
```json
{
  "code": 200,
  "message": "Posts retrieved successfully",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "欢迎加入小区社交平台",
        "content": "这是一个测试帖子...",
        "category": "公告",
        "user_id": 1,
        "likes_count": 5,
        "comments_count": 3,
        "images": [
          {
            "filename": "image1_123456789.jpg",
            "url": "http://localhost:5000/uploads/image1_123456789.jpg",
            "size": 102400,
            "mimetype": "image/jpeg"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pageSize": 10,
      "pages": 1
    }
  }
}
```

### 3.4 创建帖子

**请求路径**: `/posts`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求方式**: `multipart/form-data` 或 `application/json`
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| title | string | 是 | 帖子标题 |
| content | string | 是 | 帖子内容 |
| category | string | 是 | 帖子分类 |
| images | file[] 或 string[] | 否 | 图片文件（最多6张）或图片地址数组 |

**请求头**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data` (上传图片文件时)

**请求示例** (表单形式，包含图片文件):
```
POST /api/v1/posts
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form-data:
- title: 新帖子标题
- content: 帖子内容...
- category: 生活
- images: [图片文件1]
- images: [图片文件2]
```

**请求示例** (JSON形式，包含图片地址):
```json
{
  "title": "新帖子标题",
  "content": "帖子内容...",
  "category": "生活",
  "images": ["/uploads/file-1766039355288-972788682.png", "/uploads/file-1766039280635-607534789.png"]
}
```

**请求示例** (JSON形式，无图片):
```json
{
  "title": "新帖子标题",
  "content": "帖子内容...",
  "category": "生活"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "Post created successfully",
  "data": {
    "id": 2,
    "title": "新帖子标题",
    "content": "帖子内容...",
    "category": "生活",
    "user_id": 1,
    "likes_count": 0,
    "comments_count": 0,
    "images": [
      {
        "filename": "image1_123456789.jpg",
        "url": "http://localhost:5000/uploads/image1_123456789.jpg",
        "size": 102400,
        "mimetype": "image/jpeg"
      },
      {
        "filename": "image2_123456789.jpg",
        "url": "http://localhost:5000/uploads/image2_123456789.jpg",
        "size": 153600,
        "mimetype": "image/jpeg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.5 更新帖子

**请求路径**: `/posts/:id`
**请求方法**: `PUT`
**接口类型**: 私有接口 (需要登录)
**请求方式**: `multipart/form-data` 或 `application/json`
**请求参数**:
- `id` (路径参数): 帖子ID

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| title | string | 是 | 帖子标题 |
| content | string | 是 | 帖子内容 |
| category | string | 是 | 帖子分类 |
| images | file[] 或 string[] | 否 | 图片文件（最多6张）或图片地址数组 |

**请求头**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data` (上传图片文件时)

**请求示例** (表单形式，包含图片文件):
```
PUT /api/v1/posts/1
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form-data:
- title: 更新后的标题
- content: 更新后的内容...
- category: 生活
- images: [图片文件1]
- images: [图片文件2]
```

**请求示例** (JSON形式，包含图片地址):
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "category": "生活",
  "images": ["/uploads/file-1766039355288-972788682.png"]
}
```

**请求示例** (JSON形式，无图片):
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "category": "生活"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "Post updated successfully",
  "data": {
    "id": 2,
    "title": "更新后的标题",
    "content": "更新后的内容...",
    "category": "生活",
    "user_id": 1,
    "likes_count": 0,
    "comments_count": 0,
    "images": [
      {
        "filename": "image1_123456789.jpg",
        "url": "http://localhost:5000/uploads/image1_123456789.jpg",
        "size": 102400,
        "mimetype": "image/jpeg"
      },
      {
        "filename": "image2_123456789.jpg",
        "url": "http://localhost:5000/uploads/image2_123456789.jpg",
        "size": 153600,
        "mimetype": "image/jpeg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.6 删除帖子

**请求路径**: `/posts/:id`
**请求方法**: `DELETE`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `id` (路径参数): 帖子ID

**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "code": 200,
  "message": "Post deleted successfully",
  "data": {
    "id": 2
  }
}
```

## 4. 评论相关API

### 4.1 获取帖子的所有评论

**请求路径**: `/comments/post/:postId`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:
- `postId` (路径参数): 帖子ID

**响应示例**:
```json
{
  "code": 200,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": 1,
      "content": "这是一条评论",
      "authorId": 1,
      "postId": 1,
      "parentCommentId": null,
      "likes_count": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "User": {
        "id": 1,
        "username": "admin",
        "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=admin%20avatar&size=100x100"
      },
      "replies": [
        {
          "id": 2,
          "content": "这是一条回复",
          "authorId": 2,
          "postId": 1,
          "parentCommentId": 1,
          "likes_count": 0,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z",
          "User": {
            "id": 2,
            "username": "user",
            "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=user%20avatar&size=100x100"
          }
        }
      ]
    }
  ]
}
```

### 4.2 创建评论

**请求路径**: `/comments`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| content | string | 是 | 评论内容 |
| postId | number | 是 | 帖子ID |
| parentCommentId | number | 否 | 父评论ID (回复评论时使用) |

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```json
{
  "content": "这是一条新评论",
  "postId": 1
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "Comment created successfully",
  "data": {
    "id": 3,
    "content": "这是一条新评论",
    "authorId": 1,
    "postId": 1,
    "parentCommentId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4.3 删除评论

**请求路径**: `/comments/:id`
**请求方法**: `DELETE`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `id` (路径参数): 评论ID

**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "code": 200,
  "message": "Comment deleted successfully",
  "data": {
    "id": 3
  }
}
```

## 5. 点赞相关API

### 5.1 点赞帖子或评论

**请求路径**: `/likes`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| target_id | number | 是 | 目标ID (帖子或评论的ID) |
| target_type | string | 是 | 目标类型 (post 或 comment) |

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```json
{
  "target_id": 1,
  "target_type": "post"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "Like created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "targetId": 1,
    "targetType": "post",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5.2 取消点赞

**请求路径**: `/likes`
**请求方法**: `DELETE`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `target_id` (查询参数): 目标ID
- `target_type` (查询参数): 目标类型 (post 或 comment)

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```
DELETE /api/v1/likes?target_id=1&target_type=post
```

**响应示例**:
```json
{
  "code": 200,
  "message": "Like deleted successfully",
  "data": null
}
```

### 5.3 检查是否已点赞

**请求路径**: `/likes/check`
**请求方法**: `GET`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `target_id` (查询参数): 目标ID
- `target_type` (查询参数): 目标类型 (post 或 comment)

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```
GET /api/v1/likes/check?target_id=1&target_type=post
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "is_liked": true
  }
}
```

## 6. 关注相关API

### 6.1 获取关注者列表

**请求路径**: `/follows/followers/:id`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:
- `id` (路径参数): 用户ID
- `page` (查询参数): 页码 (默认: 1)
- `pageSize` (查询参数): 每页数量 (默认: 10)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "followerId": 2,
        "followingId": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "follower": {
          "id": 2,
          "username": "user",
          "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=user%20avatar&size=100x100",
          "nickname": "普通用户"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pageSize": 10,
      "pages": 1
    }
  }
}
```

### 6.2 获取关注列表

**请求路径**: `/follows/following/:id`
**请求方法**: `GET`
**接口类型**: 公共接口
**请求参数**:
- `id` (路径参数): 用户ID
- `page` (查询参数): 页码 (默认: 1)
- `pageSize` (查询参数): 每页数量 (默认: 10)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "followerId": 1,
        "followingId": 2,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "following": {
          "id": 2,
          "username": "user",
          "avatar": "https://neeko-copilot.bytedance.net/api/text2image?prompt=user%20avatar&size=100x100",
          "nickname": "普通用户"
        }
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "pageSize": 10,
      "pages": 1
    }
  }
}
```

### 6.3 关注用户

**请求路径**: `/follows`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| following_id | string | 是 | 被关注用户的ID |

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```json
{
  "following_id": "2"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "Followed successfully",
  "data": {
    "id": 2,
    "followerId": 1,
    "followingId": 2,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6.4 取消关注

**请求路径**: `/follows/:id`
**请求方法**: `DELETE`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `id` (路径参数): 被关注用户的ID

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```
DELETE /api/v1/follows/2
```

**响应示例**:
```json
{
  "code": 200,
  "message": "Unfollowed successfully",
  "data": null
}
```

### 6.5 检查是否已关注

**请求路径**: `/follows/check/:id`
**请求方法**: `GET`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `id` (路径参数): 被关注用户的ID

**请求头**:
- `Authorization: Bearer {token}`

**请求示例**:
```
GET /api/v1/follows/check/2
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "is_following": true
  }
}
```

## 7. 文件上传相关API

### 7.1 单个文件上传

**请求路径**: `/uploads/single`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `file` (FormData): 文件数据

**请求头**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**响应示例**:
```json
{
  "code": 200,
  "message": "File uploaded successfully",
  "data": {
    "fileName": "file-1766029951307-121497834.png",
    "fileUrl": "/uploads/file-1766029951307-121497834.png",
    "fileSize": 12345,
    "mimeType": "image/png"
  }
}
```

### 7.2 多个文件上传

**请求路径**: `/uploads/multiple`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `files` (FormData): 多个文件数据

**请求头**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**响应示例**:
```json
{
  "code": 200,
  "message": "Files uploaded successfully",
  "data": [
    {
      "fileName": "files-1766029665320-100205473.txt",
      "fileUrl": "/uploads/files-1766029665320-100205473.txt",
      "fileSize": 1234,
      "mimeType": "text/plain"
    },
    {
      "fileName": "files-1766029665320-704738816.txt",
      "fileUrl": "/uploads/files-1766029665320-704738816.txt",
      "fileSize": 5678,
      "mimeType": "text/plain"
    }
  ]
}
```

## 7. 私信管理接口

### 7.1 发送消息

**请求路径**: `/messages`
**请求方法**: `POST`
**接口类型**: 私有接口 (需要登录)
**请求方式**: `application/json`
**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| receiverId | number | 是 | 接收者用户ID |
| content | string | 是 | 消息内容 |

**请求头**:
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**请求示例**:
```json
{
  "receiverId": 2,
  "content": "你好，这是一条测试消息"
}
```

**响应示例**:
```json
{
  "id": 1,
  "senderId": 1,
  "receiverId": 2,
  "content": "你好，这是一条测试消息",
  "read": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "sender": {
    "id": 1,
    "username": "admin",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
  },
  "receiver": {
    "id": 2,
    "username": "testuser",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
  }
}
```

### 7.2 获取与特定用户的聊天记录

**请求路径**: `/messages/chat/:userId`
**请求方法**: `GET`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `userId` (路径参数): 对方用户ID
- `offset` (查询参数，可选): 分页偏移量，默认0

**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
[
  {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "content": "你好，这是一条测试消息",
    "read": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": 1,
      "username": "admin",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    },
    "receiver": {
      "id": 2,
      "username": "testuser",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    }
  }
]
```

### 7.3 获取消息列表

**请求路径**: `/messages/list`
**请求方法**: `GET`
**接口类型**: 私有接口 (需要登录)
**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
[
  {
    "id": 1,
    "senderId": 2,
    "receiverId": 1,
    "content": "你好，这是一条测试消息",
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "sender": {
      "id": 2,
      "username": "testuser",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    },
    "receiver": {
      "id": 1,
      "username": "admin",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    }
  }
]
```

### 7.4 获取未读消息数量

**请求路径**: `/messages/unread/count`
**请求方法**: `GET`
**接口类型**: 私有接口 (需要登录)
**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "unreadCount": 5
}
```

### 7.5 标记消息为已读

**请求路径**: `/messages/:messageId/read`
**请求方法**: `PUT`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `messageId` (路径参数): 消息ID

**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "message": "消息已标记为已读"
}
```

### 7.6 删除消息

**请求路径**: `/messages/:messageId`
**请求方法**: `DELETE`
**接口类型**: 私有接口 (需要登录)
**请求参数**:
- `messageId` (路径参数): 消息ID

**请求头**:
- `Authorization: Bearer {token}`

**响应示例**:
```json
{
  "message": "消息已删除"
}
```

## 8. 测试账号信息

为了方便测试系统功能，系统中已预置了以下测试账号：

### 8.1 管理员账号
- 邮箱: admin@example.com
- 密码: admin123

### 8.2 普通用户账号
- 邮箱: user@example.com
- 密码: user123

## 9. 项目结构

```
backend/
├── app.js                # 主应用入口
├── controllers/          # 控制器
│   ├── userController.js     # 用户相关控制器
│   ├── postController.js     # 帖子相关控制器
│   ├── commentController.js  # 评论相关控制器
│   ├── likeController.js     # 点赞相关控制器
│   ├── followController.js   # 关注相关控制器
│   ├── uploadController.js   # 文件上传控制器
│   └── messageController.js  # 消息相关控制器
├── middleware/           # 中间件
│   └── auth.js               # 认证中间件
├── models/               # 数据模型
│   ├── User.js               # 用户模型
│   ├── Post.js               # 帖子模型
│   ├── Comment.js            # 评论模型
│   ├── Like.js               # 点赞模型
│   ├── Follow.js             # 关注模型
│   └── Message.js            # 消息模型
├── routes/               # 路由
│   ├── userRoutes.js         # 用户相关路由
│   ├── postRoutes.js         # 帖子相关路由
│   ├── commentRoutes.js      # 评论相关路由
│   ├── likeRoutes.js         # 点赞相关路由
│   ├── followRoutes.js       # 关注相关路由
│   ├── uploadRoutes.js       # 文件上传路由
│   └── messageRoutes.js      # 消息相关路由
├── uploads/              # 上传文件存储目录
└── utils/                # 工具函数
    └── database.js           # 数据库连接
```
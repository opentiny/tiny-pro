---
title: tiny-pro-backend v1.0.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.17"

---

# TinyPro 后端接口规格说明书

> v1.0.0

Base URLs:

# Auth

## POST 登录接口

POST /auth/login

> Body 请求参数

```json
{
  "email": "j.nschfnp@qq.com",
  "password": "ut sed veniam"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» email|body|string| 是 |none|
|» password|body|string| 否 |none|

> 返回示例

> 201 Response

```json
{
  "token": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|成功|Inline|

### 返回数据结构

状态码 **201**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» token|string|true|none|经过加盐处理的AccessToken|none|

## POST 登出

POST /auth/logout

> Body 请求参数

```json
{
  "token": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» token|body|string| 是 | 登录时返回的token|none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# i18

## POST 创建一个国际化词条

POST /i18

> Body 请求参数

```json
{
  "lang": 0,
  "key": "string",
  "content": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» lang|body|number| 是 ||语言ID|
|» key|body|string| 是 ||词条键|
|» content|body|string| 是 ||词条内容|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "lang": {
    "id": 0,
    "name": "string",
    "i18": [
      {
        "id": 0,
        "lang": {
          "id": 0,
          "name": "string",
          "i18": [
            null
          ]
        },
        "key": "string",
        "content": "string"
      }
    ]
  },
  "key": "string",
  "content": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[I18](#schemai18)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取国际化字段

GET /i18

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|page|query|number| 否 ||页码.|
|limit|query|number| 否 ||获取数量|
|all|query|number| 否 ||是否全部获取, 如果不未0则忽略page与limit, 返回所有的国际化字段|
|key|query|string| 否 ||国际化字段的键, 如果设定则表示按照键来模糊查找|
|content|query|string| 否 ||国际化字段的值, 如果设定则表示按照值来模糊查找|

> 返回示例

> 200 Response

```json
{
  "items": [
    {
      "id": 0,
      "lang": {
        "id": 0,
        "name": "string",
        "i18": [
          {
            "id": null,
            "lang": null,
            "key": null,
            "content": null
          }
        ]
      },
      "key": "string",
      "content": "string"
    }
  ],
  "meta": {
    "itemCount": 0,
    "totalItems": 0,
    "itemsPerPage": 0,
    "currentPage": 0
  },
  "links": {
    "first": "string",
    "previous": "string",
    "next": "string",
    "last": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» items|[[I18](#schemai18)]|true|none||none|
|»» id|number|true|none|国际化字段的自增id|none|
|»» lang|[Lang](#schemalang)|true|none|国际化字段对应的语言信息|none|
|»»» id|number|true|none|语言ID|none|
|»»» name|string|true|none|语言名|none|
|»»» i18|[[I18](#schemai18)]|true|none|对应的国际化词条|none|
|»»»» id|number|true|none|国际化字段的自增id|none|
|»»»» lang|[Lang](#schemalang)|true|none|国际化字段对应的语言信息|none|
|»»»» key|string|true|none|国际化字段的键|none|
|»»»» content|string|true|none|国际化字段的实际内容|none|
|»» key|string|true|none|国际化字段的键|none|
|»» content|string|true|none|国际化字段的实际内容|none|
|» meta|[PaginationMeta](#schemapaginationmeta)|true|none||none|
|»» itemCount|number|false|none||none|
|»» totalItems|number|false|none||none|
|»» itemsPerPage|number|false|none||none|
|»» currentPage|number|false|none||none|
|» links|[PaginationLinks](#schemapaginationlinks)|true|none||none|
|»» first|string|false|none||none|
|»» previous|string|false|none||none|
|»» next|string|false|none||none|
|»» last|string|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取国际化表

GET /i18/format

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|lang|query|string| 否 ||语言名|

> 返回示例

> 200 Response

```json
{
  "[lang-name]": {
    "[key]": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

*Record<string,Record<sting,string>>*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» [lang-name]|object|true|none||none|
|»» [key]|string|true|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 根据国际化字段ID获取某一个国际化字段

GET /i18/{id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|integer| 是 ||国际化字段ID|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "lang": {
    "id": 0,
    "name": "string",
    "i18": [
      {
        "id": 0,
        "lang": {
          "id": 0,
          "name": "string",
          "i18": [
            null
          ]
        },
        "key": "string",
        "content": "string"
      }
    ]
  },
  "key": "string",
  "content": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[I18](#schemai18)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 修改一个国际化字段

PATCH /i18/{id}

> Body 请求参数

```json
{
  "lang": 0,
  "key": "string",
  "content": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|string| 是 ||国际化字段ID|
|body|body|object| 否 ||none|
|» lang|body|number| 否 ||语言名|
|» key|body|string| 否 ||国际化字段键|
|» content|body|string| 否 ||国际化字段值|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "lang": {
    "id": 0,
    "name": "string",
    "i18": [
      {
        "id": 0,
        "lang": {
          "id": 0,
          "name": "string",
          "i18": [
            null
          ]
        },
        "key": "string",
        "content": "string"
      }
    ]
  },
  "key": "string",
  "content": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[I18](#schemai18)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## DELETE 删除一个国际化字段

DELETE /i18/{id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|integer| 是 ||国际化字段ID|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "lang": {
    "id": 0,
    "name": "string",
    "i18": [
      {
        "id": 0,
        "lang": {
          "id": 0,
          "name": "string",
          "i18": [
            null
          ]
        },
        "key": "string",
        "content": "string"
      }
    ]
  },
  "key": "string",
  "content": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[I18](#schemai18)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# user

## POST 新建一个用户

POST /user/reg

> Body 请求参数

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "roleIds": [
    0
  ],
  "department": "string",
  "employeeType": "string",
  "probationStart": "string",
  "probationEnd": "string",
  "probationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» name|body|string| 是 | 用户昵称|none|
|» email|body|string| 是 | 用户Email|登录使用|
|» password|body|string| 是 | 用户密码|none|
|» roleIds|body|[number]| 是 | 用户角色ID数组|none|
|» department|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» employeeType|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» probationStart|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» probationEnd|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» probationDuration|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» protocolStart|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» protocolEnd|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» address|body|string| 否 | 遗留未知字段|1.1.0以前的遗留字段|
|» status|body|number| 否 | 帐号状态|none|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": [
    {
      "id": "string",
      "name": "string",
      "permission": [
        {
          "id": 0,
          "desc": "string",
          "name": "string"
        }
      ],
      "menus": [
        {
          "id": 0,
          "name": "string",
          "order": 0,
          "parentId": 0,
          "menuType": "string",
          "icon": "string",
          "component": "string",
          "path": "string",
          "locale": "string"
        }
      ]
    }
  ],
  "department": "string",
  "employeeType": "string",
  "probationENd": "string",
  "robationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0,
  "createTime": "string",
  "updateTime": "string",
  "create_time": "string",
  "salt": "string",
  "update_time": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[User](#schemauser)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取用户信息

GET /user/info/{email}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|email|path|string| 是 ||用户邮箱|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": [
    {
      "id": "string",
      "name": "string",
      "permission": [
        {
          "id": 0,
          "desc": "string",
          "name": "string"
        }
      ],
      "menus": [
        {
          "id": 0,
          "name": "string",
          "order": 0,
          "parentId": 0,
          "menuType": "string",
          "icon": "string",
          "component": "string",
          "path": "string",
          "locale": "string"
        }
      ]
    }
  ],
  "department": "string",
  "employeeType": "string",
  "probationENd": "string",
  "robationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0,
  "createTime": "string",
  "updateTime": "string",
  "create_time": "string",
  "salt": "string",
  "update_time": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[User](#schemauser)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## DELETE 删除一个用户

DELETE /user/{email}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|email|path|string| 是 ||用户邮箱|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": [
    {
      "id": "string",
      "name": "string",
      "permission": [
        {
          "id": 0,
          "desc": "string",
          "name": "string"
        }
      ],
      "menus": [
        {
          "id": 0,
          "name": "string",
          "order": 0,
          "parentId": 0,
          "menuType": "string",
          "icon": "string",
          "component": "string",
          "path": "string",
          "locale": "string"
        }
      ]
    }
  ],
  "department": "string",
  "employeeType": "string",
  "probationENd": "string",
  "robationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0,
  "createTime": "string",
  "updateTime": "string",
  "create_time": "string",
  "salt": "string",
  "update_time": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[User](#schemauser)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 修改一个用户

PATCH /user/update

如果修改了角色, 必须将该用户踢下线 (在redis中删除该用户的token)

> Body 请求参数

```json
{
  "oldPassword": "string",
  "newPassword": "string",
  "email": "string",
  "roleIds": [
    0
  ],
  "department": "string",
  "employeeType": "string",
  "probationStar": "string",
  "probationEnd": "string",
  "probationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0,
  "name": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» oldPassword|body|string| 否 | 旧密码|none|
|» newPassword|body|string| 否 | 新密码|none|
|» email|body|string| 是 | 邮箱|none|
|» roleIds|body|[number]| 是 | 角色ID|none|
|» department|body|string| 是 ||none|
|» employeeType|body|string| 是 ||none|
|» probationStar|body|string| 是 ||none|
|» probationEnd|body|string| 是 ||none|
|» probationDuration|body|string| 是 ||none|
|» protocolStart|body|string| 是 ||none|
|» protocolEnd|body|string| 是 ||none|
|» address|body|string| 是 ||none|
|» status|body|number| 是 | 状态|none|
|» name|body|string| 是 | 用户名|none|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": [
    {
      "id": "string",
      "name": "string",
      "permission": [
        {
          "id": 0,
          "desc": "string",
          "name": "string"
        }
      ],
      "menus": [
        {
          "id": 0,
          "name": "string",
          "order": 0,
          "parentId": 0,
          "menuType": "string",
          "icon": "string",
          "component": "string",
          "path": "string",
          "locale": "string"
        }
      ]
    }
  ],
  "department": "string",
  "employeeType": "string",
  "probationENd": "string",
  "robationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0,
  "createTime": "string",
  "updateTime": "string",
  "create_time": "string",
  "salt": "string",
  "update_time": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[User](#schemauser)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取用户列表

GET /user

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|name|query|string| 否 ||模糊查找的用户名|
|role|query|string| 否 ||用逗号分隔|
|email|query|string| 否 ||模糊查找的邮箱|

> 返回示例

> 200 Response

```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "password": "string",
      "role": [
        {
          "id": "string",
          "name": "string",
          "permission": [
            {}
          ],
          "menus": [
            {}
          ]
        }
      ],
      "department": "string",
      "employeeType": "string",
      "probationENd": "string",
      "robationDuration": "string",
      "protocolStart": "string",
      "protocolEnd": "string",
      "address": "string",
      "status": 0,
      "createTime": "string",
      "updateTime": "string",
      "create_time": "string",
      "salt": "string",
      "update_time": "string"
    }
  ],
  "meta": {
    "itemCount": 0,
    "totalItems": 0,
    "itemsPerPage": 0,
    "currentPage": 0
  },
  "links": {
    "first": "string",
    "previous": "string",
    "next": "string",
    "last": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» items|[[User](#schemauser)]|true|none||none|
|»» id|string|true|none|数据库自增id|none|
|»» name|string|true|none|用户名|none|
|»» email|string|true|none||登录邮箱|
|»» password|string|true|none|密码|none|
|»» role|[[Role](#schemarole)]|true|none|角色|none|
|»»» id|string|true|none|角色id|none|
|»»» name|string|true|none|角色名|none|
|»»» permission|[[Permission](#schemapermission)]|true|none|权限|none|
|»»»» id|number|true|none|权限ID|none|
|»»»» desc|string|true|none|权限介绍|none|
|»»»» name|string|true|none|权限键|none|
|»»» menus|[[Menu](#schemamenu)]|true|none|菜单|none|
|»»»» id|number|true|none|菜单id|none|
|»»»» name|string|true|none|菜单名|none|
|»»»» order|number|true|none|排序|none|
|»»»» parentId|number|false|none|父级id|none|
|»»»» menuType|string|true|none|保留字段|none|
|»»»» icon|string|false|none|图标名|none|
|»»»» component|string|true|none|组件名|none|
|»»»» path|string|true|none|路由路径|none|
|»»»» locale|string|true|none|国际化键|none|
|»» department|string|true|none||1.1.0以前的遗留字段|
|»» employeeType|string|true|none||1.1.0以前的遗留字段|
|»» probationENd|string|true|none||1.1.0以前的遗留字段|
|»» robationDuration|string|true|none||1.1.0以前的遗留字段|
|»» protocolStart|string|true|none||1.1.0以前的遗留字段|
|»» protocolEnd|string|true|none||1.1.0以前的遗留字段|
|»» address|string|true|none||1.1.0以前的遗留字段|
|»» status|number|true|none|帐号状态|none|
|»» createTime|string|true|none||none|
|»» updateTime|string|true|none||none|
|»» create_time|string|true|none||none|
|»» salt|string|true|none|bcrypt盐|none|
|»» update_time|string|true|none||none|
|» meta|[PaginationMeta](#schemapaginationmeta)|true|none||none|
|»» itemCount|number|false|none||none|
|»» totalItems|number|false|none||none|
|»» itemsPerPage|number|false|none||none|
|»» currentPage|number|false|none||none|
|» links|[PaginationLinks](#schemapaginationlinks)|true|none||none|
|»» first|string|false|none||none|
|»» previous|string|false|none||none|
|»» next|string|false|none||none|
|»» last|string|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 强制修改一个用户的密码

PATCH /user/admin/updatePwd

> 返回示例

> 200 Response

```json
{
  "email": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» email|string|true|none||强制修改密码的邮箱|
|» newPassword|string|true|none||新密码|
|» confirmPassword|string|true|none||确认新密码|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 修改自身密码

PATCH /user/updatePwd

> Body 请求参数

```json
{
  "email": "string",
  "token": "string",
  "newPassword": "string",
  "oldPassword": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» email|body|string| 是 ||要修改用户的邮箱名|
|» token|body|string| 是 ||用户token|
|» newPassword|body|string| 是 ||新密码|
|» oldPassword|body|string| 是 ||旧密码|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# role

## POST 新增一个角色

POST /role

> Body 请求参数

```json
{
  "name": "string",
  "permissionIds": [
    0
  ],
  "menuIds": [
    0
  ]
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» name|body|string| 是 | 角色名|none|
|» permissionIds|body|[number]| 是 | 权限id数组|none|
|» menuIds|body|[number]| 是 | 菜单id数组|none|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "permission": [
    {
      "id": 0,
      "desc": "string",
      "name": "string"
    }
  ],
  "menus": [
    {
      "id": 0,
      "name": "string",
      "order": 0,
      "parentId": 0,
      "menuType": "string",
      "icon": "string",
      "component": "string",
      "path": "string",
      "locale": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Role](#schemarole)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 查找所有角色

GET /role

> 返回示例

> 200 Response

```json
[
  {
    "id": "string",
    "name": "string",
    "permission": [
      {
        "id": 0,
        "desc": "string",
        "name": "string"
      }
    ],
    "menus": [
      {
        "id": 0,
        "name": "string",
        "order": 0,
        "parentId": 0,
        "menuType": "string",
        "icon": "string",
        "component": "string",
        "path": "string",
        "locale": "string"
      }
    ]
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[Role](#schemarole)]|false|none||none|
|» id|string|true|none|角色id|none|
|» name|string|true|none|角色名|none|
|» permission|[[Permission](#schemapermission)]|true|none|权限|none|
|»» id|number|true|none|权限ID|none|
|»» desc|string|true|none|权限介绍|none|
|»» name|string|true|none|权限键|none|
|» menus|[[Menu](#schemamenu)]|true|none|菜单|none|
|»» id|number|true|none|菜单id|none|
|»» name|string|true|none|菜单名|none|
|»» order|number|true|none|排序|none|
|»» parentId|number|false|none|父级id|none|
|»» menuType|string|true|none|保留字段|none|
|»» icon|string|false|none|图标名|none|
|»» component|string|true|none|组件名|none|
|»» path|string|true|none|路由路径|none|
|»» locale|string|true|none|国际化键|none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 修改一个角色

PATCH /role

> Body 请求参数

```json
{
  "id": 0,
  "name": "string",
  "permissionIds": [
    0
  ],
  "menuIds": [
    0
  ]
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» id|body|number| 是 | 角色id|none|
|» name|body|string| 否 | 角色名|none|
|» permissionIds|body|[number]| 否 | 角色权限id列表|none|
|» menuIds|body|[number]| 否 | 角色菜单列表|none|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "permission": [
    {
      "id": 0,
      "desc": "string",
      "name": "string"
    }
  ],
  "menus": [
    {
      "id": 0,
      "name": "string",
      "order": 0,
      "parentId": 0,
      "menuType": "string",
      "icon": "string",
      "component": "string",
      "path": "string",
      "locale": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Role](#schemarole)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取角色列表的详细信息

GET /role/detail

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|page|query|integer| 否 ||页数|
|limit|query|integer| 否 ||获取数量|
|name|query|string| 否 ||角色名|

> 返回示例

> 200 Response

```json
{
  "roleInfo": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "permission": [
          {
            "id": null,
            "desc": null,
            "name": null
          }
        ],
        "menus": [
          {
            "id": null,
            "name": null,
            "order": null,
            "parentId": null,
            "menuType": null,
            "icon": null,
            "component": null,
            "path": null,
            "locale": null
          }
        ]
      }
    ],
    "meta": {
      "itemCount": 0,
      "totalItems": 0,
      "itemsPerPage": 0,
      "currentPage": 0
    },
    "links": {
      "first": "string",
      "previous": "string",
      "next": "string",
      "last": "string"
    }
  },
  "menuTree": [
    {
      "id": 0,
      "label": "string",
      "children": [
        {
          "id": null,
          "label": "string",
          "children": [
            {}
          ],
          "url": "string",
          "component": "string",
          "customIcon": "string",
          "menuType": "string",
          "parentId": "string",
          "order": 0,
          "locale": "string"
        }
      ],
      "url": "string",
      "component": "string",
      "customIcon": "string",
      "menuType": "string",
      "parentId": "string",
      "order": 0,
      "locale": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» roleInfo|object|true|none||none|
|»» items|[[Role](#schemarole)]|true|none||none|
|»»» id|string|true|none|角色id|none|
|»»» name|string|true|none|角色名|none|
|»»» permission|[[Permission](#schemapermission)]|true|none|权限|none|
|»»»» id|number|true|none|权限ID|none|
|»»»» desc|string|true|none|权限介绍|none|
|»»»» name|string|true|none|权限键|none|
|»»» menus|[[Menu](#schemamenu)]|true|none|菜单|none|
|»»»» id|number|true|none|菜单id|none|
|»»»» name|string|true|none|菜单名|none|
|»»»» order|number|true|none|排序|none|
|»»»» parentId|number|false|none|父级id|none|
|»»»» menuType|string|true|none|保留字段|none|
|»»»» icon|string|false|none|图标名|none|
|»»»» component|string|true|none|组件名|none|
|»»»» path|string|true|none|路由路径|none|
|»»»» locale|string|true|none|国际化键|none|
|»» meta|[PaginationMeta](#schemapaginationmeta)|true|none||none|
|»»» itemCount|number|false|none||none|
|»»» totalItems|number|false|none||none|
|»»» itemsPerPage|number|false|none||none|
|»»» currentPage|number|false|none||none|
|»» links|[PaginationLinks](#schemapaginationlinks)|true|none||none|
|»»» first|string|false|none||none|
|»»» previous|string|false|none||none|
|»»» next|string|false|none||none|
|»»» last|string|false|none||none|
|» menuTree|[[ITreeNodeData](#schemaitreenodedata)]|true|none||none|
|»» id|any|true|none|id|none|

*anyOf*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»» *anonymous*|number|false|none||none|

*or*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»»» *anonymous*|string|false|none||none|

*continued*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»» label|string|true|none|展示的标签|none|
|»» children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|»»» id|any|true|none|id|none|
|»»» label|string|true|none|展示的标签|none|
|»»» children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|»»» url|string|true|none|访问路由|none|
|»»» component|string|true|none|组件|none|
|»»» customIcon|string|true|none|图标名|none|
|»»» menuType|string|true|none|保留字段|none|
|»»» parentId|string|true|none|父级id|none|
|»»» order|integer|true|none|排序|none|
|»»» locale|string|true|none|国际化键|none|
|»» url|string|true|none|访问路由|none|
|»» component|string|true|none|组件|none|
|»» customIcon|string|true|none|图标名|none|
|»» menuType|string|true|none|保留字段|none|
|»» parentId|string|true|none|父级id|none|
|»» order|integer|true|none|排序|none|
|»» locale|string|true|none|国际化键|none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## DELETE 删除一个角色

DELETE /role/{id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|number| 是 ||角色id|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "permission": [
    {
      "id": 0,
      "desc": "string",
      "name": "string"
    }
  ],
  "menus": [
    {
      "id": 0,
      "name": "string",
      "order": 0,
      "parentId": 0,
      "menuType": "string",
      "icon": "string",
      "component": "string",
      "path": "string",
      "locale": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Role](#schemarole)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取一个角色的详细信息

GET /role/info/{id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|integer| 是 ||角色id|

> 返回示例

> 200 Response

```json
{
  "id": "string",
  "name": "string",
  "permission": [
    {
      "id": 0,
      "desc": "string",
      "name": "string"
    }
  ],
  "menus": [
    {
      "id": 0,
      "name": "string",
      "order": 0,
      "parentId": 0,
      "menuType": "string",
      "icon": "string",
      "component": "string",
      "path": "string",
      "locale": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Role](#schemarole)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# permission

## POST 创建权限

POST /permission

> Body 请求参数

```json
{
  "name": "string",
  "desc": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» name|body|string| 是 | 权限键|none|
|» desc|body|string| 是 | 权限简介|none|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "desc": "string",
  "name": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Permission](#schemapermission)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 修改权限

PATCH /permission

> Body 请求参数

```json
{
  "name": "string",
  "desc": "string",
  "id": 0
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[UpdatePermissionDTO](#schemaupdatepermissiondto)| 否 ||none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取权限

GET /permission

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|page|query|string| 否 ||页数|
|limit|query|string| 否 ||如果为0则查找所有|
|name|query|string| 否 ||权限名，where子句格式|

> 返回示例

> 200 Response

```json
{
  "items": [
    {
      "id": 0,
      "desc": "string",
      "name": "string"
    }
  ],
  "meta": {
    "itemCount": 0,
    "totalItems": 0,
    "itemsPerPage": 0,
    "currentPage": 0
  },
  "links": {
    "first": "string",
    "previous": "string",
    "next": "string",
    "last": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» items|[[Permission](#schemapermission)]|true|none||none|
|»» id|number|true|none|权限ID|none|
|»» desc|string|true|none|权限介绍|none|
|»» name|string|true|none|权限键|none|
|» meta|[PaginationMeta](#schemapaginationmeta)|true|none||none|
|»» itemCount|number|false|none||none|
|»» totalItems|number|false|none||none|
|»» itemsPerPage|number|false|none||none|
|»» currentPage|number|false|none||none|
|» links|[PaginationLinks](#schemapaginationlinks)|true|none||none|
|»» first|string|false|none||none|
|»» previous|string|false|none||none|
|»» next|string|false|none||none|
|»» last|string|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## DELETE 删除权限

DELETE /permission/{id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|integer| 是 ||权限id|

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "desc": "string",
    "name": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» id|number|true|none|权限ID|none|
|» desc|string|true|none|权限介绍|none|
|» name|string|true|none|权限键|none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# menu

## GET 获取用户菜单

GET /menu/role/{email}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|email|path|string| 是 ||用户email|

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "label": "string",
    "children": [
      {
        "id": 0,
        "label": "string",
        "children": [
          {
            "id": null,
            "label": "string",
            "children": [
              null
            ],
            "url": "string",
            "component": "string",
            "customIcon": "string",
            "menuType": "string",
            "parentId": "string",
            "order": 0,
            "locale": "string"
          }
        ],
        "url": "string",
        "component": "string",
        "customIcon": "string",
        "menuType": "string",
        "parentId": "string",
        "order": 0,
        "locale": "string"
      }
    ],
    "url": "string",
    "component": "string",
    "customIcon": "string",
    "menuType": "string",
    "parentId": "string",
    "order": 0,
    "locale": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[ITreeNodeData](#schemaitreenodedata)]|false|none||none|
|» id|any|true|none|id|none|

*anyOf*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»» *anonymous*|number|false|none||none|

*or*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»» *anonymous*|string|false|none||none|

*continued*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» label|string|true|none|展示的标签|none|
|» children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|»» id|any|true|none|id|none|
|»» label|string|true|none|展示的标签|none|
|»» children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|»» url|string|true|none|访问路由|none|
|»» component|string|true|none|组件|none|
|»» customIcon|string|true|none|图标名|none|
|»» menuType|string|true|none|保留字段|none|
|»» parentId|string|true|none|父级id|none|
|»» order|integer|true|none|排序|none|
|»» locale|string|true|none|国际化键|none|
|» url|string|true|none|访问路由|none|
|» component|string|true|none|组件|none|
|» customIcon|string|true|none|图标名|none|
|» menuType|string|true|none|保留字段|none|
|» parentId|string|true|none|父级id|none|
|» order|integer|true|none|排序|none|
|» locale|string|true|none|国际化键|none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## GET 获取菜单树

GET /menu

获取所有的菜单，并根绝parentId建立一个菜单树

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "label": "string",
    "children": [
      {
        "id": 0,
        "label": "string",
        "children": [
          {
            "id": null,
            "label": "string",
            "children": [
              null
            ],
            "url": "string",
            "component": "string",
            "customIcon": "string",
            "menuType": "string",
            "parentId": "string",
            "order": 0,
            "locale": "string"
          }
        ],
        "url": "string",
        "component": "string",
        "customIcon": "string",
        "menuType": "string",
        "parentId": "string",
        "order": 0,
        "locale": "string"
      }
    ],
    "url": "string",
    "component": "string",
    "customIcon": "string",
    "menuType": "string",
    "parentId": "string",
    "order": 0,
    "locale": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[ITreeNodeData](#schemaitreenodedata)]|false|none||none|
|» id|any|true|none|id|none|

*anyOf*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»» *anonymous*|number|false|none||none|

*or*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|»» *anonymous*|string|false|none||none|

*continued*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» label|string|true|none|展示的标签|none|
|» children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|»» id|any|true|none|id|none|
|»» label|string|true|none|展示的标签|none|
|»» children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|»» url|string|true|none|访问路由|none|
|»» component|string|true|none|组件|none|
|»» customIcon|string|true|none|图标名|none|
|»» menuType|string|true|none|保留字段|none|
|»» parentId|string|true|none|父级id|none|
|»» order|integer|true|none|排序|none|
|»» locale|string|true|none|国际化键|none|
|» url|string|true|none|访问路由|none|
|» component|string|true|none|组件|none|
|» customIcon|string|true|none|图标名|none|
|» menuType|string|true|none|保留字段|none|
|» parentId|string|true|none|父级id|none|
|» order|integer|true|none|排序|none|
|» locale|string|true|none|国际化键|none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## POST 新增一个菜单

POST /menu

> Body 请求参数

```json
{
  "order": 0,
  "menuType": "string",
  "name": "string",
  "path": "string",
  "component": "string",
  "icon": "string",
  "locale": "string",
  "parentId": 0
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|object| 否 ||none|
|» order|body|number| 是 ||none|
|» menuType|body|string| 是 ||none|
|» name|body|string| 是 ||none|
|» path|body|string| 是 ||none|
|» component|body|string| 是 ||none|
|» icon|body|string| 是 ||none|
|» locale|body|string| 是 ||none|
|» parentId|body|number¦null| 否 ||none|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "order": 0,
  "parentId": 0,
  "menuType": "string",
  "icon": "string",
  "component": "string",
  "path": "string",
  "locale": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Menu](#schemamenu)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PATCH 修改一个菜单

PATCH /menu

> Body 请求参数

```json
{
  "order": 0,
  "menuType": "string",
  "name": "string",
  "path": "string",
  "component": "string",
  "icon": "string",
  "locale": "string",
  "parentId": 0,
  "id": 0
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[UpdateMenuDTO](#schemaupdatemenudto)| 否 ||none|

> 返回示例

> 200 Response

```json
true
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|boolean|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## DELETE 删除一个菜单

DELETE /menu

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|query|integer| 否 ||菜单Id|
|parentId|query|integer| 否 ||父级菜单ID|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "order": 0,
  "parentId": 0,
  "menuType": "string",
  "icon": "string",
  "component": "string",
  "path": "string",
  "locale": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Menu](#schemamenu)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# mock

## GET GET 的mock方法

GET /mock

> 返回示例

> 200 Response

```json
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## POST POST的mock方法

POST /mock

> 返回示例

> 200 Response

```json
"string"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|string|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# lang

## GET 获取所有语言

GET /lang

> 返回示例

> 200 Response

```json
[
  {
    "id": 0,
    "name": "string",
    "i18": [
      {
        "id": 0,
        "lang": {
          "id": 0,
          "name": "string",
          "i18": [
            {}
          ]
        },
        "key": "string",
        "content": "string"
      }
    ]
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[Lang](#schemalang)]|false|none||none|
|» 国际化字段对应的语言信息|[Lang](#schemalang)|false|none|国际化字段对应的语言信息|none|
|»» id|number|true|none|语言ID|none|
|»» name|string|true|none|语言名|none|
|»» i18|[[I18](#schemai18)]|true|none|对应的国际化词条|none|
|»»» id|number|true|none|国际化字段的自增id|none|
|»»» lang|[Lang](#schemalang)|true|none|国际化字段对应的语言信息|none|
|»»»» id|number|true|none|语言ID|none|
|»»»» name|string|true|none|语言名|none|
|»»»» i18|[[I18](#schemai18)]|true|none|对应的国际化词条|none|
|»»» key|string|true|none|国际化字段的键|none|
|»»» content|string|true|none|国际化字段的实际内容|none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## POST 增加一个语言

POST /lang

> Body 请求参数

```json
{
  "name": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[CreateLang](#schemacreatelang)| 否 ||none|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "i18": [
    {
      "id": 0,
      "lang": {
        "id": 0,
        "name": "string",
        "i18": [
          {
            "id": null,
            "lang": null,
            "key": null,
            "content": null
          }
        ]
      },
      "key": "string",
      "content": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Lang](#schemalang)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## PACH 修改一个语言

PACH /lang/{id}

> Body 请求参数

```json
{
  "name": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|string| 是 ||语言ID|
|body|body|[UpdateLang](#schemaupdatelang)| 否 ||none|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "i18": [
    {
      "id": 0,
      "lang": {
        "id": 0,
        "name": "string",
        "i18": [
          {
            "id": null,
            "lang": null,
            "key": null,
            "content": null
          }
        ]
      },
      "key": "string",
      "content": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Lang](#schemalang)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

## DELETE 删除一个语言

DELETE /lang/{id}

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|id|path|number| 是 ||语言ID|

> 返回示例

> 200 Response

```json
{
  "id": 0,
  "name": "string",
  "i18": [
    {
      "id": 0,
      "lang": {
        "id": 0,
        "name": "string",
        "i18": [
          {
            "id": null,
            "lang": null,
            "key": null,
            "content": null
          }
        ]
      },
      "key": "string",
      "content": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|[Lang](#schemalang)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|401 未登录|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|403 权限不足|Inline|

### 返回数据结构

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|true|none||none|
|» message|string|true|none||none|

状态码 **403**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» statusCode|number|false|none||none|
|» message|string|false|none||none|

# 数据模型

<h2 id="tocS_UpdateLang">UpdateLang</h2>

<a id="schemaupdatelang"></a>
<a id="schema_UpdateLang"></a>
<a id="tocSupdatelang"></a>
<a id="tocsupdatelang"></a>

```json
{
  "name": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|name|string|false|none|语言名|none|

<h2 id="tocS_CreateLang">CreateLang</h2>

<a id="schemacreatelang"></a>
<a id="schema_CreateLang"></a>
<a id="tocScreatelang"></a>
<a id="tocscreatelang"></a>

```json
{
  "name": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|name|string|true|none|语言名|none|

<h2 id="tocS_UpdateMenuDTO">UpdateMenuDTO</h2>

<a id="schemaupdatemenudto"></a>
<a id="schema_UpdateMenuDTO"></a>
<a id="tocSupdatemenudto"></a>
<a id="tocsupdatemenudto"></a>

```json
{
  "order": 0,
  "menuType": "string",
  "name": "string",
  "path": "string",
  "component": "string",
  "icon": "string",
  "locale": "string",
  "parentId": 0,
  "id": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|order|number|true|none|序号|none|
|menuType|string|true|none|菜单类型|none|
|name|string|true|none|菜单键 |唯一|
|path|string|true|none|菜单路径|none|
|component|string|true|none|组件|none|
|icon|string|true|none|图标名|none|
|locale|string|true|none|国际化字段|展示用|
|parentId|number¦null|false|none|父级id|none|
|id|number|true|none|菜单id|none|

<h2 id="tocS_CreateMenuDTO">CreateMenuDTO</h2>

<a id="schemacreatemenudto"></a>
<a id="schema_CreateMenuDTO"></a>
<a id="tocScreatemenudto"></a>
<a id="tocscreatemenudto"></a>

```json
{
  "order": 0,
  "menuType": "string",
  "name": "string",
  "path": "string",
  "component": "string",
  "icon": "string",
  "locale": "string",
  "parentId": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|order|number|true|none|序号|none|
|menuType|string|true|none|菜单类型|none|
|name|string|true|none|菜单键 |唯一|
|path|string|true|none|菜单路径|none|
|component|string|true|none|组件|none|
|icon|string|true|none|图标名|none|
|locale|string|true|none|国际化字段|展示用|
|parentId|number¦null|false|none|父级id|none|

<h2 id="tocS_UpdatePermissionDTO">UpdatePermissionDTO</h2>

<a id="schemaupdatepermissiondto"></a>
<a id="schema_UpdatePermissionDTO"></a>
<a id="tocSupdatepermissiondto"></a>
<a id="tocsupdatepermissiondto"></a>

```json
{
  "name": "string",
  "desc": "string",
  "id": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|name|string|false|none|权限键|none|
|desc|string|false|none|权限介绍|none|
|id|integer|true|none|权限id|none|

<h2 id="tocS_CreatePermissionDTO">CreatePermissionDTO</h2>

<a id="schemacreatepermissiondto"></a>
<a id="schema_CreatePermissionDTO"></a>
<a id="tocScreatepermissiondto"></a>
<a id="tocscreatepermissiondto"></a>

```json
{
  "name": "string",
  "desc": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|name|string|true|none|权限键|none|
|desc|string|true|none|权限介绍|none|

<h2 id="tocS_ITreeNodeData">ITreeNodeData</h2>

<a id="schemaitreenodedata"></a>
<a id="schema_ITreeNodeData"></a>
<a id="tocSitreenodedata"></a>
<a id="tocsitreenodedata"></a>

```json
{
  "id": 0,
  "label": "string",
  "children": [
    {
      "id": 0,
      "label": "string",
      "children": [
        {
          "id": null,
          "label": "string",
          "children": [
            {}
          ],
          "url": "string",
          "component": "string",
          "customIcon": "string",
          "menuType": "string",
          "parentId": "string",
          "order": 0,
          "locale": "string"
        }
      ],
      "url": "string",
      "component": "string",
      "customIcon": "string",
      "menuType": "string",
      "parentId": "string",
      "order": 0,
      "locale": "string"
    }
  ],
  "url": "string",
  "component": "string",
  "customIcon": "string",
  "menuType": "string",
  "parentId": "string",
  "order": 0,
  "locale": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|any|true|none|id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|number|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|label|string|true|none|展示的标签|none|
|children|[[ITreeNodeData](#schemaitreenodedata)]|false|none|子集菜单|none|
|url|string|true|none|访问路由|none|
|component|string|true|none|组件|none|
|customIcon|string|true|none|图标名|none|
|menuType|string|true|none|保留字段|none|
|parentId|string|true|none|父级id|none|
|order|integer|true|none|排序|none|
|locale|string|true|none|国际化键|none|

<h2 id="tocS_User">User</h2>

<a id="schemauser"></a>
<a id="schema_User"></a>
<a id="tocSuser"></a>
<a id="tocsuser"></a>

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": [
    {
      "id": "string",
      "name": "string",
      "permission": [
        {
          "id": 0,
          "desc": "string",
          "name": "string"
        }
      ],
      "menus": [
        {
          "id": 0,
          "name": "string",
          "order": 0,
          "parentId": 0,
          "menuType": "string",
          "icon": "string",
          "component": "string",
          "path": "string",
          "locale": "string"
        }
      ]
    }
  ],
  "department": "string",
  "employeeType": "string",
  "probationENd": "string",
  "robationDuration": "string",
  "protocolStart": "string",
  "protocolEnd": "string",
  "address": "string",
  "status": 0,
  "createTime": "string",
  "updateTime": "string",
  "create_time": "string",
  "salt": "string",
  "update_time": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|数据库自增id|none|
|name|string|true|none|用户名|none|
|email|string|true|none||登录邮箱|
|password|string|true|none|密码|none|
|role|[[Role](#schemarole)]|true|none|角色|none|
|department|string|true|none||1.1.0以前的遗留字段|
|employeeType|string|true|none||1.1.0以前的遗留字段|
|probationENd|string|true|none||1.1.0以前的遗留字段|
|robationDuration|string|true|none||1.1.0以前的遗留字段|
|protocolStart|string|true|none||1.1.0以前的遗留字段|
|protocolEnd|string|true|none||1.1.0以前的遗留字段|
|address|string|true|none||1.1.0以前的遗留字段|
|status|number|true|none|帐号状态|none|
|createTime|string|true|none||none|
|updateTime|string|true|none||none|
|create_time|string|true|none||none|
|salt|string|true|none|bcrypt盐|none|
|update_time|string|true|none||none|

<h2 id="tocS_Role">Role</h2>

<a id="schemarole"></a>
<a id="schema_Role"></a>
<a id="tocSrole"></a>
<a id="tocsrole"></a>

```json
{
  "id": "string",
  "name": "string",
  "permission": [
    {
      "id": 0,
      "desc": "string",
      "name": "string"
    }
  ],
  "menus": [
    {
      "id": 0,
      "name": "string",
      "order": 0,
      "parentId": 0,
      "menuType": "string",
      "icon": "string",
      "component": "string",
      "path": "string",
      "locale": "string"
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|true|none|角色id|none|
|name|string|true|none|角色名|none|
|permission|[[Permission](#schemapermission)]|true|none|权限|none|
|menus|[[Menu](#schemamenu)]|true|none|菜单|none|

<h2 id="tocS_Menu">Menu</h2>

<a id="schemamenu"></a>
<a id="schema_Menu"></a>
<a id="tocSmenu"></a>
<a id="tocsmenu"></a>

```json
{
  "id": 0,
  "name": "string",
  "order": 0,
  "parentId": 0,
  "menuType": "string",
  "icon": "string",
  "component": "string",
  "path": "string",
  "locale": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|菜单id|none|
|name|string|true|none|菜单名|none|
|order|number|true|none|排序|none|
|parentId|number|false|none|父级id|none|
|menuType|string|true|none|保留字段|none|
|icon|string|false|none|图标名|none|
|component|string|true|none|组件名|none|
|path|string|true|none|路由路径|none|
|locale|string|true|none|国际化键|none|

<h2 id="tocS_Permission">Permission</h2>

<a id="schemapermission"></a>
<a id="schema_Permission"></a>
<a id="tocSpermission"></a>
<a id="tocspermission"></a>

```json
{
  "id": 0,
  "desc": "string",
  "name": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|权限ID|none|
|desc|string|true|none|权限介绍|none|
|name|string|true|none|权限键|none|

<h2 id="tocS_PaginationOptionsRoutingLabels ">PaginationOptionsRoutingLabels </h2>

<a id="schemapaginationoptionsroutinglabels "></a>
<a id="schema_PaginationOptionsRoutingLabels "></a>
<a id="tocSpaginationoptionsroutinglabels "></a>
<a id="tocspaginationoptionsroutinglabels "></a>

```json
{
  "limitLabel": "string",
  "pageLabel": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|limitLabel|string|true|none||none|
|pageLabel|string|true|none||none|

<h2 id="tocS_PaginationLinks">PaginationLinks</h2>

<a id="schemapaginationlinks"></a>
<a id="schema_PaginationLinks"></a>
<a id="tocSpaginationlinks"></a>
<a id="tocspaginationlinks"></a>

```json
{
  "first": "string",
  "previous": "string",
  "next": "string",
  "last": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|first|string|false|none||none|
|previous|string|false|none||none|
|next|string|false|none||none|
|last|string|false|none||none|

<h2 id="tocS_PaginationMeta">PaginationMeta</h2>

<a id="schemapaginationmeta"></a>
<a id="schema_PaginationMeta"></a>
<a id="tocSpaginationmeta"></a>
<a id="tocspaginationmeta"></a>

```json
{
  "itemCount": 0,
  "totalItems": 0,
  "itemsPerPage": 0,
  "currentPage": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|itemCount|number|false|none||none|
|totalItems|number|false|none||none|
|itemsPerPage|number|false|none||none|
|currentPage|number|false|none||none|

<h2 id="tocS_I18">I18</h2>

<a id="schemai18"></a>
<a id="schema_I18"></a>
<a id="tocSi18"></a>
<a id="tocsi18"></a>

```json
{
  "id": 0,
  "lang": {
    "id": 0,
    "name": "string",
    "i18": [
      {
        "id": 0,
        "lang": {
          "id": 0,
          "name": "string",
          "i18": [
            null
          ]
        },
        "key": "string",
        "content": "string"
      }
    ]
  },
  "key": "string",
  "content": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|国际化字段的自增id|none|
|lang|[Lang](#schemalang)|true|none|国际化字段对应的语言信息|none|
|key|string|true|none|国际化字段的键|none|
|content|string|true|none|国际化字段的实际内容|none|

<h2 id="tocS_Lang">Lang</h2>

<a id="schemalang"></a>
<a id="schema_Lang"></a>
<a id="tocSlang"></a>
<a id="tocslang"></a>

```json
{
  "id": 0,
  "name": "string",
  "i18": [
    {
      "id": 0,
      "lang": {
        "id": 0,
        "name": "string",
        "i18": [
          {
            "id": null,
            "lang": null,
            "key": null,
            "content": null
          }
        ]
      },
      "key": "string",
      "content": "string"
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|number|true|none|语言ID|none|
|name|string|true|none|语言名|none|
|i18|[[I18](#schemai18)]|true|none|对应的国际化词条|none|


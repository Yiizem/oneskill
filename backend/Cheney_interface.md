# Cheney_interface.md —— 后端接口记录

> 姓名：孟思颐佳 | 学号：24001010430
> 记录规则：每次创建或修改接口后在文件末尾追加一条，禁止覆盖已有内容。
> 统一响应格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`，code=0 表示成功，非 0 表示失败。

---

## 接口 1：健康检查

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无
- 响应格式：

```json
{
  "code": 0,
  "msg": "服务运行正常",
  "data": { "Cheney_time": "2026-11-19T03:12:45.512Z" }
}
```

- 修改时间：2026-11-19 09:50

---

## 接口 2：数据库连接测试

- 接口路径：`/api/database/test`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

```json
{
  "user": "root",
  "password": "123456",
  "host": "127.0.0.1",
  "port": 8430,
  "database": "Cheney_ketangai"
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": {
    "Cheney_version": "8.4.4",
    "Cheney_db": "cheney_ketangai",
    "Cheney_host": "127.0.0.1",
    "Cheney_port": 8430,
    "Cheney_user": "root"
  }
}
```

- 响应格式（失败）：

```json
{
  "code": 40005,
  "msg": "数据库连接失败：ER_ACCESS_DENIED_ERROR",
  "data": {
    "Cheney_code": "ER_ACCESS_DENIED_ERROR",
    "Cheney_message": "Access denied for user 'root'@'localhost' (using password: YES)"
  }
}
```

- 其他错误码：40003 用户名为空、40004 参数超长、50005 服务异常
- 修改时间：2026-11-19 10:30

---

## 接口 3：科技新闻列表

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数（Query，均可省略）：

```text
?page=1&pageSize=10
page      页码，默认 1
pageSize  每页条数，默认 10，最大 50
示例：http://localhost:8325/api/news?page=1&pageSize=10
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "新闻列表获取成功",
  "data": {
    "Cheney_total": 8,
    "Cheney_page": 1,
    "Cheney_pageSize": 10,
    "Cheney_list": [
      {
        "Cheney_news_id": 1,
        "Cheney_news_title": "国产多模态大模型发布 2.0 版本，端侧推理时延降至 120 毫秒",
        "Cheney_news_summary": "新一代模型在同等算力下视觉与语音理解精度提升 18%，可在手机端离线运行。",
        "Cheney_news_source": "智算前沿",
        "Cheney_news_author": "林知远",
        "Cheney_news_category": "人工智能",
        "Cheney_news_publish_time": "2026-11-18T01:20:00.000Z",
        "Cheney_news_views": 1286
      }
    ]
  }
}
```

- 修改时间：2026-11-19 11:00

---

## 接口 4：科技新闻详情

- 接口路径：`/api/news/:id`
- HTTP 方法：`GET`
- 请求参数（Path）：

```text
id  新闻主键，正整数
示例：http://localhost:8325/api/news/1
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "新闻详情获取成功",
  "data": {
    "Cheney_news_id": 1,
    "Cheney_news_title": "国产多模态大模型发布 2.0 版本，端侧推理时延降至 120 毫秒",
    "Cheney_news_summary": "新一代模型在同等算力下视觉与语音理解精度提升 18%，可在手机端离线运行。",
    "Cheney_news_content": "该模型采用稀疏专家混合架构……",
    "Cheney_news_source": "智算前沿",
    "Cheney_news_author": "林知远",
    "Cheney_news_category": "人工智能",
    "Cheney_news_publish_time": "2026-11-18T01:20:00.000Z",
    "Cheney_news_views": 1286
  }
}
```

- 错误码：40001 id 不合法、40401 未找到对应新闻、50002 查询异常
- 修改时间：2026-11-19 11:00

---

## 接口 5：图文列表

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 请求参数（Query，均可省略）：

```text
?page=1&pageSize=8
page      页码，默认 1
pageSize  每页条数，默认 8，最大 50
示例：http://localhost:8325/api/gallery?page=1&pageSize=8
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "图文列表获取成功",
  "data": {
    "Cheney_total": 8,
    "Cheney_page": 1,
    "Cheney_pageSize": 8,
    "Cheney_list": [
      {
        "Cheney_gallery_id": 1,
        "Cheney_gallery_title": "智能座舱多屏交互方案",
        "Cheney_gallery_description": "中控、仪表与副驾三屏联动，导航信息可一键推送至任意屏。",
        "Cheney_gallery_image": "images/gallery-01.jpg",
        "Cheney_gallery_category": "智能汽车",
        "Cheney_gallery_source": "课堂实拍素材",
        "Cheney_gallery_publish_time": "2026-11-18T02:12:00.000Z",
        "Cheney_gallery_views": 862
      }
    ]
  }
}
```

- 修改时间：2026-11-19 11:30

---

## 接口 6：图文详情

- 接口路径：`/api/gallery/:id`
- HTTP 方法：`GET`
- 请求参数（Path）：

```text
id  图文主键，正整数
示例：http://localhost:8325/api/gallery/1
```

- 响应格式：

```json
{
  "code": 0,
  "msg": "图文详情获取成功",
  "data": {
    "Cheney_gallery_id": 1,
    "Cheney_gallery_title": "智能座舱多屏交互方案",
    "Cheney_gallery_description": "中控、仪表与副驾三屏联动，导航信息可一键推送至任意屏。",
    "Cheney_gallery_image": "images/gallery-01.jpg",
    "Cheney_gallery_category": "智能汽车",
    "Cheney_gallery_source": "课堂实拍素材",
    "Cheney_gallery_publish_time": "2026-11-18T02:12:00.000Z",
    "Cheney_gallery_views": 862
  }
}
```

- 错误码：40002 id 不合法、40402 未找到对应图文、50004 查询异常
- 修改时间：2026-11-19 11:30

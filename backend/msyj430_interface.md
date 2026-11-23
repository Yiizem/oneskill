# msyj430_interface.md —— 后端接口记录

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
  "data": { "msyj430_time": "2026-11-19T03:12:45.512Z" }
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
  "database": "msyj430_ketangai"
}
```

- 响应格式（成功）：

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": {
    "msyj430_version": "8.4.4",
    "msyj430_db": "msyj430_ketangai",
    "msyj430_host": "127.0.0.1",
    "msyj430_port": 8430,
    "msyj430_user": "root"
  }
}
```

- 响应格式（失败）：

```json
{
  "code": 40005,
  "msg": "数据库连接失败：ER_ACCESS_DENIED_ERROR",
  "data": {
    "msyj430_code": "ER_ACCESS_DENIED_ERROR",
    "msyj430_message": "Access denied for user 'root'@'localhost' (using password: YES)"
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
    "msyj430_total": 8,
    "msyj430_page": 1,
    "msyj430_pageSize": 10,
    "msyj430_list": [
      {
        "msyj430_news_id": 1,
        "msyj430_news_title": "国产多模态大模型发布 2.0 版本，端侧推理时延降至 120 毫秒",
        "msyj430_news_summary": "新一代模型在同等算力下视觉与语音理解精度提升 18%，可在手机端离线运行。",
        "msyj430_news_source": "智算前沿",
        "msyj430_news_author": "林知远",
        "msyj430_news_category": "人工智能",
        "msyj430_news_publish_time": "2026-11-18T01:20:00.000Z",
        "msyj430_news_views": 1286
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
    "msyj430_news_id": 1,
    "msyj430_news_title": "国产多模态大模型发布 2.0 版本，端侧推理时延降至 120 毫秒",
    "msyj430_news_summary": "新一代模型在同等算力下视觉与语音理解精度提升 18%，可在手机端离线运行。",
    "msyj430_news_content": "该模型采用稀疏专家混合架构……",
    "msyj430_news_source": "智算前沿",
    "msyj430_news_author": "林知远",
    "msyj430_news_category": "人工智能",
    "msyj430_news_publish_time": "2026-11-18T01:20:00.000Z",
    "msyj430_news_views": 1286
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
    "msyj430_total": 8,
    "msyj430_page": 1,
    "msyj430_pageSize": 8,
    "msyj430_list": [
      {
        "msyj430_gallery_id": 1,
        "msyj430_gallery_title": "智能座舱多屏交互方案",
        "msyj430_gallery_description": "中控、仪表与副驾三屏联动，导航信息可一键推送至任意屏。",
        "msyj430_gallery_image": "images/gallery-01.jpg",
        "msyj430_gallery_category": "智能汽车",
        "msyj430_gallery_source": "课堂实拍素材",
        "msyj430_gallery_publish_time": "2026-11-18T02:12:00.000Z",
        "msyj430_gallery_views": 862
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
    "msyj430_gallery_id": 1,
    "msyj430_gallery_title": "智能座舱多屏交互方案",
    "msyj430_gallery_description": "中控、仪表与副驾三屏联动，导航信息可一键推送至任意屏。",
    "msyj430_gallery_image": "images/gallery-01.jpg",
    "msyj430_gallery_category": "智能汽车",
    "msyj430_gallery_source": "课堂实拍素材",
    "msyj430_gallery_publish_time": "2026-11-18T02:12:00.000Z",
    "msyj430_gallery_views": 862
  }
}
```

- 错误码：40002 id 不合法、40402 未找到对应图文、50004 查询异常
- 修改时间：2026-11-19 11:30

---

## 接口 7：AI 对话默认配置

- 接口路径：`/api/chat/config`
- HTTP 方法：`GET`
- 请求参数：无（不返回任何密钥信息）
- 响应格式：

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {
    "msyj430_model": "deepseek-ai/DeepSeek-V4-Flash",
    "msyj430_systemPrompt": "你是一个有用的助手，回答简洁准确，使用中文。"
  }
}
```

- 修改时间：2026-11-23 13:40

---

## 接口 8：AI 对话（转发 SiliconFlow 大模型）

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 请求参数（JSON Body）：

```json
{
  "message": "用一句话介绍你自己",
  "history": [
    { "role": "user", "content": "上一轮用户问题" },
    { "role": "assistant", "content": "上一轮模型回答" }
  ],
  "model": "deepseek-ai/DeepSeek-V4-Flash"
}
```

```text
message  必填，单条不超过 2000 字
history  选填，只接受 user / assistant 角色，最多保留最近 20 条
model    选填，缺省取 .env 中 SILICONFLOW_MODEL
```

- 后端行为：把 system 提示词 + history + 本次 message 组装为 messages，向 `https://api.siliconflow.cn/v1/chat/completions` 发起请求；
  密钥从 `backend/.env` 的 `SILICONFLOW_API_KEY` 读取，不下发前端；发送与接收的完整 JSON 均打印到后端控制台。
- 响应格式：

```json
{
  "code": 0,
  "msg": "对话成功",
  "data": {
    "msyj430_reply": "我是你的智能助手，随时准备用简洁准确的中文回答你的问题。",
    "msyj430_model": "deepseek-ai/DeepSeek-V4-Flash",
    "msyj430_usage": { "prompt_tokens": 20, "completion_tokens": 16, "total_tokens": 36 },
    "msyj430_finishReason": "stop",
    "msyj430_id": "01a206f2418c521f569d3c261fa21e12"
  }
}
```

- 错误码：40006 消息为空、40007 消息过长、40008 大模型接口返回错误、50006 服务异常、50007 未配置密钥、50008 请求超时或网络失败、50009 返回无法解析、50010 未返回有效内容
- 修改时间：2026-11-23 13:40



## 知识库（RAG）接口

统一前缀 `/api/kb`，响应结构仍为 `{ code, msg, data }`，code=0 表示成功。

### 1. 知识库列表
- 方法与路径：`GET /api/kb`
- 参数：无
- data：`{ msyj430_list: [ { msyj430_kb_id, msyj430_kb_name, msyj430_kb_desc, msyj430_kb_created_at, msyj430_file_count, msyj430_chunk_count } ] }`

### 2. 新建知识库
- 方法与路径：`POST /api/kb`
- body：`{ name, desc }`，name 必填且不超过 100 字
- data：`{ msyj430_kb_id }`
- 错误码：40101 名称为空、40102 名称超长

### 3. 删除知识库
- 方法与路径：`DELETE /api/kb/:id`
- 说明：级联删除该库的文件记录与切片记录
- data：`{ msyj430_deleted }`
- 错误码：40103 id 不合法、40403 知识库不存在

### 4. 文件列表
- 方法与路径：`GET /api/kb/:id/files`
- data：`{ msyj430_list: [ { msyj430_kb_file_id, msyj430_kb_file_name, msyj430_kb_file_ext, msyj430_kb_file_size, msyj430_kb_file_chars, msyj430_kb_file_chunks, msyj430_kb_file_status, msyj430_kb_file_error, msyj430_kb_file_upload_time } ] }`

### 5. 上传并解析文件
- 方法与路径：`POST /api/kb/:id/files`
- 请求类型：`multipart/form-data`，字段名 `file`
- 白名单：txt / md / pdf / doc / docx / ppt / pptx，单文件不超过 20MB
- 处理流程：落盘 → 解析纯文本 → 按 480 字切片保留 80 字重叠 → 调用 bge-m3 生成向量 → 写库
- data：`{ msyj430_kb_file_id, msyj430_kb_file_name, msyj430_kb_file_ext, msyj430_kb_file_chars, msyj430_kb_file_chunks, msyj430_kb_file_status, msyj430_kb_file_error, msyj430_embedding }`，msyj430_embedding 取值 `vector` 或 `keyword-fallback`
- 错误码：40104 未收到文件、40403 知识库不存在

### 6. 删除文件
- 方法与路径：`DELETE /api/kb/file/:fileId`
- 说明：连带删除该文件的全部切片与落盘文件
- 错误码：40105 文件 id 不合法、40404 文件不存在

### 7. 切片预览
- 方法与路径：`GET /api/kb/chunks?fileId=1&limit=20`
- data：`{ msyj430_list: [ { msyj430_kb_chunk_index, msyj430_kb_chunk_content, msyj430_kb_chunk_chars } ] }`

### 8. 基于知识库问答
- 方法与路径：`POST /api/kb/chat`
- body：`{ kbId, question }`，question 不超过 1000 字
- 检索：问题向量化后与切片向量算余弦相似度，取 Top4（`RAG_TOP_K`）拼接为【参考资料】；向量不可用时降级为关键词打分（阈值 0.06）
- 响应格式：

```json
{
  "code": 0,
  "msg": "知识库问答成功",
  "data": {
    "msyj430_answer": "根据知识库资料……",
    "msyj430_sources": [
      {
        "msyj430_rank": 1,
        "msyj430_score": 0.7183,
        "msyj430_file_name": "平台使用手册.pdf",
        "msyj430_chunk_index": 2,
        "msyj430_content": "片段原文……"
      }
    ],
    "msyj430_mode": "vector",
    "msyj430_model": "deepseek-ai/DeepSeek-V4-Flash",
    "msyj430_usage": { "prompt_tokens": 702, "completion_tokens": 789, "total_tokens": 1491 }
  }
}
```

- 控制台：后端依次打印「检索模式」「发送给大模型的数据」（完整 messages）与「从大模型接收到的数据」（原始响应 JSON 文本）
- 错误码：40103 知识库 id 不合法、40106 提问为空、40107 提问超长、40008 大模型接口错误、50007 未配置密钥、50008 请求大模型失败、50009 返回无法解析、50010 无有效内容
- 修改时间：2026-11-23 14:10

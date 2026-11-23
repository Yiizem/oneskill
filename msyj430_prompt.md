# msyj430_prompt.md —— AI 开发提示词记录

> 姓名：孟思颐佳 | 学号：24001010430
> 记录规则：每次向 AI 发出开发指令后追加一条，禁止覆盖已有内容。
> 记录格式：时间 | 提示词全文 | 大模型名称

---

## 记录 1

- 时间：2026-11-19 09:40
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
请初始化本项目（根目录 E:\StudyWork\WangYE\KeTangAI），严格遵循 AGENTS.md：
1、git init + .gitignore（排除 node_modules、.env）+ 首次提交；
2、按 AGENTS.md 创建 frontend/（css、js、fonts、images 子目录）与 backend/（config、models、controllers、routes）目录骨架，安装后端依赖；
3、创建 frontend/index.html：包含姓名孟思颐佳、学号24001010430、项目名称 KeTangAI 科技资讯平台、项目类别（自选），以及所有已完成 html 页面的超链接，有 canvas 背景动画，主体是页面链接导航，页面美观；
4、创建根目录 readme.md，包含学号、姓名。
后端使用 Node.js + Express，端口 8325，接口前缀 /api，托管 frontend/ 并支持全部跨域。
```

---

## 记录 2

- 时间：2026-11-19 10:05
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
第三点：运行和查看项目。
在项目根目录创建运行后台的 start.bat 文件，要求：
1、先检查 MySQL（本地实例端口 3307）是否已监听，未监听则用 mysqld 启动；
2、backend 下若无 node_modules 则先执行 cnpm i，失败或不存在 cnpm 时改用 npm i；
3、最后 node app.js 启动服务，并自动打开 http://localhost:8325 ；
窗口内打印访问地址与停止方式，退出时 pause。
```

---

## 记录 3

- 时间：2026-11-19 10:30
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
第四点：测试数据库连接（MySQL）。
1、创建 frontend/database.html：输入用户名、密码（默认 root / 123456）后点击测试连接，成功与错误都要有明确提示；
2、后端新增 POST /api/database/test：接收 user、password、host、port、database，用 mysql2 建立临时连接测试，返回统一格式 { code, msg, data }，成功 code=0，失败 code 非 0 并给出错误码；
3、返回的服务器版本、当前库、主机端口要显示在页面上，同时把接口链接和返回 JSON 展示出来；
4、所有样式类名、JS 变量与函数名以 msyj430_ 开头，文件头写姓名学号时间与大模型名。
```

---

## 记录 4

- 时间：2026-11-19 11:00
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
第五点：完成科技新闻列表页面，新闻数据存在数据库表里。
1、新建数据表 msyj430_news（字段以 msyj430_news_ 开头），插入至少 8 条有真实业务意义的科技新闻测试数据；
2、后端提供 GET /api/news（支持 page、pageSize 分页）与 GET /api/news/:id 详情接口，走 MVC：models/controllers/routes 分层；
3、创建 frontend/news.html，页面顶部显示后端接口链接与返回的 JSON 数据内容，下方以卡片列表展示标题、摘要、来源、作者、发布时间、浏览量，点击“查看详情”逐条展开正文；
4、建表与插入数据 SQL 按执行顺序追加到 backend/msyj430_database.md，接口说明追加到 backend/msyj430_interface.md；
5、newest 页面完成后在 index.html 追加超链接入口。
```

---

## 记录 5

- 时间：2026-11-19 11:30
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
第六点：完成图文列表页面。
1、新建数据表 msyj430_gallery（字段以 msyj430_gallery_ 开头），插入 8 条测试数据，图片使用本地创建的图片（放在 frontend/images，文件名写入表中 msyj430_gallery_image 字段）；
2、后端提供 GET /api/gallery 与 GET /api/gallery/:id 接口，同样走 MVC 分层；
3、创建 frontend/gallery.html：顶部显示后端接口链接与返回 JSON，主体为三列图片卡片（图片、分类、标题、简介、时间、浏览量），点击可弹出详情预览；
4、SQL 追加到 msyj430_database.md，接口说明追加到 msyj430_interface.md，并在 index.html 追加超链接。
```

---

## 记录 6

- 时间：2026-11-19 12:10
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
请联调并检查：启动后端并逐个访问 /api/health、/api/news、/api/news/1、/api/gallery、/api/gallery/1，检查 404 与错误提示是否统一为 { code, msg, data }；用正确密码 123456 与错误密码分别测试 /api/database/test；确认四个页面与图片、样式、脚本均能正常返回，页面渲染无样式缺失。
```

---

## 记录 7

- 时间：2026-11-19 14:40
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
MySQL端口改为0430，请重新创建一个 ssh-ed25519 尾缀是3246517834@qq.com的公钥
```

- 执行结果：MySQL 实例改监听 430 端口（数据目录 E:\MySQLData 不变，root/123456，库 msyj430_ketangai），
  backend/.env 中 DB_PORT 改为 430，start.bat 的检测与启动端口同步改为 430，
  database.html 默认端口与接口示例、msyj430_interface.md 示例、readme.md 说明一并更新；
  同时生成新的 ed25519 密钥对，公钥注释为 3246517834@qq.com。

---

## 记录 8

- 时间：2026-11-19 14:55
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
MySQL端口改为8430
```

- 执行结果：MySQL 实例由 430 端口切换为 8430 端口（数据目录 E:\MySQLData、库 msyj430_ketangai、root/123456 均不变），
  backend/.env 与 .env.example 的 DB_PORT 改为 8430，start.bat 的端口检测与启动参数同步改为 8430，
  database.html 默认端口与接口示例、msyj430_interface.md 示例、readme.md 运行说明一并更新。



---

## 记录 9

- 时间：2026-11-23 13:40
- 大模型名称：豆包（Doubao）
- 提示词全文：

```text
创建AI聊天页面。
Api-key：sk-eielkqxfjxidvudvmuukioohiksyhjcbggfbuozwakifehsy
curl --request POST \
  --url https://api.siliconflow.cn/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model": "deepseek-ai/DeepSeek-V4-Flash", "messages": [{"role": "system", "content": "你是一个有用的助手"}, {"role": "user", "content": "你好，请介绍一下你自己"}]}'
在控制台里输出发送给大模型的数据和从大模型接收到的数据。
```

- 执行结果：新增 backend/controllers/msyj430_chatController.js、backend/routes/msyj430_chatRoutes.js，
  提供 GET /api/chat/config 与 POST /api/chat；密钥写入 backend/.env（已 gitignore），前端不接触密钥；
  新增 frontend/chat.html、css/msyj430_chat.css、js/msyj430_chat.js，五个页面导航均加入“AI 对话”入口，首页补充导航卡与链接清单；
  后端与前端控制台分别打印发送给大模型、从大模型接收到的完整 JSON；接口实测成功回复、多轮上下文与空消息 40006 校验均通过。

## 记录 10：知识库问答（RAG）提示词与实现要点（2026-11-23）

- 使用场景：`POST /api/kb/chat`，先检索后回答，回答必须受限于知识库内容
- 向量模型：`BAAI/bge-m3`（SiliconFlow `/embeddings` 接口，1024 维）
- 对话模型：`deepseek-ai/DeepSeek-V4-Flash`，温度与默认一致
- 系统提示词：

```text
你是知识库客服助手。只依据【参考资料】回答，资料中没有的内容就直说“知识库中没有相关信息”，不要编造；回答使用中文，先给结论再列要点。
```

- 用户消息模板：

```text
【参考资料】
【片段1｜文件名】
片段正文

【片段2｜文件名】
片段正文

【用户问题】
用户原始提问
```

- 检索参数：切片 480 字、重叠 80 字、Top4（`RAG_TOP_K=4`）、余弦相似度必须大于 0
- 降级策略：向量接口失败或全部相似度不大于 0 时，改用中文二元组 + 英文单词命中的关键词打分，阈值 0.06
- 观测手段：后端 `console.log` 打印发送的 messages 与收到的原始响应；前端 `console.log` 打印提问 payload 与完整业务响应，页面展示引用来源片段
- 修改时间：2026-11-23 14:10

# KeTangAI 科技资讯平台

姓名：孟思颐佳　|　学号：24001010430

基于 Node.js + Express + MySQL 与原生 HTML/CSS/JavaScript 的课堂全栈实践项目。

## 目录结构

```
KeTangAI/
├── AGENTS.md               # 项目开发规则
├── readme.md               # 说明文档
├── msyj430_prompt.md        # AI 提示词记录
├── start.bat               # 一键启动后台脚本
├── frontend/               # 前端（原生 HTML/CSS/JS，无第三方库）
│   ├── index.html          # 首页：信息展示 + 页面导航（canvas 背景动画）
│   ├── database.html       # 数据库连接测试
│   ├── news.html           # 科技新闻列表
│   ├── gallery.html        # 图文列表
│   ├── chat.html           # AI 智能对话（后端代理 SiliconFlow）
│   ├── css/                # 样式
│   ├── js/                 # 脚本
│   ├── images/             # 图片资源
│   └── fonts/              # iconfont 图标（预留）
└── backend/                # 后端 Node.js + Express（MVC）
    ├── app.js              # 入口，端口 8325
    ├── config/             # 数据库连接池
    ├── models/             # 数据模型
    ├── controllers/        # 控制器
    ├── routes/             # 路由（统一 /api/ 前缀）
    ├── msyj430_interface.md # 接口记录
    └── msyj430_database.md  # 建库建表 SQL 记录
```

## 运行方式

1. 确认 MySQL 服务已启动（默认端口 8430，账号 root / 123456，库 `msyj430_ketangai`）。
2. 双击根目录 `start.bat`（首次会自动安装依赖并建表）。
3. 浏览器访问 <http://localhost:8325>。

## 数据库

- 库名：`msyj430_ketangai`（utf8mb4）
- 数据表：`msyj430_news`（科技新闻）、`msyj430_gallery`（图文列表）
- 建表与测试数据 SQL 全部记录在 `backend/msyj430_database.md`，可据此在新机器完整重建。

## 接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /api/health | 服务健康检查 |
| POST | /api/database/test | 测试 MySQL 连接 |
| GET | /api/news | 科技新闻列表（分页） |
| GET | /api/news/:id | 新闻详情 |
| GET | /api/gallery | 图文列表（分页） |
| GET | /api/gallery/:id | 图文详情 |
| GET | /api/chat/config | AI 对话默认模型与系统提示词（不含密钥） |
| POST | /api/chat | 转发 SiliconFlow 大模型对话，返回模型回复 |

统一响应格式：`{ "code": 0, "msg": "提示信息", "data": {...} }`，code=0 表示成功。


## 知识库（RAG）功能（2026-11-23 新增）

新增页面 `frontend/kb.html`（样式 `frontend/css/msyj430_kb.css`，脚本 `frontend/js/msyj430_kb.js`），提供：

1. **知识库管理**：新建、列表、删除（级联删除文件与切片），列表展示文件数与切片数。
2. **文件上传与解析**：支持 txt / md / pdf / doc / docx / ppt / pptx，单文件不超过 20MB；doc 与 ppt 通过本机 Office 转成 docx、pptx 后再解析。
3. **切片与向量**：解析纯文本后按 480 字切片、80 字重叠，调用 SiliconFlow `BAAI/bge-m3` 生成 1024 维向量入库，可在线查看切片原文。
4. **知识库问答**：向量检索 Top4 片段拼成参考资料交给 `deepseek-ai/DeepSeek-V4-Flash`，回答展示引用来源与检索模式；向量不可用时自动降级为关键词检索。
5. **数据观测**：后端控制台打印「发送给大模型的数据」与「从大模型接收到的数据」，前端控制台打印提问与响应，页面提供接口原始数据面板。

后端新增文件：`services/msyj430_docParser.js`、`services/msyj430_chunker.js`、`services/msyj430_embedding.js`、`models/msyj430_kbModel.js`、`controllers/msyj430_kbController.js`、`routes/msyj430_kbRoutes.js`；示例资料在 `backend/kb-seed/`（课程作业要求.docx、课堂汇报提纲.pptx、平台使用手册.pdf、常见问题.txt）。

### 接口一览（知识库部分）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /api/kb | 知识库列表（含文件数、切片数） |
| POST | /api/kb | 新建知识库 |
| DELETE | /api/kb/:id | 删除知识库（级联） |
| GET | /api/kb/:id/files | 文件列表 |
| POST | /api/kb/:id/files | 上传文件并解析入库（multipart 字段 file） |
| DELETE | /api/kb/file/:fileId | 删除文件（连带切片） |
| GET | /api/kb/chunks | 切片预览（fileId、limit） |
| POST | /api/kb/chat | 基于知识库的问答（kbId、question） |

### 前端页面（共 6 个）

index.html · database.html · news.html · gallery.html · chat.html · kb.html
## 命名规范变更（2026-11-23）

项目内所有 `Cheney_` 前缀已统一改为 `msyj430_`，覆盖源码文件与目录名、CSS 类名、JS 变量与函数、后端模型/控制器/路由/服务文件、数据表名与字段名、数据库库名（`msyj430_ketangai`）、文档与 `start.bat`。

- 数据库迁移：新建库 `msyj430_ketangai`，按原 DDL 复制并改名建表（表名、字段名、索引名同步改名），再整表搬数据；旧库 `Cheney_ketangai` 保留为备份，确认无误后可手动删除。
- 现有数据表共 5 张：`msyj430_news`（8 条）、`msyj430_gallery`（8 条）、`msyj430_kb`、`msyj430_kb_file`、`msyj430_kb_chunk`。
- 演示知识库仍在：`平台使用手册`（pdf + txt）、`课程作业要求`（docx + pptx），已按新库名重新解析入库。
# KeTangAI 科技资讯平台

姓名：孟思颐佳　|　学号：24001010430

基于 Node.js + Express + MySQL 与原生 HTML/CSS/JavaScript 的课堂全栈实践项目。

## 目录结构

```
KeTangAI/
├── AGENTS.md               # 项目开发规则
├── readme.md               # 说明文档
├── Cheney_prompt.md        # AI 提示词记录
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
    ├── Cheney_interface.md # 接口记录
    └── Cheney_database.md  # 建库建表 SQL 记录
```

## 运行方式

1. 确认 MySQL 服务已启动（默认端口 8430，账号 root / 123456，库 `Cheney_ketangai`）。
2. 双击根目录 `start.bat`（首次会自动安装依赖并建表）。
3. 浏览器访问 <http://localhost:8325>。

## 数据库

- 库名：`Cheney_ketangai`（utf8mb4）
- 数据表：`Cheney_news`（科技新闻）、`Cheney_gallery`（图文列表）
- 建表与测试数据 SQL 全部记录在 `backend/Cheney_database.md`，可据此在新机器完整重建。

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

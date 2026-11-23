/**
 * 向四份文档追加知识库（RAG）相关内容（只追加，不覆盖）
 * 孟思颐佳｜24001010430｜2026-11-23｜豆包（Doubao）
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');

function append(relPath, text) {
  const target = path.join(root, relPath);
  fs.appendFileSync(target, text, 'utf8');
  console.log('已追加：' + relPath + '（+' + text.length + ' 字）');
}

// 1) 数据库文档
append('backend/msyj430_database.md', `

## 步骤 6：知识库相关表（RAG）

知识库功能新增三张表，均在 \`msyj430_ketangai\` 库内，字符集 utf8mb4。

\`\`\`sql
USE msyj430_ketangai;

CREATE TABLE IF NOT EXISTS msyj430_kb (
  msyj430_kb_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '知识库主键',
  msyj430_kb_name VARCHAR(100) NOT NULL COMMENT '知识库名称',
  msyj430_kb_desc VARCHAR(255) DEFAULT '' COMMENT '知识库说明',
  msyj430_kb_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (msyj430_kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库';

CREATE TABLE IF NOT EXISTS msyj430_kb_file (
  msyj430_kb_file_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件主键',
  msyj430_kb_id INT UNSIGNED NOT NULL COMMENT '所属知识库',
  msyj430_kb_file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  msyj430_kb_file_ext VARCHAR(20) NOT NULL DEFAULT '' COMMENT '扩展名',
  msyj430_kb_file_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '字节数',
  msyj430_kb_file_chars INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '解析出的字符数',
  msyj430_kb_file_chunks INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '切片数量',
  msyj430_kb_file_path VARCHAR(255) NOT NULL DEFAULT '' COMMENT '落盘路径',
  msyj430_kb_file_status VARCHAR(20) NOT NULL DEFAULT 'ready' COMMENT '解析状态 ready/failed',
  msyj430_kb_file_error VARCHAR(255) NOT NULL DEFAULT '' COMMENT '失败原因',
  msyj430_kb_file_upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (msyj430_kb_file_id),
  KEY idx_msyj430_kb_id (msyj430_kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文件';

CREATE TABLE IF NOT EXISTS msyj430_kb_chunk (
  msyj430_kb_chunk_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '切片主键',
  msyj430_kb_id INT UNSIGNED NOT NULL COMMENT '所属知识库',
  msyj430_kb_file_id INT UNSIGNED NOT NULL COMMENT '所属文件',
  msyj430_kb_chunk_index INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '切片序号',
  msyj430_kb_chunk_content TEXT NOT NULL COMMENT '切片正文',
  msyj430_kb_chunk_embedding MEDIUMTEXT COMMENT '向量（JSON 数组，可为空）',
  msyj430_kb_chunk_chars INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '字符数',
  PRIMARY KEY (msyj430_kb_chunk_id),
  KEY idx_msyj430_chunk_kb (msyj430_kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库切片';
\`\`\`

说明：
- 向量以 JSON 数组字符串存入 \`msyj430_kb_chunk_embedding\`（bge-m3 输出 1024 维），检索时在内存中计算余弦相似度，无需安装向量数据库插件。
- 删除知识库时级联删除文件与切片；删除文件时连带删除其切片。
- 上传的原始文件落盘在 \`backend/uploads/\`，已在 \`.gitignore\` 中忽略。
- 修改时间：2026-11-23 14:10
`);

// 2) 接口文档
append('backend/msyj430_interface.md', `

## 知识库（RAG）接口

统一前缀 \`/api/kb\`，响应结构仍为 \`{ code, msg, data }\`，code=0 表示成功。

### 1. 知识库列表
- 方法与路径：\`GET /api/kb\`
- 参数：无
- data：\`{ msyj430_list: [ { msyj430_kb_id, msyj430_kb_name, msyj430_kb_desc, msyj430_kb_created_at, msyj430_file_count, msyj430_chunk_count } ] }\`

### 2. 新建知识库
- 方法与路径：\`POST /api/kb\`
- body：\`{ name, desc }\`，name 必填且不超过 100 字
- data：\`{ msyj430_kb_id }\`
- 错误码：40101 名称为空、40102 名称超长

### 3. 删除知识库
- 方法与路径：\`DELETE /api/kb/:id\`
- 说明：级联删除该库的文件记录与切片记录
- data：\`{ msyj430_deleted }\`
- 错误码：40103 id 不合法、40403 知识库不存在

### 4. 文件列表
- 方法与路径：\`GET /api/kb/:id/files\`
- data：\`{ msyj430_list: [ { msyj430_kb_file_id, msyj430_kb_file_name, msyj430_kb_file_ext, msyj430_kb_file_size, msyj430_kb_file_chars, msyj430_kb_file_chunks, msyj430_kb_file_status, msyj430_kb_file_error, msyj430_kb_file_upload_time } ] }\`

### 5. 上传并解析文件
- 方法与路径：\`POST /api/kb/:id/files\`
- 请求类型：\`multipart/form-data\`，字段名 \`file\`
- 白名单：txt / md / pdf / doc / docx / ppt / pptx，单文件不超过 20MB
- 处理流程：落盘 → 解析纯文本 → 按 480 字切片保留 80 字重叠 → 调用 bge-m3 生成向量 → 写库
- data：\`{ msyj430_kb_file_id, msyj430_kb_file_name, msyj430_kb_file_ext, msyj430_kb_file_chars, msyj430_kb_file_chunks, msyj430_kb_file_status, msyj430_kb_file_error, msyj430_embedding }\`，msyj430_embedding 取值 \`vector\` 或 \`keyword-fallback\`
- 错误码：40104 未收到文件、40403 知识库不存在

### 6. 删除文件
- 方法与路径：\`DELETE /api/kb/file/:fileId\`
- 说明：连带删除该文件的全部切片与落盘文件
- 错误码：40105 文件 id 不合法、40404 文件不存在

### 7. 切片预览
- 方法与路径：\`GET /api/kb/chunks?fileId=1&limit=20\`
- data：\`{ msyj430_list: [ { msyj430_kb_chunk_index, msyj430_kb_chunk_content, msyj430_kb_chunk_chars } ] }\`

### 8. 基于知识库问答
- 方法与路径：\`POST /api/kb/chat\`
- body：\`{ kbId, question }\`，question 不超过 1000 字
- 检索：问题向量化后与切片向量算余弦相似度，取 Top4（\`RAG_TOP_K\`）拼接为【参考资料】；向量不可用时降级为关键词打分（阈值 0.06）
- 响应格式：

\`\`\`json
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
\`\`\`

- 控制台：后端依次打印「检索模式」「发送给大模型的数据」（完整 messages）与「从大模型接收到的数据」（原始响应 JSON 文本）
- 错误码：40103 知识库 id 不合法、40106 提问为空、40107 提问超长、40008 大模型接口错误、50007 未配置密钥、50008 请求大模型失败、50009 返回无法解析、50010 无有效内容
- 修改时间：2026-11-23 14:10
`);

// 3) 提示词记录
append('msyj430_prompt.md', `

## 记录 10：知识库问答（RAG）提示词与实现要点（2026-11-23）

- 使用场景：\`POST /api/kb/chat\`，先检索后回答，回答必须受限于知识库内容
- 向量模型：\`BAAI/bge-m3\`（SiliconFlow \`/embeddings\` 接口，1024 维）
- 对话模型：\`deepseek-ai/DeepSeek-V4-Flash\`，温度与默认一致
- 系统提示词：

\`\`\`text
你是知识库客服助手。只依据【参考资料】回答，资料中没有的内容就直说“知识库中没有相关信息”，不要编造；回答使用中文，先给结论再列要点。
\`\`\`

- 用户消息模板：

\`\`\`text
【参考资料】
【片段1｜文件名】
片段正文

【片段2｜文件名】
片段正文

【用户问题】
用户原始提问
\`\`\`

- 检索参数：切片 480 字、重叠 80 字、Top4（\`RAG_TOP_K=4\`）、余弦相似度必须大于 0
- 降级策略：向量接口失败或全部相似度不大于 0 时，改用中文二元组 + 英文单词命中的关键词打分，阈值 0.06
- 观测手段：后端 \`console.log\` 打印发送的 messages 与收到的原始响应；前端 \`console.log\` 打印提问 payload 与完整业务响应，页面展示引用来源片段
- 修改时间：2026-11-23 14:10
`);

// 4) readme
append('readme.md', `

## 知识库（RAG）功能（2026-11-23 新增）

新增页面 \`frontend/kb.html\`（样式 \`frontend/css/msyj430_kb.css\`，脚本 \`frontend/js/msyj430_kb.js\`），提供：

1. **知识库管理**：新建、列表、删除（级联删除文件与切片），列表展示文件数与切片数。
2. **文件上传与解析**：支持 txt / md / pdf / doc / docx / ppt / pptx，单文件不超过 20MB；doc 与 ppt 通过本机 Office 转成 docx、pptx 后再解析。
3. **切片与向量**：解析纯文本后按 480 字切片、80 字重叠，调用 SiliconFlow \`BAAI/bge-m3\` 生成 1024 维向量入库，可在线查看切片原文。
4. **知识库问答**：向量检索 Top4 片段拼成参考资料交给 \`deepseek-ai/DeepSeek-V4-Flash\`，回答展示引用来源与检索模式；向量不可用时自动降级为关键词检索。
5. **数据观测**：后端控制台打印「发送给大模型的数据」与「从大模型接收到的数据」，前端控制台打印提问与响应，页面提供接口原始数据面板。

后端新增文件：\`services/msyj430_docParser.js\`、\`services/msyj430_chunker.js\`、\`services/msyj430_embedding.js\`、\`models/msyj430_kbModel.js\`、\`controllers/msyj430_kbController.js\`、\`routes/msyj430_kbRoutes.js\`；示例资料在 \`backend/kb-seed/\`（课程作业要求.docx、课堂汇报提纲.pptx、平台使用手册.pdf、常见问题.txt）。

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
`);

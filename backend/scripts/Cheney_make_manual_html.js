/**
 * 生成平台使用手册的 HTML 中间文件（供 Edge 打印为 PDF）
 * 孟思颐佳｜24001010430｜2026-11-23｜豆包（Doubao）
 */
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'kb-seed', '_manual.html');

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<style>
body{font-family:"Microsoft YaHei",sans-serif;line-height:1.9;padding:40px;font-size:15px;color:#222}
h1{font-size:24px;margin:0 0 18px;border-bottom:2px solid #333;padding-bottom:10px}
h2{font-size:17px;margin:24px 0 10px}
p{margin:0 0 10px;text-align:justify}
</style></head><body>
<h1>KeTangAI 科技资讯平台 · 平台使用手册</h1>
<h2>一、平台简介</h2>
<p>KeTangAI 是一个课堂全栈实践项目，前端使用原生 HTML、CSS、JavaScript，后端使用 Node.js 与 Express，数据存储使用 MySQL 8.4，默认库名为 Cheney_ketangai。平台并非纯静态页面，所有列表与详情数据均来自后端 /api 接口。</p>
<h2>二、启动方式</h2>
<p>在项目根目录双击 start.bat 即可。脚本会依次检查 MySQL 的 8430 端口是否在监听，未启动则自动拉起本地实例；随后进入 backend 目录，缺少依赖时执行 npm i，最后启动 Express 服务并自动打开浏览器。服务端口固定为 8325，访问地址为 http://localhost:8325 。</p>
<h2>三、页面说明</h2>
<p>首页 index.html 展示学生信息、项目信息与全部页面入口，背景为 canvas 粒子动画。数据库测试页 database.html 用于输入账号密码测试 MySQL 连接，默认 root 与 123456。科技新闻页 news.html 读取 Cheney_news 表数据并以卡片列表展示，可展开正文。图文列表页 gallery.html 以三列图片卡片展示 Cheney_gallery 表数据，点击图片弹出详情预览。AI 对话页 chat.html 通过后端代理调用 SiliconFlow 大模型接口，密钥不暴露在前端。</p>
<h2>四、接口约定</h2>
<p>所有接口统一使用 /api 前缀，响应统一为 code、msg、data 三个字段，code 为 0 表示成功。健康检查接口为 GET /api/health，新闻接口为 GET /api/news 与 GET /api/news/:id，图文接口为 GET /api/gallery 与 GET /api/gallery/:id，对话接口为 POST /api/chat，知识库接口以 /api/kb 开头。</p>
<h2>五、知识库功能</h2>
<p>知识库页面 kb.html 支持上传 txt、md、pdf、doc、docx、ppt、pptx 七类文件。后端解析纯文本后按 480 字切片并保留 80 字重叠，调用 SiliconFlow 的 bge-m3 模型生成向量并写入 Cheney_kb_chunk 表。提问时先做向量检索，取最相关的 4 个片段拼成参考资料后交给大模型回答，页面同时展示引用来源与检索模式。向量服务不可用时会自动降级为关键词检索，保证功能可用。</p>
<h2>六、常见问题</h2>
<p>若页面提示数据库连接失败，请确认 MySQL 实例监听在 8430 端口且库名正确。若知识库上传后切片数为零，说明文件可能被加密或为扫描版 PDF，需要先转成可复制文字的版本。若对话报 40008，多为 API Key 失效或额度用尽，替换 backend/.env 中的 SILICONFLOW_API_KEY 即可。</p>
</body></html>`;

fs.writeFileSync(out, html, 'utf8');
console.log('HTML 已生成：' + out);

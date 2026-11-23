/**
 * 生成知识库演示样本文件（docx / pptx / txt）
 * 孟思颐佳｜24001010430｜2026-11-23｜豆包（Doubao）
 */
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

const seedDir = path.join(__dirname, '..', 'kb-seed');
fs.mkdirSync(seedDir, { recursive: true });

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* ---------------- docx ---------------- */
function buildDocx(paras, outPath) {
  const body = paras
    .map(
      (p, i) =>
        '<w:p><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr><w:r><w:rPr>' +
        (i === 0 ? '<w:b/><w:sz w:val="32"/>' : '<w:sz w:val="24"/>') +
        '</w:rPr><w:t xml:space="preserve">' + esc(p) + '</w:t></w:r></w:p>'
    )
    .join('');

  const documentXml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>' + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>' +
    '</w:body></w:document>';

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>';

  const rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from(contentTypes, 'utf8'));
  zip.addFile('_rels/.rels', Buffer.from(rels, 'utf8'));
  zip.addFile('word/document.xml', Buffer.from(documentXml, 'utf8'));
  zip.writeZip(outPath);
  console.log('docx 已生成：' + outPath);
}

/* ---------------- pptx ---------------- */
function buildPptx(slides, outPath) {
  const zip = new AdmZip();

  const contentTypes =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
    slides
      .map(
        (_, i) =>
          '<Override PartName="/ppt/slides/slide' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
      )
      .join('') +
    '</Types>';

  const rootRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>' +
    '</Relationships>';

  const presRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    slides
      .map(
        (_, i) =>
          '<Relationship Id="rId' + (i + 2) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + (i + 1) + '.xml"/>'
      )
      .join('') +
    '</Relationships>';

  const presentation =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
    '<p:sldIdLst>' +
    slides.map((_, i) => '<p:sldId id="' + (256 + i) + '" r:id="rId' + (i + 2) + '"/>').join('') +
    '</p:sldIdLst>' +
    '<p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>' +
    '</p:presentation>';

  zip.addFile('[Content_Types].xml', Buffer.from(contentTypes, 'utf8'));
  zip.addFile('_rels/.rels', Buffer.from(rootRels, 'utf8'));
  zip.addFile('ppt/presentation.xml', Buffer.from(presentation, 'utf8'));
  zip.addFile('ppt/_rels/presentation.xml.rels', Buffer.from(presRels, 'utf8'));

  slides.forEach((s, i) => {
    const idx = i + 1;
    const titlePara =
      '<a:p><a:r><a:rPr lang="zh-CN" sz="3200" b="1"/><a:t>' + esc(s.title) + '</a:t></a:r></a:p>';
    const bodyParas = s.body
      .split('\n')
      .map((line) => '<a:p><a:r><a:rPr lang="zh-CN" sz="1800"/><a:t>' + esc(line) + '</a:t></a:r></a:p>')
      .join('');

    const slideXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">' +
      '<p:cSld><p:spTree>' +
      '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>' +
      '<p:sp><p:nvSpPr><p:cNvPr id="2" name="标题"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>' +
      '<p:spPr><a:xfrm><a:off x="457200" y="457200"/><a:ext cx="8229600" cy="914400"/></a:xfrm></p:spPr>' +
      '<p:txBody><a:bodyPr wrap="square"/><a:lstStyle/>' + titlePara + '</p:txBody></p:sp>' +
      '<p:sp><p:nvSpPr><p:cNvPr id="3" name="正文"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>' +
      '<p:spPr><a:xfrm><a:off x="457200" y="1600200"/><a:ext cx="8229600" cy="4341600"/></a:xfrm></p:spPr>' +
      '<p:txBody><a:bodyPr wrap="square"/><a:lstStyle/>' + bodyParas + '</p:txBody></p:sp>' +
      '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';

    zip.addFile('ppt/slides/slide' + idx + '.xml', Buffer.from(slideXml, 'utf8'));
  });

  zip.writeZip(outPath);
  console.log('pptx 已生成：' + outPath);
}

/* ---------------- txt ---------------- */
const faqText = [
  'KeTangAI 常见问题速查',
  '',
  '问：项目启动后打不开页面怎么办？',
  '答：先确认后端是否在 8325 端口运行，浏览器访问 http://localhost:8325/api/health 应返回 code 等于 0 的 JSON。',
  '',
  '问：数据库连接测试默认用什么账号？',
  '答：默认用户名 root，密码 123456，主机 127.0.0.1，端口 8430，库名 msyj430_ketangai。密码错误时接口返回 40005 并附带数据库错误码。',
  '',
  '问：为什么要用 8430 端口而不是 3306？',
  '答：本机 3306 端口被系统服务占用，因此使用独立的本地实例监听 8430，数据目录位于 E 盘的 MySQLData。',
  '',
  '问：知识库支持哪些文件格式？',
  '答：支持 txt、md、pdf、doc、docx、ppt、pptx。其中 doc 与 ppt 属于老格式，后端会调用本机 Office 转换成 docx、pptx 后再解析，因此需要安装 Office。',
  '',
  '问：知识库答案不准怎么办？',
  '答：优先补充更贴合的原始资料，或把长文档拆成主题更集中的多个文件，切片越小检索越精准，但上下文连贯性会下降。',
].join('\r\n');

const courseText = [
  'KeTangAI 课堂全栈作业要求',
  '一、作业目标：基于 vibe coding 完成一个可运行的全栈项目，覆盖环境准备、数据库连接、列表页与详情页、一键启动脚本。',
  '二、技术栈要求：后端使用 Node.js 与 Express，遵循 RESTful 与 MVC 分层；前端使用原生 HTML、CSS、JavaScript，禁止引入第三方库与 CDN。',
  '三、接口规范：所有接口统一挂在 /api 前缀下，响应结构统一为 code、msg、data 三个字段，code 等于 0 表示成功。',
  '四、服务端口固定为 8325，后端需用 express.static 托管 frontend 目录，并开放全部跨域访问。',
  '五、数据库要求：使用 MySQL，账号 root，密码 123456，库名 msyj430_ketangai，编码 utf8mb4，每张业务表至少插入 8 条真实业务测试数据。',
  '六、命名规范：CSS 类名、JS 变量、JS 函数、数据表名与字段名一律使用 msyj430_ 前缀，便于批改识别。',
  '七、文件头注释：每个源码文件首行需写明姓名、学号、创建时间与大模型名称。',
  '八、凭据管理：数据库密码与第三方 API Key 只能写在 backend/.env 中，.env 必须加入 .gitignore，禁止提交到仓库。',
  '九、文档要求：接口变更写入 backend/msyj430_interface.md，数据库变更写入 backend/msyj430_database.md，提示词记录追加写入 msyj430_prompt.md，均采用追加不覆盖的方式。',
  '十、交付方式：项目提交到 GitHub 仓库，本地可通过根目录 start.bat 一键启动，启动后访问 http://localhost:8325。',
];

buildDocx(courseText, path.join(seedDir, '课程作业要求.docx'));
buildPptx(
  [
    { title: 'KeTangAI 科技资讯平台', body: '孟思颐佳 24001010430\n全栈课堂作业汇报' },
    { title: '项目结构', body: 'frontend 原生前端六页面\nbackend MVC 分层：routes / controllers / models / services\nMySQL 三张业务表与三张知识库表' },
    { title: '核心功能', body: '数据库连接测试页\n科技新闻列表与详情\n图文列表与图片预览\nAI 对话与知识库问答（RAG）' },
    { title: '下一步计划', body: '补充向量持久化与增量重建\n支持多知识库联合检索\n完善移动端适配' },
  ],
  path.join(seedDir, '课堂汇报提纲.pptx')
);
fs.writeFileSync(path.join(seedDir, '常见问题.txt'), faqText, 'utf8');
console.log('txt 已生成');

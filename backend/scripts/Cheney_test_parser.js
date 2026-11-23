/**
 * 解析层自测：docx / pptx / pdf / txt
 * 孟思颐佳｜24001010430｜2026-11-23｜豆包（Doubao）
 */
const path = require('path');
const fs = require('fs');
const { Cheney_parseFile } = require('../services/Cheney_docParser');
const { Cheney_splitText } = require('../services/Cheney_chunker');

(async () => {
  const dir = path.join(__dirname, '..', 'kb-seed');
  const files = fs.readdirSync(dir).filter((f) => !f.startsWith('_'));
  for (const name of files) {
    try {
      const buf = fs.readFileSync(path.join(dir, name));
      const text = String(await Cheney_parseFile(buf, name) || '');
      const chunks = Cheney_splitText(text, 480, 80);
      console.log('OK  ' + name + '  字数=' + text.length + '  切片=' + chunks.length);
      console.log('    首80字：' + text.replace(/\s+/g, ' ').slice(0, 80));
    } catch (e) {
      console.log('ERR ' + name + '  ' + e.message);
    }
  }
})();

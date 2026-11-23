/**
 * 向量接口自测：确认 siliconflow embeddings 是否可用
 * 孟思颐佳｜24001010430｜2026-11-23｜豆包（Doubao）
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Cheney_embedTexts, Cheney_embeddingModel } = require('../services/Cheney_embedding');

(async () => {
  console.log('模型：' + Cheney_embeddingModel);
  const vecs = await Cheney_embedTexts(['课堂项目默认端口是多少？', '知识库支持哪些文件格式？']);
  if (!vecs) {
    console.log('FAIL 向量接口不可用（已降级为关键词检索）');
    return;
  }
  console.log('OK 向量维度=' + vecs[0].length + ' 条数=' + vecs.length);
  console.log('    首5维=' + vecs[0].slice(0, 5).map((n) => n.toFixed(4)).join(','));
})();

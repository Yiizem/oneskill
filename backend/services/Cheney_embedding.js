/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：向量服务，调用 SiliconFlow embeddings 生成向量并计算余弦相似度
 */

const Cheney_apiUrl = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '') + '/embeddings';
const Cheney_apiKey = process.env.SILICONFLOW_API_KEY || '';
const Cheney_embeddingModel = process.env.SILICONFLOW_EMBEDDING_MODEL || 'BAAI/bge-m3';

// 批量生成向量，失败抛错由调用方降级为关键词检索
async function Cheney_embedTexts(Cheney_texts) {
    if (!Cheney_apiKey) {
        throw new Error('未配置 SILICONFLOW_API_KEY');
    }
    if (!Array.isArray(Cheney_texts) || Cheney_texts.length === 0) {
        return [];
    }

    const Cheney_controller = new AbortController();
    const Cheney_timer = setTimeout(() => Cheney_controller.abort(), 60000);
    try {
        const Cheney_res = await fetch(Cheney_apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + Cheney_apiKey
            },
            body: JSON.stringify({ model: Cheney_embeddingModel, input: Cheney_texts }),
            signal: Cheney_controller.signal
        });
        const Cheney_text = await Cheney_res.text();
        let Cheney_json = null;
        try {
            Cheney_json = JSON.parse(Cheney_text);
        } catch (Cheney_err) {
            throw new Error('向量接口返回无法解析：' + Cheney_text.slice(0, 200));
        }
        if (!Cheney_res.ok) {
            throw new Error('向量接口错误：' + ((Cheney_json && Cheney_json.message) || Cheney_res.status));
        }
        const Cheney_data = Cheney_json.data || [];
        return Cheney_data.map((Cheney_item) => Cheney_item.embedding);
    } finally {
        clearTimeout(Cheney_timer);
    }
}

// 余弦相似度
function Cheney_cosine(Cheney_a, Cheney_b) {
    if (!Cheney_a || !Cheney_b || Cheney_a.length !== Cheney_b.length) {
        return 0;
    }
    let Cheney_dot = 0;
    let Cheney_na = 0;
    let Cheney_nb = 0;
    for (let Cheney_i = 0; Cheney_i < Cheney_a.length; Cheney_i += 1) {
        Cheney_dot += Cheney_a[Cheney_i] * Cheney_b[Cheney_i];
        Cheney_na += Cheney_a[Cheney_i] * Cheney_a[Cheney_i];
        Cheney_nb += Cheney_b[Cheney_i] * Cheney_b[Cheney_i];
    }
    if (Cheney_na === 0 || Cheney_nb === 0) {
        return 0;
    }
    return Cheney_dot / (Math.sqrt(Cheney_na) * Math.sqrt(Cheney_nb));
}

// 关键词兜底打分：中文按二元组、英文按单词
function Cheney_keywordScore(Cheney_question, Cheney_content) {
    const Cheney_q = String(Cheney_question || '').toLowerCase();
    const Cheney_c = String(Cheney_content || '').toLowerCase();
    const Cheney_tokens = [];
    const Cheney_cn = Cheney_q.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    Cheney_cn.forEach((Cheney_seg) => {
        for (let Cheney_i = 0; Cheney_i < Cheney_seg.length - 1; Cheney_i += 1) {
            Cheney_tokens.push(Cheney_seg.slice(Cheney_i, Cheney_i + 2));
        }
    });
    (Cheney_q.match(/[a-z0-9]{3,}/g) || []).forEach((Cheney_w) => Cheney_tokens.push(Cheney_w));
    if (Cheney_tokens.length === 0) {
        return 0;
    }
    let Cheney_hit = 0;
    Cheney_tokens.forEach((Cheney_t) => {
        if (Cheney_c.includes(Cheney_t)) {
            Cheney_hit += 1;
        }
    });
    return Cheney_hit / Cheney_tokens.length;
}

module.exports = { Cheney_embedTexts, Cheney_cosine, Cheney_keywordScore, Cheney_embeddingModel };

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：向量服务，调用 SiliconFlow embeddings 生成向量并计算余弦相似度
 */

const msyj430_apiUrl = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '') + '/embeddings';
const msyj430_apiKey = process.env.SILICONFLOW_API_KEY || '';
const msyj430_embeddingModel = process.env.SILICONFLOW_EMBEDDING_MODEL || 'BAAI/bge-m3';

// 批量生成向量，失败抛错由调用方降级为关键词检索
async function msyj430_embedTexts(msyj430_texts) {
    if (!msyj430_apiKey) {
        throw new Error('未配置 SILICONFLOW_API_KEY');
    }
    if (!Array.isArray(msyj430_texts) || msyj430_texts.length === 0) {
        return [];
    }

    const msyj430_controller = new AbortController();
    const msyj430_timer = setTimeout(() => msyj430_controller.abort(), 60000);
    try {
        const msyj430_res = await fetch(msyj430_apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + msyj430_apiKey
            },
            body: JSON.stringify({ model: msyj430_embeddingModel, input: msyj430_texts }),
            signal: msyj430_controller.signal
        });
        const msyj430_text = await msyj430_res.text();
        let msyj430_json = null;
        try {
            msyj430_json = JSON.parse(msyj430_text);
        } catch (msyj430_err) {
            throw new Error('向量接口返回无法解析：' + msyj430_text.slice(0, 200));
        }
        if (!msyj430_res.ok) {
            throw new Error('向量接口错误：' + ((msyj430_json && msyj430_json.message) || msyj430_res.status));
        }
        const msyj430_data = msyj430_json.data || [];
        return msyj430_data.map((msyj430_item) => msyj430_item.embedding);
    } finally {
        clearTimeout(msyj430_timer);
    }
}

// 余弦相似度
function msyj430_cosine(msyj430_a, msyj430_b) {
    if (!msyj430_a || !msyj430_b || msyj430_a.length !== msyj430_b.length) {
        return 0;
    }
    let msyj430_dot = 0;
    let msyj430_na = 0;
    let msyj430_nb = 0;
    for (let msyj430_i = 0; msyj430_i < msyj430_a.length; msyj430_i += 1) {
        msyj430_dot += msyj430_a[msyj430_i] * msyj430_b[msyj430_i];
        msyj430_na += msyj430_a[msyj430_i] * msyj430_a[msyj430_i];
        msyj430_nb += msyj430_b[msyj430_i] * msyj430_b[msyj430_i];
    }
    if (msyj430_na === 0 || msyj430_nb === 0) {
        return 0;
    }
    return msyj430_dot / (Math.sqrt(msyj430_na) * Math.sqrt(msyj430_nb));
}

// 关键词兜底打分：中文按二元组、英文按单词
function msyj430_keywordScore(msyj430_question, msyj430_content) {
    const msyj430_q = String(msyj430_question || '').toLowerCase();
    const msyj430_c = String(msyj430_content || '').toLowerCase();
    const msyj430_tokens = [];
    const msyj430_cn = msyj430_q.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    msyj430_cn.forEach((msyj430_seg) => {
        for (let msyj430_i = 0; msyj430_i < msyj430_seg.length - 1; msyj430_i += 1) {
            msyj430_tokens.push(msyj430_seg.slice(msyj430_i, msyj430_i + 2));
        }
    });
    (msyj430_q.match(/[a-z0-9]{3,}/g) || []).forEach((msyj430_w) => msyj430_tokens.push(msyj430_w));
    if (msyj430_tokens.length === 0) {
        return 0;
    }
    let msyj430_hit = 0;
    msyj430_tokens.forEach((msyj430_t) => {
        if (msyj430_c.includes(msyj430_t)) {
            msyj430_hit += 1;
        }
    });
    return msyj430_hit / msyj430_tokens.length;
}

module.exports = { msyj430_embedTexts, msyj430_cosine, msyj430_keywordScore, msyj430_embeddingModel };

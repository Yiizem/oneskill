/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库控制器（C），负责上传解析入库、知识库管理、基于知识库的问答
 */
const Cheney_fs = require('fs');
const Cheney_path = require('path');
const Cheney_kbModel = require('../models/Cheney_kbModel');
const { Cheney_ok, Cheney_fail } = require('../utils/Cheney_result');
const { Cheney_parseFile } = require('../services/Cheney_docParser');
const { Cheney_splitText } = require('../services/Cheney_chunker');
const { Cheney_embedTexts, Cheney_cosine, Cheney_keywordScore } = require('../services/Cheney_embedding');

const Cheney_apiUrl = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '') + '/chat/completions';
const Cheney_apiKey = process.env.SILICONFLOW_API_KEY || '';
const Cheney_chatModel = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const Cheney_topK = Number(process.env.RAG_TOP_K) || 4;
const Cheney_uploadDir = Cheney_path.join(__dirname, '..', 'uploads');

// 还原上传文件名：部分客户端会把 UTF-8 文件名按 latin1 传递，这里做一次安全修正
function Cheney_fixFileName(Cheney_raw) {
    const Cheney_name = String(Cheney_raw || '');
    if (/[\u4e00-\u9fa5]/.test(Cheney_name)) {
        return Cheney_name;
    }
    try {
        const Cheney_decoded = Buffer.from(Cheney_name, 'latin1').toString('utf8');
        if (!/\uFFFD/.test(Cheney_decoded) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(Cheney_decoded)) {
            return Cheney_decoded;
        }
    } catch (Cheney_err) {
        return Cheney_name;
    }
    return Cheney_name;
}

// 知识库列表
async function Cheney_kbList(Cheney_req, Cheney_res) {
    try {
        const Cheney_rows = await Cheney_kbModel.Cheney_listKB();
        return Cheney_res.json(Cheney_ok({ Cheney_list: Cheney_rows }, '知识库列表获取成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 列表异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('知识库列表异常：' + Cheney_err.message, 50101));
    }
}

// 新建知识库
async function Cheney_kbCreate(Cheney_req, Cheney_res) {
    try {
        const Cheney_body = Cheney_req.body || {};
        const Cheney_name = String(Cheney_body.name || '').trim();
        if (!Cheney_name) {
            return Cheney_res.status(400).json(Cheney_fail('知识库名称不能为空', 40101));
        }
        if (Cheney_name.length > 100) {
            return Cheney_res.status(400).json(Cheney_fail('知识库名称不超过 100 字', 40102));
        }
        const Cheney_id = await Cheney_kbModel.Cheney_createKB(Cheney_name, String(Cheney_body.desc || '').slice(0, 255));
        return Cheney_res.json(Cheney_ok({ Cheney_kb_id: Cheney_id }, '知识库创建成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 创建异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('知识库创建异常：' + Cheney_err.message, 50102));
    }
}

// 删除知识库
async function Cheney_kbDelete(Cheney_req, Cheney_res) {
    try {
        const Cheney_id = Number(Cheney_req.params.id);
        if (!Number.isInteger(Cheney_id) || Cheney_id <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('知识库 id 不合法', 40103));
        }
        const Cheney_kb = await Cheney_kbModel.Cheney_getKB(Cheney_id);
        if (!Cheney_kb) {
            return Cheney_res.status(404).json(Cheney_fail('知识库不存在', 40403));
        }
        const Cheney_rows = await Cheney_kbModel.Cheney_deleteKB(Cheney_id);
        return Cheney_res.json(Cheney_ok({ Cheney_deleted: Cheney_rows }, '知识库已删除'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 删除异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('知识库删除异常：' + Cheney_err.message, 50103));
    }
}

// 文件列表
async function Cheney_kbFiles(Cheney_req, Cheney_res) {
    try {
        const Cheney_id = Number(Cheney_req.params.id);
        if (!Number.isInteger(Cheney_id) || Cheney_id <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('知识库 id 不合法', 40103));
        }
        const Cheney_files = await Cheney_kbModel.Cheney_listFiles(Cheney_id);
        return Cheney_res.json(Cheney_ok({ Cheney_list: Cheney_files }, '文件列表获取成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 文件列表异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('文件列表异常：' + Cheney_err.message, 50104));
    }
}

// 上传并解析文件
async function Cheney_kbUpload(Cheney_req, Cheney_res) {
    let Cheney_stored = '';
    try {
        const Cheney_id = Number(Cheney_req.params.id);
        if (!Number.isInteger(Cheney_id) || Cheney_id <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('知识库 id 不合法', 40103));
        }
        const Cheney_kb = await Cheney_kbModel.Cheney_getKB(Cheney_id);
        if (!Cheney_kb) {
            return Cheney_res.status(404).json(Cheney_fail('知识库不存在', 40403));
        }
        if (!Cheney_req.file) {
            return Cheney_res.status(400).json(Cheney_fail('未接收到文件，请选择 txt / md / pdf / doc / docx / ppt / pptx', 40104));
        }

        const Cheney_file = Cheney_req.file;
        Cheney_stored = Cheney_file.path || '';
        const Cheney_name = Cheney_fixFileName(Cheney_file.originalname);
        const Cheney_ext = Cheney_path.extname(Cheney_name).toLowerCase();

        // 解析为纯文本
        let Cheney_text = '';
        let Cheney_status = 'ready';
        let Cheney_error = '';
        try {
            Cheney_text = await Cheney_parseFile(Cheney_fs.readFileSync(Cheney_stored), Cheney_name);
        } catch (Cheney_parseErr) {
            Cheney_status = 'failed';
            Cheney_error = Cheney_parseErr.message.slice(0, 250);
            console.error('[Cheney_kbController] 解析失败：', Cheney_parseErr.message);
        }

        const Cheney_chunks = Cheney_status === 'ready' ? Cheney_splitText(Cheney_text, 480, 80) : [];
        let Cheney_vectors = null;
        if (Cheney_chunks.length > 0) {
            try {
                Cheney_vectors = await Cheney_embedTexts(Cheney_chunks);
                console.log('[Cheney_kbController] 已生成向量 ' + Cheney_vectors.length + ' 条（' + (process.env.SILICONFLOW_EMBEDDING_MODEL || 'BAAI/bge-m3') + '）');
            } catch (Cheney_embedErr) {
                console.warn('[Cheney_kbController] 向量生成失败，问答时降级为关键词检索：' + Cheney_embedErr.message);
                Cheney_vectors = null;
            }
        }

        const Cheney_fileId = await Cheney_kbModel.Cheney_insertFile({
            Cheney_kb_id: Cheney_id,
            Cheney_kb_file_name: Cheney_name,
            Cheney_kb_file_ext: Cheney_ext,
            Cheney_kb_file_size: Cheney_file.size || 0,
            Cheney_kb_file_chars: Cheney_text.length,
            Cheney_kb_file_chunks: Cheney_chunks.length,
            Cheney_kb_file_path: Cheney_stored,
            Cheney_kb_file_status: Cheney_status,
            Cheney_kb_file_error: Cheney_error
        });

        if (Cheney_chunks.length > 0) {
            await Cheney_kbModel.Cheney_insertChunks(Cheney_id, Cheney_fileId, Cheney_chunks, Cheney_vectors);
        }

        console.log('[Cheney_kbController] 上传解析完成：' + Cheney_name + ' · ' + Cheney_text.length + ' 字 · ' + Cheney_chunks.length + ' 片');

        return Cheney_res.json(Cheney_ok({
            Cheney_kb_file_id: Cheney_fileId,
            Cheney_kb_file_name: Cheney_name,
            Cheney_kb_file_ext: Cheney_ext,
            Cheney_kb_file_chars: Cheney_text.length,
            Cheney_kb_file_chunks: Cheney_chunks.length,
            Cheney_kb_file_status: Cheney_status,
            Cheney_kb_file_error: Cheney_error,
            Cheney_embedding: Cheney_vectors ? 'vector' : 'keyword-fallback'
        }, Cheney_status === 'ready' ? '文件已入库' : '文件已上传但解析失败'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 上传异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('文件上传异常：' + Cheney_err.message, 50105));
    }
}

// 删除文件
async function Cheney_kbFileDelete(Cheney_req, Cheney_res) {
    try {
        const Cheney_fileId = Number(Cheney_req.params.fileId);
        if (!Number.isInteger(Cheney_fileId) || Cheney_fileId <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('文件 id 不合法', 40105));
        }
        const Cheney_file = await Cheney_kbModel.Cheney_getFile(Cheney_fileId);
        if (!Cheney_file) {
            return Cheney_res.status(404).json(Cheney_fail('文件不存在', 40404));
        }
        await Cheney_kbModel.Cheney_deleteFile(Cheney_fileId);
        try {
            if (Cheney_file.Cheney_kb_file_path && Cheney_fs.existsSync(Cheney_file.Cheney_kb_file_path)) {
                Cheney_fs.unlinkSync(Cheney_file.Cheney_kb_file_path);
            }
        } catch (Cheney_e) { /* 落盘文件删除失败不影响记录清理 */ }
        return Cheney_res.json(Cheney_ok({ Cheney_kb_file_id: Cheney_fileId }, '文件已删除'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 删除文件异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('删除文件异常：' + Cheney_err.message, 50106));
    }
}

// 切片预览
async function Cheney_kbChunks(Cheney_req, Cheney_res) {
    try {
        const Cheney_fileId = Number(Cheney_req.query.fileId);
        if (!Number.isInteger(Cheney_fileId) || Cheney_fileId <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('fileId 不合法', 40105));
        }
        const Cheney_rows = await Cheney_kbModel.Cheney_listChunksByFile(Cheney_fileId, Number(Cheney_req.query.limit) || 20);
        return Cheney_res.json(Cheney_ok({ Cheney_list: Cheney_rows }, '切片获取成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 切片异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('切片查询异常：' + Cheney_err.message, 50107));
    }
}

// 检索：优先向量余弦，失败降级关键词
async function Cheney_retrieve(Cheney_kbId, Cheney_question) {
    const Cheney_chunks = await Cheney_kbModel.Cheney_listChunks(Cheney_kbId, 400);
    if (Cheney_chunks.length === 0) {
        return { Cheney_top: [], Cheney_mode: 'empty' };
    }

    let Cheney_mode = 'vector';
    let Cheney_scored = [];
    try {
        const Cheney_qVec = (await Cheney_embedTexts([Cheney_question]))[0];
        Cheney_scored = Cheney_chunks
            .map((Cheney_row) => {
                let Cheney_vec = null;
                try {
                    Cheney_vec = Cheney_row.Cheney_kb_chunk_embedding ? JSON.parse(Cheney_row.Cheney_kb_chunk_embedding) : null;
                } catch (Cheney_e) {
                    Cheney_vec = null;
                }
                return {
                    Cheney_row: Cheney_row,
                    Cheney_score: Cheney_vec ? Cheney_cosine(Cheney_qVec, Cheney_vec) : 0
                };
            })
            .filter((Cheney_item) => Cheney_item.Cheney_score > 0)
            .sort((Cheney_a, Cheney_b) => Cheney_b.Cheney_score - Cheney_a.Cheney_score);
    } catch (Cheney_err) {
        console.warn('[Cheney_kbController] 向量检索失败，降级关键词：' + Cheney_err.message);
        Cheney_mode = 'keyword';
        Cheney_scored = [];
    }

    if (Cheney_scored.length === 0) {
        Cheney_mode = 'keyword';
        Cheney_scored = Cheney_chunks
            .map((Cheney_row) => ({
                Cheney_row: Cheney_row,
                Cheney_score: Cheney_keywordScore(Cheney_question, Cheney_row.Cheney_kb_chunk_content)
            }))
            .filter((Cheney_item) => Cheney_item.Cheney_score > 0.06)
            .sort((Cheney_a, Cheney_b) => Cheney_b.Cheney_score - Cheney_a.Cheney_score);
    }

    const Cheney_top = Cheney_scored.slice(0, Cheney_topK).map((Cheney_item, Cheney_index) => ({
        Cheney_rank: Cheney_index + 1,
        Cheney_score: Number(Cheney_item.Cheney_score.toFixed(4)),
        Cheney_file_name: Cheney_item.Cheney_row.Cheney_kb_file_name || '',
        Cheney_chunk_index: Cheney_item.Cheney_row.Cheney_kb_chunk_index,
        Cheney_content: Cheney_item.Cheney_row.Cheney_kb_chunk_content
    }));

    return { Cheney_top: Cheney_top, Cheney_mode: Cheney_mode };
}

// 基于知识库问答
async function Cheney_kbChat(Cheney_req, Cheney_res) {
    try {
        if (!Cheney_apiKey) {
            return Cheney_res.status(500).json(Cheney_fail('后端未配置 SILICONFLOW_API_KEY', 50007));
        }
        const Cheney_body = Cheney_req.body || {};
        const Cheney_kbId = Number(Cheney_body.kbId);
        const Cheney_question = String(Cheney_body.question || '').trim();
        if (!Number.isInteger(Cheney_kbId) || Cheney_kbId <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('知识库 id 不合法', 40103));
        }
        if (!Cheney_question) {
            return Cheney_res.status(400).json(Cheney_fail('提问内容不能为空', 40106));
        }
        if (Cheney_question.length > 1000) {
            return Cheney_res.status(400).json(Cheney_fail('提问不超过 1000 字', 40107));
        }

        const Cheney_ret = await Cheney_retrieve(Cheney_kbId, Cheney_question);
        if (Cheney_ret.Cheney_top.length === 0) {
            return Cheney_res.json(Cheney_ok({
                Cheney_answer: '知识库里没有检索到与这个问题相关的内容，请换个说法，或先上传相关资料。',
                Cheney_sources: [],
                Cheney_mode: Cheney_ret.Cheney_mode
            }, '未命中知识库'));
        }

        const Cheney_context = Cheney_ret.Cheney_top
            .map((Cheney_item, Cheney_index) => '【片段' + (Cheney_index + 1) + '｜' + Cheney_item.Cheney_file_name + '】\n' + Cheney_item.Cheney_content)
            .join('\n\n');

        const Cheney_payload = {
            model: Cheney_chatModel,
            messages: [
                {
                    role: 'system',
                    content: '你是知识库客服助手。只依据【参考资料】回答，资料中没有的内容就直说“知识库中没有相关信息”，不要编造；回答使用中文，先给结论再列要点。'
                },
                {
                    role: 'user',
                    content: '【参考资料】\n' + Cheney_context + '\n\n【用户问题】\n' + Cheney_question
                }
            ]
        };

        console.log('[Cheney_kbController] 检索模式：' + Cheney_ret.Cheney_mode + '，命中 ' + Cheney_ret.Cheney_top.length + ' 个片段');
        console.log('[Cheney_kbController] 发送给大模型的数据：');
        console.log(JSON.stringify(Cheney_payload, null, 2));

        const Cheney_controller = new AbortController();
        const Cheney_timer = setTimeout(() => Cheney_controller.abort(), 60000);
        let Cheney_resUp;
        let Cheney_text = '';
        try {
            Cheney_resUp = await fetch(Cheney_apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + Cheney_apiKey
                },
                body: JSON.stringify(Cheney_payload),
                signal: Cheney_controller.signal
            });
            Cheney_text = await Cheney_resUp.text();
        } catch (Cheney_err) {
            clearTimeout(Cheney_timer);
            return Cheney_res.status(500).json(Cheney_fail('请求大模型失败：' + Cheney_err.message, 50008));
        }
        clearTimeout(Cheney_timer);

        console.log('[Cheney_kbController] 从大模型接收到的数据：');
        console.log(Cheney_text);

        let Cheney_json = null;
        try {
            Cheney_json = JSON.parse(Cheney_text);
        } catch (Cheney_err) {
            return Cheney_res.status(502).json(Cheney_fail('大模型返回无法解析', 50009, { Cheney_raw: Cheney_text.slice(0, 500) }));
        }
        if (!Cheney_resUp.ok) {
            return Cheney_res.status(502).json(Cheney_fail('大模型接口错误：' + ((Cheney_json && Cheney_json.message) || Cheney_resUp.status), 40008));
        }

        const Cheney_choice = (Cheney_json.choices && Cheney_json.choices[0]) || null;
        const Cheney_answer = Cheney_choice && Cheney_choice.message ? String(Cheney_choice.message.content || '') : '';
        if (!Cheney_answer) {
            return Cheney_res.status(502).json(Cheney_fail('大模型未返回有效内容', 50010));
        }

        return Cheney_res.json(Cheney_ok({
            Cheney_answer: Cheney_answer,
            Cheney_sources: Cheney_ret.Cheney_top,
            Cheney_mode: Cheney_ret.Cheney_mode,
            Cheney_model: Cheney_json.model || Cheney_chatModel,
            Cheney_usage: Cheney_json.usage || null
        }, '知识库问答成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_kbController] 问答异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('知识库问答异常：' + Cheney_err.message, 50006));
    }
}

module.exports = {
    Cheney_kbList,
    Cheney_kbCreate,
    Cheney_kbDelete,
    Cheney_kbFiles,
    Cheney_kbUpload,
    Cheney_kbFileDelete,
    Cheney_kbChunks,
    Cheney_kbChat,
    Cheney_uploadDir
};

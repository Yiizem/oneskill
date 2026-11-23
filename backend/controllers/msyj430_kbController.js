/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库控制器（C），负责上传解析入库、知识库管理、基于知识库的问答
 */
const msyj430_fs = require('fs');
const msyj430_path = require('path');
const msyj430_kbModel = require('../models/msyj430_kbModel');
const { msyj430_ok, msyj430_fail } = require('../utils/msyj430_result');
const { msyj430_parseFile } = require('../services/msyj430_docParser');
const { msyj430_splitText } = require('../services/msyj430_chunker');
const { msyj430_embedTexts, msyj430_cosine, msyj430_keywordScore } = require('../services/msyj430_embedding');

const msyj430_apiUrl = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '') + '/chat/completions';
const msyj430_apiKey = process.env.SILICONFLOW_API_KEY || '';
const msyj430_chatModel = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const msyj430_topK = Number(process.env.RAG_TOP_K) || 4;
const msyj430_uploadDir = msyj430_path.join(__dirname, '..', 'uploads');

// 还原上传文件名：部分客户端会把 UTF-8 文件名按 latin1 传递，这里做一次安全修正
function msyj430_fixFileName(msyj430_raw) {
    const msyj430_name = String(msyj430_raw || '');
    if (/[\u4e00-\u9fa5]/.test(msyj430_name)) {
        return msyj430_name;
    }
    try {
        const msyj430_decoded = Buffer.from(msyj430_name, 'latin1').toString('utf8');
        if (!/\uFFFD/.test(msyj430_decoded) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(msyj430_decoded)) {
            return msyj430_decoded;
        }
    } catch (msyj430_err) {
        return msyj430_name;
    }
    return msyj430_name;
}

// 知识库列表
async function msyj430_kbList(msyj430_req, msyj430_res) {
    try {
        const msyj430_rows = await msyj430_kbModel.msyj430_listKB();
        return msyj430_res.json(msyj430_ok({ msyj430_list: msyj430_rows }, '知识库列表获取成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 列表异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('知识库列表异常：' + msyj430_err.message, 50101));
    }
}

// 新建知识库
async function msyj430_kbCreate(msyj430_req, msyj430_res) {
    try {
        const msyj430_body = msyj430_req.body || {};
        const msyj430_name = String(msyj430_body.name || '').trim();
        if (!msyj430_name) {
            return msyj430_res.status(400).json(msyj430_fail('知识库名称不能为空', 40101));
        }
        if (msyj430_name.length > 100) {
            return msyj430_res.status(400).json(msyj430_fail('知识库名称不超过 100 字', 40102));
        }
        const msyj430_id = await msyj430_kbModel.msyj430_createKB(msyj430_name, String(msyj430_body.desc || '').slice(0, 255));
        return msyj430_res.json(msyj430_ok({ msyj430_kb_id: msyj430_id }, '知识库创建成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 创建异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('知识库创建异常：' + msyj430_err.message, 50102));
    }
}

// 删除知识库
async function msyj430_kbDelete(msyj430_req, msyj430_res) {
    try {
        const msyj430_id = Number(msyj430_req.params.id);
        if (!Number.isInteger(msyj430_id) || msyj430_id <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('知识库 id 不合法', 40103));
        }
        const msyj430_kb = await msyj430_kbModel.msyj430_getKB(msyj430_id);
        if (!msyj430_kb) {
            return msyj430_res.status(404).json(msyj430_fail('知识库不存在', 40403));
        }
        const msyj430_rows = await msyj430_kbModel.msyj430_deleteKB(msyj430_id);
        return msyj430_res.json(msyj430_ok({ msyj430_deleted: msyj430_rows }, '知识库已删除'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 删除异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('知识库删除异常：' + msyj430_err.message, 50103));
    }
}

// 文件列表
async function msyj430_kbFiles(msyj430_req, msyj430_res) {
    try {
        const msyj430_id = Number(msyj430_req.params.id);
        if (!Number.isInteger(msyj430_id) || msyj430_id <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('知识库 id 不合法', 40103));
        }
        const msyj430_files = await msyj430_kbModel.msyj430_listFiles(msyj430_id);
        return msyj430_res.json(msyj430_ok({ msyj430_list: msyj430_files }, '文件列表获取成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 文件列表异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('文件列表异常：' + msyj430_err.message, 50104));
    }
}

// 上传并解析文件
async function msyj430_kbUpload(msyj430_req, msyj430_res) {
    let msyj430_stored = '';
    try {
        const msyj430_id = Number(msyj430_req.params.id);
        if (!Number.isInteger(msyj430_id) || msyj430_id <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('知识库 id 不合法', 40103));
        }
        const msyj430_kb = await msyj430_kbModel.msyj430_getKB(msyj430_id);
        if (!msyj430_kb) {
            return msyj430_res.status(404).json(msyj430_fail('知识库不存在', 40403));
        }
        if (!msyj430_req.file) {
            return msyj430_res.status(400).json(msyj430_fail('未接收到文件，请选择 txt / md / pdf / doc / docx / ppt / pptx', 40104));
        }

        const msyj430_file = msyj430_req.file;
        msyj430_stored = msyj430_file.path || '';
        const msyj430_name = msyj430_fixFileName(msyj430_file.originalname);
        const msyj430_ext = msyj430_path.extname(msyj430_name).toLowerCase();

        // 解析为纯文本
        let msyj430_text = '';
        let msyj430_status = 'ready';
        let msyj430_error = '';
        try {
            msyj430_text = await msyj430_parseFile(msyj430_fs.readFileSync(msyj430_stored), msyj430_name);
        } catch (msyj430_parseErr) {
            msyj430_status = 'failed';
            msyj430_error = msyj430_parseErr.message.slice(0, 250);
            console.error('[msyj430_kbController] 解析失败：', msyj430_parseErr.message);
        }

        const msyj430_chunks = msyj430_status === 'ready' ? msyj430_splitText(msyj430_text, 480, 80) : [];
        let msyj430_vectors = null;
        if (msyj430_chunks.length > 0) {
            try {
                msyj430_vectors = await msyj430_embedTexts(msyj430_chunks);
                console.log('[msyj430_kbController] 已生成向量 ' + msyj430_vectors.length + ' 条（' + (process.env.SILICONFLOW_EMBEDDING_MODEL || 'BAAI/bge-m3') + '）');
            } catch (msyj430_embedErr) {
                console.warn('[msyj430_kbController] 向量生成失败，问答时降级为关键词检索：' + msyj430_embedErr.message);
                msyj430_vectors = null;
            }
        }

        const msyj430_fileId = await msyj430_kbModel.msyj430_insertFile({
            msyj430_kb_id: msyj430_id,
            msyj430_kb_file_name: msyj430_name,
            msyj430_kb_file_ext: msyj430_ext,
            msyj430_kb_file_size: msyj430_file.size || 0,
            msyj430_kb_file_chars: msyj430_text.length,
            msyj430_kb_file_chunks: msyj430_chunks.length,
            msyj430_kb_file_path: msyj430_stored,
            msyj430_kb_file_status: msyj430_status,
            msyj430_kb_file_error: msyj430_error
        });

        if (msyj430_chunks.length > 0) {
            await msyj430_kbModel.msyj430_insertChunks(msyj430_id, msyj430_fileId, msyj430_chunks, msyj430_vectors);
        }

        console.log('[msyj430_kbController] 上传解析完成：' + msyj430_name + ' · ' + msyj430_text.length + ' 字 · ' + msyj430_chunks.length + ' 片');

        return msyj430_res.json(msyj430_ok({
            msyj430_kb_file_id: msyj430_fileId,
            msyj430_kb_file_name: msyj430_name,
            msyj430_kb_file_ext: msyj430_ext,
            msyj430_kb_file_chars: msyj430_text.length,
            msyj430_kb_file_chunks: msyj430_chunks.length,
            msyj430_kb_file_status: msyj430_status,
            msyj430_kb_file_error: msyj430_error,
            msyj430_embedding: msyj430_vectors ? 'vector' : 'keyword-fallback'
        }, msyj430_status === 'ready' ? '文件已入库' : '文件已上传但解析失败'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 上传异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('文件上传异常：' + msyj430_err.message, 50105));
    }
}

// 删除文件
async function msyj430_kbFileDelete(msyj430_req, msyj430_res) {
    try {
        const msyj430_fileId = Number(msyj430_req.params.fileId);
        if (!Number.isInteger(msyj430_fileId) || msyj430_fileId <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('文件 id 不合法', 40105));
        }
        const msyj430_file = await msyj430_kbModel.msyj430_getFile(msyj430_fileId);
        if (!msyj430_file) {
            return msyj430_res.status(404).json(msyj430_fail('文件不存在', 40404));
        }
        await msyj430_kbModel.msyj430_deleteFile(msyj430_fileId);
        try {
            if (msyj430_file.msyj430_kb_file_path && msyj430_fs.existsSync(msyj430_file.msyj430_kb_file_path)) {
                msyj430_fs.unlinkSync(msyj430_file.msyj430_kb_file_path);
            }
        } catch (msyj430_e) { /* 落盘文件删除失败不影响记录清理 */ }
        return msyj430_res.json(msyj430_ok({ msyj430_kb_file_id: msyj430_fileId }, '文件已删除'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 删除文件异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('删除文件异常：' + msyj430_err.message, 50106));
    }
}

// 切片预览
async function msyj430_kbChunks(msyj430_req, msyj430_res) {
    try {
        const msyj430_fileId = Number(msyj430_req.query.fileId);
        if (!Number.isInteger(msyj430_fileId) || msyj430_fileId <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('fileId 不合法', 40105));
        }
        const msyj430_rows = await msyj430_kbModel.msyj430_listChunksByFile(msyj430_fileId, Number(msyj430_req.query.limit) || 20);
        return msyj430_res.json(msyj430_ok({ msyj430_list: msyj430_rows }, '切片获取成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 切片异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('切片查询异常：' + msyj430_err.message, 50107));
    }
}

// 检索：优先向量余弦，失败降级关键词
async function msyj430_retrieve(msyj430_kbId, msyj430_question) {
    const msyj430_chunks = await msyj430_kbModel.msyj430_listChunks(msyj430_kbId, 400);
    if (msyj430_chunks.length === 0) {
        return { msyj430_top: [], msyj430_mode: 'empty' };
    }

    let msyj430_mode = 'vector';
    let msyj430_scored = [];
    try {
        const msyj430_qVec = (await msyj430_embedTexts([msyj430_question]))[0];
        msyj430_scored = msyj430_chunks
            .map((msyj430_row) => {
                let msyj430_vec = null;
                try {
                    msyj430_vec = msyj430_row.msyj430_kb_chunk_embedding ? JSON.parse(msyj430_row.msyj430_kb_chunk_embedding) : null;
                } catch (msyj430_e) {
                    msyj430_vec = null;
                }
                return {
                    msyj430_row: msyj430_row,
                    msyj430_score: msyj430_vec ? msyj430_cosine(msyj430_qVec, msyj430_vec) : 0
                };
            })
            .filter((msyj430_item) => msyj430_item.msyj430_score > 0)
            .sort((msyj430_a, msyj430_b) => msyj430_b.msyj430_score - msyj430_a.msyj430_score);
    } catch (msyj430_err) {
        console.warn('[msyj430_kbController] 向量检索失败，降级关键词：' + msyj430_err.message);
        msyj430_mode = 'keyword';
        msyj430_scored = [];
    }

    if (msyj430_scored.length === 0) {
        msyj430_mode = 'keyword';
        msyj430_scored = msyj430_chunks
            .map((msyj430_row) => ({
                msyj430_row: msyj430_row,
                msyj430_score: msyj430_keywordScore(msyj430_question, msyj430_row.msyj430_kb_chunk_content)
            }))
            .filter((msyj430_item) => msyj430_item.msyj430_score > 0.06)
            .sort((msyj430_a, msyj430_b) => msyj430_b.msyj430_score - msyj430_a.msyj430_score);
    }

    const msyj430_top = msyj430_scored.slice(0, msyj430_topK).map((msyj430_item, msyj430_index) => ({
        msyj430_rank: msyj430_index + 1,
        msyj430_score: Number(msyj430_item.msyj430_score.toFixed(4)),
        msyj430_file_name: msyj430_item.msyj430_row.msyj430_kb_file_name || '',
        msyj430_chunk_index: msyj430_item.msyj430_row.msyj430_kb_chunk_index,
        msyj430_content: msyj430_item.msyj430_row.msyj430_kb_chunk_content
    }));

    return { msyj430_top: msyj430_top, msyj430_mode: msyj430_mode };
}

// 基于知识库问答
async function msyj430_kbChat(msyj430_req, msyj430_res) {
    try {
        if (!msyj430_apiKey) {
            return msyj430_res.status(500).json(msyj430_fail('后端未配置 SILICONFLOW_API_KEY', 50007));
        }
        const msyj430_body = msyj430_req.body || {};
        const msyj430_kbId = Number(msyj430_body.kbId);
        const msyj430_question = String(msyj430_body.question || '').trim();
        if (!Number.isInteger(msyj430_kbId) || msyj430_kbId <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('知识库 id 不合法', 40103));
        }
        if (!msyj430_question) {
            return msyj430_res.status(400).json(msyj430_fail('提问内容不能为空', 40106));
        }
        if (msyj430_question.length > 1000) {
            return msyj430_res.status(400).json(msyj430_fail('提问不超过 1000 字', 40107));
        }

        const msyj430_ret = await msyj430_retrieve(msyj430_kbId, msyj430_question);
        if (msyj430_ret.msyj430_top.length === 0) {
            return msyj430_res.json(msyj430_ok({
                msyj430_answer: '知识库里没有检索到与这个问题相关的内容，请换个说法，或先上传相关资料。',
                msyj430_sources: [],
                msyj430_mode: msyj430_ret.msyj430_mode
            }, '未命中知识库'));
        }

        const msyj430_context = msyj430_ret.msyj430_top
            .map((msyj430_item, msyj430_index) => '【片段' + (msyj430_index + 1) + '｜' + msyj430_item.msyj430_file_name + '】\n' + msyj430_item.msyj430_content)
            .join('\n\n');

        const msyj430_payload = {
            model: msyj430_chatModel,
            messages: [
                {
                    role: 'system',
                    content: '你是知识库客服助手。只依据【参考资料】回答，资料中没有的内容就直说“知识库中没有相关信息”，不要编造；回答使用中文，先给结论再列要点。'
                },
                {
                    role: 'user',
                    content: '【参考资料】\n' + msyj430_context + '\n\n【用户问题】\n' + msyj430_question
                }
            ]
        };

        console.log('[msyj430_kbController] 检索模式：' + msyj430_ret.msyj430_mode + '，命中 ' + msyj430_ret.msyj430_top.length + ' 个片段');
        console.log('[msyj430_kbController] 发送给大模型的数据：');
        console.log(JSON.stringify(msyj430_payload, null, 2));

        const msyj430_controller = new AbortController();
        const msyj430_timer = setTimeout(() => msyj430_controller.abort(), 60000);
        let msyj430_resUp;
        let msyj430_text = '';
        try {
            msyj430_resUp = await fetch(msyj430_apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + msyj430_apiKey
                },
                body: JSON.stringify(msyj430_payload),
                signal: msyj430_controller.signal
            });
            msyj430_text = await msyj430_resUp.text();
        } catch (msyj430_err) {
            clearTimeout(msyj430_timer);
            return msyj430_res.status(500).json(msyj430_fail('请求大模型失败：' + msyj430_err.message, 50008));
        }
        clearTimeout(msyj430_timer);

        console.log('[msyj430_kbController] 从大模型接收到的数据：');
        console.log(msyj430_text);

        let msyj430_json = null;
        try {
            msyj430_json = JSON.parse(msyj430_text);
        } catch (msyj430_err) {
            return msyj430_res.status(502).json(msyj430_fail('大模型返回无法解析', 50009, { msyj430_raw: msyj430_text.slice(0, 500) }));
        }
        if (!msyj430_resUp.ok) {
            return msyj430_res.status(502).json(msyj430_fail('大模型接口错误：' + ((msyj430_json && msyj430_json.message) || msyj430_resUp.status), 40008));
        }

        const msyj430_choice = (msyj430_json.choices && msyj430_json.choices[0]) || null;
        const msyj430_answer = msyj430_choice && msyj430_choice.message ? String(msyj430_choice.message.content || '') : '';
        if (!msyj430_answer) {
            return msyj430_res.status(502).json(msyj430_fail('大模型未返回有效内容', 50010));
        }

        return msyj430_res.json(msyj430_ok({
            msyj430_answer: msyj430_answer,
            msyj430_sources: msyj430_ret.msyj430_top,
            msyj430_mode: msyj430_ret.msyj430_mode,
            msyj430_model: msyj430_json.model || msyj430_chatModel,
            msyj430_usage: msyj430_json.usage || null
        }, '知识库问答成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_kbController] 问答异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('知识库问答异常：' + msyj430_err.message, 50006));
    }
}

module.exports = {
    msyj430_kbList,
    msyj430_kbCreate,
    msyj430_kbDelete,
    msyj430_kbFiles,
    msyj430_kbUpload,
    msyj430_kbFileDelete,
    msyj430_kbChunks,
    msyj430_kbChat,
    msyj430_uploadDir
};

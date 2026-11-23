/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：AI 聊天控制器（C），代理调用 SiliconFlow chat/completions，密钥只存于 .env
 */
const { msyj430_ok, msyj430_fail } = require('../utils/msyj430_result');

const msyj430_apiUrl = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '') + '/chat/completions';
const msyj430_apiKey = process.env.SILICONFLOW_API_KEY || '';
const msyj430_defaultModel = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const msyj430_systemPrompt = '你是一个有用的助手，回答简洁准确，使用中文。';
const msyj430_maxHistory = 20;

// 校验并规整前端传来的历史消息
function msyj430_normalizeHistory(msyj430_raw) {
    if (!Array.isArray(msyj430_raw)) {
        return [];
    }
    return msyj430_raw
        .filter((msyj430_item) => msyj430_item && typeof msyj430_item === 'object')
        .filter((msyj430_item) => ['user', 'assistant'].includes(String(msyj430_item.role)))
        .map((msyj430_item) => ({
            role: String(msyj430_item.role),
            content: String(msyj430_item.content || '').slice(0, 2000)
        }))
        .filter((msyj430_item) => msyj430_item.content.length > 0)
        .slice(-msyj430_maxHistory);
}

// POST /api/chat —— 接收用户消息，转发给大模型并回传回复
async function msyj430_chat(msyj430_req, msyj430_res) {
    try {
        if (!msyj430_apiKey) {
            return msyj430_res.status(500).json(msyj430_fail('后端未配置 SILICONFLOW_API_KEY，请检查 backend/.env', 50007));
        }

        const msyj430_body = msyj430_req.body || {};
        const msyj430_message = String(msyj430_body.message || '').trim();
        if (!msyj430_message) {
            return msyj430_res.status(400).json(msyj430_fail('消息内容不能为空', 40006));
        }
        if (msyj430_message.length > 2000) {
            return msyj430_res.status(400).json(msyj430_fail('消息内容过长，单条不超过 2000 字', 40007));
        }

        const msyj430_model = String(msyj430_body.model || '').trim() || msyj430_defaultModel;
        const msyj430_history = msyj430_normalizeHistory(msyj430_body.history);

        // 组装发送给大模型的完整数据
        const msyj430_payload = {
            model: msyj430_model,
            messages: [
                { role: 'system', content: msyj430_systemPrompt },
                ...msyj430_history,
                { role: 'user', content: msyj430_message }
            ]
        };

        console.log('[msyj430_chatController] 发送给大模型的数据：');
        console.log(JSON.stringify(msyj430_payload, null, 2));

        const msyj430_controller = new AbortController();
        const msyj430_timer = setTimeout(() => msyj430_controller.abort(), 60000);
        let msyj430_upstream;
        let msyj430_text = '';
        try {
            msyj430_upstream = await fetch(msyj430_apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + msyj430_apiKey
                },
                body: JSON.stringify(msyj430_payload),
                signal: msyj430_controller.signal
            });
            msyj430_text = await msyj430_upstream.text();
        } catch (msyj430_err) {
            clearTimeout(msyj430_timer);
            const msyj430_reason = msyj430_err.name === 'AbortError' ? '请求大模型超时（60 秒）' : '请求大模型失败：' + msyj430_err.message;
            console.error('[msyj430_chatController] ' + msyj430_reason);
            return msyj430_res.status(500).json(msyj430_fail(msyj430_reason, 50008));
        }
        clearTimeout(msyj430_timer);

        console.log('[msyj430_chatController] 从大模型接收到的数据：');
        console.log(msyj430_text);

        let msyj430_json = null;
        try {
            msyj430_json = JSON.parse(msyj430_text);
        } catch (msyj430_err) {
            return msyj430_res.status(502).json(msyj430_fail('大模型返回内容无法解析', 50009, { msyj430_raw: msyj430_text.slice(0, 500) }));
        }

        if (!msyj430_upstream.ok) {
            const msyj430_errMsg = (msyj430_json && msyj430_json.message) || ('HTTP ' + msyj430_upstream.status);
            return msyj430_res.status(502).json(msyj430_fail('大模型接口返回错误：' + msyj430_errMsg, 40008, {
                msyj430_status: msyj430_upstream.status,
                msyj430_raw: msyj430_text.slice(0, 500)
            }));
        }

        const msyj430_choice = (msyj430_json.choices && msyj430_json.choices[0]) || null;
        const msyj430_reply = msyj430_choice && msyj430_choice.message ? String(msyj430_choice.message.content || '') : '';
        if (!msyj430_reply) {
            return msyj430_res.status(502).json(msyj430_fail('大模型未返回有效内容', 50010));
        }

        return msyj430_res.json(msyj430_ok({
            msyj430_reply: msyj430_reply,
            msyj430_model: msyj430_json.model || msyj430_model,
            msyj430_usage: msyj430_json.usage || null,
            msyj430_finishReason: (msyj430_choice && msyj430_choice.finish_reason) || '',
            msyj430_id: msyj430_json.id || ''
        }, '对话成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_chatController] 异常：', msyj430_err.message);
        return msyj430_res.status(500).json(msyj430_fail('对话异常：' + msyj430_err.message, 50006));
    }
}

module.exports = { msyj430_chat, msyj430_defaultModel, msyj430_systemPrompt };

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：AI 聊天控制器（C），代理调用 SiliconFlow chat/completions，密钥只存于 .env
 */
const { Cheney_ok, Cheney_fail } = require('../utils/Cheney_result');

const Cheney_apiUrl = (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').replace(/\/$/, '') + '/chat/completions';
const Cheney_apiKey = process.env.SILICONFLOW_API_KEY || '';
const Cheney_defaultModel = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';
const Cheney_systemPrompt = '你是一个有用的助手，回答简洁准确，使用中文。';
const Cheney_maxHistory = 20;

// 校验并规整前端传来的历史消息
function Cheney_normalizeHistory(Cheney_raw) {
    if (!Array.isArray(Cheney_raw)) {
        return [];
    }
    return Cheney_raw
        .filter((Cheney_item) => Cheney_item && typeof Cheney_item === 'object')
        .filter((Cheney_item) => ['user', 'assistant'].includes(String(Cheney_item.role)))
        .map((Cheney_item) => ({
            role: String(Cheney_item.role),
            content: String(Cheney_item.content || '').slice(0, 2000)
        }))
        .filter((Cheney_item) => Cheney_item.content.length > 0)
        .slice(-Cheney_maxHistory);
}

// POST /api/chat —— 接收用户消息，转发给大模型并回传回复
async function Cheney_chat(Cheney_req, Cheney_res) {
    try {
        if (!Cheney_apiKey) {
            return Cheney_res.status(500).json(Cheney_fail('后端未配置 SILICONFLOW_API_KEY，请检查 backend/.env', 50007));
        }

        const Cheney_body = Cheney_req.body || {};
        const Cheney_message = String(Cheney_body.message || '').trim();
        if (!Cheney_message) {
            return Cheney_res.status(400).json(Cheney_fail('消息内容不能为空', 40006));
        }
        if (Cheney_message.length > 2000) {
            return Cheney_res.status(400).json(Cheney_fail('消息内容过长，单条不超过 2000 字', 40007));
        }

        const Cheney_model = String(Cheney_body.model || '').trim() || Cheney_defaultModel;
        const Cheney_history = Cheney_normalizeHistory(Cheney_body.history);

        // 组装发送给大模型的完整数据
        const Cheney_payload = {
            model: Cheney_model,
            messages: [
                { role: 'system', content: Cheney_systemPrompt },
                ...Cheney_history,
                { role: 'user', content: Cheney_message }
            ]
        };

        console.log('[Cheney_chatController] 发送给大模型的数据：');
        console.log(JSON.stringify(Cheney_payload, null, 2));

        const Cheney_controller = new AbortController();
        const Cheney_timer = setTimeout(() => Cheney_controller.abort(), 60000);
        let Cheney_upstream;
        let Cheney_text = '';
        try {
            Cheney_upstream = await fetch(Cheney_apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + Cheney_apiKey
                },
                body: JSON.stringify(Cheney_payload),
                signal: Cheney_controller.signal
            });
            Cheney_text = await Cheney_upstream.text();
        } catch (Cheney_err) {
            clearTimeout(Cheney_timer);
            const Cheney_reason = Cheney_err.name === 'AbortError' ? '请求大模型超时（60 秒）' : '请求大模型失败：' + Cheney_err.message;
            console.error('[Cheney_chatController] ' + Cheney_reason);
            return Cheney_res.status(500).json(Cheney_fail(Cheney_reason, 50008));
        }
        clearTimeout(Cheney_timer);

        console.log('[Cheney_chatController] 从大模型接收到的数据：');
        console.log(Cheney_text);

        let Cheney_json = null;
        try {
            Cheney_json = JSON.parse(Cheney_text);
        } catch (Cheney_err) {
            return Cheney_res.status(502).json(Cheney_fail('大模型返回内容无法解析', 50009, { Cheney_raw: Cheney_text.slice(0, 500) }));
        }

        if (!Cheney_upstream.ok) {
            const Cheney_errMsg = (Cheney_json && Cheney_json.message) || ('HTTP ' + Cheney_upstream.status);
            return Cheney_res.status(502).json(Cheney_fail('大模型接口返回错误：' + Cheney_errMsg, 40008, {
                Cheney_status: Cheney_upstream.status,
                Cheney_raw: Cheney_text.slice(0, 500)
            }));
        }

        const Cheney_choice = (Cheney_json.choices && Cheney_json.choices[0]) || null;
        const Cheney_reply = Cheney_choice && Cheney_choice.message ? String(Cheney_choice.message.content || '') : '';
        if (!Cheney_reply) {
            return Cheney_res.status(502).json(Cheney_fail('大模型未返回有效内容', 50010));
        }

        return Cheney_res.json(Cheney_ok({
            Cheney_reply: Cheney_reply,
            Cheney_model: Cheney_json.model || Cheney_model,
            Cheney_usage: Cheney_json.usage || null,
            Cheney_finishReason: (Cheney_choice && Cheney_choice.finish_reason) || '',
            Cheney_id: Cheney_json.id || ''
        }, '对话成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_chatController] 异常：', Cheney_err.message);
        return Cheney_res.status(500).json(Cheney_fail('对话异常：' + Cheney_err.message, 50006));
    }
}

module.exports = { Cheney_chat, Cheney_defaultModel, Cheney_systemPrompt };

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：AI 聊天页面脚本，请求 /api/chat，并在控制台输出发送与接收的完整数据
 */

(function () {
    var msyj430_cfg = { model: '', systemPrompt: '' };
    var msyj430_history = [];
    var msyj430_busy = false;

    var msyj430_elBody = document.getElementById('msyj430_chatBody');
    var msyj430_elInput = document.getElementById('msyj430_chatInput');
    var msyj430_elSend = document.getElementById('msyj430_chatSend');
    var msyj430_elClear = document.getElementById('msyj430_chatClear');
    var msyj430_elCounter = document.getElementById('msyj430_chatCounter');
    var msyj430_elQuick = document.getElementById('msyj430_chatQuick');
    var msyj430_elModelBadge = document.getElementById('msyj430_chatModelBadge');
    var msyj430_elSystem = document.getElementById('msyj430_chatSystemPrompt');
    var msyj430_elApiStatus = document.getElementById('msyj430_chatApiStatus');
    var msyj430_elApiCode = document.getElementById('msyj430_chatApiCode');
    var msyj430_elApiToggle = document.getElementById('msyj430_chatApiToggle');

    // 读取后端公开配置（模型名与系统提示词，不含密钥）
    function msyj430_loadConfig() {
        fetch('/api/chat/config')
            .then(function (msyj430_res) { return msyj430_res.json(); })
            .then(function (msyj430_json) {
                if (msyj430_json && msyj430_json.code === 0 && msyj430_json.data) {
                    msyj430_cfg.model = msyj430_json.data.msyj430_model || '';
                    msyj430_cfg.systemPrompt = msyj430_json.data.msyj430_systemPrompt || '';
                    msyj430_elModelBadge.textContent = '模型：' + msyj430_cfg.model;
                    msyj430_elSystem.textContent = '系统提示词：' + msyj430_cfg.systemPrompt;
                    console.log('[msyj430_chat] 读取接口配置：', msyj430_json);
                }
            })
            .catch(function (msyj430_err) {
                msyj430_elModelBadge.textContent = '模型：读取失败';
                console.warn('[msyj430_chat] 读取配置失败：', msyj430_err);
            });
    }

    // 滚动到底部
    function msyj430_scrollBottom() {
        msyj430_elBody.scrollTop = msyj430_elBody.scrollHeight;
    }

    // 渲染一条消息气泡
    function msyj430_renderMessage(msyj430_role, msyj430_text, msyj430_meta) {
        var msyj430_wrapper = document.createElement('div');
        msyj430_wrapper.className = 'msyj430_msg ' + (msyj430_role === 'user' ? 'msyj430_msgUser' : 'msyj430_msgAssistant');

        var msyj430_avatar = document.createElement('div');
        msyj430_avatar.className = 'msyj430_msgAvatar';
        msyj430_avatar.textContent = msyj430_role === 'user' ? '我' : 'AI';

        var msyj430_bubble = document.createElement('div');
        msyj430_bubble.className = 'msyj430_msgBubble';
        msyj430_text.split(/\n{2,}/).forEach(function (msyj430_part) {
            var msyj430_p = document.createElement('p');
            msyj430_p.textContent = msyj430_part;
            msyj430_bubble.appendChild(msyj430_p);
        });

        if (msyj430_meta) {
            var msyj430_metaEl = document.createElement('div');
            msyj430_metaEl.className = 'msyj430_msgMeta';
            msyj430_metaEl.textContent = msyj430_meta;
            msyj430_bubble.appendChild(msyj430_metaEl);
        }

        msyj430_wrapper.appendChild(msyj430_avatar);
        msyj430_wrapper.appendChild(msyj430_bubble);
        msyj430_elBody.appendChild(msyj430_wrapper);
        msyj430_scrollBottom();
        return msyj430_wrapper;
    }

    // 等待提示
    function msyj430_renderTyping() {
        var msyj430_wrapper = document.createElement('div');
        msyj430_wrapper.className = 'msyj430_msg msyj430_msgAssistant';
        msyj430_wrapper.id = 'msyj430_typingRow';

        var msyj430_avatar = document.createElement('div');
        msyj430_avatar.className = 'msyj430_msgAvatar';
        msyj430_avatar.textContent = 'AI';

        var msyj430_bubble = document.createElement('div');
        msyj430_bubble.className = 'msyj430_msgBubble';
        msyj430_bubble.innerHTML = '<span class="msyj430_typing"><i></i><i></i><i></i></span>';

        msyj430_wrapper.appendChild(msyj430_avatar);
        msyj430_wrapper.appendChild(msyj430_bubble);
        msyj430_elBody.appendChild(msyj430_wrapper);
        msyj430_scrollBottom();
    }

    function msyj430_removeTyping() {
        var msyj430_row = document.getElementById('msyj430_typingRow');
        if (msyj430_row) {
            msyj430_row.remove();
        }
    }

    // 接口面板状态与原始数据
    function msyj430_showApiResult(msyj430_status, msyj430_request, msyj430_response) {
        msyj430_elApiStatus.textContent = msyj430_status;
        var msyj430_text = '【发送】\n' + JSON.stringify(msyj430_request, null, 2) +
            '\n\n【接收】\n' + JSON.stringify(msyj430_response, null, 2);
        msyj430_elApiCode.textContent = msyj430_text;
    }

    // 发送消息
    function msyj430_send() {
        var msyj430_text = msyj430_elInput.value.trim();
        if (!msyj430_text || msyj430_busy) {
            return;
        }

        msyj430_renderMessage('user', msyj430_text);
        msyj430_history.push({ role: 'user', content: msyj430_text });

        var msyj430_payload = {
            message: msyj430_text,
            history: msyj430_history.slice(0, -1),
            model: msyj430_cfg.model || undefined
        };

        // 控制台输出：发送给大模型的数据
        console.log('[msyj430_chat] 发送给大模型的数据（经后端转发）：', JSON.stringify(msyj430_payload, null, 2));
        console.log(msyj430_payload);

        msyj430_elInput.value = '';
        msyj430_elCounter.textContent = '0 / 2000';
        msyj430_busy = true;
        msyj430_elSend.disabled = true;
        msyj430_elApiStatus.textContent = '状态：等待大模型回复…';
        msyj430_renderTyping();

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msyj430_payload)
        })
            .then(function (msyj430_res) { return msyj430_res.json(); })
            .then(function (msyj430_json) {
                msyj430_removeTyping();

                // 控制台输出：从大模型接收到的数据
                console.log('[msyj430_chat] 从大模型接收到的数据：', JSON.stringify(msyj430_json, null, 2));
                console.log(msyj430_json);

                if (msyj430_json && msyj430_json.code === 0 && msyj430_json.data) {
                    var msyj430_data = msyj430_json.data;
                    var msyj430_usage = msyj430_data.msyj430_usage || {};
                    var msyj430_meta = (msyj430_data.msyj430_model || '') +
                        ' · tokens ' + (msyj430_usage.total_tokens || '-');
                    msyj430_renderMessage('assistant', msyj430_data.msyj430_reply, msyj430_meta);
                    msyj430_history.push({ role: 'assistant', content: msyj430_data.msyj430_reply });
                    msyj430_showApiResult('状态：成功 · code = 0', msyj430_payload, msyj430_json);
                } else {
                    var msyj430_msg = (msyj430_json && msyj430_json.msg) || '请求失败';
                    var msyj430_errorRow = msyj430_renderMessage('assistant', '⚠ ' + msyj430_msg);
                    msyj430_errorRow.classList.add('msyj430_msgError');
                    msyj430_history.pop();
                    msyj430_showApiResult('状态：失败 · code = ' + ((msyj430_json && msyj430_json.code) || '-'), msyj430_payload, msyj430_json);
                }
            })
            .catch(function (msyj430_err) {
                msyj430_removeTyping();
                console.error('[msyj430_chat] 请求异常：', msyj430_err);
                var msyj430_row = msyj430_renderMessage('assistant', '⚠ 网络或服务异常：' + msyj430_err.message);
                msyj430_row.classList.add('msyj430_msgError');
                msyj430_history.pop();
                msyj430_showApiResult('状态：异常', msyj430_payload, { error: msyj430_err.message });
            })
            .finally(function () {
                msyj430_busy = false;
                msyj430_elSend.disabled = false;
                msyj430_elInput.focus();
            });
    }

    // 输入计数
    msyj430_elInput.addEventListener('input', function () {
        msyj430_elCounter.textContent = msyj430_elInput.value.length + ' / 2000';
    });

    // Enter 发送，Shift + Enter 换行
    msyj430_elInput.addEventListener('keydown', function (msyj430_event) {
        if (msyj430_event.key === 'Enter' && !msyj430_event.shiftKey) {
            msyj430_event.preventDefault();
            msyj430_send();
        }
    });

    msyj430_elSend.addEventListener('click', msyj430_send);

    // 快捷提问
    msyj430_elQuick.addEventListener('click', function (msyj430_event) {
        var msyj430_btn = msyj430_event.target.closest('[data-q]');
        if (!msyj430_btn) {
            return;
        }
        msyj430_elInput.value = msyj430_btn.getAttribute('data-q');
        msyj430_elCounter.textContent = msyj430_elInput.value.length + ' / 2000';
        msyj430_send();
    });

    // 清空对话
    msyj430_elClear.addEventListener('click', function () {
        msyj430_history = [];
        msyj430_elBody.innerHTML = '';
        msyj430_renderMessage('assistant', '对话已清空，可以开始新的提问。');
        msyj430_elApiStatus.textContent = '状态：待发送';
        msyj430_elApiCode.textContent = '尚未请求接口';
        console.log('[msyj430_chat] 已清空对话历史');
    });

    // 原始数据折叠
    msyj430_elApiToggle.addEventListener('click', function () {
        var msyj430_hidden = msyj430_elApiCode.classList.toggle('msyj430_codeHidden');
        msyj430_elApiToggle.textContent = msyj430_hidden ? '查看原始数据' : '收起原始数据';
    });

    msyj430_loadConfig();
})();

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：AI 聊天页面脚本，请求 /api/chat，并在控制台输出发送与接收的完整数据
 */

(function () {
    var Cheney_cfg = { model: '', systemPrompt: '' };
    var Cheney_history = [];
    var Cheney_busy = false;

    var Cheney_elBody = document.getElementById('Cheney_chatBody');
    var Cheney_elInput = document.getElementById('Cheney_chatInput');
    var Cheney_elSend = document.getElementById('Cheney_chatSend');
    var Cheney_elClear = document.getElementById('Cheney_chatClear');
    var Cheney_elCounter = document.getElementById('Cheney_chatCounter');
    var Cheney_elQuick = document.getElementById('Cheney_chatQuick');
    var Cheney_elModelBadge = document.getElementById('Cheney_chatModelBadge');
    var Cheney_elSystem = document.getElementById('Cheney_chatSystemPrompt');
    var Cheney_elApiStatus = document.getElementById('Cheney_chatApiStatus');
    var Cheney_elApiCode = document.getElementById('Cheney_chatApiCode');
    var Cheney_elApiToggle = document.getElementById('Cheney_chatApiToggle');

    // 读取后端公开配置（模型名与系统提示词，不含密钥）
    function Cheney_loadConfig() {
        fetch('/api/chat/config')
            .then(function (Cheney_res) { return Cheney_res.json(); })
            .then(function (Cheney_json) {
                if (Cheney_json && Cheney_json.code === 0 && Cheney_json.data) {
                    Cheney_cfg.model = Cheney_json.data.Cheney_model || '';
                    Cheney_cfg.systemPrompt = Cheney_json.data.Cheney_systemPrompt || '';
                    Cheney_elModelBadge.textContent = '模型：' + Cheney_cfg.model;
                    Cheney_elSystem.textContent = '系统提示词：' + Cheney_cfg.systemPrompt;
                    console.log('[Cheney_chat] 读取接口配置：', Cheney_json);
                }
            })
            .catch(function (Cheney_err) {
                Cheney_elModelBadge.textContent = '模型：读取失败';
                console.warn('[Cheney_chat] 读取配置失败：', Cheney_err);
            });
    }

    // 滚动到底部
    function Cheney_scrollBottom() {
        Cheney_elBody.scrollTop = Cheney_elBody.scrollHeight;
    }

    // 渲染一条消息气泡
    function Cheney_renderMessage(Cheney_role, Cheney_text, Cheney_meta) {
        var Cheney_wrapper = document.createElement('div');
        Cheney_wrapper.className = 'Cheney_msg ' + (Cheney_role === 'user' ? 'Cheney_msgUser' : 'Cheney_msgAssistant');

        var Cheney_avatar = document.createElement('div');
        Cheney_avatar.className = 'Cheney_msgAvatar';
        Cheney_avatar.textContent = Cheney_role === 'user' ? '我' : 'AI';

        var Cheney_bubble = document.createElement('div');
        Cheney_bubble.className = 'Cheney_msgBubble';
        Cheney_text.split(/\n{2,}/).forEach(function (Cheney_part) {
            var Cheney_p = document.createElement('p');
            Cheney_p.textContent = Cheney_part;
            Cheney_bubble.appendChild(Cheney_p);
        });

        if (Cheney_meta) {
            var Cheney_metaEl = document.createElement('div');
            Cheney_metaEl.className = 'Cheney_msgMeta';
            Cheney_metaEl.textContent = Cheney_meta;
            Cheney_bubble.appendChild(Cheney_metaEl);
        }

        Cheney_wrapper.appendChild(Cheney_avatar);
        Cheney_wrapper.appendChild(Cheney_bubble);
        Cheney_elBody.appendChild(Cheney_wrapper);
        Cheney_scrollBottom();
        return Cheney_wrapper;
    }

    // 等待提示
    function Cheney_renderTyping() {
        var Cheney_wrapper = document.createElement('div');
        Cheney_wrapper.className = 'Cheney_msg Cheney_msgAssistant';
        Cheney_wrapper.id = 'Cheney_typingRow';

        var Cheney_avatar = document.createElement('div');
        Cheney_avatar.className = 'Cheney_msgAvatar';
        Cheney_avatar.textContent = 'AI';

        var Cheney_bubble = document.createElement('div');
        Cheney_bubble.className = 'Cheney_msgBubble';
        Cheney_bubble.innerHTML = '<span class="Cheney_typing"><i></i><i></i><i></i></span>';

        Cheney_wrapper.appendChild(Cheney_avatar);
        Cheney_wrapper.appendChild(Cheney_bubble);
        Cheney_elBody.appendChild(Cheney_wrapper);
        Cheney_scrollBottom();
    }

    function Cheney_removeTyping() {
        var Cheney_row = document.getElementById('Cheney_typingRow');
        if (Cheney_row) {
            Cheney_row.remove();
        }
    }

    // 接口面板状态与原始数据
    function Cheney_showApiResult(Cheney_status, Cheney_request, Cheney_response) {
        Cheney_elApiStatus.textContent = Cheney_status;
        var Cheney_text = '【发送】\n' + JSON.stringify(Cheney_request, null, 2) +
            '\n\n【接收】\n' + JSON.stringify(Cheney_response, null, 2);
        Cheney_elApiCode.textContent = Cheney_text;
    }

    // 发送消息
    function Cheney_send() {
        var Cheney_text = Cheney_elInput.value.trim();
        if (!Cheney_text || Cheney_busy) {
            return;
        }

        Cheney_renderMessage('user', Cheney_text);
        Cheney_history.push({ role: 'user', content: Cheney_text });

        var Cheney_payload = {
            message: Cheney_text,
            history: Cheney_history.slice(0, -1),
            model: Cheney_cfg.model || undefined
        };

        // 控制台输出：发送给大模型的数据
        console.log('[Cheney_chat] 发送给大模型的数据（经后端转发）：', JSON.stringify(Cheney_payload, null, 2));
        console.log(Cheney_payload);

        Cheney_elInput.value = '';
        Cheney_elCounter.textContent = '0 / 2000';
        Cheney_busy = true;
        Cheney_elSend.disabled = true;
        Cheney_elApiStatus.textContent = '状态：等待大模型回复…';
        Cheney_renderTyping();

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Cheney_payload)
        })
            .then(function (Cheney_res) { return Cheney_res.json(); })
            .then(function (Cheney_json) {
                Cheney_removeTyping();

                // 控制台输出：从大模型接收到的数据
                console.log('[Cheney_chat] 从大模型接收到的数据：', JSON.stringify(Cheney_json, null, 2));
                console.log(Cheney_json);

                if (Cheney_json && Cheney_json.code === 0 && Cheney_json.data) {
                    var Cheney_data = Cheney_json.data;
                    var Cheney_usage = Cheney_data.Cheney_usage || {};
                    var Cheney_meta = (Cheney_data.Cheney_model || '') +
                        ' · tokens ' + (Cheney_usage.total_tokens || '-');
                    Cheney_renderMessage('assistant', Cheney_data.Cheney_reply, Cheney_meta);
                    Cheney_history.push({ role: 'assistant', content: Cheney_data.Cheney_reply });
                    Cheney_showApiResult('状态：成功 · code = 0', Cheney_payload, Cheney_json);
                } else {
                    var Cheney_msg = (Cheney_json && Cheney_json.msg) || '请求失败';
                    var Cheney_errorRow = Cheney_renderMessage('assistant', '⚠ ' + Cheney_msg);
                    Cheney_errorRow.classList.add('Cheney_msgError');
                    Cheney_history.pop();
                    Cheney_showApiResult('状态：失败 · code = ' + ((Cheney_json && Cheney_json.code) || '-'), Cheney_payload, Cheney_json);
                }
            })
            .catch(function (Cheney_err) {
                Cheney_removeTyping();
                console.error('[Cheney_chat] 请求异常：', Cheney_err);
                var Cheney_row = Cheney_renderMessage('assistant', '⚠ 网络或服务异常：' + Cheney_err.message);
                Cheney_row.classList.add('Cheney_msgError');
                Cheney_history.pop();
                Cheney_showApiResult('状态：异常', Cheney_payload, { error: Cheney_err.message });
            })
            .finally(function () {
                Cheney_busy = false;
                Cheney_elSend.disabled = false;
                Cheney_elInput.focus();
            });
    }

    // 输入计数
    Cheney_elInput.addEventListener('input', function () {
        Cheney_elCounter.textContent = Cheney_elInput.value.length + ' / 2000';
    });

    // Enter 发送，Shift + Enter 换行
    Cheney_elInput.addEventListener('keydown', function (Cheney_event) {
        if (Cheney_event.key === 'Enter' && !Cheney_event.shiftKey) {
            Cheney_event.preventDefault();
            Cheney_send();
        }
    });

    Cheney_elSend.addEventListener('click', Cheney_send);

    // 快捷提问
    Cheney_elQuick.addEventListener('click', function (Cheney_event) {
        var Cheney_btn = Cheney_event.target.closest('[data-q]');
        if (!Cheney_btn) {
            return;
        }
        Cheney_elInput.value = Cheney_btn.getAttribute('data-q');
        Cheney_elCounter.textContent = Cheney_elInput.value.length + ' / 2000';
        Cheney_send();
    });

    // 清空对话
    Cheney_elClear.addEventListener('click', function () {
        Cheney_history = [];
        Cheney_elBody.innerHTML = '';
        Cheney_renderMessage('assistant', '对话已清空，可以开始新的提问。');
        Cheney_elApiStatus.textContent = '状态：待发送';
        Cheney_elApiCode.textContent = '尚未请求接口';
        console.log('[Cheney_chat] 已清空对话历史');
    });

    // 原始数据折叠
    Cheney_elApiToggle.addEventListener('click', function () {
        var Cheney_hidden = Cheney_elApiCode.classList.toggle('Cheney_codeHidden');
        Cheney_elApiToggle.textContent = Cheney_hidden ? '查看原始数据' : '收起原始数据';
    });

    Cheney_loadConfig();
})();

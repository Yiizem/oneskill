/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库连接测试页面脚本，提交参数到 /api/database/test 并渲染结果
 */
(function () {
    'use strict';

    var msyj430_apiBase = window.location.origin + '/api';
    var msyj430_form = document.getElementById('msyj430_dbForm');
    var msyj430_submitBtn = document.getElementById('msyj430_submitBtn');
    var msyj430_resetBtn = document.getElementById('msyj430_resetBtn');
    var msyj430_resultBox = document.getElementById('msyj430_result');
    var msyj430_resultIdle = document.getElementById('msyj430_resultIdle');
    var msyj430_resultBody = document.getElementById('msyj430_resultBody');
    var msyj430_apiUrl = document.getElementById('msyj430_apiUrl');

    var msyj430_endpoint = msyj430_apiBase + '/database/test';
    msyj430_apiUrl.textContent = msyj430_endpoint;
    msyj430_apiUrl.href = msyj430_endpoint;

    // 渲染结果区：成功绿色、失败红色
    function msyj430_renderResult(msyj430_json, msyj430_isOk) {
        msyj430_resultBox.classList.remove('msyj430_resultOk', 'msyj430_resultFail');
        msyj430_resultBox.classList.add(msyj430_isOk ? 'msyj430_resultOk' : 'msyj430_resultFail');
        msyj430_resultIdle.hidden = true;
        msyj430_resultBody.hidden = false;

        var msyj430_detail = msyj430_json.data || {};
        var msyj430_rows = Object.keys(msyj430_detail).map(function (msyj430_key) {
            return '<div class="msyj430_resultKey">' + msyj430_key.replace('msyj430_', '') + '</div>' +
                '<div class="msyj430_resultVal">' + String(msyj430_detail[msyj430_key]) + '</div>';
        }).join('');

        msyj430_resultBody.innerHTML =
            '<div class="msyj430_resultHead"><span class="msyj430_resultDot"></span>' +
            (msyj430_isOk ? '连接成功' : '连接失败') + '</div>' +
            '<div class="msyj430_resultMsg">' + msyj430_json.msg + '</div>' +
            '<div class="msyj430_resultGrid">' + msyj430_rows + '</div>' +
            '<pre class="msyj430_code">' + JSON.stringify(msyj430_json, null, 2) + '</pre>';
    }

    // 提交测试请求
    msyj430_form.addEventListener('submit', function (msyj430_event) {
        msyj430_event.preventDefault();

        var msyj430_payload = {
            user: document.getElementById('msyj430_user').value.trim(),
            password: document.getElementById('msyj430_password').value,
            host: document.getElementById('msyj430_host').value.trim(),
            port: Number(document.getElementById('msyj430_port').value) || 0,
            database: document.getElementById('msyj430_database').value.trim()
        };

        msyj430_submitBtn.disabled = true;
        msyj430_submitBtn.textContent = '连接中…';

        fetch(msyj430_endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msyj430_payload)
        })
            .then(function (msyj430_res) {
                return msyj430_res.json();
            })
            .then(function (msyj430_json) {
                console.log('数据库连接测试返回：', msyj430_json);
                if (msyj430_json.code === 0) {
                    msyj430_renderResult(msyj430_json, true);
                } else {
                    console.error('数据库连接失败：', msyj430_json);
                    msyj430_renderResult(msyj430_json, false);
                }
            })
            .catch(function (msyj430_err) {
                console.error('请求接口异常：', msyj430_err.message);
                msyj430_resultIdle.hidden = true;
                msyj430_resultBody.hidden = false;
                msyj430_renderResult({
                    code: 50000,
                    msg: '请求接口异常：' + msyj430_err.message + '（请确认后端已启动）',
                    data: {}
                }, false);
            })
            .finally(function () {
                msyj430_submitBtn.disabled = false;
                msyj430_submitBtn.textContent = '测试连接';
            });
    });

    // 重置后回到初始状态
    msyj430_resetBtn.addEventListener('click', function () {
        msyj430_resultBox.classList.remove('msyj430_resultOk', 'msyj430_resultFail');
        msyj430_resultBody.hidden = true;
        msyj430_resultBody.innerHTML = '';
        msyj430_resultIdle.hidden = false;
        console.log('表单已重置为默认参数 root / 123456');
    });

    console.log('数据库测试页面已就绪，接口地址：' + msyj430_endpoint);
})();

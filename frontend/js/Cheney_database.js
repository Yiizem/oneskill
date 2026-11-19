/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库连接测试页面脚本，提交参数到 /api/database/test 并渲染结果
 */
(function () {
    'use strict';

    var Cheney_apiBase = window.location.origin + '/api';
    var Cheney_form = document.getElementById('Cheney_dbForm');
    var Cheney_submitBtn = document.getElementById('Cheney_submitBtn');
    var Cheney_resetBtn = document.getElementById('Cheney_resetBtn');
    var Cheney_resultBox = document.getElementById('Cheney_result');
    var Cheney_resultIdle = document.getElementById('Cheney_resultIdle');
    var Cheney_resultBody = document.getElementById('Cheney_resultBody');
    var Cheney_apiUrl = document.getElementById('Cheney_apiUrl');

    var Cheney_endpoint = Cheney_apiBase + '/database/test';
    Cheney_apiUrl.textContent = Cheney_endpoint;
    Cheney_apiUrl.href = Cheney_endpoint;

    // 渲染结果区：成功绿色、失败红色
    function Cheney_renderResult(Cheney_json, Cheney_isOk) {
        Cheney_resultBox.classList.remove('Cheney_resultOk', 'Cheney_resultFail');
        Cheney_resultBox.classList.add(Cheney_isOk ? 'Cheney_resultOk' : 'Cheney_resultFail');
        Cheney_resultIdle.hidden = true;
        Cheney_resultBody.hidden = false;

        var Cheney_detail = Cheney_json.data || {};
        var Cheney_rows = Object.keys(Cheney_detail).map(function (Cheney_key) {
            return '<div class="Cheney_resultKey">' + Cheney_key.replace('Cheney_', '') + '</div>' +
                '<div class="Cheney_resultVal">' + String(Cheney_detail[Cheney_key]) + '</div>';
        }).join('');

        Cheney_resultBody.innerHTML =
            '<div class="Cheney_resultHead"><span class="Cheney_resultDot"></span>' +
            (Cheney_isOk ? '连接成功' : '连接失败') + '</div>' +
            '<div class="Cheney_resultMsg">' + Cheney_json.msg + '</div>' +
            '<div class="Cheney_resultGrid">' + Cheney_rows + '</div>' +
            '<pre class="Cheney_code">' + JSON.stringify(Cheney_json, null, 2) + '</pre>';
    }

    // 提交测试请求
    Cheney_form.addEventListener('submit', function (Cheney_event) {
        Cheney_event.preventDefault();

        var Cheney_payload = {
            user: document.getElementById('Cheney_user').value.trim(),
            password: document.getElementById('Cheney_password').value,
            host: document.getElementById('Cheney_host').value.trim(),
            port: Number(document.getElementById('Cheney_port').value) || 0,
            database: document.getElementById('Cheney_database').value.trim()
        };

        Cheney_submitBtn.disabled = true;
        Cheney_submitBtn.textContent = '连接中…';

        fetch(Cheney_endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Cheney_payload)
        })
            .then(function (Cheney_res) {
                return Cheney_res.json();
            })
            .then(function (Cheney_json) {
                console.log('数据库连接测试返回：', Cheney_json);
                if (Cheney_json.code === 0) {
                    Cheney_renderResult(Cheney_json, true);
                } else {
                    console.error('数据库连接失败：', Cheney_json);
                    Cheney_renderResult(Cheney_json, false);
                }
            })
            .catch(function (Cheney_err) {
                console.error('请求接口异常：', Cheney_err.message);
                Cheney_resultIdle.hidden = true;
                Cheney_resultBody.hidden = false;
                Cheney_renderResult({
                    code: 50000,
                    msg: '请求接口异常：' + Cheney_err.message + '（请确认后端已启动）',
                    data: {}
                }, false);
            })
            .finally(function () {
                Cheney_submitBtn.disabled = false;
                Cheney_submitBtn.textContent = '测试连接';
            });
    });

    // 重置后回到初始状态
    Cheney_resetBtn.addEventListener('click', function () {
        Cheney_resultBox.classList.remove('Cheney_resultOk', 'Cheney_resultFail');
        Cheney_resultBody.hidden = true;
        Cheney_resultBody.innerHTML = '';
        Cheney_resultIdle.hidden = false;
        console.log('表单已重置为默认参数 root / 123456');
    });

    console.log('数据库测试页面已就绪，接口地址：' + Cheney_endpoint);
})();

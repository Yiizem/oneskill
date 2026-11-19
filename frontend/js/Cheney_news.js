/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻列表页脚本，请求 /api/news 渲染列表，并展示接口链接与返回数据
 */
(function () {
    'use strict';

    var Cheney_apiBase = window.location.origin + '/api';
    var Cheney_listEndpoint = Cheney_apiBase + '/news?page=1&pageSize=10';
    var Cheney_apiUrl = document.getElementById('Cheney_apiUrl');
    var Cheney_apiCode = document.getElementById('Cheney_apiCode');
    var Cheney_apiState = document.getElementById('Cheney_apiState');
    var Cheney_apiToggle = document.getElementById('Cheney_apiToggle');
    var Cheney_listBox = document.getElementById('Cheney_newsList');
    var Cheney_totalInfo = document.getElementById('Cheney_totalInfo');
    var Cheney_refreshBtn = document.getElementById('Cheney_refreshBtn');

    Cheney_apiUrl.textContent = Cheney_listEndpoint;
    Cheney_apiUrl.href = Cheney_listEndpoint;

    // 防止数据库内容中的特殊字符破坏结构
    function Cheney_escape(Cheney_text) {
        return String(Cheney_text === null || Cheney_text === undefined ? '' : Cheney_text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // 时间格式化：2026-11-18T09:20:00.000Z -> 2026-11-18 09:20
    function Cheney_formatTime(Cheney_value) {
        if (!Cheney_value) { return '—'; }
        var Cheney_date = new Date(Cheney_value);
        if (isNaN(Cheney_date.getTime())) { return String(Cheney_value); }
        var Cheney_pad = function (Cheney_n) { return String(Cheney_n).padStart(2, '0'); };
        return Cheney_date.getFullYear() + '-' + Cheney_pad(Cheney_date.getMonth() + 1) + '-' +
            Cheney_pad(Cheney_date.getDate()) + ' ' + Cheney_pad(Cheney_date.getHours()) + ':' +
            Cheney_pad(Cheney_date.getMinutes());
    }

    // 渲染单条新闻卡片
    function Cheney_createItem(Cheney_row, Cheney_index) {
        var Cheney_item = document.createElement('article');
        Cheney_item.className = 'Cheney_newsItem';
        Cheney_item.dataset.id = Cheney_row.Cheney_news_id;
        Cheney_item.innerHTML =
            '<div class="Cheney_newsTop">' +
                '<span class="Cheney_newsIndex">#' + Cheney_index + '</span>' +
                '<span class="Cheney_newsCategory">' + Cheney_escape(Cheney_row.Cheney_news_category) + '</span>' +
                '<h3 class="Cheney_newsTitle">' + Cheney_escape(Cheney_row.Cheney_news_title) + '</h3>' +
            '</div>' +
            '<p class="Cheney_newsSummary">' + Cheney_escape(Cheney_row.Cheney_news_summary) + '</p>' +
            '<div class="Cheney_newsMeta">' +
                '<span>来源：' + Cheney_escape(Cheney_row.Cheney_news_source) + '</span>' +
                '<span>作者：' + Cheney_escape(Cheney_row.Cheney_news_author) + '</span>' +
                '<span>发布时间：' + Cheney_formatTime(Cheney_row.Cheney_news_publish_time) + '</span>' +
                '<span>浏览：' + Cheney_row.Cheney_news_views + '</span>' +
            '</div>' +
            '<button class="Cheney_newsDetailBtn" type="button">查看详情</button>';
        return Cheney_item;
    }

    // 展开或收起详情正文
    function Cheney_bindDetail(Cheney_item) {
        var Cheney_btn = Cheney_item.querySelector('.Cheney_newsDetailBtn');
        var Cheney_id = Cheney_item.dataset.id;
        var Cheney_detailEndpoint = Cheney_apiBase + '/news/' + Cheney_id;

        Cheney_btn.addEventListener('click', function () {
            var Cheney_exist = Cheney_item.querySelector('.Cheney_newsContent');
            if (Cheney_exist) {
                Cheney_exist.remove();
                Cheney_btn.textContent = '查看详情';
                return;
            }

            Cheney_btn.textContent = '加载中…';
            fetch(Cheney_detailEndpoint)
                .then(function (Cheney_res) { return Cheney_res.json(); })
                .then(function (Cheney_json) {
                    console.log('新闻详情接口返回 ' + Cheney_detailEndpoint + '：', Cheney_json);
                    if (Cheney_json.code !== 0) {
                        throw new Error(Cheney_json.msg || '详情获取失败');
                    }
                    var Cheney_box = document.createElement('div');
                    Cheney_box.className = 'Cheney_newsContent';
                    Cheney_box.innerHTML =
                        '<div class="Cheney_newsContentHead">GET ' + Cheney_detailEndpoint + '</div>' +
                        Cheney_escape(Cheney_json.data.Cheney_news_content);
                    Cheney_item.appendChild(Cheney_box);
                    Cheney_btn.textContent = '收起详情';
                })
                .catch(function (Cheney_err) {
                    console.error('新闻详情获取失败：', Cheney_err.message);
                    Cheney_btn.textContent = '查看详情';
                    alert('详情获取失败：' + Cheney_err.message);
                });
        });
    }

    // 请求列表数据
    function Cheney_loadList() {
        Cheney_refreshBtn.disabled = true;
        fetch(Cheney_listEndpoint)
            .then(function (Cheney_res) { return Cheney_res.json(); })
            .then(function (Cheney_json) {
                console.log('科技新闻接口返回 ' + Cheney_listEndpoint + '：', Cheney_json);
                Cheney_apiCode.textContent = JSON.stringify(Cheney_json, null, 2);

                if (Cheney_json.code !== 0) {
                    throw new Error(Cheney_json.msg || '接口返回失败');
                }

                var Cheney_list = Cheney_json.data.Cheney_list || [];
                Cheney_apiState.textContent = 'code = 0 · ' + Cheney_list.length + ' 条';
                Cheney_totalInfo.textContent = '数据表共 ' + Cheney_json.data.Cheney_total + ' 条，当前展示 ' + Cheney_list.length + ' 条';

                Cheney_listBox.innerHTML = '';
                if (Cheney_list.length === 0) {
                    Cheney_listBox.innerHTML = '<div class="Cheney_empty">暂无新闻数据</div>';
                    return;
                }
                Cheney_list.forEach(function (Cheney_row, Cheney_i) {
                    var Cheney_item = Cheney_createItem(Cheney_row, Cheney_i + 1);
                    Cheney_bindDetail(Cheney_item);
                    Cheney_listBox.appendChild(Cheney_item);
                });
            })
            .catch(function (Cheney_err) {
                console.error('科技新闻列表请求失败：', Cheney_err.message);
                Cheney_apiState.textContent = '请求失败';
                Cheney_apiCode.textContent = '请求失败：' + Cheney_err.message;
                Cheney_listBox.innerHTML = '<div class="Cheney_empty">数据加载失败：' + Cheney_escape(Cheney_err.message) + '（请确认后端已启动）</div>';
            })
            .finally(function () {
                Cheney_refreshBtn.disabled = false;
            });
    }

    // 接口返回数据面板收起 / 展开
    Cheney_apiToggle.addEventListener('click', function () {
        var Cheney_hidden = Cheney_apiCode.hasAttribute('hidden');
        if (Cheney_hidden) {
            Cheney_apiCode.removeAttribute('hidden');
            Cheney_apiToggle.textContent = '收起返回数据';
        } else {
            Cheney_apiCode.setAttribute('hidden', 'hidden');
            Cheney_apiToggle.textContent = '展开返回数据';
        }
    });

    Cheney_refreshBtn.addEventListener('click', Cheney_loadList);

    Cheney_loadList();
})();

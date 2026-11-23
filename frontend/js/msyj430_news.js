/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻列表页脚本，请求 /api/news 渲染列表，并展示接口链接与返回数据
 */
(function () {
    'use strict';

    var msyj430_apiBase = window.location.origin + '/api';
    var msyj430_listEndpoint = msyj430_apiBase + '/news?page=1&pageSize=10';
    var msyj430_apiUrl = document.getElementById('msyj430_apiUrl');
    var msyj430_apiCode = document.getElementById('msyj430_apiCode');
    var msyj430_apiState = document.getElementById('msyj430_apiState');
    var msyj430_apiToggle = document.getElementById('msyj430_apiToggle');
    var msyj430_listBox = document.getElementById('msyj430_newsList');
    var msyj430_totalInfo = document.getElementById('msyj430_totalInfo');
    var msyj430_refreshBtn = document.getElementById('msyj430_refreshBtn');

    msyj430_apiUrl.textContent = msyj430_listEndpoint;
    msyj430_apiUrl.href = msyj430_listEndpoint;

    // 防止数据库内容中的特殊字符破坏结构
    function msyj430_escape(msyj430_text) {
        return String(msyj430_text === null || msyj430_text === undefined ? '' : msyj430_text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // 时间格式化：2026-11-18T09:20:00.000Z -> 2026-11-18 09:20
    function msyj430_formatTime(msyj430_value) {
        if (!msyj430_value) { return '—'; }
        var msyj430_date = new Date(msyj430_value);
        if (isNaN(msyj430_date.getTime())) { return String(msyj430_value); }
        var msyj430_pad = function (msyj430_n) { return String(msyj430_n).padStart(2, '0'); };
        return msyj430_date.getFullYear() + '-' + msyj430_pad(msyj430_date.getMonth() + 1) + '-' +
            msyj430_pad(msyj430_date.getDate()) + ' ' + msyj430_pad(msyj430_date.getHours()) + ':' +
            msyj430_pad(msyj430_date.getMinutes());
    }

    // 渲染单条新闻卡片
    function msyj430_createItem(msyj430_row, msyj430_index) {
        var msyj430_item = document.createElement('article');
        msyj430_item.className = 'msyj430_newsItem';
        msyj430_item.dataset.id = msyj430_row.msyj430_news_id;
        msyj430_item.innerHTML =
            '<div class="msyj430_newsTop">' +
                '<span class="msyj430_newsIndex">#' + msyj430_index + '</span>' +
                '<span class="msyj430_newsCategory">' + msyj430_escape(msyj430_row.msyj430_news_category) + '</span>' +
                '<h3 class="msyj430_newsTitle">' + msyj430_escape(msyj430_row.msyj430_news_title) + '</h3>' +
            '</div>' +
            '<p class="msyj430_newsSummary">' + msyj430_escape(msyj430_row.msyj430_news_summary) + '</p>' +
            '<div class="msyj430_newsMeta">' +
                '<span>来源：' + msyj430_escape(msyj430_row.msyj430_news_source) + '</span>' +
                '<span>作者：' + msyj430_escape(msyj430_row.msyj430_news_author) + '</span>' +
                '<span>发布时间：' + msyj430_formatTime(msyj430_row.msyj430_news_publish_time) + '</span>' +
                '<span>浏览：' + msyj430_row.msyj430_news_views + '</span>' +
            '</div>' +
            '<button class="msyj430_newsDetailBtn" type="button">查看详情</button>';
        return msyj430_item;
    }

    // 展开或收起详情正文
    function msyj430_bindDetail(msyj430_item) {
        var msyj430_btn = msyj430_item.querySelector('.msyj430_newsDetailBtn');
        var msyj430_id = msyj430_item.dataset.id;
        var msyj430_detailEndpoint = msyj430_apiBase + '/news/' + msyj430_id;

        msyj430_btn.addEventListener('click', function () {
            var msyj430_exist = msyj430_item.querySelector('.msyj430_newsContent');
            if (msyj430_exist) {
                msyj430_exist.remove();
                msyj430_btn.textContent = '查看详情';
                return;
            }

            msyj430_btn.textContent = '加载中…';
            fetch(msyj430_detailEndpoint)
                .then(function (msyj430_res) { return msyj430_res.json(); })
                .then(function (msyj430_json) {
                    console.log('新闻详情接口返回 ' + msyj430_detailEndpoint + '：', msyj430_json);
                    if (msyj430_json.code !== 0) {
                        throw new Error(msyj430_json.msg || '详情获取失败');
                    }
                    var msyj430_box = document.createElement('div');
                    msyj430_box.className = 'msyj430_newsContent';
                    msyj430_box.innerHTML =
                        '<div class="msyj430_newsContentHead">GET ' + msyj430_detailEndpoint + '</div>' +
                        msyj430_escape(msyj430_json.data.msyj430_news_content);
                    msyj430_item.appendChild(msyj430_box);
                    msyj430_btn.textContent = '收起详情';
                })
                .catch(function (msyj430_err) {
                    console.error('新闻详情获取失败：', msyj430_err.message);
                    msyj430_btn.textContent = '查看详情';
                    alert('详情获取失败：' + msyj430_err.message);
                });
        });
    }

    // 请求列表数据
    function msyj430_loadList() {
        msyj430_refreshBtn.disabled = true;
        fetch(msyj430_listEndpoint)
            .then(function (msyj430_res) { return msyj430_res.json(); })
            .then(function (msyj430_json) {
                console.log('科技新闻接口返回 ' + msyj430_listEndpoint + '：', msyj430_json);
                msyj430_apiCode.textContent = JSON.stringify(msyj430_json, null, 2);

                if (msyj430_json.code !== 0) {
                    throw new Error(msyj430_json.msg || '接口返回失败');
                }

                var msyj430_list = msyj430_json.data.msyj430_list || [];
                msyj430_apiState.textContent = 'code = 0 · ' + msyj430_list.length + ' 条';
                msyj430_totalInfo.textContent = '数据表共 ' + msyj430_json.data.msyj430_total + ' 条，当前展示 ' + msyj430_list.length + ' 条';

                msyj430_listBox.innerHTML = '';
                if (msyj430_list.length === 0) {
                    msyj430_listBox.innerHTML = '<div class="msyj430_empty">暂无新闻数据</div>';
                    return;
                }
                msyj430_list.forEach(function (msyj430_row, msyj430_i) {
                    var msyj430_item = msyj430_createItem(msyj430_row, msyj430_i + 1);
                    msyj430_bindDetail(msyj430_item);
                    msyj430_listBox.appendChild(msyj430_item);
                });
            })
            .catch(function (msyj430_err) {
                console.error('科技新闻列表请求失败：', msyj430_err.message);
                msyj430_apiState.textContent = '请求失败';
                msyj430_apiCode.textContent = '请求失败：' + msyj430_err.message;
                msyj430_listBox.innerHTML = '<div class="msyj430_empty">数据加载失败：' + msyj430_escape(msyj430_err.message) + '（请确认后端已启动）</div>';
            })
            .finally(function () {
                msyj430_refreshBtn.disabled = false;
            });
    }

    // 接口返回数据面板收起 / 展开
    msyj430_apiToggle.addEventListener('click', function () {
        var msyj430_hidden = msyj430_apiCode.hasAttribute('hidden');
        if (msyj430_hidden) {
            msyj430_apiCode.removeAttribute('hidden');
            msyj430_apiToggle.textContent = '收起返回数据';
        } else {
            msyj430_apiCode.setAttribute('hidden', 'hidden');
            msyj430_apiToggle.textContent = '展开返回数据';
        }
    });

    msyj430_refreshBtn.addEventListener('click', msyj430_loadList);

    msyj430_loadList();
})();

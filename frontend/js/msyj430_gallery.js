/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：图文列表页脚本，请求 /api/gallery 渲染图片卡片，并展示接口链接与返回数据
 */
(function () {
    'use strict';

    var msyj430_apiBase = window.location.origin + '/api';
    var msyj430_listEndpoint = msyj430_apiBase + '/gallery?page=1&pageSize=10';
    var msyj430_apiUrl = document.getElementById('msyj430_apiUrl');
    var msyj430_apiCode = document.getElementById('msyj430_apiCode');
    var msyj430_apiState = document.getElementById('msyj430_apiState');
    var msyj430_apiToggle = document.getElementById('msyj430_apiToggle');
    var msyj430_grid = document.getElementById('msyj430_galleryGrid');
    var msyj430_totalInfo = document.getElementById('msyj430_totalInfo');
    var msyj430_refreshBtn = document.getElementById('msyj430_refreshBtn');
    var msyj430_lightbox = document.getElementById('msyj430_lightbox');
    var msyj430_lightboxImg = document.getElementById('msyj430_lightboxImg');
    var msyj430_lightboxTitle = document.getElementById('msyj430_lightboxTitle');
    var msyj430_lightboxDesc = document.getElementById('msyj430_lightboxDesc');
    var msyj430_lightboxMeta = document.getElementById('msyj430_lightboxMeta');
    var msyj430_lightboxCode = document.getElementById('msyj430_lightboxCode');
    var msyj430_lightboxClose = document.getElementById('msyj430_lightboxClose');

    msyj430_apiUrl.textContent = msyj430_listEndpoint;
    msyj430_apiUrl.href = msyj430_listEndpoint;

    function msyj430_escape(msyj430_text) {
        return String(msyj430_text === null || msyj430_text === undefined ? '' : msyj430_text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function msyj430_formatTime(msyj430_value) {
        if (!msyj430_value) { return '—'; }
        var msyj430_date = new Date(msyj430_value);
        if (isNaN(msyj430_date.getTime())) { return String(msyj430_value); }
        var msyj430_pad = function (msyj430_n) { return String(msyj430_n).padStart(2, '0'); };
        return msyj430_date.getFullYear() + '-' + msyj430_pad(msyj430_date.getMonth() + 1) + '-' +
            msyj430_pad(msyj430_date.getDate()) + ' ' + msyj430_pad(msyj430_date.getHours()) + ':' +
            msyj430_pad(msyj430_date.getMinutes());
    }

    // 打开图文详情预览
    function msyj430_openDetail(msyj430_id) {
        var msyj430_detailEndpoint = msyj430_apiBase + '/gallery/' + msyj430_id;
        fetch(msyj430_detailEndpoint)
            .then(function (msyj430_res) { return msyj430_res.json(); })
            .then(function (msyj430_json) {
                console.log('图文详情接口返回 ' + msyj430_detailEndpoint + '：', msyj430_json);
                if (msyj430_json.code !== 0) {
                    throw new Error(msyj430_json.msg || '详情获取失败');
                }
                var msyj430_data = msyj430_json.data;
                msyj430_lightboxImg.src = msyj430_data.msyj430_gallery_image;
                msyj430_lightboxImg.alt = msyj430_data.msyj430_gallery_title;
                msyj430_lightboxTitle.textContent = msyj430_data.msyj430_gallery_title;
                msyj430_lightboxDesc.textContent = msyj430_data.msyj430_gallery_description;
                msyj430_lightboxMeta.innerHTML =
                    '<span>分类：' + msyj430_escape(msyj430_data.msyj430_gallery_category) + '</span>' +
                    '<span>来源：' + msyj430_escape(msyj430_data.msyj430_gallery_source) + '</span>' +
                    '<span>时间：' + msyj430_formatTime(msyj430_data.msyj430_gallery_publish_time) + '</span>' +
                    '<span>浏览：' + msyj430_data.msyj430_gallery_views + '</span>';
                msyj430_lightboxCode.textContent = JSON.stringify(msyj430_json, null, 2);
                msyj430_lightbox.classList.add('isOpen');
            })
            .catch(function (msyj430_err) {
                console.error('图文详情获取失败：', msyj430_err.message);
                alert('详情获取失败：' + msyj430_err.message);
            });
    }

    // 渲染单个图文卡片
    function msyj430_createCard(msyj430_row) {
        var msyj430_card = document.createElement('article');
        msyj430_card.className = 'msyj430_galleryCard';
        msyj430_card.innerHTML =
            '<div class="msyj430_galleryFigure">' +
                '<span class="msyj430_galleryCat">' + msyj430_escape(msyj430_row.msyj430_gallery_category) + '</span>' +
                '<img src="' + msyj430_escape(msyj430_row.msyj430_gallery_image) + '" alt="' +
                msyj430_escape(msyj430_row.msyj430_gallery_title) + '" loading="lazy">' +
            '</div>' +
            '<div class="msyj430_galleryBody">' +
                '<h3 class="msyj430_galleryTitle">' + msyj430_escape(msyj430_row.msyj430_gallery_title) + '</h3>' +
                '<p class="msyj430_galleryDesc">' + msyj430_escape(msyj430_row.msyj430_gallery_description) + '</p>' +
                '<div class="msyj430_galleryMeta">' +
                    '<span>' + msyj430_formatTime(msyj430_row.msyj430_gallery_publish_time) + ' · ' + msyj430_row.msyj430_gallery_views + ' 次浏览</span>' +
                    '<span class="msyj430_galleryMore">查看详情</span>' +
                '</div>' +
            '</div>';

        msyj430_card.querySelector('.msyj430_galleryMore').addEventListener('click', function () {
            msyj430_openDetail(msyj430_row.msyj430_gallery_id);
        });
        msyj430_card.querySelector('.msyj430_galleryFigure').addEventListener('click', function () {
            msyj430_openDetail(msyj430_row.msyj430_gallery_id);
        });
        return msyj430_card;
    }

    // 请求图文列表
    function msyj430_loadGallery() {
        msyj430_refreshBtn.disabled = true;
        fetch(msyj430_listEndpoint)
            .then(function (msyj430_res) { return msyj430_res.json(); })
            .then(function (msyj430_json) {
                console.log('图文列表接口返回 ' + msyj430_listEndpoint + '：', msyj430_json);
                msyj430_apiCode.textContent = JSON.stringify(msyj430_json, null, 2);

                if (msyj430_json.code !== 0) {
                    throw new Error(msyj430_json.msg || '接口返回失败');
                }

                var msyj430_list = msyj430_json.data.msyj430_list || [];
                msyj430_apiState.textContent = 'code = 0 · ' + msyj430_list.length + ' 条';
                msyj430_totalInfo.textContent = '数据表共 ' + msyj430_json.data.msyj430_total + ' 条，当前展示 ' + msyj430_list.length + ' 条';

                msyj430_grid.innerHTML = '';
                if (msyj430_list.length === 0) {
                    msyj430_grid.innerHTML = '<div class="msyj430_empty">暂无图文数据</div>';
                    return;
                }
                msyj430_list.forEach(function (msyj430_row) {
                    msyj430_grid.appendChild(msyj430_createCard(msyj430_row));
                });
            })
            .catch(function (msyj430_err) {
                console.error('图文列表请求失败：', msyj430_err.message);
                msyj430_apiState.textContent = '请求失败';
                msyj430_apiCode.textContent = '请求失败：' + msyj430_err.message;
                msyj430_grid.innerHTML = '<div class="msyj430_empty">数据加载失败：' + msyj430_escape(msyj430_err.message) + '（请确认后端已启动）</div>';
            })
            .finally(function () {
                msyj430_refreshBtn.disabled = false;
            });
    }

    // 关闭预览
    function msyj430_closeDetail() {
        msyj430_lightbox.classList.remove('isOpen');
    }

    msyj430_lightboxClose.addEventListener('click', msyj430_closeDetail);
    msyj430_lightbox.addEventListener('click', function (msyj430_event) {
        if (msyj430_event.target === msyj430_lightbox) { msyj430_closeDetail(); }
    });
    document.addEventListener('keydown', function (msyj430_event) {
        if (msyj430_event.key === 'Escape') { msyj430_closeDetail(); }
    });

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

    msyj430_refreshBtn.addEventListener('click', msyj430_loadGallery);

    msyj430_loadGallery();
})();

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：图文列表页脚本，请求 /api/gallery 渲染图片卡片，并展示接口链接与返回数据
 */
(function () {
    'use strict';

    var Cheney_apiBase = window.location.origin + '/api';
    var Cheney_listEndpoint = Cheney_apiBase + '/gallery?page=1&pageSize=10';
    var Cheney_apiUrl = document.getElementById('Cheney_apiUrl');
    var Cheney_apiCode = document.getElementById('Cheney_apiCode');
    var Cheney_apiState = document.getElementById('Cheney_apiState');
    var Cheney_apiToggle = document.getElementById('Cheney_apiToggle');
    var Cheney_grid = document.getElementById('Cheney_galleryGrid');
    var Cheney_totalInfo = document.getElementById('Cheney_totalInfo');
    var Cheney_refreshBtn = document.getElementById('Cheney_refreshBtn');
    var Cheney_lightbox = document.getElementById('Cheney_lightbox');
    var Cheney_lightboxImg = document.getElementById('Cheney_lightboxImg');
    var Cheney_lightboxTitle = document.getElementById('Cheney_lightboxTitle');
    var Cheney_lightboxDesc = document.getElementById('Cheney_lightboxDesc');
    var Cheney_lightboxMeta = document.getElementById('Cheney_lightboxMeta');
    var Cheney_lightboxCode = document.getElementById('Cheney_lightboxCode');
    var Cheney_lightboxClose = document.getElementById('Cheney_lightboxClose');

    Cheney_apiUrl.textContent = Cheney_listEndpoint;
    Cheney_apiUrl.href = Cheney_listEndpoint;

    function Cheney_escape(Cheney_text) {
        return String(Cheney_text === null || Cheney_text === undefined ? '' : Cheney_text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function Cheney_formatTime(Cheney_value) {
        if (!Cheney_value) { return '—'; }
        var Cheney_date = new Date(Cheney_value);
        if (isNaN(Cheney_date.getTime())) { return String(Cheney_value); }
        var Cheney_pad = function (Cheney_n) { return String(Cheney_n).padStart(2, '0'); };
        return Cheney_date.getFullYear() + '-' + Cheney_pad(Cheney_date.getMonth() + 1) + '-' +
            Cheney_pad(Cheney_date.getDate()) + ' ' + Cheney_pad(Cheney_date.getHours()) + ':' +
            Cheney_pad(Cheney_date.getMinutes());
    }

    // 打开图文详情预览
    function Cheney_openDetail(Cheney_id) {
        var Cheney_detailEndpoint = Cheney_apiBase + '/gallery/' + Cheney_id;
        fetch(Cheney_detailEndpoint)
            .then(function (Cheney_res) { return Cheney_res.json(); })
            .then(function (Cheney_json) {
                console.log('图文详情接口返回 ' + Cheney_detailEndpoint + '：', Cheney_json);
                if (Cheney_json.code !== 0) {
                    throw new Error(Cheney_json.msg || '详情获取失败');
                }
                var Cheney_data = Cheney_json.data;
                Cheney_lightboxImg.src = Cheney_data.Cheney_gallery_image;
                Cheney_lightboxImg.alt = Cheney_data.Cheney_gallery_title;
                Cheney_lightboxTitle.textContent = Cheney_data.Cheney_gallery_title;
                Cheney_lightboxDesc.textContent = Cheney_data.Cheney_gallery_description;
                Cheney_lightboxMeta.innerHTML =
                    '<span>分类：' + Cheney_escape(Cheney_data.Cheney_gallery_category) + '</span>' +
                    '<span>来源：' + Cheney_escape(Cheney_data.Cheney_gallery_source) + '</span>' +
                    '<span>时间：' + Cheney_formatTime(Cheney_data.Cheney_gallery_publish_time) + '</span>' +
                    '<span>浏览：' + Cheney_data.Cheney_gallery_views + '</span>';
                Cheney_lightboxCode.textContent = JSON.stringify(Cheney_json, null, 2);
                Cheney_lightbox.classList.add('isOpen');
            })
            .catch(function (Cheney_err) {
                console.error('图文详情获取失败：', Cheney_err.message);
                alert('详情获取失败：' + Cheney_err.message);
            });
    }

    // 渲染单个图文卡片
    function Cheney_createCard(Cheney_row) {
        var Cheney_card = document.createElement('article');
        Cheney_card.className = 'Cheney_galleryCard';
        Cheney_card.innerHTML =
            '<div class="Cheney_galleryFigure">' +
                '<span class="Cheney_galleryCat">' + Cheney_escape(Cheney_row.Cheney_gallery_category) + '</span>' +
                '<img src="' + Cheney_escape(Cheney_row.Cheney_gallery_image) + '" alt="' +
                Cheney_escape(Cheney_row.Cheney_gallery_title) + '" loading="lazy">' +
            '</div>' +
            '<div class="Cheney_galleryBody">' +
                '<h3 class="Cheney_galleryTitle">' + Cheney_escape(Cheney_row.Cheney_gallery_title) + '</h3>' +
                '<p class="Cheney_galleryDesc">' + Cheney_escape(Cheney_row.Cheney_gallery_description) + '</p>' +
                '<div class="Cheney_galleryMeta">' +
                    '<span>' + Cheney_formatTime(Cheney_row.Cheney_gallery_publish_time) + ' · ' + Cheney_row.Cheney_gallery_views + ' 次浏览</span>' +
                    '<span class="Cheney_galleryMore">查看详情</span>' +
                '</div>' +
            '</div>';

        Cheney_card.querySelector('.Cheney_galleryMore').addEventListener('click', function () {
            Cheney_openDetail(Cheney_row.Cheney_gallery_id);
        });
        Cheney_card.querySelector('.Cheney_galleryFigure').addEventListener('click', function () {
            Cheney_openDetail(Cheney_row.Cheney_gallery_id);
        });
        return Cheney_card;
    }

    // 请求图文列表
    function Cheney_loadGallery() {
        Cheney_refreshBtn.disabled = true;
        fetch(Cheney_listEndpoint)
            .then(function (Cheney_res) { return Cheney_res.json(); })
            .then(function (Cheney_json) {
                console.log('图文列表接口返回 ' + Cheney_listEndpoint + '：', Cheney_json);
                Cheney_apiCode.textContent = JSON.stringify(Cheney_json, null, 2);

                if (Cheney_json.code !== 0) {
                    throw new Error(Cheney_json.msg || '接口返回失败');
                }

                var Cheney_list = Cheney_json.data.Cheney_list || [];
                Cheney_apiState.textContent = 'code = 0 · ' + Cheney_list.length + ' 条';
                Cheney_totalInfo.textContent = '数据表共 ' + Cheney_json.data.Cheney_total + ' 条，当前展示 ' + Cheney_list.length + ' 条';

                Cheney_grid.innerHTML = '';
                if (Cheney_list.length === 0) {
                    Cheney_grid.innerHTML = '<div class="Cheney_empty">暂无图文数据</div>';
                    return;
                }
                Cheney_list.forEach(function (Cheney_row) {
                    Cheney_grid.appendChild(Cheney_createCard(Cheney_row));
                });
            })
            .catch(function (Cheney_err) {
                console.error('图文列表请求失败：', Cheney_err.message);
                Cheney_apiState.textContent = '请求失败';
                Cheney_apiCode.textContent = '请求失败：' + Cheney_err.message;
                Cheney_grid.innerHTML = '<div class="Cheney_empty">数据加载失败：' + Cheney_escape(Cheney_err.message) + '（请确认后端已启动）</div>';
            })
            .finally(function () {
                Cheney_refreshBtn.disabled = false;
            });
    }

    // 关闭预览
    function Cheney_closeDetail() {
        Cheney_lightbox.classList.remove('isOpen');
    }

    Cheney_lightboxClose.addEventListener('click', Cheney_closeDetail);
    Cheney_lightbox.addEventListener('click', function (Cheney_event) {
        if (Cheney_event.target === Cheney_lightbox) { Cheney_closeDetail(); }
    });
    document.addEventListener('keydown', function (Cheney_event) {
        if (Cheney_event.key === 'Escape') { Cheney_closeDetail(); }
    });

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

    Cheney_refreshBtn.addEventListener('click', Cheney_loadGallery);

    Cheney_loadGallery();
})();

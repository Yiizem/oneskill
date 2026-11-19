/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：首页 canvas 粒子背景动画（粒子漂浮 + 邻近连线 + 鼠标吸附）
 */
(function () {
    'use strict';

    var Cheney_canvas = document.getElementById('Cheney_heroCanvas');
    if (!Cheney_canvas) { return; }

    var Cheney_ctx = Cheney_canvas.getContext('2d');
    var Cheney_width = 0;
    var Cheney_height = 0;
    var Cheney_ratio = 1;
    var Cheney_particles = [];
    var Cheney_rafId = 0;
    var Cheney_mouse = { Cheney_x: -9999, Cheney_y: -9999, Cheney_inside: false };
    var Cheney_maxLinkDistance = 160;

    // 依据容器尺寸计算粒子数量，避免小屏幕过密
    function Cheney_createParticles() {
        var Cheney_count = Math.round((Cheney_width * Cheney_height) / 9000);
        Cheney_count = Math.min(Math.max(Cheney_count, 48), 132);
        Cheney_particles = [];
        for (var Cheney_i = 0; Cheney_i < Cheney_count; Cheney_i++) {
            Cheney_particles.push({
                Cheney_px: Math.random() * Cheney_width,
                Cheney_py: Math.random() * Cheney_height,
                Cheney_vx: (Math.random() - 0.5) * 0.42,
                Cheney_vy: (Math.random() - 0.5) * 0.42,
                Cheney_radius: Math.random() * 2.2 + 1.1,
                Cheney_alpha: Math.random() * 0.5 + 0.5
            });
        }
    }

    // 处理画布尺寸与高分屏缩放
    function Cheney_resize() {
        var Cheney_box = Cheney_canvas.getBoundingClientRect();
        Cheney_ratio = window.devicePixelRatio || 1;
        Cheney_width = Cheney_box.width;
        Cheney_height = Cheney_box.height;
        Cheney_canvas.width = Math.round(Cheney_width * Cheney_ratio);
        Cheney_canvas.height = Math.round(Cheney_height * Cheney_ratio);
        Cheney_ctx.setTransform(Cheney_ratio, 0, 0, Cheney_ratio, 0, 0);
        Cheney_createParticles();
    }

    // 单个粒子移动与边界回弹
    function Cheney_moveParticle(Cheney_p) {
        Cheney_p.Cheney_px += Cheney_p.Cheney_vx;
        Cheney_p.Cheney_py += Cheney_p.Cheney_vy;
        if (Cheney_p.Cheney_px < 0 || Cheney_p.Cheney_px > Cheney_width) { Cheney_p.Cheney_vx *= -1; }
        if (Cheney_p.Cheney_py < 0 || Cheney_p.Cheney_py > Cheney_height) { Cheney_p.Cheney_vy *= -1; }
        Cheney_p.Cheney_px = Math.min(Math.max(Cheney_p.Cheney_px, 0), Cheney_width);
        Cheney_p.Cheney_py = Math.min(Math.max(Cheney_p.Cheney_py, 0), Cheney_height);
    }

    // 主绘制循环
    function Cheney_draw() {
        Cheney_ctx.clearRect(0, 0, Cheney_width, Cheney_height);

        var Cheney_len = Cheney_particles.length;
        for (var Cheney_i = 0; Cheney_i < Cheney_len; Cheney_i++) {
            var Cheney_p = Cheney_particles[Cheney_i];
            Cheney_moveParticle(Cheney_p);

            // 鼠标附近的粒子轻微加速，形成跟随感
            if (Cheney_mouse.Cheney_inside) {
                var Cheney_dx = Cheney_p.Cheney_px - Cheney_mouse.Cheney_x;
                var Cheney_dy = Cheney_p.Cheney_py - Cheney_mouse.Cheney_y;
                var Cheney_dist = Math.sqrt(Cheney_dx * Cheney_dx + Cheney_dy * Cheney_dy);
                if (Cheney_dist < 110 && Cheney_dist > 0.001) {
                    Cheney_p.Cheney_px += (Cheney_dx / Cheney_dist) * 0.35;
                    Cheney_p.Cheney_py += (Cheney_dy / Cheney_dist) * 0.35;
                }
            }

            Cheney_ctx.beginPath();
            Cheney_ctx.arc(Cheney_p.Cheney_px, Cheney_p.Cheney_py, Cheney_p.Cheney_radius, 0, Math.PI * 2);
            Cheney_ctx.fillStyle = 'rgba(120, 226, 255, ' + Cheney_p.Cheney_alpha + ')';
            Cheney_ctx.fill();
        }

        // 邻近粒子连线
        for (var Cheney_a = 0; Cheney_a < Cheney_len; Cheney_a++) {
            for (var Cheney_b = Cheney_a + 1; Cheney_b < Cheney_len; Cheney_b++) {
                var Cheney_pa = Cheney_particles[Cheney_a];
                var Cheney_pb = Cheney_particles[Cheney_b];
                var Cheney_gapX = Cheney_pa.Cheney_px - Cheney_pb.Cheney_px;
                var Cheney_gapY = Cheney_pa.Cheney_py - Cheney_pb.Cheney_py;
                var Cheney_gap = Math.sqrt(Cheney_gapX * Cheney_gapX + Cheney_gapY * Cheney_gapY);
                if (Cheney_gap < Cheney_maxLinkDistance) {
                    var Cheney_lineAlpha = (1 - Cheney_gap / Cheney_maxLinkDistance) * 0.5;
                    Cheney_ctx.beginPath();
                    Cheney_ctx.strokeStyle = 'rgba(78, 225, 255, ' + Cheney_lineAlpha.toFixed(3) + ')';
                    Cheney_ctx.lineWidth = 0.8;
                    Cheney_ctx.moveTo(Cheney_pa.Cheney_px, Cheney_pa.Cheney_py);
                    Cheney_ctx.lineTo(Cheney_pb.Cheney_px, Cheney_pb.Cheney_py);
                    Cheney_ctx.stroke();
                }
            }
        }

        // 鼠标与粒子的连线
        if (Cheney_mouse.Cheney_inside) {
            for (var Cheney_m = 0; Cheney_m < Cheney_len; Cheney_m++) {
                var Cheney_pm = Cheney_particles[Cheney_m];
                var Cheney_mx = Cheney_pm.Cheney_px - Cheney_mouse.Cheney_x;
                var Cheney_my = Cheney_pm.Cheney_py - Cheney_mouse.Cheney_y;
                var Cheney_mDist = Math.sqrt(Cheney_mx * Cheney_mx + Cheney_my * Cheney_my);
                if (Cheney_mDist < 170) {
                    Cheney_ctx.beginPath();
                    Cheney_ctx.strokeStyle = 'rgba(139, 107, 255, ' + ((1 - Cheney_mDist / 170) * 0.42).toFixed(3) + ')';
                    Cheney_ctx.lineWidth = 1;
                    Cheney_ctx.moveTo(Cheney_pm.Cheney_px, Cheney_pm.Cheney_py);
                    Cheney_ctx.lineTo(Cheney_mouse.Cheney_x, Cheney_mouse.Cheney_y);
                    Cheney_ctx.stroke();
                }
            }
        }

        Cheney_rafId = window.requestAnimationFrame(Cheney_draw);
    }

    // 只在鼠标位于画布内时参与计算
    Cheney_canvas.addEventListener('mousemove', function (Cheney_event) {
        var Cheney_box = Cheney_canvas.getBoundingClientRect();
        Cheney_mouse.Cheney_x = Cheney_event.clientX - Cheney_box.left;
        Cheney_mouse.Cheney_y = Cheney_event.clientY - Cheney_box.top;
        Cheney_mouse.Cheney_inside = true;
    });

    Cheney_canvas.addEventListener('mouseleave', function () {
        Cheney_mouse.Cheney_inside = false;
        Cheney_mouse.Cheney_x = -9999;
        Cheney_mouse.Cheney_y = -9999;
    });

    window.addEventListener('resize', function () {
        window.clearTimeout(Cheney_canvas.Cheney_resizeTimer);
        Cheney_canvas.Cheney_resizeTimer = window.setTimeout(Cheney_resize, 160);
    });

    // 用户开启减少动画时只静态渲染一帧
    var Cheney_reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Cheney_resize();
    if (Cheney_reduceMotion) {
        Cheney_ctx.clearRect(0, 0, Cheney_width, Cheney_height);
        for (var Cheney_k = 0; Cheney_k < Cheney_particles.length; Cheney_k++) {
            var Cheney_staticP = Cheney_particles[Cheney_k];
            Cheney_ctx.beginPath();
            Cheney_ctx.arc(Cheney_staticP.Cheney_px, Cheney_staticP.Cheney_py, Cheney_staticP.Cheney_radius, 0, Math.PI * 2);
            Cheney_ctx.fillStyle = 'rgba(120, 226, 255, 0.5)';
            Cheney_ctx.fill();
        }
    } else {
        Cheney_draw();
    }

    // 页面隐藏时暂停动画，减少资源占用
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            window.cancelAnimationFrame(Cheney_rafId);
        } else if (!Cheney_reduceMotion) {
            Cheney_rafId = window.requestAnimationFrame(Cheney_draw);
        }
    });
})();

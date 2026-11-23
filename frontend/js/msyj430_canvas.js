/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：首页 canvas 粒子背景动画（粒子漂浮 + 邻近连线 + 鼠标吸附）
 */
(function () {
    'use strict';

    var msyj430_canvas = document.getElementById('msyj430_heroCanvas');
    if (!msyj430_canvas) { return; }

    var msyj430_ctx = msyj430_canvas.getContext('2d');
    var msyj430_width = 0;
    var msyj430_height = 0;
    var msyj430_ratio = 1;
    var msyj430_particles = [];
    var msyj430_rafId = 0;
    var msyj430_mouse = { msyj430_x: -9999, msyj430_y: -9999, msyj430_inside: false };
    var msyj430_maxLinkDistance = 160;

    // 依据容器尺寸计算粒子数量，避免小屏幕过密
    function msyj430_createParticles() {
        var msyj430_count = Math.round((msyj430_width * msyj430_height) / 9000);
        msyj430_count = Math.min(Math.max(msyj430_count, 48), 132);
        msyj430_particles = [];
        for (var msyj430_i = 0; msyj430_i < msyj430_count; msyj430_i++) {
            msyj430_particles.push({
                msyj430_px: Math.random() * msyj430_width,
                msyj430_py: Math.random() * msyj430_height,
                msyj430_vx: (Math.random() - 0.5) * 0.42,
                msyj430_vy: (Math.random() - 0.5) * 0.42,
                msyj430_radius: Math.random() * 2.2 + 1.1,
                msyj430_alpha: Math.random() * 0.5 + 0.5
            });
        }
    }

    // 处理画布尺寸与高分屏缩放
    function msyj430_resize() {
        var msyj430_box = msyj430_canvas.getBoundingClientRect();
        msyj430_ratio = window.devicePixelRatio || 1;
        msyj430_width = msyj430_box.width;
        msyj430_height = msyj430_box.height;
        msyj430_canvas.width = Math.round(msyj430_width * msyj430_ratio);
        msyj430_canvas.height = Math.round(msyj430_height * msyj430_ratio);
        msyj430_ctx.setTransform(msyj430_ratio, 0, 0, msyj430_ratio, 0, 0);
        msyj430_createParticles();
    }

    // 单个粒子移动与边界回弹
    function msyj430_moveParticle(msyj430_p) {
        msyj430_p.msyj430_px += msyj430_p.msyj430_vx;
        msyj430_p.msyj430_py += msyj430_p.msyj430_vy;
        if (msyj430_p.msyj430_px < 0 || msyj430_p.msyj430_px > msyj430_width) { msyj430_p.msyj430_vx *= -1; }
        if (msyj430_p.msyj430_py < 0 || msyj430_p.msyj430_py > msyj430_height) { msyj430_p.msyj430_vy *= -1; }
        msyj430_p.msyj430_px = Math.min(Math.max(msyj430_p.msyj430_px, 0), msyj430_width);
        msyj430_p.msyj430_py = Math.min(Math.max(msyj430_p.msyj430_py, 0), msyj430_height);
    }

    // 主绘制循环
    function msyj430_draw() {
        msyj430_ctx.clearRect(0, 0, msyj430_width, msyj430_height);

        var msyj430_len = msyj430_particles.length;
        for (var msyj430_i = 0; msyj430_i < msyj430_len; msyj430_i++) {
            var msyj430_p = msyj430_particles[msyj430_i];
            msyj430_moveParticle(msyj430_p);

            // 鼠标附近的粒子轻微加速，形成跟随感
            if (msyj430_mouse.msyj430_inside) {
                var msyj430_dx = msyj430_p.msyj430_px - msyj430_mouse.msyj430_x;
                var msyj430_dy = msyj430_p.msyj430_py - msyj430_mouse.msyj430_y;
                var msyj430_dist = Math.sqrt(msyj430_dx * msyj430_dx + msyj430_dy * msyj430_dy);
                if (msyj430_dist < 110 && msyj430_dist > 0.001) {
                    msyj430_p.msyj430_px += (msyj430_dx / msyj430_dist) * 0.35;
                    msyj430_p.msyj430_py += (msyj430_dy / msyj430_dist) * 0.35;
                }
            }

            msyj430_ctx.beginPath();
            msyj430_ctx.arc(msyj430_p.msyj430_px, msyj430_p.msyj430_py, msyj430_p.msyj430_radius, 0, Math.PI * 2);
            msyj430_ctx.fillStyle = 'rgba(120, 226, 255, ' + msyj430_p.msyj430_alpha + ')';
            msyj430_ctx.fill();
        }

        // 邻近粒子连线
        for (var msyj430_a = 0; msyj430_a < msyj430_len; msyj430_a++) {
            for (var msyj430_b = msyj430_a + 1; msyj430_b < msyj430_len; msyj430_b++) {
                var msyj430_pa = msyj430_particles[msyj430_a];
                var msyj430_pb = msyj430_particles[msyj430_b];
                var msyj430_gapX = msyj430_pa.msyj430_px - msyj430_pb.msyj430_px;
                var msyj430_gapY = msyj430_pa.msyj430_py - msyj430_pb.msyj430_py;
                var msyj430_gap = Math.sqrt(msyj430_gapX * msyj430_gapX + msyj430_gapY * msyj430_gapY);
                if (msyj430_gap < msyj430_maxLinkDistance) {
                    var msyj430_lineAlpha = (1 - msyj430_gap / msyj430_maxLinkDistance) * 0.5;
                    msyj430_ctx.beginPath();
                    msyj430_ctx.strokeStyle = 'rgba(78, 225, 255, ' + msyj430_lineAlpha.toFixed(3) + ')';
                    msyj430_ctx.lineWidth = 0.8;
                    msyj430_ctx.moveTo(msyj430_pa.msyj430_px, msyj430_pa.msyj430_py);
                    msyj430_ctx.lineTo(msyj430_pb.msyj430_px, msyj430_pb.msyj430_py);
                    msyj430_ctx.stroke();
                }
            }
        }

        // 鼠标与粒子的连线
        if (msyj430_mouse.msyj430_inside) {
            for (var msyj430_m = 0; msyj430_m < msyj430_len; msyj430_m++) {
                var msyj430_pm = msyj430_particles[msyj430_m];
                var msyj430_mx = msyj430_pm.msyj430_px - msyj430_mouse.msyj430_x;
                var msyj430_my = msyj430_pm.msyj430_py - msyj430_mouse.msyj430_y;
                var msyj430_mDist = Math.sqrt(msyj430_mx * msyj430_mx + msyj430_my * msyj430_my);
                if (msyj430_mDist < 170) {
                    msyj430_ctx.beginPath();
                    msyj430_ctx.strokeStyle = 'rgba(139, 107, 255, ' + ((1 - msyj430_mDist / 170) * 0.42).toFixed(3) + ')';
                    msyj430_ctx.lineWidth = 1;
                    msyj430_ctx.moveTo(msyj430_pm.msyj430_px, msyj430_pm.msyj430_py);
                    msyj430_ctx.lineTo(msyj430_mouse.msyj430_x, msyj430_mouse.msyj430_y);
                    msyj430_ctx.stroke();
                }
            }
        }

        msyj430_rafId = window.requestAnimationFrame(msyj430_draw);
    }

    // 只在鼠标位于画布内时参与计算
    msyj430_canvas.addEventListener('mousemove', function (msyj430_event) {
        var msyj430_box = msyj430_canvas.getBoundingClientRect();
        msyj430_mouse.msyj430_x = msyj430_event.clientX - msyj430_box.left;
        msyj430_mouse.msyj430_y = msyj430_event.clientY - msyj430_box.top;
        msyj430_mouse.msyj430_inside = true;
    });

    msyj430_canvas.addEventListener('mouseleave', function () {
        msyj430_mouse.msyj430_inside = false;
        msyj430_mouse.msyj430_x = -9999;
        msyj430_mouse.msyj430_y = -9999;
    });

    window.addEventListener('resize', function () {
        window.clearTimeout(msyj430_canvas.msyj430_resizeTimer);
        msyj430_canvas.msyj430_resizeTimer = window.setTimeout(msyj430_resize, 160);
    });

    // 用户开启减少动画时只静态渲染一帧
    var msyj430_reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    msyj430_resize();
    if (msyj430_reduceMotion) {
        msyj430_ctx.clearRect(0, 0, msyj430_width, msyj430_height);
        for (var msyj430_k = 0; msyj430_k < msyj430_particles.length; msyj430_k++) {
            var msyj430_staticP = msyj430_particles[msyj430_k];
            msyj430_ctx.beginPath();
            msyj430_ctx.arc(msyj430_staticP.msyj430_px, msyj430_staticP.msyj430_py, msyj430_staticP.msyj430_radius, 0, Math.PI * 2);
            msyj430_ctx.fillStyle = 'rgba(120, 226, 255, 0.5)';
            msyj430_ctx.fill();
        }
    } else {
        msyj430_draw();
    }

    // 页面隐藏时暂停动画，减少资源占用
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            window.cancelAnimationFrame(msyj430_rafId);
        } else if (!msyj430_reduceMotion) {
            msyj430_rafId = window.requestAnimationFrame(msyj430_draw);
        }
    });
})();

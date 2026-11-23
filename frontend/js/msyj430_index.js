/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：首页脚本，输出页面与接口基础信息到浏览器控制台
 */
(function () {
    'use strict';

    var msyj430_apiBase = window.location.origin + '/api';

    console.log('%c KeTangAI 科技资讯平台 ', 'background:#4ee1ff;color:#04121a;font-weight:bold;padding:2px 6px;border-radius:4px;');
    console.log('姓名：孟思颐佳 | 学号：24001010430');
    console.log('项目名称：KeTangAI 科技资讯平台（项目类别：自选）');
    console.log('后端接口基础地址：' + msyj430_apiBase);
    console.log('可用页面：index.html / database.html / news.html / gallery.html');

    // 探测后端健康状态，结果只打印到控制台
    fetch(msyj430_apiBase + '/health')
        .then(function (msyj430_res) {
            return msyj430_res.json();
        })
        .then(function (msyj430_json) {
            console.log('后端健康检查：', msyj430_json);
        })
        .catch(function (msyj430_err) {
            console.error('后端健康检查失败，请确认 start.bat 已运行：', msyj430_err.message);
        });
})();

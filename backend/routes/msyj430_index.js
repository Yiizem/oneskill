/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：/api 路由汇总入口
 */
const msyj430_express = require('express');
const msyj430_databaseRoutes = require('./msyj430_databaseRoutes');
const msyj430_newsRoutes = require('./msyj430_newsRoutes');
const msyj430_galleryRoutes = require('./msyj430_galleryRoutes');
const msyj430_chatRoutes = require('./msyj430_chatRoutes');
const msyj430_kbRoutes = require('./msyj430_kbRoutes');

const msyj430_router = msyj430_express.Router();

// 健康检查
msyj430_router.get('/health', (msyj430_req, msyj430_res) => {
    msyj430_res.json({ code: 0, msg: '服务运行正常', data: { msyj430_time: new Date().toISOString() } });
});

msyj430_router.use(msyj430_databaseRoutes);
msyj430_router.use(msyj430_newsRoutes);
msyj430_router.use(msyj430_galleryRoutes);
msyj430_router.use(msyj430_chatRoutes);
msyj430_router.use(msyj430_kbRoutes);

module.exports = msyj430_router;

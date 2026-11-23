/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：/api 路由汇总入口
 */
const Cheney_express = require('express');
const Cheney_databaseRoutes = require('./Cheney_databaseRoutes');
const Cheney_newsRoutes = require('./Cheney_newsRoutes');
const Cheney_galleryRoutes = require('./Cheney_galleryRoutes');
const Cheney_chatRoutes = require('./Cheney_chatRoutes');

const Cheney_router = Cheney_express.Router();

// 健康检查
Cheney_router.get('/health', (Cheney_req, Cheney_res) => {
    Cheney_res.json({ code: 0, msg: '服务运行正常', data: { Cheney_time: new Date().toISOString() } });
});

Cheney_router.use(Cheney_databaseRoutes);
Cheney_router.use(Cheney_newsRoutes);
Cheney_router.use(Cheney_galleryRoutes);
Cheney_router.use(Cheney_chatRoutes);

module.exports = Cheney_router;

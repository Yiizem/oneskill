/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻相关路由
 */
const Cheney_express = require('express');
const Cheney_newsController = require('../controllers/Cheney_newsController');
const Cheney_router = Cheney_express.Router();

Cheney_router.get('/news', Cheney_newsController.Cheney_getNewsList);
Cheney_router.get('/news/:id', Cheney_newsController.Cheney_getNewsDetail);

module.exports = Cheney_router;

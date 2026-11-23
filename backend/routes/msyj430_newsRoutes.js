/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻相关路由
 */
const msyj430_express = require('express');
const msyj430_newsController = require('../controllers/msyj430_newsController');
const msyj430_router = msyj430_express.Router();

msyj430_router.get('/news', msyj430_newsController.msyj430_getNewsList);
msyj430_router.get('/news/:id', msyj430_newsController.msyj430_getNewsDetail);

module.exports = msyj430_router;

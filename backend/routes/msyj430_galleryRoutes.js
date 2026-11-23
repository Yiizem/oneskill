/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：图文列表相关路由
 */
const msyj430_express = require('express');
const msyj430_galleryController = require('../controllers/msyj430_galleryController');
const msyj430_router = msyj430_express.Router();

msyj430_router.get('/gallery', msyj430_galleryController.msyj430_getGalleryList);
msyj430_router.get('/gallery/:id', msyj430_galleryController.msyj430_getGalleryDetail);

module.exports = msyj430_router;

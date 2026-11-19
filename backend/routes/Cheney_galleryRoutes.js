/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：图文列表相关路由
 */
const Cheney_express = require('express');
const Cheney_galleryController = require('../controllers/Cheney_galleryController');
const Cheney_router = Cheney_express.Router();

Cheney_router.get('/gallery', Cheney_galleryController.Cheney_getGalleryList);
Cheney_router.get('/gallery/:id', Cheney_galleryController.Cheney_getGalleryDetail);

module.exports = Cheney_router;

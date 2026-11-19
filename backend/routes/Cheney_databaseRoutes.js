/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库相关路由
 */
const Cheney_express = require('express');
const Cheney_databaseController = require('../controllers/Cheney_databaseController');
const Cheney_router = Cheney_express.Router();

Cheney_router.post('/database/test', Cheney_databaseController.Cheney_testDatabase);

module.exports = Cheney_router;

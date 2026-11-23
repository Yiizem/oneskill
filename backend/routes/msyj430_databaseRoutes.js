/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库相关路由
 */
const msyj430_express = require('express');
const msyj430_databaseController = require('../controllers/msyj430_databaseController');
const msyj430_router = msyj430_express.Router();

msyj430_router.post('/database/test', msyj430_databaseController.msyj430_testDatabase);

module.exports = msyj430_router;

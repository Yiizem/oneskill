/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：AI 聊天路由（GET 取默认配置 / POST 发起对话）
 */
const msyj430_express = require('express');
const { msyj430_chat, msyj430_defaultModel, msyj430_systemPrompt } = require('../controllers/msyj430_chatController');
const { msyj430_ok } = require('../utils/msyj430_result');

const msyj430_router = msyj430_express.Router();

// GET /api/chat/config —— 页面初始化时读取默认模型与系统提示词（不含密钥）
msyj430_router.get('/chat/config', (msyj430_req, msyj430_res) => {
    msyj430_res.json(msyj430_ok({
        msyj430_model: msyj430_defaultModel,
        msyj430_systemPrompt: msyj430_systemPrompt
    }));
});

// POST /api/chat —— 发送消息并获取大模型回复
msyj430_router.post('/chat', msyj430_chat);

module.exports = msyj430_router;

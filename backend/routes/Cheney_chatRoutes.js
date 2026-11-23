/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：AI 聊天路由（GET 取默认配置 / POST 发起对话）
 */
const Cheney_express = require('express');
const { Cheney_chat, Cheney_defaultModel, Cheney_systemPrompt } = require('../controllers/Cheney_chatController');
const { Cheney_ok } = require('../utils/Cheney_result');

const Cheney_router = Cheney_express.Router();

// GET /api/chat/config —— 页面初始化时读取默认模型与系统提示词（不含密钥）
Cheney_router.get('/chat/config', (Cheney_req, Cheney_res) => {
    Cheney_res.json(Cheney_ok({
        Cheney_model: Cheney_defaultModel,
        Cheney_systemPrompt: Cheney_systemPrompt
    }));
});

// POST /api/chat —— 发送消息并获取大模型回复
Cheney_router.post('/chat', Cheney_chat);

module.exports = Cheney_router;

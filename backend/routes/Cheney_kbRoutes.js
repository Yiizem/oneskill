/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库路由，含上传中间件与知识库 CRUD、切片预览、RAG 问答
 */
const Cheney_express = require('express');
const Cheney_path = require('path');
const Cheney_fs = require('fs');
const Cheney_multer = require('multer');
const Cheney_kb = require('../controllers/Cheney_kbController');

const Cheney_router = Cheney_express.Router();
const Cheney_uploadDir = Cheney_path.join(__dirname, '..', 'uploads');
const Cheney_allowExt = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const Cheney_maxSize = 20 * 1024 * 1024;

Cheney_fs.mkdirSync(Cheney_uploadDir, { recursive: true });

const Cheney_storage = Cheney_multer.diskStorage({
    destination: (Cheney_req, Cheney_file, Cheney_cb) => {
        Cheney_cb(null, Cheney_uploadDir);
    },
    filename: (Cheney_req, Cheney_file, Cheney_cb) => {
        const Cheney_ext = Cheney_path.extname(Cheney_file.originalname || '').toLowerCase() || '.bin';
        const Cheney_name = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + Cheney_ext;
        Cheney_cb(null, Cheney_name);
    }
});

const Cheney_upload = Cheney_multer({
    storage: Cheney_storage,
    limits: { fileSize: Cheney_maxSize },
    fileFilter: (Cheney_req, Cheney_file, Cheney_cb) => {
        const Cheney_ext = Cheney_path.extname(Cheney_file.originalname || '').toLowerCase();
        if (!Cheney_allowExt.includes(Cheney_ext)) {
            Cheney_cb(new Error('不支持的文件类型：' + (Cheney_ext || '未知') + '，支持 txt / md / pdf / doc / docx / ppt / pptx'));
            return;
        }
        Cheney_cb(null, true);
    }
});

// 知识库管理
Cheney_router.get('/kb', Cheney_kb.Cheney_kbList);
Cheney_router.post('/kb', Cheney_kb.Cheney_kbCreate);
Cheney_router.delete('/kb/:id', Cheney_kb.Cheney_kbDelete);

// 文件与切片
Cheney_router.get('/kb/chunks', Cheney_kb.Cheney_kbChunks);
Cheney_router.delete('/kb/file/:fileId', Cheney_kb.Cheney_kbFileDelete);
Cheney_router.get('/kb/:id/files', Cheney_kb.Cheney_kbFiles);
Cheney_router.post('/kb/:id/files', Cheney_upload.single('file'), Cheney_kb.Cheney_kbUpload);

// 基于知识库的问答
Cheney_router.post('/kb/chat', Cheney_kb.Cheney_kbChat);

module.exports = Cheney_router;

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库路由，含上传中间件与知识库 CRUD、切片预览、RAG 问答
 */
const msyj430_express = require('express');
const msyj430_path = require('path');
const msyj430_fs = require('fs');
const msyj430_multer = require('multer');
const msyj430_kb = require('../controllers/msyj430_kbController');

const msyj430_router = msyj430_express.Router();
const msyj430_uploadDir = msyj430_path.join(__dirname, '..', 'uploads');
const msyj430_allowExt = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const msyj430_maxSize = 20 * 1024 * 1024;

msyj430_fs.mkdirSync(msyj430_uploadDir, { recursive: true });

const msyj430_storage = msyj430_multer.diskStorage({
    destination: (msyj430_req, msyj430_file, msyj430_cb) => {
        msyj430_cb(null, msyj430_uploadDir);
    },
    filename: (msyj430_req, msyj430_file, msyj430_cb) => {
        const msyj430_ext = msyj430_path.extname(msyj430_file.originalname || '').toLowerCase() || '.bin';
        const msyj430_name = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + msyj430_ext;
        msyj430_cb(null, msyj430_name);
    }
});

const msyj430_upload = msyj430_multer({
    storage: msyj430_storage,
    limits: { fileSize: msyj430_maxSize },
    fileFilter: (msyj430_req, msyj430_file, msyj430_cb) => {
        const msyj430_ext = msyj430_path.extname(msyj430_file.originalname || '').toLowerCase();
        if (!msyj430_allowExt.includes(msyj430_ext)) {
            msyj430_cb(new Error('不支持的文件类型：' + (msyj430_ext || '未知') + '，支持 txt / md / pdf / doc / docx / ppt / pptx'));
            return;
        }
        msyj430_cb(null, true);
    }
});

// 知识库管理
msyj430_router.get('/kb', msyj430_kb.msyj430_kbList);
msyj430_router.post('/kb', msyj430_kb.msyj430_kbCreate);
msyj430_router.delete('/kb/:id', msyj430_kb.msyj430_kbDelete);

// 文件与切片
msyj430_router.get('/kb/chunks', msyj430_kb.msyj430_kbChunks);
msyj430_router.delete('/kb/file/:fileId', msyj430_kb.msyj430_kbFileDelete);
msyj430_router.get('/kb/:id/files', msyj430_kb.msyj430_kbFiles);
msyj430_router.post('/kb/:id/files', msyj430_upload.single('file'), msyj430_kb.msyj430_kbUpload);

// 基于知识库的问答
msyj430_router.post('/kb/chat', msyj430_kb.msyj430_kbChat);

module.exports = msyj430_router;

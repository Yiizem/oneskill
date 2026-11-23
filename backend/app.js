/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：后端入口，Express 服务，端口固定 8325，托管 frontend/ 并开放全部跨域
 */
const msyj430_path = require('path');
require('dotenv').config({ path: msyj430_path.join(__dirname, '.env') });
const msyj430_express = require('express');
const msyj430_apiRoutes = require('./routes/msyj430_index');
const { msyj430_pool, msyj430_dbConfig } = require('./config/msyj430_db');

const msyj430_app = msyj430_express();
const msyj430_port = Number(process.env.PORT) || 8325;
const msyj430_frontendDir = msyj430_path.join(__dirname, '..', 'frontend');

// 解析 JSON 与表单请求体
msyj430_app.use(msyj430_express.json());
msyj430_app.use(msyj430_express.urlencoded({ extended: false }));

// 支持所有跨域访问（含预检请求）
msyj430_app.use((msyj430_req, msyj430_res, msyj430_next) => {
    msyj430_res.setHeader('Access-Control-Allow-Origin', '*');
    msyj430_res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    msyj430_res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    msyj430_res.setHeader('Access-Control-Max-Age', '86400');
    if (msyj430_req.method === 'OPTIONS') {
        return msyj430_res.sendStatus(204);
    }
    msyj430_next();
});

// 静态托管 frontend/
msyj430_app.use(msyj430_express.static(msyj430_frontendDir));

// 所有接口统一挂载在 /api 下
msyj430_app.use('/api', msyj430_apiRoutes);

// 未匹配的接口返回统一 JSON
msyj430_app.use('/api', (msyj430_req, msyj430_res) => {
    msyj430_res.status(404).json({ code: 40400, msg: '接口不存在：' + msyj430_req.originalUrl, data: {} });
});

// 页面未找到时回落到首页
msyj430_app.use((msyj430_req, msyj430_res) => {
    msyj430_res.status(404).sendFile(msyj430_path.join(msyj430_frontendDir, 'index.html'));
});

// 统一错误处理
msyj430_app.use((msyj430_err, msyj430_req, msyj430_res, msyj430_next) => {
    console.error('[msyj430_app] 服务异常：', msyj430_err.message);
    msyj430_res.status(500).json({ code: 50000, msg: '服务器内部错误：' + msyj430_err.message, data: {} });
});

// 启动服务前先探测数据库连通性，便于排查
(async () => {
    try {
        const msyj430_conn = await msyj430_pool.getConnection();
        msyj430_conn.release();
        console.log('[msyj430_app] 数据库连接正常：' + msyj430_dbConfig.user + '@' + msyj430_dbConfig.host + ':' + msyj430_dbConfig.port + '/' + msyj430_dbConfig.database);
    } catch (msyj430_err) {
        console.warn('[msyj430_app] 数据库暂时不可用（' + msyj430_err.code + '），服务仍会启动：');
        console.warn('            ' + msyj430_err.message);
    }

    msyj430_app.listen(msyj430_port, () => {
        console.log('==========================================');
        console.log(' KeTangAI 后端已启动');
        console.log(' 本地访问：http://localhost:' + msyj430_port);
        console.log(' 接口前缀：http://localhost:' + msyj430_port + '/api');
        console.log(' 静态目录：' + msyj430_frontendDir);
        console.log('==========================================');
    });
})();

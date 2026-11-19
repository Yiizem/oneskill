/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：后端入口，Express 服务，端口固定 8325，托管 frontend/ 并开放全部跨域
 */
const Cheney_path = require('path');
require('dotenv').config({ path: Cheney_path.join(__dirname, '.env') });
const Cheney_express = require('express');
const Cheney_apiRoutes = require('./routes/Cheney_index');
const { Cheney_pool, Cheney_dbConfig } = require('./config/Cheney_db');

const Cheney_app = Cheney_express();
const Cheney_port = Number(process.env.PORT) || 8325;
const Cheney_frontendDir = Cheney_path.join(__dirname, '..', 'frontend');

// 解析 JSON 与表单请求体
Cheney_app.use(Cheney_express.json());
Cheney_app.use(Cheney_express.urlencoded({ extended: false }));

// 支持所有跨域访问（含预检请求）
Cheney_app.use((Cheney_req, Cheney_res, Cheney_next) => {
    Cheney_res.setHeader('Access-Control-Allow-Origin', '*');
    Cheney_res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    Cheney_res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    Cheney_res.setHeader('Access-Control-Max-Age', '86400');
    if (Cheney_req.method === 'OPTIONS') {
        return Cheney_res.sendStatus(204);
    }
    Cheney_next();
});

// 静态托管 frontend/
Cheney_app.use(Cheney_express.static(Cheney_frontendDir));

// 所有接口统一挂载在 /api 下
Cheney_app.use('/api', Cheney_apiRoutes);

// 未匹配的接口返回统一 JSON
Cheney_app.use('/api', (Cheney_req, Cheney_res) => {
    Cheney_res.status(404).json({ code: 40400, msg: '接口不存在：' + Cheney_req.originalUrl, data: {} });
});

// 页面未找到时回落到首页
Cheney_app.use((Cheney_req, Cheney_res) => {
    Cheney_res.status(404).sendFile(Cheney_path.join(Cheney_frontendDir, 'index.html'));
});

// 统一错误处理
Cheney_app.use((Cheney_err, Cheney_req, Cheney_res, Cheney_next) => {
    console.error('[Cheney_app] 服务异常：', Cheney_err.message);
    Cheney_res.status(500).json({ code: 50000, msg: '服务器内部错误：' + Cheney_err.message, data: {} });
});

// 启动服务前先探测数据库连通性，便于排查
(async () => {
    try {
        const Cheney_conn = await Cheney_pool.getConnection();
        Cheney_conn.release();
        console.log('[Cheney_app] 数据库连接正常：' + Cheney_dbConfig.user + '@' + Cheney_dbConfig.host + ':' + Cheney_dbConfig.port + '/' + Cheney_dbConfig.database);
    } catch (Cheney_err) {
        console.warn('[Cheney_app] 数据库暂时不可用（' + Cheney_err.code + '），服务仍会启动：');
        console.warn('            ' + Cheney_err.message);
    }

    Cheney_app.listen(Cheney_port, () => {
        console.log('==========================================');
        console.log(' KeTangAI 后端已启动');
        console.log(' 本地访问：http://localhost:' + Cheney_port);
        console.log(' 接口前缀：http://localhost:' + Cheney_port + '/api');
        console.log(' 静态目录：' + Cheney_frontendDir);
        console.log('==========================================');
    });
})();

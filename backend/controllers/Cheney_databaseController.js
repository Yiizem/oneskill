/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库连接测试控制器（C）
 */
const { Cheney_dbConfig, Cheney_testConnection } = require('../config/Cheney_db');
const { Cheney_ok, Cheney_fail } = require('../utils/Cheney_result');

// POST /api/database/test —— 使用页面提交的账号密码测试 MySQL 连接
async function Cheney_testDatabase(Cheney_req, Cheney_res) {
    try {
        const Cheney_body = Cheney_req.body || {};
        const Cheney_user = String(Cheney_body.user || '').trim();
        const Cheney_password = String(Cheney_body.password ?? '');

        // 用户名必填校验
        if (!Cheney_user) {
            return Cheney_res.status(400).json(Cheney_fail('用户名不能为空', 40003));
        }
        if (Cheney_user.length > 64 || Cheney_password.length > 128) {
            return Cheney_res.status(400).json(Cheney_fail('用户名或密码长度超出限制', 40004));
        }

        // 主机、端口、库名未填写时回落到 .env 默认值
        const Cheney_options = {
            host: String(Cheney_body.host || '').trim() || Cheney_dbConfig.host,
            port: Number(Cheney_body.port) || Cheney_dbConfig.port,
            user: Cheney_user,
            password: Cheney_password,
            database: String(Cheney_body.database || '').trim() || Cheney_dbConfig.database
        };

        const Cheney_result = await Cheney_testConnection(Cheney_options);
        console.log('[Cheney_databaseController] 连接测试：' + Cheney_user + '@' + Cheney_options.host + ':' + Cheney_options.port + ' -> ' + (Cheney_result.success ? '成功' : '失败'));

        if (Cheney_result.success) {
            return Cheney_res.json(Cheney_ok(Cheney_result.detail, Cheney_result.msg));
        }
        return Cheney_res.status(200).json(Cheney_fail(Cheney_result.msg, 40005, Cheney_result.detail));
    } catch (Cheney_err) {
        console.error('[Cheney_databaseController] 异常：', Cheney_err.message);
        Cheney_res.status(500).json(Cheney_fail('连接测试异常：' + Cheney_err.message, 50005));
    }
}

module.exports = { Cheney_testDatabase };

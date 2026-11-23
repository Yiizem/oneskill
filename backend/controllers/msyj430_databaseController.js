/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库连接测试控制器（C）
 */
const { msyj430_dbConfig, msyj430_testConnection } = require('../config/msyj430_db');
const { msyj430_ok, msyj430_fail } = require('../utils/msyj430_result');

// POST /api/database/test —— 使用页面提交的账号密码测试 MySQL 连接
async function msyj430_testDatabase(msyj430_req, msyj430_res) {
    try {
        const msyj430_body = msyj430_req.body || {};
        const msyj430_user = String(msyj430_body.user || '').trim();
        const msyj430_password = String(msyj430_body.password ?? '');

        // 用户名必填校验
        if (!msyj430_user) {
            return msyj430_res.status(400).json(msyj430_fail('用户名不能为空', 40003));
        }
        if (msyj430_user.length > 64 || msyj430_password.length > 128) {
            return msyj430_res.status(400).json(msyj430_fail('用户名或密码长度超出限制', 40004));
        }

        // 主机、端口、库名未填写时回落到 .env 默认值
        const msyj430_options = {
            host: String(msyj430_body.host || '').trim() || msyj430_dbConfig.host,
            port: Number(msyj430_body.port) || msyj430_dbConfig.port,
            user: msyj430_user,
            password: msyj430_password,
            database: String(msyj430_body.database || '').trim() || msyj430_dbConfig.database
        };

        const msyj430_result = await msyj430_testConnection(msyj430_options);
        console.log('[msyj430_databaseController] 连接测试：' + msyj430_user + '@' + msyj430_options.host + ':' + msyj430_options.port + ' -> ' + (msyj430_result.success ? '成功' : '失败'));

        if (msyj430_result.success) {
            return msyj430_res.json(msyj430_ok(msyj430_result.detail, msyj430_result.msg));
        }
        return msyj430_res.status(200).json(msyj430_fail(msyj430_result.msg, 40005, msyj430_result.detail));
    } catch (msyj430_err) {
        console.error('[msyj430_databaseController] 异常：', msyj430_err.message);
        msyj430_res.status(500).json(msyj430_fail('连接测试异常：' + msyj430_err.message, 50005));
    }
}

module.exports = { msyj430_testDatabase };

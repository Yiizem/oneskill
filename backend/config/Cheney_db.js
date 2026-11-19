/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库连接配置（连接池 + 连接测试），凭据统一从 .env 读取
 */
const Cheney_path = require('path');
require('dotenv').config({ path: Cheney_path.join(__dirname, '..', '.env') });
const Cheney_mysql = require('mysql2/promise');

// 基础配置，全部取自环境变量，代码中不出现明文凭据
const Cheney_dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// 全局连接池，供模型层复用
const Cheney_pool = Cheney_mysql.createPool({
    ...Cheney_dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

/**
 * 使用用户提交的账号密码测试数据库连接
 * @param {object} Cheney_options host/port/user/password/database
 * @returns {Promise<object>} { success, msg, detail }
 */
async function Cheney_testConnection(Cheney_options) {
    let Cheney_tempConn = null;
    try {
        Cheney_tempConn = await Cheney_mysql.createConnection({
            host: Cheney_options.host,
            port: Cheney_options.port,
            user: Cheney_options.user,
            password: Cheney_options.password,
            database: Cheney_options.database || undefined,
            connectTimeout: 8000
        });
        const [Cheney_rows] = await Cheney_tempConn.query('SELECT VERSION() AS Cheney_version, DATABASE() AS Cheney_db');
        return {
            success: true,
            msg: '数据库连接成功',
            detail: {
                Cheney_version: Cheney_rows[0].Cheney_version,
                Cheney_db: Cheney_rows[0].Cheney_db || '(未指定数据库)',
                Cheney_host: Cheney_options.host,
                Cheney_port: Cheney_options.port,
                Cheney_user: Cheney_options.user
            }
        };
    } catch (Cheney_err) {
        return {
            success: false,
            msg: '数据库连接失败：' + (Cheney_err.code || Cheney_err.message),
            detail: { Cheney_code: Cheney_err.code || '', Cheney_message: Cheney_err.message }
        };
    } finally {
        if (Cheney_tempConn) {
            try { await Cheney_tempConn.end(); } catch (Cheney_e) { /* 忽略关闭异常 */ }
        }
    }
}

module.exports = { Cheney_pool, Cheney_dbConfig, Cheney_testConnection };

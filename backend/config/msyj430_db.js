/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：数据库连接配置（连接池 + 连接测试），凭据统一从 .env 读取
 */
const msyj430_path = require('path');
require('dotenv').config({ path: msyj430_path.join(__dirname, '..', '.env') });
const msyj430_mysql = require('mysql2/promise');

// 基础配置，全部取自环境变量，代码中不出现明文凭据
const msyj430_dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// 全局连接池，供模型层复用
const msyj430_pool = msyj430_mysql.createPool({
    ...msyj430_dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

/**
 * 使用用户提交的账号密码测试数据库连接
 * @param {object} msyj430_options host/port/user/password/database
 * @returns {Promise<object>} { success, msg, detail }
 */
async function msyj430_testConnection(msyj430_options) {
    let msyj430_tempConn = null;
    try {
        msyj430_tempConn = await msyj430_mysql.createConnection({
            host: msyj430_options.host,
            port: msyj430_options.port,
            user: msyj430_options.user,
            password: msyj430_options.password,
            database: msyj430_options.database || undefined,
            connectTimeout: 8000
        });
        const [msyj430_rows] = await msyj430_tempConn.query('SELECT VERSION() AS msyj430_version, DATABASE() AS msyj430_db');
        return {
            success: true,
            msg: '数据库连接成功',
            detail: {
                msyj430_version: msyj430_rows[0].msyj430_version,
                msyj430_db: msyj430_rows[0].msyj430_db || '(未指定数据库)',
                msyj430_host: msyj430_options.host,
                msyj430_port: msyj430_options.port,
                msyj430_user: msyj430_options.user
            }
        };
    } catch (msyj430_err) {
        return {
            success: false,
            msg: '数据库连接失败：' + (msyj430_err.code || msyj430_err.message),
            detail: { msyj430_code: msyj430_err.code || '', msyj430_message: msyj430_err.message }
        };
    } finally {
        if (msyj430_tempConn) {
            try { await msyj430_tempConn.end(); } catch (msyj430_e) { /* 忽略关闭异常 */ }
        }
    }
}

module.exports = { msyj430_pool, msyj430_dbConfig, msyj430_testConnection };

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：统一 JSON 响应格式封装 { code, msg, data }
 */

// 成功响应
function msyj430_ok(msyj430_data, msyj430_msg) {
    return { code: 0, msg: msyj430_msg || '操作成功', data: msyj430_data === undefined ? {} : msyj430_data };
}

// 失败响应，code 非 0
function msyj430_fail(msyj430_msg, msyj430_code, msyj430_data) {
    return {
        code: msyj430_code === undefined ? 1 : msyj430_code,
        msg: msyj430_msg || '操作失败',
        data: msyj430_data === undefined ? {} : msyj430_data
    };
}

module.exports = { msyj430_ok, msyj430_fail };

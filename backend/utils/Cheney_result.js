/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：统一 JSON 响应格式封装 { code, msg, data }
 */

// 成功响应
function Cheney_ok(Cheney_data, Cheney_msg) {
    return { code: 0, msg: Cheney_msg || '操作成功', data: Cheney_data === undefined ? {} : Cheney_data };
}

// 失败响应，code 非 0
function Cheney_fail(Cheney_msg, Cheney_code, Cheney_data) {
    return {
        code: Cheney_code === undefined ? 1 : Cheney_code,
        msg: Cheney_msg || '操作失败',
        data: Cheney_data === undefined ? {} : Cheney_data
    };
}

module.exports = { Cheney_ok, Cheney_fail };

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻控制器（C），负责参数校验与响应组装
 */
const msyj430_newsModel = require('../models/msyj430_newsModel');
const { msyj430_ok, msyj430_fail } = require('../utils/msyj430_result');

// GET /api/news —— 新闻列表，支持 page、pageSize
async function msyj430_getNewsList(msyj430_req, msyj430_res) {
    try {
        const msyj430_page = Math.max(parseInt(msyj430_req.query.page, 10) || 1, 1);
        const msyj430_pageSize = Math.min(Math.max(parseInt(msyj430_req.query.pageSize, 10) || 10, 1), 50);
        const msyj430_result = await msyj430_newsModel.msyj430_selectNewsList(msyj430_page, msyj430_pageSize);
        msyj430_res.json(msyj430_ok({
            msyj430_total: msyj430_result.msyj430_total,
            msyj430_page: msyj430_page,
            msyj430_pageSize: msyj430_pageSize,
            msyj430_list: msyj430_result.msyj430_list
        }, '新闻列表获取成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_newsController] 列表查询失败：', msyj430_err.message);
        msyj430_res.status(500).json(msyj430_fail('新闻列表获取失败：' + msyj430_err.message, 50001));
    }
}

// GET /api/news/:id —— 新闻详情
async function msyj430_getNewsDetail(msyj430_req, msyj430_res) {
    try {
        const msyj430_id = parseInt(msyj430_req.params.id, 10);
        if (!Number.isInteger(msyj430_id) || msyj430_id <= 0) {
            return msyj430_res.status(400).json(msyj430_fail('新闻 id 不合法', 40001));
        }
        const msyj430_row = await msyj430_newsModel.msyj430_selectNewsById(msyj430_id);
        if (!msyj430_row) {
            return msyj430_res.status(404).json(msyj430_fail('未找到 id 为 ' + msyj430_id + ' 的新闻', 40401));
        }
        msyj430_res.json(msyj430_ok(msyj430_row, '新闻详情获取成功'));
    } catch (msyj430_err) {
        console.error('[msyj430_newsController] 详情查询失败：', msyj430_err.message);
        msyj430_res.status(500).json(msyj430_fail('新闻详情获取失败：' + msyj430_err.message, 50002));
    }
}

module.exports = { msyj430_getNewsList, msyj430_getNewsDetail };

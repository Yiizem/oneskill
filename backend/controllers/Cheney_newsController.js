/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻控制器（C），负责参数校验与响应组装
 */
const Cheney_newsModel = require('../models/Cheney_newsModel');
const { Cheney_ok, Cheney_fail } = require('../utils/Cheney_result');

// GET /api/news —— 新闻列表，支持 page、pageSize
async function Cheney_getNewsList(Cheney_req, Cheney_res) {
    try {
        const Cheney_page = Math.max(parseInt(Cheney_req.query.page, 10) || 1, 1);
        const Cheney_pageSize = Math.min(Math.max(parseInt(Cheney_req.query.pageSize, 10) || 10, 1), 50);
        const Cheney_result = await Cheney_newsModel.Cheney_selectNewsList(Cheney_page, Cheney_pageSize);
        Cheney_res.json(Cheney_ok({
            Cheney_total: Cheney_result.Cheney_total,
            Cheney_page: Cheney_page,
            Cheney_pageSize: Cheney_pageSize,
            Cheney_list: Cheney_result.Cheney_list
        }, '新闻列表获取成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_newsController] 列表查询失败：', Cheney_err.message);
        Cheney_res.status(500).json(Cheney_fail('新闻列表获取失败：' + Cheney_err.message, 50001));
    }
}

// GET /api/news/:id —— 新闻详情
async function Cheney_getNewsDetail(Cheney_req, Cheney_res) {
    try {
        const Cheney_id = parseInt(Cheney_req.params.id, 10);
        if (!Number.isInteger(Cheney_id) || Cheney_id <= 0) {
            return Cheney_res.status(400).json(Cheney_fail('新闻 id 不合法', 40001));
        }
        const Cheney_row = await Cheney_newsModel.Cheney_selectNewsById(Cheney_id);
        if (!Cheney_row) {
            return Cheney_res.status(404).json(Cheney_fail('未找到 id 为 ' + Cheney_id + ' 的新闻', 40401));
        }
        Cheney_res.json(Cheney_ok(Cheney_row, '新闻详情获取成功'));
    } catch (Cheney_err) {
        console.error('[Cheney_newsController] 详情查询失败：', Cheney_err.message);
        Cheney_res.status(500).json(Cheney_fail('新闻详情获取失败：' + Cheney_err.message, 50002));
    }
}

module.exports = { Cheney_getNewsList, Cheney_getNewsDetail };

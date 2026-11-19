/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻数据模型（M），仅负责 Cheney_news 表的读写
 */
const { Cheney_pool } = require('../config/Cheney_db');

// 分页查询新闻列表
async function Cheney_selectNewsList(Cheney_page, Cheney_pageSize) {
    const Cheney_offset = (Cheney_page - 1) * Cheney_pageSize;
    const [Cheney_rows] = await Cheney_pool.query(
        `SELECT Cheney_news_id, Cheney_news_title, Cheney_news_summary, Cheney_news_source,
                Cheney_news_author, Cheney_news_category, Cheney_news_publish_time, Cheney_news_views
         FROM Cheney_news
         ORDER BY Cheney_news_publish_time DESC, Cheney_news_id DESC
         LIMIT ? OFFSET ?`,
        [Cheney_pageSize, Cheney_offset]
    );
    const [Cheney_countRows] = await Cheney_pool.query('SELECT COUNT(*) AS Cheney_total FROM Cheney_news');
    return { Cheney_list: Cheney_rows, Cheney_total: Cheney_countRows[0].Cheney_total };
}

// 按主键查询单条新闻（含正文）
async function Cheney_selectNewsById(Cheney_id) {
    const [Cheney_rows] = await Cheney_pool.query(
        'SELECT * FROM Cheney_news WHERE Cheney_news_id = ?',
        [Cheney_id]
    );
    return Cheney_rows.length > 0 ? Cheney_rows[0] : null;
}

module.exports = { Cheney_selectNewsList, Cheney_selectNewsById };

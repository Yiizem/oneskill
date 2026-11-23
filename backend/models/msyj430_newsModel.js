/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：科技新闻数据模型（M），仅负责 msyj430_news 表的读写
 */
const { msyj430_pool } = require('../config/msyj430_db');

// 分页查询新闻列表
async function msyj430_selectNewsList(msyj430_page, msyj430_pageSize) {
    const msyj430_offset = (msyj430_page - 1) * msyj430_pageSize;
    const [msyj430_rows] = await msyj430_pool.query(
        `SELECT msyj430_news_id, msyj430_news_title, msyj430_news_summary, msyj430_news_source,
                msyj430_news_author, msyj430_news_category, msyj430_news_publish_time, msyj430_news_views
         FROM msyj430_news
         ORDER BY msyj430_news_publish_time DESC, msyj430_news_id DESC
         LIMIT ? OFFSET ?`,
        [msyj430_pageSize, msyj430_offset]
    );
    const [msyj430_countRows] = await msyj430_pool.query('SELECT COUNT(*) AS msyj430_total FROM msyj430_news');
    return { msyj430_list: msyj430_rows, msyj430_total: msyj430_countRows[0].msyj430_total };
}

// 按主键查询单条新闻（含正文）
async function msyj430_selectNewsById(msyj430_id) {
    const [msyj430_rows] = await msyj430_pool.query(
        'SELECT * FROM msyj430_news WHERE msyj430_news_id = ?',
        [msyj430_id]
    );
    return msyj430_rows.length > 0 ? msyj430_rows[0] : null;
}

module.exports = { msyj430_selectNewsList, msyj430_selectNewsById };

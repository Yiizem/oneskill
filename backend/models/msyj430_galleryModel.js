/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：图文列表数据模型（M），仅负责 msyj430_gallery 表的读写
 */
const { msyj430_pool } = require('../config/msyj430_db');

// 分页查询图文列表
async function msyj430_selectGalleryList(msyj430_page, msyj430_pageSize) {
    const msyj430_offset = (msyj430_page - 1) * msyj430_pageSize;
    const [msyj430_rows] = await msyj430_pool.query(
        `SELECT msyj430_gallery_id, msyj430_gallery_title, msyj430_gallery_description,
                msyj430_gallery_image, msyj430_gallery_category, msyj430_gallery_source,
                msyj430_gallery_publish_time, msyj430_gallery_views
         FROM msyj430_gallery
         ORDER BY msyj430_gallery_publish_time DESC, msyj430_gallery_id DESC
         LIMIT ? OFFSET ?`,
        [msyj430_pageSize, msyj430_offset]
    );
    const [msyj430_countRows] = await msyj430_pool.query('SELECT COUNT(*) AS msyj430_total FROM msyj430_gallery');
    return { msyj430_list: msyj430_rows, msyj430_total: msyj430_countRows[0].msyj430_total };
}

// 按主键查询单条图文
async function msyj430_selectGalleryById(msyj430_id) {
    const [msyj430_rows] = await msyj430_pool.query(
        'SELECT * FROM msyj430_gallery WHERE msyj430_gallery_id = ?',
        [msyj430_id]
    );
    return msyj430_rows.length > 0 ? msyj430_rows[0] : null;
}

module.exports = { msyj430_selectGalleryList, msyj430_selectGalleryById };

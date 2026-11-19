/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-19 | 大模型：豆包
 * 文件说明：图文列表数据模型（M），仅负责 Cheney_gallery 表的读写
 */
const { Cheney_pool } = require('../config/Cheney_db');

// 分页查询图文列表
async function Cheney_selectGalleryList(Cheney_page, Cheney_pageSize) {
    const Cheney_offset = (Cheney_page - 1) * Cheney_pageSize;
    const [Cheney_rows] = await Cheney_pool.query(
        `SELECT Cheney_gallery_id, Cheney_gallery_title, Cheney_gallery_description,
                Cheney_gallery_image, Cheney_gallery_category, Cheney_gallery_source,
                Cheney_gallery_publish_time, Cheney_gallery_views
         FROM Cheney_gallery
         ORDER BY Cheney_gallery_publish_time DESC, Cheney_gallery_id DESC
         LIMIT ? OFFSET ?`,
        [Cheney_pageSize, Cheney_offset]
    );
    const [Cheney_countRows] = await Cheney_pool.query('SELECT COUNT(*) AS Cheney_total FROM Cheney_gallery');
    return { Cheney_list: Cheney_rows, Cheney_total: Cheney_countRows[0].Cheney_total };
}

// 按主键查询单条图文
async function Cheney_selectGalleryById(Cheney_id) {
    const [Cheney_rows] = await Cheney_pool.query(
        'SELECT * FROM Cheney_gallery WHERE Cheney_gallery_id = ?',
        [Cheney_id]
    );
    return Cheney_rows.length > 0 ? Cheney_rows[0] : null;
}

module.exports = { Cheney_selectGalleryList, Cheney_selectGalleryById };

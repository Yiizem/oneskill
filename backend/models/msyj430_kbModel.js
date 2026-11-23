/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库数据模型（M），负责知识库、文件、切片三张表的读写
 */
const { msyj430_pool } = require('../config/msyj430_db');

// 新建知识库
async function msyj430_createKB(msyj430_name, msyj430_desc) {
    const msyj430_sql = 'INSERT INTO msyj430_kb (msyj430_kb_name, msyj430_kb_desc) VALUES (?, ?)';
    const [msyj430_result] = await msyj430_pool.query(msyj430_sql, [msyj430_name, msyj430_desc || '']);
    return msyj430_result.insertId;
}

// 知识库列表（带文件数与切片数）
async function msyj430_listKB() {
    const msyj430_sql = `
        SELECT k.msyj430_kb_id, k.msyj430_kb_name, k.msyj430_kb_desc, k.msyj430_kb_created_at,
               (SELECT COUNT(*) FROM msyj430_kb_file f WHERE f.msyj430_kb_id = k.msyj430_kb_id) AS msyj430_file_count,
               (SELECT COUNT(*) FROM msyj430_kb_chunk c WHERE c.msyj430_kb_id = k.msyj430_kb_id) AS msyj430_chunk_count
        FROM msyj430_kb k
        ORDER BY k.msyj430_kb_id DESC`;
    const [msyj430_rows] = await msyj430_pool.query(msyj430_sql);
    return msyj430_rows;
}

async function msyj430_getKB(msyj430_kbId) {
    const [msyj430_rows] = await msyj430_pool.query('SELECT * FROM msyj430_kb WHERE msyj430_kb_id = ?', [msyj430_kbId]);
    return msyj430_rows[0] || null;
}

// 删除知识库（连同文件与切片）
async function msyj430_deleteKB(msyj430_kbId) {
    await msyj430_pool.query('DELETE FROM msyj430_kb_chunk WHERE msyj430_kb_id = ?', [msyj430_kbId]);
    await msyj430_pool.query('DELETE FROM msyj430_kb_file WHERE msyj430_kb_id = ?', [msyj430_kbId]);
    const [msyj430_result] = await msyj430_pool.query('DELETE FROM msyj430_kb WHERE msyj430_kb_id = ?', [msyj430_kbId]);
    return msyj430_result.affectedRows;
}

// 写入文件记录
async function msyj430_insertFile(msyj430_data) {
    const msyj430_sql = `INSERT INTO msyj430_kb_file
        (msyj430_kb_id, msyj430_kb_file_name, msyj430_kb_file_ext, msyj430_kb_file_size,
         msyj430_kb_file_chars, msyj430_kb_file_chunks, msyj430_kb_file_path, msyj430_kb_file_status, msyj430_kb_file_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [msyj430_result] = await msyj430_pool.query(msyj430_sql, [
        msyj430_data.msyj430_kb_id,
        msyj430_data.msyj430_kb_file_name,
        msyj430_data.msyj430_kb_file_ext,
        msyj430_data.msyj430_kb_file_size,
        msyj430_data.msyj430_kb_file_chars,
        msyj430_data.msyj430_kb_file_chunks,
        msyj430_data.msyj430_kb_file_path,
        msyj430_data.msyj430_kb_file_status,
        msyj430_data.msyj430_kb_file_error || ''
    ]);
    return msyj430_result.insertId;
}

// 文件列表
async function msyj430_listFiles(msyj430_kbId) {
    const msyj430_sql = `SELECT msyj430_kb_file_id, msyj430_kb_id, msyj430_kb_file_name, msyj430_kb_file_ext,
        msyj430_kb_file_size, msyj430_kb_file_chars, msyj430_kb_file_chunks, msyj430_kb_file_status,
        msyj430_kb_file_error, msyj430_kb_file_upload_time
        FROM msyj430_kb_file WHERE msyj430_kb_id = ? ORDER BY msyj430_kb_file_id DESC`;
    const [msyj430_rows] = await msyj430_pool.query(msyj430_sql, [msyj430_kbId]);
    return msyj430_rows;
}

async function msyj430_getFile(msyj430_fileId) {
    const [msyj430_rows] = await msyj430_pool.query('SELECT * FROM msyj430_kb_file WHERE msyj430_kb_file_id = ?', [msyj430_fileId]);
    return msyj430_rows[0] || null;
}

async function msyj430_deleteFile(msyj430_fileId) {
    await msyj430_pool.query('DELETE FROM msyj430_kb_chunk WHERE msyj430_kb_file_id = ?', [msyj430_fileId]);
    const [msyj430_result] = await msyj430_pool.query('DELETE FROM msyj430_kb_file WHERE msyj430_kb_file_id = ?', [msyj430_fileId]);
    return msyj430_result.affectedRows;
}

// 批量写入切片（含向量）
async function msyj430_insertChunks(msyj430_kbId, msyj430_fileId, msyj430_chunks, msyj430_vectors) {
    if (!msyj430_chunks || msyj430_chunks.length === 0) {
        return 0;
    }
    const msyj430_rows = msyj430_chunks.map((msyj430_text, msyj430_index) => [
        msyj430_kbId,
        msyj430_fileId,
        msyj430_index,
        msyj430_text,
        msyj430_vectors && msyj430_vectors[msyj430_index] ? JSON.stringify(msyj430_vectors[msyj430_index]) : null,
        msyj430_text.length
    ]);
    const msyj430_sql = `INSERT INTO msyj430_kb_chunk
        (msyj430_kb_id, msyj430_kb_file_id, msyj430_kb_chunk_index, msyj430_kb_chunk_content,
         msyj430_kb_chunk_embedding, msyj430_kb_chunk_chars) VALUES ?`;
    const [msyj430_result] = await msyj430_pool.query(msyj430_sql, [msyj430_rows]);
    return msyj430_result.affectedRows;
}

// 取某知识库全部切片（检索用）
async function msyj430_listChunks(msyj430_kbId, msyj430_limit) {
    const msyj430_sql = `SELECT c.msyj430_kb_chunk_id, c.msyj430_kb_id, c.msyj430_kb_file_id,
        c.msyj430_kb_chunk_index, c.msyj430_kb_chunk_content, c.msyj430_kb_chunk_embedding,
        f.msyj430_kb_file_name
        FROM msyj430_kb_chunk c
        LEFT JOIN msyj430_kb_file f ON f.msyj430_kb_file_id = c.msyj430_kb_file_id
        WHERE c.msyj430_kb_id = ?
        ORDER BY c.msyj430_kb_file_id, c.msyj430_kb_chunk_index
        LIMIT ?`;
    const [msyj430_rows] = await msyj430_pool.query(msyj430_sql, [msyj430_kbId, Number(msyj430_limit) || 400]);
    return msyj430_rows;
}

// 切片预览
async function msyj430_listChunksByFile(msyj430_fileId, msyj430_limit) {
    const msyj430_sql = `SELECT msyj430_kb_chunk_id, msyj430_kb_chunk_index, msyj430_kb_chunk_content, msyj430_kb_chunk_chars
        FROM msyj430_kb_chunk WHERE msyj430_kb_file_id = ? ORDER BY msyj430_kb_chunk_index LIMIT ?`;
    const [msyj430_rows] = await msyj430_pool.query(msyj430_sql, [msyj430_fileId, Number(msyj430_limit) || 200]);
    return msyj430_rows;
}

module.exports = {
    msyj430_createKB,
    msyj430_listKB,
    msyj430_getKB,
    msyj430_deleteKB,
    msyj430_insertFile,
    msyj430_listFiles,
    msyj430_getFile,
    msyj430_deleteFile,
    msyj430_insertChunks,
    msyj430_listChunks,
    msyj430_listChunksByFile
};

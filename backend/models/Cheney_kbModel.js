/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库数据模型（M），负责知识库、文件、切片三张表的读写
 */
const { Cheney_pool } = require('../config/Cheney_db');

// 新建知识库
async function Cheney_createKB(Cheney_name, Cheney_desc) {
    const Cheney_sql = 'INSERT INTO Cheney_kb (Cheney_kb_name, Cheney_kb_desc) VALUES (?, ?)';
    const [Cheney_result] = await Cheney_pool.query(Cheney_sql, [Cheney_name, Cheney_desc || '']);
    return Cheney_result.insertId;
}

// 知识库列表（带文件数与切片数）
async function Cheney_listKB() {
    const Cheney_sql = `
        SELECT k.Cheney_kb_id, k.Cheney_kb_name, k.Cheney_kb_desc, k.Cheney_kb_created_at,
               (SELECT COUNT(*) FROM Cheney_kb_file f WHERE f.Cheney_kb_id = k.Cheney_kb_id) AS Cheney_file_count,
               (SELECT COUNT(*) FROM Cheney_kb_chunk c WHERE c.Cheney_kb_id = k.Cheney_kb_id) AS Cheney_chunk_count
        FROM Cheney_kb k
        ORDER BY k.Cheney_kb_id DESC`;
    const [Cheney_rows] = await Cheney_pool.query(Cheney_sql);
    return Cheney_rows;
}

async function Cheney_getKB(Cheney_kbId) {
    const [Cheney_rows] = await Cheney_pool.query('SELECT * FROM Cheney_kb WHERE Cheney_kb_id = ?', [Cheney_kbId]);
    return Cheney_rows[0] || null;
}

// 删除知识库（连同文件与切片）
async function Cheney_deleteKB(Cheney_kbId) {
    await Cheney_pool.query('DELETE FROM Cheney_kb_chunk WHERE Cheney_kb_id = ?', [Cheney_kbId]);
    await Cheney_pool.query('DELETE FROM Cheney_kb_file WHERE Cheney_kb_id = ?', [Cheney_kbId]);
    const [Cheney_result] = await Cheney_pool.query('DELETE FROM Cheney_kb WHERE Cheney_kb_id = ?', [Cheney_kbId]);
    return Cheney_result.affectedRows;
}

// 写入文件记录
async function Cheney_insertFile(Cheney_data) {
    const Cheney_sql = `INSERT INTO Cheney_kb_file
        (Cheney_kb_id, Cheney_kb_file_name, Cheney_kb_file_ext, Cheney_kb_file_size,
         Cheney_kb_file_chars, Cheney_kb_file_chunks, Cheney_kb_file_path, Cheney_kb_file_status, Cheney_kb_file_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [Cheney_result] = await Cheney_pool.query(Cheney_sql, [
        Cheney_data.Cheney_kb_id,
        Cheney_data.Cheney_kb_file_name,
        Cheney_data.Cheney_kb_file_ext,
        Cheney_data.Cheney_kb_file_size,
        Cheney_data.Cheney_kb_file_chars,
        Cheney_data.Cheney_kb_file_chunks,
        Cheney_data.Cheney_kb_file_path,
        Cheney_data.Cheney_kb_file_status,
        Cheney_data.Cheney_kb_file_error || ''
    ]);
    return Cheney_result.insertId;
}

// 文件列表
async function Cheney_listFiles(Cheney_kbId) {
    const Cheney_sql = `SELECT Cheney_kb_file_id, Cheney_kb_id, Cheney_kb_file_name, Cheney_kb_file_ext,
        Cheney_kb_file_size, Cheney_kb_file_chars, Cheney_kb_file_chunks, Cheney_kb_file_status,
        Cheney_kb_file_error, Cheney_kb_file_upload_time
        FROM Cheney_kb_file WHERE Cheney_kb_id = ? ORDER BY Cheney_kb_file_id DESC`;
    const [Cheney_rows] = await Cheney_pool.query(Cheney_sql, [Cheney_kbId]);
    return Cheney_rows;
}

async function Cheney_getFile(Cheney_fileId) {
    const [Cheney_rows] = await Cheney_pool.query('SELECT * FROM Cheney_kb_file WHERE Cheney_kb_file_id = ?', [Cheney_fileId]);
    return Cheney_rows[0] || null;
}

async function Cheney_deleteFile(Cheney_fileId) {
    await Cheney_pool.query('DELETE FROM Cheney_kb_chunk WHERE Cheney_kb_file_id = ?', [Cheney_fileId]);
    const [Cheney_result] = await Cheney_pool.query('DELETE FROM Cheney_kb_file WHERE Cheney_kb_file_id = ?', [Cheney_fileId]);
    return Cheney_result.affectedRows;
}

// 批量写入切片（含向量）
async function Cheney_insertChunks(Cheney_kbId, Cheney_fileId, Cheney_chunks, Cheney_vectors) {
    if (!Cheney_chunks || Cheney_chunks.length === 0) {
        return 0;
    }
    const Cheney_rows = Cheney_chunks.map((Cheney_text, Cheney_index) => [
        Cheney_kbId,
        Cheney_fileId,
        Cheney_index,
        Cheney_text,
        Cheney_vectors && Cheney_vectors[Cheney_index] ? JSON.stringify(Cheney_vectors[Cheney_index]) : null,
        Cheney_text.length
    ]);
    const Cheney_sql = `INSERT INTO Cheney_kb_chunk
        (Cheney_kb_id, Cheney_kb_file_id, Cheney_kb_chunk_index, Cheney_kb_chunk_content,
         Cheney_kb_chunk_embedding, Cheney_kb_chunk_chars) VALUES ?`;
    const [Cheney_result] = await Cheney_pool.query(Cheney_sql, [Cheney_rows]);
    return Cheney_result.affectedRows;
}

// 取某知识库全部切片（检索用）
async function Cheney_listChunks(Cheney_kbId, Cheney_limit) {
    const Cheney_sql = `SELECT c.Cheney_kb_chunk_id, c.Cheney_kb_id, c.Cheney_kb_file_id,
        c.Cheney_kb_chunk_index, c.Cheney_kb_chunk_content, c.Cheney_kb_chunk_embedding,
        f.Cheney_kb_file_name
        FROM Cheney_kb_chunk c
        LEFT JOIN Cheney_kb_file f ON f.Cheney_kb_file_id = c.Cheney_kb_file_id
        WHERE c.Cheney_kb_id = ?
        ORDER BY c.Cheney_kb_file_id, c.Cheney_kb_chunk_index
        LIMIT ?`;
    const [Cheney_rows] = await Cheney_pool.query(Cheney_sql, [Cheney_kbId, Number(Cheney_limit) || 400]);
    return Cheney_rows;
}

// 切片预览
async function Cheney_listChunksByFile(Cheney_fileId, Cheney_limit) {
    const Cheney_sql = `SELECT Cheney_kb_chunk_id, Cheney_kb_chunk_index, Cheney_kb_chunk_content, Cheney_kb_chunk_chars
        FROM Cheney_kb_chunk WHERE Cheney_kb_file_id = ? ORDER BY Cheney_kb_chunk_index LIMIT ?`;
    const [Cheney_rows] = await Cheney_pool.query(Cheney_sql, [Cheney_fileId, Number(Cheney_limit) || 200]);
    return Cheney_rows;
}

module.exports = {
    Cheney_createKB,
    Cheney_listKB,
    Cheney_getKB,
    Cheney_deleteKB,
    Cheney_insertFile,
    Cheney_listFiles,
    Cheney_getFile,
    Cheney_deleteFile,
    Cheney_insertChunks,
    Cheney_listChunks,
    Cheney_listChunksByFile
};

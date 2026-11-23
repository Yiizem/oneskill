/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：文本切片服务，按段落与长度切块并保留少量重叠
 */

const Cheney_defaultSize = 480;
const Cheney_defaultOverlap = 80;

// 按“段落 → 句子 → 硬切”三层策略切片
function Cheney_splitText(Cheney_text, Cheney_size, Cheney_overlap) {
    const Cheney_sizeLimit = Cheney_size || Cheney_defaultSize;
    const Cheney_ov = Cheney_overlap || Cheney_defaultOverlap;
    const Cheney_clean = String(Cheney_text || '').replace(/\r\n/g, '\n').trim();
    if (!Cheney_clean) {
        return [];
    }

    const Cheney_paras = Cheney_clean.split(/\n{2,}/).map((Cheney_p) => Cheney_p.replace(/\n/g, ' ').trim()).filter(Boolean);
    const Cheney_chunks = [];

    Cheney_paras.forEach((Cheney_para) => {
        if (Cheney_para.length <= Cheney_sizeLimit) {
            Cheney_chunks.push(Cheney_para);
            return;
        }
        // 超长段落按句号切分再拼接
        const Cheney_sentences = Cheney_para.split(/(?<=[。！？；.!?;])/).filter(Boolean);
        let Cheney_buf = '';
        Cheney_sentences.forEach((Cheney_sentence) => {
            if ((Cheney_buf + Cheney_sentence).length <= Cheney_sizeLimit) {
                Cheney_buf += Cheney_sentence;
                return;
            }
            if (Cheney_buf) {
                Cheney_chunks.push(Cheney_buf.trim());
            }
            if (Cheney_sentence.length > Cheney_sizeLimit) {
                // 单句仍超长则硬切
                for (let Cheney_i = 0; Cheney_i < Cheney_sentence.length; Cheney_i += Cheney_sizeLimit) {
                    Cheney_chunks.push(Cheney_sentence.slice(Cheney_i, Cheney_i + Cheney_sizeLimit));
                }
                Cheney_buf = '';
            } else {
                Cheney_buf = Cheney_sentence;
            }
        });
        if (Cheney_buf.trim()) {
            Cheney_chunks.push(Cheney_buf.trim());
        }
    });

    // 合并过短的碎片，并给除首块外的切片补上一块尾部作为重叠上下文
    const Cheney_merged = [];
    Cheney_chunks.forEach((Cheney_chunk) => {
        if (Cheney_merged.length === 0) {
            Cheney_merged.push(Cheney_chunk);
            return;
        }
        const Cheney_prev = Cheney_merged[Cheney_merged.length - 1];
        if (Cheney_prev.length < 120 && (Cheney_prev.length + Cheney_chunk.length) <= Cheney_sizeLimit) {
            Cheney_merged[Cheney_merged.length - 1] = Cheney_prev + ' ' + Cheney_chunk;
        } else {
            Cheney_merged.push(Cheney_chunk);
        }
    });

    return Cheney_merged.map((Cheney_chunk, Cheney_index) => {
        if (Cheney_index === 0 || Cheney_ov <= 0) {
            return Cheney_chunk;
        }
        const Cheney_head = Cheney_merged[Cheney_index - 1].slice(-Cheney_ov);
        return Cheney_head + ' ' + Cheney_chunk;
    });
}

module.exports = { Cheney_splitText };

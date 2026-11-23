/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：文本切片服务，按段落与长度切块并保留少量重叠
 */

const msyj430_defaultSize = 480;
const msyj430_defaultOverlap = 80;

// 按“段落 → 句子 → 硬切”三层策略切片
function msyj430_splitText(msyj430_text, msyj430_size, msyj430_overlap) {
    const msyj430_sizeLimit = msyj430_size || msyj430_defaultSize;
    const msyj430_ov = msyj430_overlap || msyj430_defaultOverlap;
    const msyj430_clean = String(msyj430_text || '').replace(/\r\n/g, '\n').trim();
    if (!msyj430_clean) {
        return [];
    }

    const msyj430_paras = msyj430_clean.split(/\n{2,}/).map((msyj430_p) => msyj430_p.replace(/\n/g, ' ').trim()).filter(Boolean);
    const msyj430_chunks = [];

    msyj430_paras.forEach((msyj430_para) => {
        if (msyj430_para.length <= msyj430_sizeLimit) {
            msyj430_chunks.push(msyj430_para);
            return;
        }
        // 超长段落按句号切分再拼接
        const msyj430_sentences = msyj430_para.split(/(?<=[。！？；.!?;])/).filter(Boolean);
        let msyj430_buf = '';
        msyj430_sentences.forEach((msyj430_sentence) => {
            if ((msyj430_buf + msyj430_sentence).length <= msyj430_sizeLimit) {
                msyj430_buf += msyj430_sentence;
                return;
            }
            if (msyj430_buf) {
                msyj430_chunks.push(msyj430_buf.trim());
            }
            if (msyj430_sentence.length > msyj430_sizeLimit) {
                // 单句仍超长则硬切
                for (let msyj430_i = 0; msyj430_i < msyj430_sentence.length; msyj430_i += msyj430_sizeLimit) {
                    msyj430_chunks.push(msyj430_sentence.slice(msyj430_i, msyj430_i + msyj430_sizeLimit));
                }
                msyj430_buf = '';
            } else {
                msyj430_buf = msyj430_sentence;
            }
        });
        if (msyj430_buf.trim()) {
            msyj430_chunks.push(msyj430_buf.trim());
        }
    });

    // 合并过短的碎片，并给除首块外的切片补上一块尾部作为重叠上下文
    const msyj430_merged = [];
    msyj430_chunks.forEach((msyj430_chunk) => {
        if (msyj430_merged.length === 0) {
            msyj430_merged.push(msyj430_chunk);
            return;
        }
        const msyj430_prev = msyj430_merged[msyj430_merged.length - 1];
        if (msyj430_prev.length < 120 && (msyj430_prev.length + msyj430_chunk.length) <= msyj430_sizeLimit) {
            msyj430_merged[msyj430_merged.length - 1] = msyj430_prev + ' ' + msyj430_chunk;
        } else {
            msyj430_merged.push(msyj430_chunk);
        }
    });

    return msyj430_merged.map((msyj430_chunk, msyj430_index) => {
        if (msyj430_index === 0 || msyj430_ov <= 0) {
            return msyj430_chunk;
        }
        const msyj430_head = msyj430_merged[msyj430_index - 1].slice(-msyj430_ov);
        return msyj430_head + ' ' + msyj430_chunk;
    });
}

module.exports = { msyj430_splitText };

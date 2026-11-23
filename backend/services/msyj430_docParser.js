/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：文档解析服务，支持 txt/md/pdf/docx/pptx，doc/ppt 经 Office 转换后再解析
 */
const msyj430_fs = require('fs');
const msyj430_os = require('os');
const msyj430_path = require('path');
const msyj430_child = require('child_process');
const msyj430_AdmZip = require('adm-zip');
const msyj430_mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');

const msyj430_supportExt = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const msyj430_plainExt = ['.txt', '.md', '.csv', '.json', '.log'];

// 清理 XML/HTML 片段中的标签，保留文字
function msyj430_stripTags(msyj430_xml) {
    return msyj430_xml
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n');
}

// 解析 docx（mammoth 抽正文）
async function msyj430_parseDocx(msyj430_buffer) {
    const msyj430_result = await msyj430_mammoth.extractRawText({ buffer: msyj430_buffer });
    return msyj430_result.value || '';
}

// 解析 pptx（按幻灯片顺序抽取 <a:t> 文本）
function msyj430_parsePptx(msyj430_buffer) {
    const msyj430_zip = new msyj430_AdmZip(msyj430_buffer);
    const msyj430_slideEntries = msyj430_zip.getEntries()
        .filter((msyj430_entry) => /ppt\/slides\/slide\d+\.xml$/.test(msyj430_entry.entryName))
        .sort((msyj430_a, msyj430_b) => {
            const msyj430_na = Number((msyj430_a.entryName.match(/slide(\d+)\.xml/) || [0, 0])[1]);
            const msyj430_nb = Number((msyj430_b.entryName.match(/slide(\d+)\.xml/) || [0, 0])[1]);
            return msyj430_na - msyj430_nb;
        });

    const msyj430_lines = [];
    msyj430_slideEntries.forEach((msyj430_entry, msyj430_index) => {
        const msyj430_xml = msyj430_zip.readAsText(msyj430_entry);
        const msyj430_texts = [];
        const msyj430_regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
        let msyj430_m = msyj430_regex.exec(msyj430_xml);
        while (msyj430_m) {
            const msyj430_t = msyj430_stripTags(msyj430_m[1]).trim();
            if (msyj430_t) {
                msyj430_texts.push(msyj430_t);
            }
            msyj430_m = msyj430_regex.exec(msyj430_xml);
        }
        if (msyj430_texts.length > 0) {
            msyj430_lines.push('第 ' + (msyj430_index + 1) + ' 页：' + msyj430_texts.join(' '));
        }
    });
    return msyj430_lines.join('\n\n');
}

// 解析 pdf（pdf-parse v2）
async function msyj430_parsePdf(msyj430_buffer) {
    const msyj430_parser = new PDFParse({ data: msyj430_buffer });
    try {
        const msyj430_result = await msyj430_parser.getText();
        const msyj430_raw = (msyj430_result && msyj430_result.text) || '';
        // PDF 逐字抽取常在中文字之间插入空格，这里把「中 文 字 符」之间多余的空格去掉
        return msyj430_raw.replace(/([\u4e00-\u9fa5，。、；：！？“”（）])[ \t]+(?=[\u4e00-\u9fa5，。、；：！？“”（）])/g, '$1');
    } finally {
        if (typeof msyj430_parser.destroy === 'function') {
            await msyj430_parser.destroy();
        }
    }
}

// doc / ppt 老格式：调用 Office COM 转成 docx / pptx 后解析
function msyj430_convertLegacy(msyj430_buffer, msyj430_ext) {
    const msyj430_tmpDir = msyj430_path.join(msyj430_os.tmpdir(), 'msyj430_kb_convert');
    msyj430_fs.mkdirSync(msyj430_tmpDir, { recursive: true });
    const msyj430_stamp = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const msyj430_in = msyj430_path.join(msyj430_tmpDir, msyj430_stamp + msyj430_ext);
    const msyj430_targetExt = msyj430_ext === '.doc' ? '.docx' : '.pptx';
    const msyj430_out = msyj430_path.join(msyj430_tmpDir, msyj430_stamp + msyj430_targetExt);
    msyj430_fs.writeFileSync(msyj430_in, msyj430_buffer);

    const msyj430_script = msyj430_path.join(__dirname, '..', 'scripts', 'msyj430_office_convert.ps1');
    const msyj430_ps = [
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        'powershell.exe'
    ].find((msyj430_p) => {
        try {
            return msyj430_fs.existsSync(msyj430_p);
        } catch (msyj430_e) {
            return false;
        }
    }) || 'powershell.exe';

    const msyj430_ret = msyj430_child.spawnSync(msyj430_ps, [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', msyj430_script,
        '-In', msyj430_in, '-Out', msyj430_out, '-Kind', msyj430_ext === '.doc' ? 'word' : 'ppt'
    ], { encoding: 'utf8', timeout: 120000 });

    const msyj430_log = ((msyj430_ret.stdout || '') + (msyj430_ret.stderr || '')).trim();
    let msyj430_text = '';
    try {
        if (msyj430_fs.existsSync(msyj430_out)) {
            const msyj430_converted = msyj430_fs.readFileSync(msyj430_out);
            msyj430_text = msyj430_targetExt === '.docx'
                ? ''
                : msyj430_parsePptx(msyj430_converted);
        }
    } catch (msyj430_err) {
        throw new Error('老格式转换后解析失败：' + msyj430_err.message);
    }

    // docx 需要异步解析，这里把结果通过 Promise 返回给调用方
    const msyj430_promise = (async () => {
        if (msyj430_text) {
            return msyj430_text;
        }
        if (msyj430_fs.existsSync(msyj430_out)) {
            return await msyj430_parseDocx(msyj430_fs.readFileSync(msyj430_out));
        }
        throw new Error('Office 转换失败，请另存为 ' + msyj430_targetExt + ' 后重新上传。' + (msyj430_log ? ' 转换日志：' + msyj430_log.slice(0, 200) : ''));
    })();

    msyj430_promise.finally(() => {
        [msyj430_in, msyj430_out].forEach((msyj430_f) => {
            try { msyj430_fs.unlinkSync(msyj430_f); } catch (msyj430_e) { /* 忽略清理失败 */ }
        });
    });

    return msyj430_promise;
}

// 统一入口：按扩展名解析出纯文本
async function msyj430_parseFile(msyj430_buffer, msyj430_fileName) {
    const msyj430_ext = msyj430_path.extname(msyj430_fileName).toLowerCase();
    if (!msyj430_supportExt.includes(msyj430_ext)) {
        throw new Error('不支持的文件类型：' + (msyj430_ext || '未知') + '，支持 txt / md / pdf / doc / docx / ppt / pptx');
    }

    if (msyj430_plainExt.includes(msyj430_ext)) {
        return msyj430_stripTags(msyj430_buffer.toString('utf8'));
    }
    if (msyj430_ext === '.pdf') {
        return msyj430_parsePdf(msyj430_buffer);
    }
    if (msyj430_ext === '.docx') {
        return msyj430_parseDocx(msyj430_buffer);
    }
    if (msyj430_ext === '.pptx') {
        return msyj430_parsePptx(msyj430_buffer);
    }
    if (msyj430_ext === '.doc' || msyj430_ext === '.ppt') {
        return msyj430_convertLegacy(msyj430_buffer, msyj430_ext);
    }
    throw new Error('暂未实现的解析分支：' + msyj430_ext);
}

module.exports = { msyj430_parseFile, msyj430_supportExt };

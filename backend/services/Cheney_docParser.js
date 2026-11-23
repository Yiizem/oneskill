/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：文档解析服务，支持 txt/md/pdf/docx/pptx，doc/ppt 经 Office 转换后再解析
 */
const Cheney_fs = require('fs');
const Cheney_os = require('os');
const Cheney_path = require('path');
const Cheney_child = require('child_process');
const Cheney_AdmZip = require('adm-zip');
const Cheney_mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');

const Cheney_supportExt = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const Cheney_plainExt = ['.txt', '.md', '.csv', '.json', '.log'];

// 清理 XML/HTML 片段中的标签，保留文字
function Cheney_stripTags(Cheney_xml) {
    return Cheney_xml
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
async function Cheney_parseDocx(Cheney_buffer) {
    const Cheney_result = await Cheney_mammoth.extractRawText({ buffer: Cheney_buffer });
    return Cheney_result.value || '';
}

// 解析 pptx（按幻灯片顺序抽取 <a:t> 文本）
function Cheney_parsePptx(Cheney_buffer) {
    const Cheney_zip = new Cheney_AdmZip(Cheney_buffer);
    const Cheney_slideEntries = Cheney_zip.getEntries()
        .filter((Cheney_entry) => /ppt\/slides\/slide\d+\.xml$/.test(Cheney_entry.entryName))
        .sort((Cheney_a, Cheney_b) => {
            const Cheney_na = Number((Cheney_a.entryName.match(/slide(\d+)\.xml/) || [0, 0])[1]);
            const Cheney_nb = Number((Cheney_b.entryName.match(/slide(\d+)\.xml/) || [0, 0])[1]);
            return Cheney_na - Cheney_nb;
        });

    const Cheney_lines = [];
    Cheney_slideEntries.forEach((Cheney_entry, Cheney_index) => {
        const Cheney_xml = Cheney_zip.readAsText(Cheney_entry);
        const Cheney_texts = [];
        const Cheney_regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
        let Cheney_m = Cheney_regex.exec(Cheney_xml);
        while (Cheney_m) {
            const Cheney_t = Cheney_stripTags(Cheney_m[1]).trim();
            if (Cheney_t) {
                Cheney_texts.push(Cheney_t);
            }
            Cheney_m = Cheney_regex.exec(Cheney_xml);
        }
        if (Cheney_texts.length > 0) {
            Cheney_lines.push('第 ' + (Cheney_index + 1) + ' 页：' + Cheney_texts.join(' '));
        }
    });
    return Cheney_lines.join('\n\n');
}

// 解析 pdf（pdf-parse v2）
async function Cheney_parsePdf(Cheney_buffer) {
    const Cheney_parser = new PDFParse({ data: Cheney_buffer });
    try {
        const Cheney_result = await Cheney_parser.getText();
        const Cheney_raw = (Cheney_result && Cheney_result.text) || '';
        // PDF 逐字抽取常在中文字之间插入空格，这里把「中 文 字 符」之间多余的空格去掉
        return Cheney_raw.replace(/([\u4e00-\u9fa5，。、；：！？“”（）])[ \t]+(?=[\u4e00-\u9fa5，。、；：！？“”（）])/g, '$1');
    } finally {
        if (typeof Cheney_parser.destroy === 'function') {
            await Cheney_parser.destroy();
        }
    }
}

// doc / ppt 老格式：调用 Office COM 转成 docx / pptx 后解析
function Cheney_convertLegacy(Cheney_buffer, Cheney_ext) {
    const Cheney_tmpDir = Cheney_path.join(Cheney_os.tmpdir(), 'Cheney_kb_convert');
    Cheney_fs.mkdirSync(Cheney_tmpDir, { recursive: true });
    const Cheney_stamp = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const Cheney_in = Cheney_path.join(Cheney_tmpDir, Cheney_stamp + Cheney_ext);
    const Cheney_targetExt = Cheney_ext === '.doc' ? '.docx' : '.pptx';
    const Cheney_out = Cheney_path.join(Cheney_tmpDir, Cheney_stamp + Cheney_targetExt);
    Cheney_fs.writeFileSync(Cheney_in, Cheney_buffer);

    const Cheney_script = Cheney_path.join(__dirname, '..', 'scripts', 'Cheney_office_convert.ps1');
    const Cheney_ps = [
        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        'powershell.exe'
    ].find((Cheney_p) => {
        try {
            return Cheney_fs.existsSync(Cheney_p);
        } catch (Cheney_e) {
            return false;
        }
    }) || 'powershell.exe';

    const Cheney_ret = Cheney_child.spawnSync(Cheney_ps, [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', Cheney_script,
        '-In', Cheney_in, '-Out', Cheney_out, '-Kind', Cheney_ext === '.doc' ? 'word' : 'ppt'
    ], { encoding: 'utf8', timeout: 120000 });

    const Cheney_log = ((Cheney_ret.stdout || '') + (Cheney_ret.stderr || '')).trim();
    let Cheney_text = '';
    try {
        if (Cheney_fs.existsSync(Cheney_out)) {
            const Cheney_converted = Cheney_fs.readFileSync(Cheney_out);
            Cheney_text = Cheney_targetExt === '.docx'
                ? ''
                : Cheney_parsePptx(Cheney_converted);
        }
    } catch (Cheney_err) {
        throw new Error('老格式转换后解析失败：' + Cheney_err.message);
    }

    // docx 需要异步解析，这里把结果通过 Promise 返回给调用方
    const Cheney_promise = (async () => {
        if (Cheney_text) {
            return Cheney_text;
        }
        if (Cheney_fs.existsSync(Cheney_out)) {
            return await Cheney_parseDocx(Cheney_fs.readFileSync(Cheney_out));
        }
        throw new Error('Office 转换失败，请另存为 ' + Cheney_targetExt + ' 后重新上传。' + (Cheney_log ? ' 转换日志：' + Cheney_log.slice(0, 200) : ''));
    })();

    Cheney_promise.finally(() => {
        [Cheney_in, Cheney_out].forEach((Cheney_f) => {
            try { Cheney_fs.unlinkSync(Cheney_f); } catch (Cheney_e) { /* 忽略清理失败 */ }
        });
    });

    return Cheney_promise;
}

// 统一入口：按扩展名解析出纯文本
async function Cheney_parseFile(Cheney_buffer, Cheney_fileName) {
    const Cheney_ext = Cheney_path.extname(Cheney_fileName).toLowerCase();
    if (!Cheney_supportExt.includes(Cheney_ext)) {
        throw new Error('不支持的文件类型：' + (Cheney_ext || '未知') + '，支持 txt / md / pdf / doc / docx / ppt / pptx');
    }

    if (Cheney_plainExt.includes(Cheney_ext)) {
        return Cheney_stripTags(Cheney_buffer.toString('utf8'));
    }
    if (Cheney_ext === '.pdf') {
        return Cheney_parsePdf(Cheney_buffer);
    }
    if (Cheney_ext === '.docx') {
        return Cheney_parseDocx(Cheney_buffer);
    }
    if (Cheney_ext === '.pptx') {
        return Cheney_parsePptx(Cheney_buffer);
    }
    if (Cheney_ext === '.doc' || Cheney_ext === '.ppt') {
        return Cheney_convertLegacy(Cheney_buffer, Cheney_ext);
    }
    throw new Error('暂未实现的解析分支：' + Cheney_ext);
}

module.exports = { Cheney_parseFile, Cheney_supportExt };

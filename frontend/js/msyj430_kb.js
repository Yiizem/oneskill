/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库页面脚本，负责知识库管理、文件上传解析、切片预览与知识库问答，并在控制台输出收发数据
 */

(function () {
    var msyj430_state = {
        list: [],
        activeId: 0,
        activeName: '',
        busy: false
    };

    var msyj430_el = {
        kbList: document.getElementById('msyj430_kbList'),
        kbCount: document.getElementById('msyj430_kbCount'),
        newName: document.getElementById('msyj430_kbNewName'),
        newDesc: document.getElementById('msyj430_kbNewDesc'),
        createBtn: document.getElementById('msyj430_kbCreateBtn'),
        fileTitle: document.getElementById('msyj430_kbFileTitle'),
        fileInfo: document.getElementById('msyj430_kbFileInfo'),
        fileInput: document.getElementById('msyj430_kbFile'),
        uploadBtn: document.getElementById('msyj430_kbUploadBtn'),
        progress: document.getElementById('msyj430_kbProgress'),
        progressText: document.getElementById('msyj430_kbProgressText'),
        files: document.getElementById('msyj430_kbFiles'),
        chatTitle: document.getElementById('msyj430_kbChatTitle'),
        chatBody: document.getElementById('msyj430_kbChatBody'),
        chatClear: document.getElementById('msyj430_kbChatClear'),
        quick: document.getElementById('msyj430_kbQuick'),
        input: document.getElementById('msyj430_kbInput'),
        counter: document.getElementById('msyj430_kbCounter'),
        send: document.getElementById('msyj430_kbSend'),
        apiStatus: document.getElementById('msyj430_kbApiStatus'),
        apiCode: document.getElementById('msyj430_kbApiCode'),
        apiToggle: document.getElementById('msyj430_kbApiToggle'),
        embedBadge: document.getElementById('msyj430_kbEmbedBadge')
    };

    /* ---------------- 通用工具 ---------------- */

    // 接口面板：记录最近一次请求与响应
    function msyj430_showApi(msyj430_status, msyj430_request, msyj430_response) {
        msyj430_el.apiStatus.textContent = msyj430_status;
        msyj430_el.apiCode.textContent = '【发送】\n' + JSON.stringify(msyj430_request, null, 2) +
            '\n\n【接收】\n' + JSON.stringify(msyj430_response, null, 2);
    }

    function msyj430_setProgress(msyj430_text) {
        if (!msyj430_text) {
            msyj430_el.progress.classList.add('msyj430_kbProgressHidden');
            return;
        }
        msyj430_el.progress.classList.remove('msyj430_kbProgressHidden');
        msyj430_el.progressText.textContent = msyj430_text;
    }

    function msyj430_formatTime(msyj430_value) {
        if (!msyj430_value) {
            return '-';
        }
        var msyj430_date = new Date(msyj430_value);
        if (isNaN(msyj430_date.getTime())) {
            return String(msyj430_value);
        }
        var msyj430_pad = function (msyj430_n) { return msyj430_n < 10 ? '0' + msyj430_n : String(msyj430_n); };
        return msyj430_date.getFullYear() + '-' + msyj430_pad(msyj430_date.getMonth() + 1) + '-' +
            msyj430_pad(msyj430_date.getDate()) + ' ' + msyj430_pad(msyj430_date.getHours()) + ':' +
            msyj430_pad(msyj430_date.getMinutes());
    }

    // 统一的 JSON 请求
    function msyj430_request(msyj430_url, msyj430_options) {
        return fetch(msyj430_url, msyj430_options || {})
            .then(function (msyj430_res) {
                return msyj430_res.json().catch(function () {
                    return { code: -1, msg: '响应不是合法 JSON（HTTP ' + msyj430_res.status + '）' };
                });
            });
    }

    /* ---------------- 知识库列表 ---------------- */

    function msyj430_loadList() {
        msyj430_el.kbList.innerHTML = '<div class="msyj430_kbEmpty">正在加载知识库…</div>';
        msyj430_request('/api/kb')
            .then(function (msyj430_json) {
                console.log('[msyj430_kb] 知识库列表：', msyj430_json);
                if (!msyj430_json || msyj430_json.code !== 0) {
                    msyj430_el.kbList.innerHTML = '<div class="msyj430_kbEmpty">加载失败：' +
                        ((msyj430_json && msyj430_json.msg) || '未知错误') + '</div>';
                    return;
                }
                msyj430_state.list = (msyj430_json.data && msyj430_json.data.msyj430_list) || [];
                msyj430_renderList();
                if (msyj430_state.list.length > 0 && !msyj430_state.activeId) {
                    msyj430_selectKb(msyj430_state.list[0].msyj430_kb_id, msyj430_state.list[0].msyj430_kb_name);
                }
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 列表异常：', msyj430_err);
                msyj430_el.kbList.innerHTML = '<div class="msyj430_kbEmpty">网络异常：' + msyj430_err.message + '</div>';
            });
    }

    function msyj430_renderList() {
        msyj430_el.kbCount.textContent = '共 ' + msyj430_state.list.length + ' 个';
        if (msyj430_state.list.length === 0) {
            msyj430_el.kbList.innerHTML = '<div class="msyj430_kbEmpty">还没有知识库，先在下方新建一个</div>';
            return;
        }

        msyj430_el.kbList.innerHTML = '';
        msyj430_state.list.forEach(function (msyj430_kb) {
            var msyj430_item = document.createElement('div');
            msyj430_item.className = 'msyj430_kbItem' + (msyj430_kb.msyj430_kb_id === msyj430_state.activeId ? ' isActive' : '');
            msyj430_item.setAttribute('data-id', String(msyj430_kb.msyj430_kb_id));

            var msyj430_name = document.createElement('div');
            msyj430_name.className = 'msyj430_kbItemName';
            msyj430_name.textContent = msyj430_kb.msyj430_kb_name;

            var msyj430_desc = document.createElement('div');
            msyj430_desc.className = 'msyj430_kbItemDesc';
            msyj430_desc.textContent = msyj430_kb.msyj430_kb_desc || '未填写说明';

            var msyj430_meta = document.createElement('div');
            msyj430_meta.className = 'msyj430_kbItemMeta';
            msyj430_meta.innerHTML = '<span>文件 ' + (msyj430_kb.msyj430_file_count || 0) + '</span>' +
                '<span>切片 ' + (msyj430_kb.msyj430_chunk_count || 0) + '</span>' +
                '<span>' + msyj430_formatTime(msyj430_kb.msyj430_kb_created_at) + '</span>';

            var msyj430_del = document.createElement('button');
            msyj430_del.className = 'msyj430_kbItemDel';
            msyj430_del.type = 'button';
            msyj430_del.textContent = '删除';
            msyj430_del.setAttribute('data-del', String(msyj430_kb.msyj430_kb_id));

            msyj430_item.appendChild(msyj430_name);
            msyj430_item.appendChild(msyj430_desc);
            msyj430_item.appendChild(msyj430_meta);
            msyj430_item.appendChild(msyj430_del);
            msyj430_el.kbList.appendChild(msyj430_item);
        });
    }

    function msyj430_selectKb(msyj430_id, msyj430_name) {
        msyj430_state.activeId = msyj430_id;
        msyj430_state.activeName = msyj430_name || '';
        msyj430_renderList();
        msyj430_el.fileTitle.textContent = '文件管理 · ' + msyj430_state.activeName;
        msyj430_el.chatTitle.textContent = '知识库问答 · ' + msyj430_state.activeName;
        msyj430_el.uploadBtn.disabled = false;
        msyj430_el.send.disabled = false;
        msyj430_loadFiles();
    }

    /* ---------------- 新建 / 删除知识库 ---------------- */

    function msyj430_createKb() {
        var msyj430_name = msyj430_el.newName.value.trim();
        var msyj430_desc = msyj430_el.newDesc.value.trim();
        if (!msyj430_name) {
            msyj430_el.newName.focus();
            return;
        }
        var msyj430_payload = { name: msyj430_name, desc: msyj430_desc };
        msyj430_el.createBtn.disabled = true;
        msyj430_el.apiStatus.textContent = '状态：创建知识库中…';
        console.log('[msyj430_kb] 发送给大模型的检索数据 → 新建知识库：', JSON.stringify(msyj430_payload, null, 2));

        msyj430_request('/api/kb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msyj430_payload)
        })
            .then(function (msyj430_json) {
                console.log('[msyj430_kb] 创建知识库返回：', msyj430_json);
                msyj430_showApi('状态：创建 · code = ' + msyj430_json.code, msyj430_payload, msyj430_json);
                if (msyj430_json.code === 0) {
                    msyj430_el.newName.value = '';
                    msyj430_el.newDesc.value = '';
                    var msyj430_newId = msyj430_json.data.msyj430_kb_id;
                    msyj430_state.activeId = 0;
                    msyj430_loadList();
                    setTimeout(function () {
                        msyj430_selectKb(msyj430_newId, msyj430_name);
                    }, 400);
                } else {
                    alert('创建失败：' + (msyj430_json.msg || '未知错误'));
                }
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 创建异常：', msyj430_err);
                alert('创建失败：' + msyj430_err.message);
            })
            .finally(function () {
                msyj430_el.createBtn.disabled = false;
            });
    }

    function msyj430_deleteKb(msyj430_id) {
        if (!window.confirm('删除知识库会同时删除它的全部文件与切片，确认继续？')) {
            return;
        }
        msyj430_el.apiStatus.textContent = '状态：删除知识库中…';
        msyj430_request('/api/kb/' + msyj430_id, { method: 'DELETE' })
            .then(function (msyj430_json) {
                console.log('[msyj430_kb] 删除知识库返回：', msyj430_json);
                msyj430_showApi('状态：删除 · code = ' + msyj430_json.code, { id: msyj430_id }, msyj430_json);
                if (msyj430_state.activeId === msyj430_id) {
                    msyj430_state.activeId = 0;
                    msyj430_state.activeName = '';
                    msyj430_el.fileTitle.textContent = '文件管理 · 未选择知识库';
                    msyj430_el.chatTitle.textContent = '知识库问答 · 未选择知识库';
                    msyj430_el.files.innerHTML = '<div class="msyj430_kbEmpty">暂未选择知识库</div>';
                    msyj430_el.uploadBtn.disabled = true;
                    msyj430_el.send.disabled = true;
                }
                msyj430_loadList();
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 删除异常：', msyj430_err);
                alert('删除失败：' + msyj430_err.message);
            });
    }

    /* ---------------- 文件列表与上传 ---------------- */

    function msyj430_loadFiles() {
        if (!msyj430_state.activeId) {
            return;
        }
        msyj430_el.files.innerHTML = '<div class="msyj430_kbEmpty">正在加载文件…</div>';
        msyj430_request('/api/kb/' + msyj430_state.activeId + '/files')
            .then(function (msyj430_json) {
                console.log('[msyj430_kb] 文件列表：', msyj430_json);
                if (!msyj430_json || msyj430_json.code !== 0) {
                    msyj430_el.files.innerHTML = '<div class="msyj430_kbEmpty">加载失败：' +
                        ((msyj430_json && msyj430_json.msg) || '未知错误') + '</div>';
                    return;
                }
                var msyj430_files = (msyj430_json.data && msyj430_json.data.msyj430_list) || [];
                msyj430_renderFiles(msyj430_files);
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 文件列表异常：', msyj430_err);
                msyj430_el.files.innerHTML = '<div class="msyj430_kbEmpty">网络异常：' + msyj430_err.message + '</div>';
            });
    }

    function msyj430_renderFiles(msyj430_files) {
        msyj430_el.fileInfo.textContent = '共 ' + msyj430_files.length + ' 个文件';
        if (msyj430_files.length === 0) {
            msyj430_el.files.innerHTML = '<div class="msyj430_kbEmpty">还没有文件，上传一个 txt / pdf / docx / pptx 试试</div>';
            return;
        }

        msyj430_el.files.innerHTML = '';
        msyj430_files.forEach(function (msyj430_file) {
            var msyj430_card = document.createElement('div');
            msyj430_card.className = 'msyj430_kbFileCard';

            var msyj430_top = document.createElement('div');
            msyj430_top.className = 'msyj430_kbFileTop';

            var msyj430_name = document.createElement('span');
            msyj430_name.className = 'msyj430_kbFileName';
            msyj430_name.textContent = msyj430_file.msyj430_kb_file_name;

            var msyj430_tag = document.createElement('span');
            msyj430_tag.className = 'msyj430_kbFileTag' + (msyj430_file.msyj430_kb_file_status === 'failed' ? ' msyj430_kbFileTagFailed' : '');
            msyj430_tag.textContent = (msyj430_file.msyj430_kb_file_ext || '').replace('.', '').toUpperCase() +
                ' · ' + (msyj430_file.msyj430_kb_file_status === 'failed' ? '解析失败' : '已入库');

            msyj430_top.appendChild(msyj430_name);
            msyj430_top.appendChild(msyj430_tag);

            var msyj430_meta = document.createElement('div');
            msyj430_meta.className = 'msyj430_kbFileMeta';
            msyj430_meta.innerHTML = '<span>字数 ' + (msyj430_file.msyj430_kb_file_chars || 0) + '</span>' +
                '<span>切片 ' + (msyj430_file.msyj430_kb_file_chunks || 0) + '</span>' +
                '<span>大小 ' + Math.round((msyj430_file.msyj430_kb_file_size || 0) / 1024) + ' KB</span>' +
                '<span>上传 ' + msyj430_formatTime(msyj430_file.msyj430_kb_file_upload_time) + '</span>';

            msyj430_card.appendChild(msyj430_top);
            msyj430_card.appendChild(msyj430_meta);

            if (msyj430_file.msyj430_kb_file_error) {
                var msyj430_errEl = document.createElement('div');
                msyj430_errEl.className = 'msyj430_kbFileErr';
                msyj430_errEl.textContent = '错误：' + msyj430_file.msyj430_kb_file_error;
                msyj430_card.appendChild(msyj430_errEl);
            }

            var msyj430_actions = document.createElement('div');
            msyj430_actions.className = 'msyj430_kbFileActions';

            var msyj430_viewBtn = document.createElement('button');
            msyj430_viewBtn.className = 'msyj430_toolbarBtn';
            msyj430_viewBtn.type = 'button';
            msyj430_viewBtn.textContent = '查看切片';
            msyj430_viewBtn.setAttribute('data-view', String(msyj430_file.msyj430_kb_file_id));
            msyj430_viewBtn.setAttribute('data-name', msyj430_file.msyj430_kb_file_name);

            var msyj430_delBtn = document.createElement('button');
            msyj430_delBtn.className = 'msyj430_toolbarBtn';
            msyj430_delBtn.type = 'button';
            msyj430_delBtn.textContent = '删除文件';
            msyj430_delBtn.setAttribute('data-del', String(msyj430_file.msyj430_kb_file_id));

            msyj430_actions.appendChild(msyj430_viewBtn);
            msyj430_actions.appendChild(msyj430_delBtn);
            msyj430_card.appendChild(msyj430_actions);

            msyj430_el.files.appendChild(msyj430_card);
        });
    }

    function msyj430_uploadFile() {
        if (!msyj430_state.activeId) {
            alert('请先选择知识库');
            return;
        }
        var msyj430_file = msyj430_el.fileInput.files && msyj430_el.fileInput.files[0];
        if (!msyj430_file) {
            alert('请先选择要上传的文件');
            return;
        }

        var msyj430_form = new FormData();
        msyj430_form.append('file', msyj430_file);

        msyj430_el.uploadBtn.disabled = true;
        msyj430_setProgress('正在上传并解析「' + msyj430_file.name + '」，解析后会自动切片并生成向量，请稍候…');
        msyj430_el.apiStatus.textContent = '状态：上传解析中…';
        console.log('[msyj430_kb] 上传文件：', msyj430_file.name, msyj430_file.size + ' 字节', '→ /api/kb/' + msyj430_state.activeId + '/files');

        msyj430_request('/api/kb/' + msyj430_state.activeId + '/files', {
            method: 'POST',
            body: msyj430_form
        })
            .then(function (msyj430_json) {
                // 控制台输出：接收到的解析结果（后端已把这些片段发给大模型用于回答）
                console.log('[msyj430_kb] 从后端接收到的解析结果：', JSON.stringify(msyj430_json, null, 2));
                msyj430_showApi('状态：上传 · code = ' + msyj430_json.code,
                    { kbId: msyj430_state.activeId, fileName: msyj430_file.name }, msyj430_json);

                if (msyj430_json.code === 0) {
                    var msyj430_data = msyj430_json.data || {};
                    msyj430_setProgress('解析完成：' + (msyj430_data.msyj430_kb_file_name || msyj430_file.name) +
                        ' · ' + (msyj430_data.msyj430_kb_file_chars || 0) + ' 字 · ' +
                        (msyj430_data.msyj430_kb_file_chunks || 0) + ' 片 · 向量 ' +
                        (msyj430_data.msyj430_embedding === 'vector' ? '已生成' : '降级为关键词检索'));
                    if (msyj430_data.msyj430_kb_file_status === 'failed') {
                        msyj430_setProgress('解析失败：' + (msyj430_data.msyj430_kb_file_error || '请换一个可复制文字的文件'));
                    }
                } else {
                    msyj430_setProgress('上传失败：' + (msyj430_json.msg || '未知错误'));
                }
                msyj430_el.fileInput.value = '';
                msyj430_loadFiles();
                msyj430_loadList();
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 上传异常：', msyj430_err);
                msyj430_setProgress('上传异常：' + msyj430_err.message);
            })
            .finally(function () {
                msyj430_el.uploadBtn.disabled = false;
                setTimeout(function () { msyj430_setProgress(''); }, 6000);
            });
    }

    function msyj430_deleteFile(msyj430_fileId) {
        if (!window.confirm('删除该文件会同时删除它的切片，确认继续？')) {
            return;
        }
        msyj430_request('/api/kb/file/' + msyj430_fileId, { method: 'DELETE' })
            .then(function (msyj430_json) {
                console.log('[msyj430_kb] 删除文件返回：', msyj430_json);
                msyj430_showApi('状态：删除文件 · code = ' + msyj430_json.code, { fileId: msyj430_fileId }, msyj430_json);
                msyj430_loadFiles();
                msyj430_loadList();
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 删除文件异常：', msyj430_err);
            });
    }

    /* ---------------- 切片预览 ---------------- */

    function msyj430_openChunks(msyj430_fileId, msyj430_fileName) {
        var msyj430_mask = document.createElement('div');
        msyj430_mask.className = 'msyj430_kbMask isOpen';

        var msyj430_modal = document.createElement('div');
        msyj430_modal.className = 'msyj430_kbModal';

        var msyj430_head = document.createElement('div');
        msyj430_head.className = 'msyj430_kbModalHead';

        var msyj430_title = document.createElement('div');
        msyj430_title.className = 'msyj430_kbModalTitle';
        msyj430_title.textContent = '切片预览 · ' + msyj430_fileName;

        var msyj430_close = document.createElement('button');
        msyj430_close.className = 'msyj430_kbModalClose';
        msyj430_close.type = 'button';
        msyj430_close.textContent = '关闭';

        var msyj430_body = document.createElement('div');
        msyj430_body.className = 'msyj430_kbModalBody';
        msyj430_body.textContent = '正在读取切片…';

        msyj430_head.appendChild(msyj430_title);
        msyj430_head.appendChild(msyj430_close);
        msyj430_modal.appendChild(msyj430_head);
        msyj430_modal.appendChild(msyj430_body);
        msyj430_mask.appendChild(msyj430_modal);
        document.body.appendChild(msyj430_mask);

        function msyj430_closeMask() {
            msyj430_mask.remove();
        }
        msyj430_close.addEventListener('click', msyj430_closeMask);
        msyj430_mask.addEventListener('click', function (msyj430_event) {
            if (msyj430_event.target === msyj430_mask) {
                msyj430_closeMask();
            }
        });

        msyj430_request('/api/kb/chunks?fileId=' + msyj430_fileId + '&limit=20')
            .then(function (msyj430_json) {
                console.log('[msyj430_kb] 切片预览：', msyj430_json);
                msyj430_showApi('状态：切片预览 · code = ' + msyj430_json.code, { fileId: msyj430_fileId }, msyj430_json);
                if (!msyj430_json || msyj430_json.code !== 0) {
                    msyj430_body.textContent = '读取失败：' + ((msyj430_json && msyj430_json.msg) || '未知错误');
                    return;
                }
                var msyj430_rows = (msyj430_json.data && msyj430_json.data.msyj430_list) || [];
                msyj430_body.innerHTML = '';
                if (msyj430_rows.length === 0) {
                    msyj430_body.textContent = '该文件没有切片，可能是解析失败或内容为空。';
                    return;
                }
                msyj430_rows.forEach(function (msyj430_row) {
                    var msyj430_chunk = document.createElement('div');
                    msyj430_chunk.className = 'msyj430_kbChunk';
                    var msyj430_chunkHead = document.createElement('div');
                    msyj430_chunkHead.className = 'msyj430_kbChunkHead';
                    msyj430_chunkHead.textContent = '第 ' + (msyj430_row.msyj430_kb_chunk_index + 1) + ' 片 · ' +
                        (msyj430_row.msyj430_kb_chunk_chars || 0) + ' 字';
                    msyj430_chunk.appendChild(msyj430_chunkHead);
                    msyj430_chunk.appendChild(document.createTextNode(msyj430_row.msyj430_kb_chunk_content || ''));
                    msyj430_body.appendChild(msyj430_chunk);
                });
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 切片异常：', msyj430_err);
                msyj430_body.textContent = '读取失败：' + msyj430_err.message;
            });
    }

    /* ---------------- 知识库问答 ---------------- */

    function msyj430_renderMessage(msyj430_role, msyj430_text) {
        var msyj430_wrapper = document.createElement('div');
        msyj430_wrapper.className = 'msyj430_kbMsg ' + (msyj430_role === 'user' ? 'msyj430_kbMsgUser' : 'msyj430_kbMsgAssistant');

        var msyj430_avatar = document.createElement('div');
        msyj430_avatar.className = 'msyj430_kbMsgAvatar';
        msyj430_avatar.textContent = msyj430_role === 'user' ? '我' : 'KB';

        var msyj430_bubble = document.createElement('div');
        msyj430_bubble.className = 'msyj430_kbMsgBubble';
        String(msyj430_text || '').split(/\n{2,}/).forEach(function (msyj430_part) {
            if (!msyj430_part) {
                return;
            }
            var msyj430_p = document.createElement('p');
            msyj430_p.textContent = msyj430_part;
            msyj430_bubble.appendChild(msyj430_p);
        });

        msyj430_wrapper.appendChild(msyj430_avatar);
        msyj430_wrapper.appendChild(msyj430_bubble);
        msyj430_el.chatBody.appendChild(msyj430_wrapper);
        msyj430_el.chatBody.scrollTop = msyj430_el.chatBody.scrollHeight;
        return msyj430_bubble;
    }

    function msyj430_appendSources(msyj430_bubble, msyj430_sources, msyj430_mode) {
        var msyj430_meta = document.createElement('div');
        msyj430_meta.className = 'msyj430_kbMsgMeta';
        msyj430_meta.textContent = '检索模式：' + (msyj430_mode === 'vector' ? '向量余弦' : (msyj430_mode === 'keyword' ? '关键词降级' : '未命中')) +
            ' · 命中 ' + msyj430_sources.length + ' 个片段';

        var msyj430_box = document.createElement('div');
        msyj430_box.className = 'msyj430_kbSourceText';
        msyj430_box.style.display = 'none';

        msyj430_sources.forEach(function (msyj430_source) {
            var msyj430_chip = document.createElement('button');
            msyj430_chip.className = 'msyj430_kbSource';
            msyj430_chip.type = 'button';
            msyj430_chip.textContent = '【' + msyj430_source.msyj430_rank + '】' + msyj430_source.msyj430_file_name +
                ' · 第' + (msyj430_source.msyj430_chunk_index + 1) + '片 · ' + msyj430_source.msyj430_score;
            msyj430_chip.addEventListener('click', function () {
                var msyj430_open = msyj430_box.style.display === 'none';
                msyj430_box.style.display = msyj430_open ? 'block' : 'none';
                msyj430_box.textContent = '【' + msyj430_source.msyj430_file_name + ' · 第' +
                    (msyj430_source.msyj430_chunk_index + 1) + ' 片】\n' + msyj430_source.msyj430_content;
            });
            msyj430_bubble.appendChild(msyj430_chip);
        });

        msyj430_bubble.appendChild(msyj430_meta);
        if (msyj430_sources.length > 0) {
            msyj430_bubble.appendChild(msyj430_box);
        }
    }

    function msyj430_send() {
        var msyj430_question = msyj430_el.input.value.trim();
        if (!msyj430_question || msyj430_state.busy) {
            return;
        }
        if (!msyj430_state.activeId) {
            alert('请先选择知识库');
            return;
        }

        msyj430_renderMessage('user', msyj430_question);
        var msyj430_payload = { kbId: msyj430_state.activeId, question: msyj430_question };

        // 控制台输出：发送给大模型的数据（经后端补入参考资料后转发）
        console.log('[msyj430_kb] 发送给大模型的数据（提问）：', JSON.stringify(msyj430_payload, null, 2));
        console.log(msyj430_payload);

        msyj430_el.input.value = '';
        msyj430_el.counter.textContent = '0 / 1000';
        msyj430_state.busy = true;
        msyj430_el.send.disabled = true;
        msyj430_el.apiStatus.textContent = '状态：检索知识库并请求大模型中…';

        var msyj430_wait = msyj430_renderMessage('assistant', '正在检索知识库…');

        msyj430_request('/api/kb/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msyj430_payload)
        })
            .then(function (msyj430_json) {
                // 控制台输出：从大模型接收到的数据（后端已打印原始响应，这里打印完整业务响应）
                console.log('[msyj430_kb] 从大模型接收到的数据：', JSON.stringify(msyj430_json, null, 2));
                console.log(msyj430_json);

                var msyj430_row = msyj430_wait.parentElement;
                if (msyj430_json && msyj430_json.code === 0 && msyj430_json.data) {
                    var msyj430_data = msyj430_json.data;
                    var msyj430_meta = (msyj430_data.msyj430_model || '') + ' · ' +
                        (msyj430_data.msyj430_usage ? 'tokens ' + (msyj430_data.msyj430_usage.total_tokens || '-') : '未调用模型');
                    msyj430_wait.innerHTML = '';
                    String(msyj430_data.msyj430_answer || '').split(/\n{2,}/).forEach(function (msyj430_part) {
                        if (!msyj430_part) {
                            return;
                        }
                        var msyj430_p = document.createElement('p');
                        msyj430_p.textContent = msyj430_part;
                        msyj430_wait.appendChild(msyj430_p);
                    });
                    if (msyj430_meta) {
                        var msyj430_modelEl = document.createElement('div');
                        msyj430_modelEl.className = 'msyj430_kbMsgTip';
                        msyj430_modelEl.textContent = msyj430_meta;
                        msyj430_wait.appendChild(msyj430_modelEl);
                    }
                    msyj430_appendSources(msyj430_wait, msyj430_data.msyj430_sources || [], msyj430_data.msyj430_mode);
                    msyj430_showApi('状态：成功 · code = 0', msyj430_payload, msyj430_json);
                } else {
                    msyj430_row.classList.add('msyj430_kbMsgError');
                    msyj430_wait.innerHTML = '';
                    var msyj430_errP = document.createElement('p');
                    msyj430_errP.textContent = '⚠ ' + ((msyj430_json && msyj430_json.msg) || '请求失败');
                    msyj430_wait.appendChild(msyj430_errP);
                    msyj430_showApi('状态：失败 · code = ' + ((msyj430_json && msyj430_json.code) || '-'), msyj430_payload, msyj430_json);
                }
                msyj430_el.chatBody.scrollTop = msyj430_el.chatBody.scrollHeight;
            })
            .catch(function (msyj430_err) {
                console.error('[msyj430_kb] 问答异常：', msyj430_err);
                var msyj430_row = msyj430_wait.parentElement;
                msyj430_row.classList.add('msyj430_kbMsgError');
                msyj430_wait.innerHTML = '';
                var msyj430_errP = document.createElement('p');
                msyj430_errP.textContent = '⚠ 网络或服务异常：' + msyj430_err.message;
                msyj430_wait.appendChild(msyj430_errP);
                msyj430_showApi('状态：异常', msyj430_payload, { error: msyj430_err.message });
            })
            .finally(function () {
                msyj430_state.busy = false;
                msyj430_el.send.disabled = !msyj430_state.activeId;
                msyj430_el.input.focus();
            });
    }

    /* ---------------- 事件绑定 ---------------- */

    msyj430_el.kbList.addEventListener('click', function (msyj430_event) {
        var msyj430_del = msyj430_event.target.closest('[data-del]');
        if (msyj430_del) {
            msyj430_event.stopPropagation();
            msyj430_deleteKb(Number(msyj430_del.getAttribute('data-del')));
            return;
        }
        var msyj430_item = msyj430_event.target.closest('.msyj430_kbItem');
        if (!msyj430_item) {
            return;
        }
        var msyj430_id = Number(msyj430_item.getAttribute('data-id'));
        var msyj430_name = msyj430_item.querySelector('.msyj430_kbItemName').textContent;
        msyj430_selectKb(msyj430_id, msyj430_name);
    });

    msyj430_el.createBtn.addEventListener('click', msyj430_createKb);
    msyj430_el.newName.addEventListener('keydown', function (msyj430_event) {
        if (msyj430_event.key === 'Enter') {
            msyj430_event.preventDefault();
            msyj430_el.newDesc.focus();
        }
    });
    msyj430_el.newDesc.addEventListener('keydown', function (msyj430_event) {
        if (msyj430_event.key === 'Enter') {
            msyj430_event.preventDefault();
            msyj430_createKb();
        }
    });

    msyj430_el.uploadBtn.addEventListener('click', msyj430_uploadFile);

    msyj430_el.files.addEventListener('click', function (msyj430_event) {
        var msyj430_view = msyj430_event.target.closest('[data-view]');
        if (msyj430_view) {
            msyj430_openChunks(Number(msyj430_view.getAttribute('data-view')), msyj430_view.getAttribute('data-name'));
            return;
        }
        var msyj430_del = msyj430_event.target.closest('[data-del]');
        if (msyj430_del) {
            msyj430_deleteFile(Number(msyj430_del.getAttribute('data-del')));
        }
    });

    msyj430_el.input.addEventListener('input', function () {
        msyj430_el.counter.textContent = msyj430_el.input.value.length + ' / 1000';
    });

    msyj430_el.input.addEventListener('keydown', function (msyj430_event) {
        if (msyj430_event.key === 'Enter' && !msyj430_event.shiftKey) {
            msyj430_event.preventDefault();
            msyj430_send();
        }
    });

    msyj430_el.send.addEventListener('click', msyj430_send);

    msyj430_el.quick.addEventListener('click', function (msyj430_event) {
        var msyj430_btn = msyj430_event.target.closest('[data-q]');
        if (!msyj430_btn) {
            return;
        }
        msyj430_el.input.value = msyj430_btn.getAttribute('data-q');
        msyj430_el.counter.textContent = msyj430_el.input.value.length + ' / 1000';
        msyj430_send();
    });

    msyj430_el.chatClear.addEventListener('click', function () {
        msyj430_el.chatBody.innerHTML = '';
        msyj430_renderMessage('assistant', '问答已清空，可以继续基于当前知识库提问。');
        msyj430_el.apiStatus.textContent = '状态：待操作';
        msyj430_el.apiCode.textContent = '尚未请求接口';
        console.log('[msyj430_kb] 已清空问答记录');
    });

    msyj430_el.apiToggle.addEventListener('click', function () {
        var msyj430_hidden = msyj430_el.apiCode.classList.toggle('msyj430_codeHidden');
        msyj430_el.apiToggle.textContent = msyj430_hidden ? '查看原始数据' : '收起原始数据';
    });

    msyj430_loadList();
})();

/*
 * 姓名：孟思颐佳 | 学号：24001010430 | 时间：2026-11-23 | 大模型：豆包
 * 文件说明：知识库页面脚本，负责知识库管理、文件上传解析、切片预览与知识库问答，并在控制台输出收发数据
 */

(function () {
    var Cheney_state = {
        list: [],
        activeId: 0,
        activeName: '',
        busy: false
    };

    var Cheney_el = {
        kbList: document.getElementById('Cheney_kbList'),
        kbCount: document.getElementById('Cheney_kbCount'),
        newName: document.getElementById('Cheney_kbNewName'),
        newDesc: document.getElementById('Cheney_kbNewDesc'),
        createBtn: document.getElementById('Cheney_kbCreateBtn'),
        fileTitle: document.getElementById('Cheney_kbFileTitle'),
        fileInfo: document.getElementById('Cheney_kbFileInfo'),
        fileInput: document.getElementById('Cheney_kbFile'),
        uploadBtn: document.getElementById('Cheney_kbUploadBtn'),
        progress: document.getElementById('Cheney_kbProgress'),
        progressText: document.getElementById('Cheney_kbProgressText'),
        files: document.getElementById('Cheney_kbFiles'),
        chatTitle: document.getElementById('Cheney_kbChatTitle'),
        chatBody: document.getElementById('Cheney_kbChatBody'),
        chatClear: document.getElementById('Cheney_kbChatClear'),
        quick: document.getElementById('Cheney_kbQuick'),
        input: document.getElementById('Cheney_kbInput'),
        counter: document.getElementById('Cheney_kbCounter'),
        send: document.getElementById('Cheney_kbSend'),
        apiStatus: document.getElementById('Cheney_kbApiStatus'),
        apiCode: document.getElementById('Cheney_kbApiCode'),
        apiToggle: document.getElementById('Cheney_kbApiToggle'),
        embedBadge: document.getElementById('Cheney_kbEmbedBadge')
    };

    /* ---------------- 通用工具 ---------------- */

    // 接口面板：记录最近一次请求与响应
    function Cheney_showApi(Cheney_status, Cheney_request, Cheney_response) {
        Cheney_el.apiStatus.textContent = Cheney_status;
        Cheney_el.apiCode.textContent = '【发送】\n' + JSON.stringify(Cheney_request, null, 2) +
            '\n\n【接收】\n' + JSON.stringify(Cheney_response, null, 2);
    }

    function Cheney_setProgress(Cheney_text) {
        if (!Cheney_text) {
            Cheney_el.progress.classList.add('Cheney_kbProgressHidden');
            return;
        }
        Cheney_el.progress.classList.remove('Cheney_kbProgressHidden');
        Cheney_el.progressText.textContent = Cheney_text;
    }

    function Cheney_formatTime(Cheney_value) {
        if (!Cheney_value) {
            return '-';
        }
        var Cheney_date = new Date(Cheney_value);
        if (isNaN(Cheney_date.getTime())) {
            return String(Cheney_value);
        }
        var Cheney_pad = function (Cheney_n) { return Cheney_n < 10 ? '0' + Cheney_n : String(Cheney_n); };
        return Cheney_date.getFullYear() + '-' + Cheney_pad(Cheney_date.getMonth() + 1) + '-' +
            Cheney_pad(Cheney_date.getDate()) + ' ' + Cheney_pad(Cheney_date.getHours()) + ':' +
            Cheney_pad(Cheney_date.getMinutes());
    }

    // 统一的 JSON 请求
    function Cheney_request(Cheney_url, Cheney_options) {
        return fetch(Cheney_url, Cheney_options || {})
            .then(function (Cheney_res) {
                return Cheney_res.json().catch(function () {
                    return { code: -1, msg: '响应不是合法 JSON（HTTP ' + Cheney_res.status + '）' };
                });
            });
    }

    /* ---------------- 知识库列表 ---------------- */

    function Cheney_loadList() {
        Cheney_el.kbList.innerHTML = '<div class="Cheney_kbEmpty">正在加载知识库…</div>';
        Cheney_request('/api/kb')
            .then(function (Cheney_json) {
                console.log('[Cheney_kb] 知识库列表：', Cheney_json);
                if (!Cheney_json || Cheney_json.code !== 0) {
                    Cheney_el.kbList.innerHTML = '<div class="Cheney_kbEmpty">加载失败：' +
                        ((Cheney_json && Cheney_json.msg) || '未知错误') + '</div>';
                    return;
                }
                Cheney_state.list = (Cheney_json.data && Cheney_json.data.Cheney_list) || [];
                Cheney_renderList();
                if (Cheney_state.list.length > 0 && !Cheney_state.activeId) {
                    Cheney_selectKb(Cheney_state.list[0].Cheney_kb_id, Cheney_state.list[0].Cheney_kb_name);
                }
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 列表异常：', Cheney_err);
                Cheney_el.kbList.innerHTML = '<div class="Cheney_kbEmpty">网络异常：' + Cheney_err.message + '</div>';
            });
    }

    function Cheney_renderList() {
        Cheney_el.kbCount.textContent = '共 ' + Cheney_state.list.length + ' 个';
        if (Cheney_state.list.length === 0) {
            Cheney_el.kbList.innerHTML = '<div class="Cheney_kbEmpty">还没有知识库，先在下方新建一个</div>';
            return;
        }

        Cheney_el.kbList.innerHTML = '';
        Cheney_state.list.forEach(function (Cheney_kb) {
            var Cheney_item = document.createElement('div');
            Cheney_item.className = 'Cheney_kbItem' + (Cheney_kb.Cheney_kb_id === Cheney_state.activeId ? ' isActive' : '');
            Cheney_item.setAttribute('data-id', String(Cheney_kb.Cheney_kb_id));

            var Cheney_name = document.createElement('div');
            Cheney_name.className = 'Cheney_kbItemName';
            Cheney_name.textContent = Cheney_kb.Cheney_kb_name;

            var Cheney_desc = document.createElement('div');
            Cheney_desc.className = 'Cheney_kbItemDesc';
            Cheney_desc.textContent = Cheney_kb.Cheney_kb_desc || '未填写说明';

            var Cheney_meta = document.createElement('div');
            Cheney_meta.className = 'Cheney_kbItemMeta';
            Cheney_meta.innerHTML = '<span>文件 ' + (Cheney_kb.Cheney_file_count || 0) + '</span>' +
                '<span>切片 ' + (Cheney_kb.Cheney_chunk_count || 0) + '</span>' +
                '<span>' + Cheney_formatTime(Cheney_kb.Cheney_kb_created_at) + '</span>';

            var Cheney_del = document.createElement('button');
            Cheney_del.className = 'Cheney_kbItemDel';
            Cheney_del.type = 'button';
            Cheney_del.textContent = '删除';
            Cheney_del.setAttribute('data-del', String(Cheney_kb.Cheney_kb_id));

            Cheney_item.appendChild(Cheney_name);
            Cheney_item.appendChild(Cheney_desc);
            Cheney_item.appendChild(Cheney_meta);
            Cheney_item.appendChild(Cheney_del);
            Cheney_el.kbList.appendChild(Cheney_item);
        });
    }

    function Cheney_selectKb(Cheney_id, Cheney_name) {
        Cheney_state.activeId = Cheney_id;
        Cheney_state.activeName = Cheney_name || '';
        Cheney_renderList();
        Cheney_el.fileTitle.textContent = '文件管理 · ' + Cheney_state.activeName;
        Cheney_el.chatTitle.textContent = '知识库问答 · ' + Cheney_state.activeName;
        Cheney_el.uploadBtn.disabled = false;
        Cheney_el.send.disabled = false;
        Cheney_loadFiles();
    }

    /* ---------------- 新建 / 删除知识库 ---------------- */

    function Cheney_createKb() {
        var Cheney_name = Cheney_el.newName.value.trim();
        var Cheney_desc = Cheney_el.newDesc.value.trim();
        if (!Cheney_name) {
            Cheney_el.newName.focus();
            return;
        }
        var Cheney_payload = { name: Cheney_name, desc: Cheney_desc };
        Cheney_el.createBtn.disabled = true;
        Cheney_el.apiStatus.textContent = '状态：创建知识库中…';
        console.log('[Cheney_kb] 发送给大模型的检索数据 → 新建知识库：', JSON.stringify(Cheney_payload, null, 2));

        Cheney_request('/api/kb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Cheney_payload)
        })
            .then(function (Cheney_json) {
                console.log('[Cheney_kb] 创建知识库返回：', Cheney_json);
                Cheney_showApi('状态：创建 · code = ' + Cheney_json.code, Cheney_payload, Cheney_json);
                if (Cheney_json.code === 0) {
                    Cheney_el.newName.value = '';
                    Cheney_el.newDesc.value = '';
                    var Cheney_newId = Cheney_json.data.Cheney_kb_id;
                    Cheney_state.activeId = 0;
                    Cheney_loadList();
                    setTimeout(function () {
                        Cheney_selectKb(Cheney_newId, Cheney_name);
                    }, 400);
                } else {
                    alert('创建失败：' + (Cheney_json.msg || '未知错误'));
                }
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 创建异常：', Cheney_err);
                alert('创建失败：' + Cheney_err.message);
            })
            .finally(function () {
                Cheney_el.createBtn.disabled = false;
            });
    }

    function Cheney_deleteKb(Cheney_id) {
        if (!window.confirm('删除知识库会同时删除它的全部文件与切片，确认继续？')) {
            return;
        }
        Cheney_el.apiStatus.textContent = '状态：删除知识库中…';
        Cheney_request('/api/kb/' + Cheney_id, { method: 'DELETE' })
            .then(function (Cheney_json) {
                console.log('[Cheney_kb] 删除知识库返回：', Cheney_json);
                Cheney_showApi('状态：删除 · code = ' + Cheney_json.code, { id: Cheney_id }, Cheney_json);
                if (Cheney_state.activeId === Cheney_id) {
                    Cheney_state.activeId = 0;
                    Cheney_state.activeName = '';
                    Cheney_el.fileTitle.textContent = '文件管理 · 未选择知识库';
                    Cheney_el.chatTitle.textContent = '知识库问答 · 未选择知识库';
                    Cheney_el.files.innerHTML = '<div class="Cheney_kbEmpty">暂未选择知识库</div>';
                    Cheney_el.uploadBtn.disabled = true;
                    Cheney_el.send.disabled = true;
                }
                Cheney_loadList();
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 删除异常：', Cheney_err);
                alert('删除失败：' + Cheney_err.message);
            });
    }

    /* ---------------- 文件列表与上传 ---------------- */

    function Cheney_loadFiles() {
        if (!Cheney_state.activeId) {
            return;
        }
        Cheney_el.files.innerHTML = '<div class="Cheney_kbEmpty">正在加载文件…</div>';
        Cheney_request('/api/kb/' + Cheney_state.activeId + '/files')
            .then(function (Cheney_json) {
                console.log('[Cheney_kb] 文件列表：', Cheney_json);
                if (!Cheney_json || Cheney_json.code !== 0) {
                    Cheney_el.files.innerHTML = '<div class="Cheney_kbEmpty">加载失败：' +
                        ((Cheney_json && Cheney_json.msg) || '未知错误') + '</div>';
                    return;
                }
                var Cheney_files = (Cheney_json.data && Cheney_json.data.Cheney_list) || [];
                Cheney_renderFiles(Cheney_files);
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 文件列表异常：', Cheney_err);
                Cheney_el.files.innerHTML = '<div class="Cheney_kbEmpty">网络异常：' + Cheney_err.message + '</div>';
            });
    }

    function Cheney_renderFiles(Cheney_files) {
        Cheney_el.fileInfo.textContent = '共 ' + Cheney_files.length + ' 个文件';
        if (Cheney_files.length === 0) {
            Cheney_el.files.innerHTML = '<div class="Cheney_kbEmpty">还没有文件，上传一个 txt / pdf / docx / pptx 试试</div>';
            return;
        }

        Cheney_el.files.innerHTML = '';
        Cheney_files.forEach(function (Cheney_file) {
            var Cheney_card = document.createElement('div');
            Cheney_card.className = 'Cheney_kbFileCard';

            var Cheney_top = document.createElement('div');
            Cheney_top.className = 'Cheney_kbFileTop';

            var Cheney_name = document.createElement('span');
            Cheney_name.className = 'Cheney_kbFileName';
            Cheney_name.textContent = Cheney_file.Cheney_kb_file_name;

            var Cheney_tag = document.createElement('span');
            Cheney_tag.className = 'Cheney_kbFileTag' + (Cheney_file.Cheney_kb_file_status === 'failed' ? ' Cheney_kbFileTagFailed' : '');
            Cheney_tag.textContent = (Cheney_file.Cheney_kb_file_ext || '').replace('.', '').toUpperCase() +
                ' · ' + (Cheney_file.Cheney_kb_file_status === 'failed' ? '解析失败' : '已入库');

            Cheney_top.appendChild(Cheney_name);
            Cheney_top.appendChild(Cheney_tag);

            var Cheney_meta = document.createElement('div');
            Cheney_meta.className = 'Cheney_kbFileMeta';
            Cheney_meta.innerHTML = '<span>字数 ' + (Cheney_file.Cheney_kb_file_chars || 0) + '</span>' +
                '<span>切片 ' + (Cheney_file.Cheney_kb_file_chunks || 0) + '</span>' +
                '<span>大小 ' + Math.round((Cheney_file.Cheney_kb_file_size || 0) / 1024) + ' KB</span>' +
                '<span>上传 ' + Cheney_formatTime(Cheney_file.Cheney_kb_file_upload_time) + '</span>';

            Cheney_card.appendChild(Cheney_top);
            Cheney_card.appendChild(Cheney_meta);

            if (Cheney_file.Cheney_kb_file_error) {
                var Cheney_errEl = document.createElement('div');
                Cheney_errEl.className = 'Cheney_kbFileErr';
                Cheney_errEl.textContent = '错误：' + Cheney_file.Cheney_kb_file_error;
                Cheney_card.appendChild(Cheney_errEl);
            }

            var Cheney_actions = document.createElement('div');
            Cheney_actions.className = 'Cheney_kbFileActions';

            var Cheney_viewBtn = document.createElement('button');
            Cheney_viewBtn.className = 'Cheney_toolbarBtn';
            Cheney_viewBtn.type = 'button';
            Cheney_viewBtn.textContent = '查看切片';
            Cheney_viewBtn.setAttribute('data-view', String(Cheney_file.Cheney_kb_file_id));
            Cheney_viewBtn.setAttribute('data-name', Cheney_file.Cheney_kb_file_name);

            var Cheney_delBtn = document.createElement('button');
            Cheney_delBtn.className = 'Cheney_toolbarBtn';
            Cheney_delBtn.type = 'button';
            Cheney_delBtn.textContent = '删除文件';
            Cheney_delBtn.setAttribute('data-del', String(Cheney_file.Cheney_kb_file_id));

            Cheney_actions.appendChild(Cheney_viewBtn);
            Cheney_actions.appendChild(Cheney_delBtn);
            Cheney_card.appendChild(Cheney_actions);

            Cheney_el.files.appendChild(Cheney_card);
        });
    }

    function Cheney_uploadFile() {
        if (!Cheney_state.activeId) {
            alert('请先选择知识库');
            return;
        }
        var Cheney_file = Cheney_el.fileInput.files && Cheney_el.fileInput.files[0];
        if (!Cheney_file) {
            alert('请先选择要上传的文件');
            return;
        }

        var Cheney_form = new FormData();
        Cheney_form.append('file', Cheney_file);

        Cheney_el.uploadBtn.disabled = true;
        Cheney_setProgress('正在上传并解析「' + Cheney_file.name + '」，解析后会自动切片并生成向量，请稍候…');
        Cheney_el.apiStatus.textContent = '状态：上传解析中…';
        console.log('[Cheney_kb] 上传文件：', Cheney_file.name, Cheney_file.size + ' 字节', '→ /api/kb/' + Cheney_state.activeId + '/files');

        Cheney_request('/api/kb/' + Cheney_state.activeId + '/files', {
            method: 'POST',
            body: Cheney_form
        })
            .then(function (Cheney_json) {
                // 控制台输出：接收到的解析结果（后端已把这些片段发给大模型用于回答）
                console.log('[Cheney_kb] 从后端接收到的解析结果：', JSON.stringify(Cheney_json, null, 2));
                Cheney_showApi('状态：上传 · code = ' + Cheney_json.code,
                    { kbId: Cheney_state.activeId, fileName: Cheney_file.name }, Cheney_json);

                if (Cheney_json.code === 0) {
                    var Cheney_data = Cheney_json.data || {};
                    Cheney_setProgress('解析完成：' + (Cheney_data.Cheney_kb_file_name || Cheney_file.name) +
                        ' · ' + (Cheney_data.Cheney_kb_file_chars || 0) + ' 字 · ' +
                        (Cheney_data.Cheney_kb_file_chunks || 0) + ' 片 · 向量 ' +
                        (Cheney_data.Cheney_embedding === 'vector' ? '已生成' : '降级为关键词检索'));
                    if (Cheney_data.Cheney_kb_file_status === 'failed') {
                        Cheney_setProgress('解析失败：' + (Cheney_data.Cheney_kb_file_error || '请换一个可复制文字的文件'));
                    }
                } else {
                    Cheney_setProgress('上传失败：' + (Cheney_json.msg || '未知错误'));
                }
                Cheney_el.fileInput.value = '';
                Cheney_loadFiles();
                Cheney_loadList();
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 上传异常：', Cheney_err);
                Cheney_setProgress('上传异常：' + Cheney_err.message);
            })
            .finally(function () {
                Cheney_el.uploadBtn.disabled = false;
                setTimeout(function () { Cheney_setProgress(''); }, 6000);
            });
    }

    function Cheney_deleteFile(Cheney_fileId) {
        if (!window.confirm('删除该文件会同时删除它的切片，确认继续？')) {
            return;
        }
        Cheney_request('/api/kb/file/' + Cheney_fileId, { method: 'DELETE' })
            .then(function (Cheney_json) {
                console.log('[Cheney_kb] 删除文件返回：', Cheney_json);
                Cheney_showApi('状态：删除文件 · code = ' + Cheney_json.code, { fileId: Cheney_fileId }, Cheney_json);
                Cheney_loadFiles();
                Cheney_loadList();
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 删除文件异常：', Cheney_err);
            });
    }

    /* ---------------- 切片预览 ---------------- */

    function Cheney_openChunks(Cheney_fileId, Cheney_fileName) {
        var Cheney_mask = document.createElement('div');
        Cheney_mask.className = 'Cheney_kbMask isOpen';

        var Cheney_modal = document.createElement('div');
        Cheney_modal.className = 'Cheney_kbModal';

        var Cheney_head = document.createElement('div');
        Cheney_head.className = 'Cheney_kbModalHead';

        var Cheney_title = document.createElement('div');
        Cheney_title.className = 'Cheney_kbModalTitle';
        Cheney_title.textContent = '切片预览 · ' + Cheney_fileName;

        var Cheney_close = document.createElement('button');
        Cheney_close.className = 'Cheney_kbModalClose';
        Cheney_close.type = 'button';
        Cheney_close.textContent = '关闭';

        var Cheney_body = document.createElement('div');
        Cheney_body.className = 'Cheney_kbModalBody';
        Cheney_body.textContent = '正在读取切片…';

        Cheney_head.appendChild(Cheney_title);
        Cheney_head.appendChild(Cheney_close);
        Cheney_modal.appendChild(Cheney_head);
        Cheney_modal.appendChild(Cheney_body);
        Cheney_mask.appendChild(Cheney_modal);
        document.body.appendChild(Cheney_mask);

        function Cheney_closeMask() {
            Cheney_mask.remove();
        }
        Cheney_close.addEventListener('click', Cheney_closeMask);
        Cheney_mask.addEventListener('click', function (Cheney_event) {
            if (Cheney_event.target === Cheney_mask) {
                Cheney_closeMask();
            }
        });

        Cheney_request('/api/kb/chunks?fileId=' + Cheney_fileId + '&limit=20')
            .then(function (Cheney_json) {
                console.log('[Cheney_kb] 切片预览：', Cheney_json);
                Cheney_showApi('状态：切片预览 · code = ' + Cheney_json.code, { fileId: Cheney_fileId }, Cheney_json);
                if (!Cheney_json || Cheney_json.code !== 0) {
                    Cheney_body.textContent = '读取失败：' + ((Cheney_json && Cheney_json.msg) || '未知错误');
                    return;
                }
                var Cheney_rows = (Cheney_json.data && Cheney_json.data.Cheney_list) || [];
                Cheney_body.innerHTML = '';
                if (Cheney_rows.length === 0) {
                    Cheney_body.textContent = '该文件没有切片，可能是解析失败或内容为空。';
                    return;
                }
                Cheney_rows.forEach(function (Cheney_row) {
                    var Cheney_chunk = document.createElement('div');
                    Cheney_chunk.className = 'Cheney_kbChunk';
                    var Cheney_chunkHead = document.createElement('div');
                    Cheney_chunkHead.className = 'Cheney_kbChunkHead';
                    Cheney_chunkHead.textContent = '第 ' + (Cheney_row.Cheney_kb_chunk_index + 1) + ' 片 · ' +
                        (Cheney_row.Cheney_kb_chunk_chars || 0) + ' 字';
                    Cheney_chunk.appendChild(Cheney_chunkHead);
                    Cheney_chunk.appendChild(document.createTextNode(Cheney_row.Cheney_kb_chunk_content || ''));
                    Cheney_body.appendChild(Cheney_chunk);
                });
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 切片异常：', Cheney_err);
                Cheney_body.textContent = '读取失败：' + Cheney_err.message;
            });
    }

    /* ---------------- 知识库问答 ---------------- */

    function Cheney_renderMessage(Cheney_role, Cheney_text) {
        var Cheney_wrapper = document.createElement('div');
        Cheney_wrapper.className = 'Cheney_kbMsg ' + (Cheney_role === 'user' ? 'Cheney_kbMsgUser' : 'Cheney_kbMsgAssistant');

        var Cheney_avatar = document.createElement('div');
        Cheney_avatar.className = 'Cheney_kbMsgAvatar';
        Cheney_avatar.textContent = Cheney_role === 'user' ? '我' : 'KB';

        var Cheney_bubble = document.createElement('div');
        Cheney_bubble.className = 'Cheney_kbMsgBubble';
        String(Cheney_text || '').split(/\n{2,}/).forEach(function (Cheney_part) {
            if (!Cheney_part) {
                return;
            }
            var Cheney_p = document.createElement('p');
            Cheney_p.textContent = Cheney_part;
            Cheney_bubble.appendChild(Cheney_p);
        });

        Cheney_wrapper.appendChild(Cheney_avatar);
        Cheney_wrapper.appendChild(Cheney_bubble);
        Cheney_el.chatBody.appendChild(Cheney_wrapper);
        Cheney_el.chatBody.scrollTop = Cheney_el.chatBody.scrollHeight;
        return Cheney_bubble;
    }

    function Cheney_appendSources(Cheney_bubble, Cheney_sources, Cheney_mode) {
        var Cheney_meta = document.createElement('div');
        Cheney_meta.className = 'Cheney_kbMsgMeta';
        Cheney_meta.textContent = '检索模式：' + (Cheney_mode === 'vector' ? '向量余弦' : (Cheney_mode === 'keyword' ? '关键词降级' : '未命中')) +
            ' · 命中 ' + Cheney_sources.length + ' 个片段';

        var Cheney_box = document.createElement('div');
        Cheney_box.className = 'Cheney_kbSourceText';
        Cheney_box.style.display = 'none';

        Cheney_sources.forEach(function (Cheney_source) {
            var Cheney_chip = document.createElement('button');
            Cheney_chip.className = 'Cheney_kbSource';
            Cheney_chip.type = 'button';
            Cheney_chip.textContent = '【' + Cheney_source.Cheney_rank + '】' + Cheney_source.Cheney_file_name +
                ' · 第' + (Cheney_source.Cheney_chunk_index + 1) + '片 · ' + Cheney_source.Cheney_score;
            Cheney_chip.addEventListener('click', function () {
                var Cheney_open = Cheney_box.style.display === 'none';
                Cheney_box.style.display = Cheney_open ? 'block' : 'none';
                Cheney_box.textContent = '【' + Cheney_source.Cheney_file_name + ' · 第' +
                    (Cheney_source.Cheney_chunk_index + 1) + ' 片】\n' + Cheney_source.Cheney_content;
            });
            Cheney_bubble.appendChild(Cheney_chip);
        });

        Cheney_bubble.appendChild(Cheney_meta);
        if (Cheney_sources.length > 0) {
            Cheney_bubble.appendChild(Cheney_box);
        }
    }

    function Cheney_send() {
        var Cheney_question = Cheney_el.input.value.trim();
        if (!Cheney_question || Cheney_state.busy) {
            return;
        }
        if (!Cheney_state.activeId) {
            alert('请先选择知识库');
            return;
        }

        Cheney_renderMessage('user', Cheney_question);
        var Cheney_payload = { kbId: Cheney_state.activeId, question: Cheney_question };

        // 控制台输出：发送给大模型的数据（经后端补入参考资料后转发）
        console.log('[Cheney_kb] 发送给大模型的数据（提问）：', JSON.stringify(Cheney_payload, null, 2));
        console.log(Cheney_payload);

        Cheney_el.input.value = '';
        Cheney_el.counter.textContent = '0 / 1000';
        Cheney_state.busy = true;
        Cheney_el.send.disabled = true;
        Cheney_el.apiStatus.textContent = '状态：检索知识库并请求大模型中…';

        var Cheney_wait = Cheney_renderMessage('assistant', '正在检索知识库…');

        Cheney_request('/api/kb/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Cheney_payload)
        })
            .then(function (Cheney_json) {
                // 控制台输出：从大模型接收到的数据（后端已打印原始响应，这里打印完整业务响应）
                console.log('[Cheney_kb] 从大模型接收到的数据：', JSON.stringify(Cheney_json, null, 2));
                console.log(Cheney_json);

                var Cheney_row = Cheney_wait.parentElement;
                if (Cheney_json && Cheney_json.code === 0 && Cheney_json.data) {
                    var Cheney_data = Cheney_json.data;
                    var Cheney_meta = (Cheney_data.Cheney_model || '') + ' · ' +
                        (Cheney_data.Cheney_usage ? 'tokens ' + (Cheney_data.Cheney_usage.total_tokens || '-') : '未调用模型');
                    Cheney_wait.innerHTML = '';
                    String(Cheney_data.Cheney_answer || '').split(/\n{2,}/).forEach(function (Cheney_part) {
                        if (!Cheney_part) {
                            return;
                        }
                        var Cheney_p = document.createElement('p');
                        Cheney_p.textContent = Cheney_part;
                        Cheney_wait.appendChild(Cheney_p);
                    });
                    if (Cheney_meta) {
                        var Cheney_modelEl = document.createElement('div');
                        Cheney_modelEl.className = 'Cheney_kbMsgTip';
                        Cheney_modelEl.textContent = Cheney_meta;
                        Cheney_wait.appendChild(Cheney_modelEl);
                    }
                    Cheney_appendSources(Cheney_wait, Cheney_data.Cheney_sources || [], Cheney_data.Cheney_mode);
                    Cheney_showApi('状态：成功 · code = 0', Cheney_payload, Cheney_json);
                } else {
                    Cheney_row.classList.add('Cheney_kbMsgError');
                    Cheney_wait.innerHTML = '';
                    var Cheney_errP = document.createElement('p');
                    Cheney_errP.textContent = '⚠ ' + ((Cheney_json && Cheney_json.msg) || '请求失败');
                    Cheney_wait.appendChild(Cheney_errP);
                    Cheney_showApi('状态：失败 · code = ' + ((Cheney_json && Cheney_json.code) || '-'), Cheney_payload, Cheney_json);
                }
                Cheney_el.chatBody.scrollTop = Cheney_el.chatBody.scrollHeight;
            })
            .catch(function (Cheney_err) {
                console.error('[Cheney_kb] 问答异常：', Cheney_err);
                var Cheney_row = Cheney_wait.parentElement;
                Cheney_row.classList.add('Cheney_kbMsgError');
                Cheney_wait.innerHTML = '';
                var Cheney_errP = document.createElement('p');
                Cheney_errP.textContent = '⚠ 网络或服务异常：' + Cheney_err.message;
                Cheney_wait.appendChild(Cheney_errP);
                Cheney_showApi('状态：异常', Cheney_payload, { error: Cheney_err.message });
            })
            .finally(function () {
                Cheney_state.busy = false;
                Cheney_el.send.disabled = !Cheney_state.activeId;
                Cheney_el.input.focus();
            });
    }

    /* ---------------- 事件绑定 ---------------- */

    Cheney_el.kbList.addEventListener('click', function (Cheney_event) {
        var Cheney_del = Cheney_event.target.closest('[data-del]');
        if (Cheney_del) {
            Cheney_event.stopPropagation();
            Cheney_deleteKb(Number(Cheney_del.getAttribute('data-del')));
            return;
        }
        var Cheney_item = Cheney_event.target.closest('.Cheney_kbItem');
        if (!Cheney_item) {
            return;
        }
        var Cheney_id = Number(Cheney_item.getAttribute('data-id'));
        var Cheney_name = Cheney_item.querySelector('.Cheney_kbItemName').textContent;
        Cheney_selectKb(Cheney_id, Cheney_name);
    });

    Cheney_el.createBtn.addEventListener('click', Cheney_createKb);
    Cheney_el.newName.addEventListener('keydown', function (Cheney_event) {
        if (Cheney_event.key === 'Enter') {
            Cheney_event.preventDefault();
            Cheney_el.newDesc.focus();
        }
    });
    Cheney_el.newDesc.addEventListener('keydown', function (Cheney_event) {
        if (Cheney_event.key === 'Enter') {
            Cheney_event.preventDefault();
            Cheney_createKb();
        }
    });

    Cheney_el.uploadBtn.addEventListener('click', Cheney_uploadFile);

    Cheney_el.files.addEventListener('click', function (Cheney_event) {
        var Cheney_view = Cheney_event.target.closest('[data-view]');
        if (Cheney_view) {
            Cheney_openChunks(Number(Cheney_view.getAttribute('data-view')), Cheney_view.getAttribute('data-name'));
            return;
        }
        var Cheney_del = Cheney_event.target.closest('[data-del]');
        if (Cheney_del) {
            Cheney_deleteFile(Number(Cheney_del.getAttribute('data-del')));
        }
    });

    Cheney_el.input.addEventListener('input', function () {
        Cheney_el.counter.textContent = Cheney_el.input.value.length + ' / 1000';
    });

    Cheney_el.input.addEventListener('keydown', function (Cheney_event) {
        if (Cheney_event.key === 'Enter' && !Cheney_event.shiftKey) {
            Cheney_event.preventDefault();
            Cheney_send();
        }
    });

    Cheney_el.send.addEventListener('click', Cheney_send);

    Cheney_el.quick.addEventListener('click', function (Cheney_event) {
        var Cheney_btn = Cheney_event.target.closest('[data-q]');
        if (!Cheney_btn) {
            return;
        }
        Cheney_el.input.value = Cheney_btn.getAttribute('data-q');
        Cheney_el.counter.textContent = Cheney_el.input.value.length + ' / 1000';
        Cheney_send();
    });

    Cheney_el.chatClear.addEventListener('click', function () {
        Cheney_el.chatBody.innerHTML = '';
        Cheney_renderMessage('assistant', '问答已清空，可以继续基于当前知识库提问。');
        Cheney_el.apiStatus.textContent = '状态：待操作';
        Cheney_el.apiCode.textContent = '尚未请求接口';
        console.log('[Cheney_kb] 已清空问答记录');
    });

    Cheney_el.apiToggle.addEventListener('click', function () {
        var Cheney_hidden = Cheney_el.apiCode.classList.toggle('Cheney_codeHidden');
        Cheney_el.apiToggle.textContent = Cheney_hidden ? '查看原始数据' : '收起原始数据';
    });

    Cheney_loadList();
})();

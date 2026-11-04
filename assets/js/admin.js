/* LiteCMS 后台交互 v1.0.0 —— 原生 JS，无依赖 */
(function () {
  'use strict';

  /* ---------------------------------------------------------- 全选与计数 */
  var checkAll = document.getElementById('checkAll');
  var rows = document.querySelectorAll('.row-check');
  var countEl = document.getElementById('selCount');

  function updateCount() {
    var n = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].checked) { n++; }
    }
    if (countEl) { countEl.textContent = '已选 ' + n + ' 项'; }
    if (checkAll) {
      checkAll.checked = n > 0 && n === rows.length;
      checkAll.indeterminate = n > 0 && n < rows.length;
    }
  }

  if (checkAll) {
    checkAll.addEventListener('change', function () {
      for (var i = 0; i < rows.length; i++) { rows[i].checked = checkAll.checked; }
      updateCount();
    });
  }
  for (var i = 0; i < rows.length; i++) {
    rows[i].addEventListener('change', updateCount);
  }
  updateCount();

  window.confirmBulk = function () {
    var n = 0;
    for (var j = 0; j < rows.length; j++) { if (rows[j].checked) { n++; } }
    if (n === 0) {
      alert('请先勾选要操作的文章。');
      return false;
    }
    var sel = document.querySelector('.bulk-bar select');
    var label = sel ? sel.options[sel.selectedIndex].text : '执行操作';
    return confirm('确定对选中的 ' + n + ' 篇文章执行「' + label + '」？');
  };

  /* ---------------------------------------------------------- 正文编辑器工具栏 */
  var textarea = document.getElementById('contentInput');
  var info = document.getElementById('editorInfo');

  function updateInfo() {
    if (!textarea || !info) { return; }
    var len = textarea.value.length;
    info.textContent = len + ' 字符';
  }
  if (textarea) {
    textarea.addEventListener('input', updateInfo);
    textarea.addEventListener('keydown', function (e) {
      // Tab 缩进
      if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('    ');
      }
      // Ctrl/Cmd + S 提示保存
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        var form = document.getElementById('editorForm');
        if (form) { form.submit(); }
      }
    });
    updateInfo();
  }

  function insertAtCursor(text, wrapBefore, wrapAfter) {
    if (!textarea) { return; }
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var value = textarea.value;
    var selected = value.substring(start, end);

    if (wrapBefore !== undefined) {
      var replacement = wrapBefore + selected + wrapAfter;
      textarea.value = value.substring(0, start) + replacement + value.substring(end);
      textarea.selectionStart = start + wrapBefore.length;
      textarea.selectionEnd = start + wrapBefore.length + selected.length;
    } else {
      textarea.value = value.substring(0, start) + text + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }
    textarea.focus();
    updateInfo();
  }

  var tbs = document.querySelectorAll('.tb');
  for (var k = 0; k < tbs.length; k++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.getAttribute('data-wrap');
        var list = btn.getAttribute('data-list');
        var ins = btn.getAttribute('data-insert');

        if (tag) {
          insertAtCursor('', '<' + tag + '>', '</' + tag + '>');
        } else if (list) {
          var inner = '<li>列表项</li>';
          insertAtCursor('', '<' + list + '>\n  ', '\n</' + list + '>');
          if (textarea) {
            var v = textarea.value;
            var p = textarea.selectionStart;
            textarea.value = v.substring(0, p) + inner + v.substring(p);
          }
        } else if (ins === 'link') {
          insertAtCursor('', '<a href="#">', '</a>');
        } else if (ins === 'quote') {
          insertAtCursor('', '<blockquote><p>', '</p></blockquote>');
        } else if (ins === 'table') {
          insertAtCursor(
            '<table>\n  <tr><th>表头</th><th>表头</th></tr>\n  <tr><td>内容</td><td>内容</td></tr>\n</table>\n'
          );
        }
      });
    })(tbs[k]);
  }

  /* ---------------------------------------------------------- 标签快捷选择 */
  var picks = document.querySelectorAll('.tag-pick');
  var tagInput = document.querySelector('input[name="tags"]');

  function currentTags() {
    if (!tagInput) { return []; }
    var parts = tagInput.value.split(/[,，]/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].replace(/^\s+|\s+$/g, '');
      if (t !== '') { out.push(t); }
    }
    return out;
  }

  function setTags(list) {
    // 去重
    var seen = {}, out = [];
    for (var i = 0; i < list.length; i++) {
      if (!seen[list[i]]) { seen[list[i]] = 1; out.push(list[i]); }
    }
    tagInput.value = out.join(', ');
  }

  for (var m = 0; m < picks.length; m++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        if (!tagInput) { return; }
        var name = btn.getAttribute('data-tag');
        var list = currentTags();
        var idx = -1;
        for (var i = 0; i < list.length; i++) {
          if (list[i] === name) { idx = i; }
        }
        if (idx >= 0) {
          list.splice(idx, 1);
          btn.className = 'tag-pick';
        } else {
          list.push(name);
          btn.className = 'tag-pick on';
        }
        setTags(list);
      });
    })(picks[m]);
  }

  /* ---------------------------------------------------------- 媒体库选择与插入 */
  var mediaModal = document.getElementById('mediaModal');
  var mediaGrid = document.getElementById('mediaGrid');
  var mediaBtn = document.getElementById('tbMedia');
  var mediaFile = document.getElementById('mediaFile');
  var mediaSearch = document.getElementById('mediaSearch');
  var mediaImageOnly = document.getElementById('mediaImageOnly');
  var mediaStatus = document.getElementById('mediaStatus');
  var mediaInsertRow = document.getElementById('mediaInsertRow');
  var mediaUrl = document.getElementById('mediaUrl');
  var mediaCopyUrl = document.getElementById('mediaCopyUrl');
  var mediaItems = [];
  var mediaLoaded = false;
  var lastFocus = null;

  function mediaCsrf() {
    var el = document.querySelector('input[name="_token"]');
    return el ? el.value : '';
  }

  function setMediaStatus(text, isErr) {
    if (!mediaStatus) { return; }
    mediaStatus.textContent = text || '';
    mediaStatus.style.color = isErr ? '#c0392b' : '';
  }

  function fmtSize(n) {
    if (!n) { return '—'; }
    if (n < 1024) { return n + ' B'; }
    if (n < 1024 * 1024) { return Math.round(n / 1024) + ' KB'; }
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderMedia() {
    if (!mediaGrid) { return; }
    var kw = mediaSearch ? mediaSearch.value.trim().toLowerCase() : '';
    var onlyImg = mediaImageOnly ? mediaImageOnly.checked : true;
    var list = mediaItems.filter(function (it) {
      if (onlyImg && !it.isImage) { return false; }
      if (kw && it.name.toLowerCase().indexOf(kw) < 0) { return false; }
      return true;
    });
    if (list.length === 0) {
      mediaGrid.innerHTML = '<div class="media-empty">' +
        (mediaItems.length === 0 ? '媒体库还是空的，先上传一个文件吧。' : '没有匹配的文件。') + '</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var thumb = it.isImage
        ? '<img src="' + escapeHtml(it.url) + '" alt="" loading="lazy">'
        : '<span class="media-ext">' + escapeHtml((it.ext || 'file').toUpperCase()) + '</span>';
      html += '<button type="button" class="media-card" data-url="' + escapeHtml(it.url) +
        '" data-name="' + escapeHtml(it.name) + '" data-img="' + (it.isImage ? '1' : '0') + '" title="' + escapeHtml(it.name) + '">' +
        '<span class="media-thumb">' + thumb + '</span>' +
        '<span class="media-meta"><b>' + escapeHtml(it.name) + '</b><em>' + fmtSize(it.size) + '</em></span>' +
        (it.isImage ? '<span class="media-badge">点击插入</span>' : '') +
        '</button>';
    }
    mediaGrid.innerHTML = html;
  }

  function loadMedia(force) {
    if (!mediaGrid || (mediaLoaded && !force)) { return; }
    setMediaStatus('加载中…');
    fetch('/wp-admin/media/api/list', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.ok) {
          setMediaStatus((data && data.error) || '读取媒体库失败。', true);
          mediaItems = [];
        } else {
          mediaItems = data.items || [];
          mediaLoaded = true;
          setMediaStatus('共 ' + mediaItems.length + ' 个文件');
        }
        renderMedia();
      })
      .catch(function () { setMediaStatus('网络错误，无法读取媒体库。', true); });
  }

  function openMedia() {
    if (!mediaModal) { return; }
    lastFocus = document.activeElement;
    mediaModal.hidden = false;
    document.body.style.overflow = 'hidden';
    loadMedia(false);
    if (mediaSearch) { setTimeout(function () { mediaSearch.focus(); }, 30); }
  }

  function closeMedia() {
    if (!mediaModal) { return; }
    mediaModal.hidden = true;
    document.body.style.overflow = '';
    if (mediaInsertRow) { mediaInsertRow.hidden = true; }
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  /* 把选中的媒体插入正文：图片 -> <img>，其它 -> 下载链接（textarea 是纯文本，不做 HTML 转义） */
  function insertMedia(url, name, isImg) {
    if (isImg) {
      insertAtCursor('\n<img src="' + url + '" alt="' + name + '">\n');
    } else {
      insertAtCursor('\n<p><a href="' + url + '" target="_blank" rel="noopener">' + name + '</a></p>\n');
    }
    closeMedia();
  }

  if (mediaBtn) {
    mediaBtn.addEventListener('click', openMedia);
  }
  if (mediaModal) {
    var closers = mediaModal.querySelectorAll('[data-media-close]');
    for (var c = 0; c < closers.length; c++) {
      closers[c].addEventListener('click', closeMedia);
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mediaModal.hidden) { closeMedia(); }
    });
    mediaModal.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.media-card') : null;
      if (!card) { return; }
      insertMedia(card.getAttribute('data-url'), card.getAttribute('data-name'), card.getAttribute('data-img') === '1');
    });
  }
  if (mediaSearch) { mediaSearch.addEventListener('input', renderMedia); }
  if (mediaImageOnly) { mediaImageOnly.addEventListener('change', renderMedia); }
  if (mediaCopyUrl) {
    mediaCopyUrl.addEventListener('click', function () {
      if (!mediaUrl) { return; }
      mediaUrl.select();
      try {
        if (navigator.clipboard) { navigator.clipboard.writeText(mediaUrl.value); }
        else { document.execCommand('copy'); }
        setMediaStatus('链接已复制');
      } catch (err) { setMediaStatus('复制失败，请手动选择复制', true); }
    });
  }

  /* 编辑器内直接上传：上传成功后刷新列表并自动插入 */
  if (mediaFile) {
    mediaFile.addEventListener('change', function () {
      var files = mediaFile.files;
      if (!files || files.length === 0) { return; }
      var list = [];
      for (var i = 0; i < files.length; i++) { list.push(files[i]); }
      var done = 0;
      var firstNew = null;

      function step() {
        if (done >= list.length) {
          mediaFile.value = '';
          loadMedia(true);
          if (firstNew) { insertMedia(firstNew.url, firstNew.name, firstNew.isImage); }
          return;
        }
        var f = list[done];
        setMediaStatus('正在上传 ' + f.name + '（' + (done + 1) + '/' + list.length + '）…');
        var fd = new FormData();
        fd.append('file', f);
        fd.append('_token', mediaCsrf());
        fetch('/wp-admin/media/api/upload', {
          method: 'POST',
          body: fd,
          credentials: 'same-origin',
          headers: { 'X-CSRF-Token': mediaCsrf() }
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (!data || !data.ok) {
              setMediaStatus((data && data.error) || '上传失败。', true);
            } else if (!firstNew) {
              firstNew = data.item;
            }
            done++;
            step();
          })
          .catch(function () {
            setMediaStatus('上传失败：网络错误。', true);
            done++;
            step();
          });
      }
      step();
    });
  }

  /* ---------------------------------------------------------- 友情链接拖拽排序 */
  /* 用 Pointer Events 实现，而不是 HTML5 drag&drop：
     - 不依赖 dragover 在拖拽会话里持续派发（部分浏览器/触屏设备上会断）
     - 鼠标、触摸、触控笔同一套逻辑
     - 拖动过程中实时预览，松手才提交 */
  var flTable = document.getElementById('flTable');
  if (flTable) {
    var flBody = flTable.tBodies[0];
    var dragRow = null;
    var orderDirty = false;
    var startY = 0;
    var activePointer = null;

    function renumber() {
      var all = flBody.querySelectorAll('tr[data-idx]');
      for (var i = 0; i < all.length; i++) {
        var num = all[i].querySelector('.col-num');
        if (num) { num.textContent = i + 1; }
      }
    }

    function sortedRows() {
      return [].slice.call(flBody.querySelectorAll('tr[data-idx]'));
    }

    /* 依据指针的 y 坐标找到应该插入到哪一行之前 */
    function rowAfterPoint(y) {
      var list = sortedRows().filter(function (r) { return r !== dragRow; });
      for (var i = 0; i < list.length; i++) {
        var rect = list[i].getBoundingClientRect();
        if (y < rect.top + rect.height / 2) { return list[i]; }
      }
      return null;
    }

    function moveRowTo(y) {
      var ref = rowAfterPoint(y);
      var next = ref || null;
      // 已经是目标位置就不动，避免抖动
      if (next && dragRow.nextElementSibling === next) { return; }
      if (!next && dragRow === flBody.lastElementChild) { return; }
      flBody.insertBefore(dragRow, next);
      orderDirty = true;
    }

    function onPointerDown(e) {
      var handle = e.target.closest ? e.target.closest('.drag-handle') : null;
      if (!handle || !flBody.contains(handle)) { return; }
      if (e.button !== undefined && e.button !== 0) { return; }
      var row = handle.closest('tr[data-idx]');
      if (!row) { return; }
      e.preventDefault();
      dragRow = row;
      activePointer = e.pointerId;
      startY = e.clientY;
      orderDirty = false;
      row.classList.add('dragging');
      flTable.classList.add('sorting');
      document.body.classList.add('row-sorting');
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragRow) { return; }
      e.preventDefault();
      moveRowTo(e.clientY);
      var list = sortedRows();
      for (var i = 0; i < list.length; i++) {
        list[i].classList.toggle('drop-above', list[i] === rowAfterPoint(e.clientY));
      }
    }

    function onPointerUp() {
      if (!dragRow) { return; }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      dragRow.classList.remove('dragging');
      flTable.classList.remove('sorting');
      document.body.classList.remove('row-sorting');
      var list = sortedRows();
      for (var i = 0; i < list.length; i++) { list[i].classList.remove('drop-above'); }
      dragRow = null;
      activePointer = null;
      renumber();
      if (orderDirty) { orderDirty = false; saveOrder(); }
    }

    flBody.addEventListener('pointerdown', onPointerDown);

    function saveOrder() {
      var list = sortedRows();
      if (list.length < 2) { return; }
      var order = [];
      for (var i = 0; i < list.length; i++) { order.push(list[i].getAttribute('data-idx')); }
      var tokenEl = document.querySelector('#flTable') ? document.querySelector('input[name="_token"]') : null;
      var fd = new FormData();
      fd.append('order', order.join(','));
      fd.append('_token', tokenEl ? tokenEl.value : '');
      fetch('/wp-admin/friendlinks/order', {
        method: 'POST', body: fd, credentials: 'same-origin',
        headers: { 'X-CSRF-Token': tokenEl ? tokenEl.value : '' }
      }).then(function (r) {
        if (r.ok || r.redirected) { window.location.reload(); }
        else { window.alert('排序保存失败，请刷新页面重试。'); }
      }).catch(function () { window.alert('网络错误，排序未保存。'); });
    }

    /* 键盘兜底：手柄可聚焦，↑ / ↓ 调整位置 */
    flBody.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') { return; }
      var handle = e.target.closest ? e.target.closest('.drag-handle') : null;
      if (!handle) { return; }
      var row = handle.closest('tr[data-idx]');
      if (!row) { return; }
      e.preventDefault();
      if (e.key === 'ArrowUp' && row.previousElementSibling) {
        flBody.insertBefore(row, row.previousElementSibling);
      } else if (e.key === 'ArrowDown' && row.nextElementSibling) {
        flBody.insertBefore(row.nextElementSibling, row);
      } else { return; }
      renumber();
      handle.focus();
      saveOrder();
    });
  }

  /* ---------------------------------------------------------- 标题自动生成 slug 提示 */
  var titleInput = document.getElementById('titleInput');
  var slugInput = document.querySelector('input[name="slug"]');
  if (titleInput && slugInput) {
    titleInput.addEventListener('blur', function () {
      if (slugInput.value === '' && titleInput.value !== '' && slugInput.dataset.touched !== '1') {
        slugInput.placeholder = '将根据标题自动生成';
      }
    });
    slugInput.addEventListener('input', function () {
      slugInput.dataset.touched = '1';
    });
  }

  /* ---------------------------------------------------------- 防止表单重复提交 */
  var forms = document.querySelectorAll('form');
  for (var f = 0; f < forms.length; f++) {
    forms[f].addEventListener('submit', function () {
      var btns = this.querySelectorAll('button[type="submit"]');
      // 批量操作表单里有多个 formaction 按钮，不做禁用以免丢失提交值
      if (btns.length === 1) {
        btns[0].disabled = true;
        btns[0].textContent = '处理中…';
        var frm = this;
        setTimeout(function () {
          if (frm) {
            var b = frm.querySelectorAll('button[type="submit"]');
            if (b.length) { b[0].disabled = false; }
          }
        }, 4000);
      }
    });
  }
})();

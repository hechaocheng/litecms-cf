/* LiteCMS 前台交互 v1.0.0 —— 原生 JS，无依赖 */
(function () {
  'use strict';

  // 1. 卡片轻微高亮（当前 tag/category 的线索保留）
  // 2. 代码块复制按钮
  var pres = document.querySelectorAll('.article-content pre');
  for (var i = 0; i < pres.length; i++) {
    (function (pre) {
      var btn = document.createElement('button');
      btn.textContent = '复制';
      btn.style.cssText = 'position:absolute;top:8px;right:8px;font-size:11px;padding:3px 8px;' +
        'border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#cfd6e4;' +
        'border-radius:6px;cursor:pointer;font-family:inherit;';
      pre.style.position = 'relative';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '已复制';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
          });
        } else {
          btn.textContent = '请手动选择';
          setTimeout(function () { btn.textContent = '复制'; }, 1500);
        }
      });
      pre.appendChild(btn);
    })(pres[i]);
  }

  // 3. 图片懒加载兜底（若不支持 loading 属性）
  if (!('loading' in HTMLImageElement.prototype)) {
    var imgs = document.querySelectorAll('.article-content img');
    for (var j = 0; j < imgs.length; j++) {
      imgs[j].setAttribute('loading', 'lazy');
    }
  }

  // 4. 锚点平滑滚动
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.tagName === 'A' && t.getAttribute('href') && t.getAttribute('href').charAt(0) === '#') {
      var el = document.querySelector(t.getAttribute('href'));
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
})();

/* ---------------------------------------------------------- 评论区 v1.2.0（AJAX + 防灌水 + 本地记忆） */
(function () {
  'use strict';

  var form = document.getElementById('cForm');
  if (!form) { return; }

  var parentId = document.getElementById('parentId');
  var replyHint = document.getElementById('replyHint');
  var replyTarget = document.getElementById('replyTarget');
  var formTitle = document.getElementById('formTitle');
  var textarea = document.getElementById('cContent');
  var counter = document.getElementById('cCount');
  var submitBtn = document.getElementById('cmSubmit');
  var statusBox = document.getElementById('cmStatus');
  var tokenInput = document.getElementById('cmToken');
  var elapsedInput = document.getElementById('cmElapsed');
  var rememberBox = document.getElementById('cmRemember');
  var listEl = document.querySelector('.comment-list');
  var emptyEl = document.querySelector('.comments-empty');
  var countEl = document.querySelector('.comments-head .count');
  var authorEl = document.getElementById('cmAuthor');
  var emailEl = document.getElementById('cmEmail');
  var websiteEl = document.getElementById('cmWebsite');

  var STORE_KEY = 'litecms_visitor_v1';
  var INTERVAL = parseInt(form.getAttribute('data-interval') || '30', 10) || 0;
  var MODERATION = form.getAttribute('data-moderation') === '1';

  var openedAt = Date.now();
  var lockUntil = 0;          // 频率限制冷却截止时间
  var sending = false;
  var lastSent = '';
  var lastSentAt = 0;
  var tokenPromise = null;
  var siteKey = '';

  /* -------------------------------------------------- 本地存储：记住访客信息 */
  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(siteKey) || '{}') || {};
    } catch (e) { return {}; }
  }
  function writeStore(data) {
    try {
      if (rememberBox && !rememberBox.checked) {
        localStorage.removeItem(siteKey);
        return;
      }
      localStorage.setItem(siteKey, JSON.stringify(data));
    } catch (e) { /* 隐私模式下忽略 */ }
  }

  siteKey = STORE_KEY + ':' + location.host;
  (function restoreVisitor() {
    var saved = readStore();
    if (!saved || !saved.author) { return; }
    if (authorEl && !authorEl.value) { authorEl.value = saved.author; }
    if (emailEl && !emailEl.value) { emailEl.value = saved.email || ''; }
    if (websiteEl && !websiteEl.value) { websiteEl.value = saved.website || ''; }
  })();

  function saveVisitor() {
    writeStore({
      author: authorEl ? authorEl.value.trim() : '',
      email: emailEl ? emailEl.value.trim() : '',
      website: websiteEl ? websiteEl.value.trim() : '',
      ts: Date.now(),
    });
  }

  if (rememberBox) {
    rememberBox.addEventListener('change', function () {
      if (rememberBox.checked) { saveVisitor(); }
      else { try { localStorage.removeItem(siteKey); } catch (e) {} }
    });
  }

  /* -------------------------------------------------- 字数统计 */
  function updateCounter() {
    if (textarea && counter) { counter.textContent = textarea.value.length; }
    if (elapsedInput) { elapsedInput.value = String(Math.max(0, Date.now() - openedAt)); }
  }
  if (textarea) {
    textarea.addEventListener('input', updateCounter);
    updateCounter();
  }

  /* -------------------------------------------------- 状态提示 */
  function showStatus(type, html) {
    if (!statusBox) { return; }
    statusBox.className = 'cm-status cm-status-' + type;
    statusBox.innerHTML = html;
    statusBox.hidden = false;
  }
  function hideStatus() {
    if (statusBox) { statusBox.hidden = true; statusBox.innerHTML = ''; }
  }

  /* -------------------------------------------------- 访客令牌 */
  function fetchToken(force) {
    if (tokenPromise && !force) { return tokenPromise; }
    tokenPromise = fetch('/comment/token', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.token) {
          if (tokenInput) { tokenInput.value = d.token; }
          if (d.interval != null) { INTERVAL = Number(d.interval) || INTERVAL; }
          return d.token;
        }
        return '';
      })
      .catch(function () { tokenPromise = null; return ''; });
    return tokenPromise;
  }
  fetchToken();

  /* -------------------------------------------------- 回复 */
  function bindReplyButtons(root) {
    var btns = (root || document).querySelectorAll('.reply-btn');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].dataset.bound === '1') { continue; }
      btns[i].dataset.bound = '1';
      btns[i].addEventListener('click', function () {
        var btn = this;
        if (parentId) { parentId.value = btn.getAttribute('data-reply'); }
        if (replyTarget) { replyTarget.textContent = btn.getAttribute('data-author'); }
        if (replyHint) { replyHint.style.display = 'flex'; }
        if (formTitle) { formTitle.textContent = '回复评论'; }
        var wrap = document.getElementById('comment-form');
        if (wrap) { wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        setTimeout(function () { if (textarea) { textarea.focus(); } }, 320);
      });
    }
  }
  bindReplyButtons(document);

  var cancel = document.getElementById('cancelReply');
  if (cancel) {
    cancel.addEventListener('click', function () {
      if (parentId) { parentId.value = '0'; }
      if (replyHint) { replyHint.style.display = 'none'; }
      if (formTitle) { formTitle.textContent = '发表评论'; }
    });
  }

  /* -------------------------------------------------- 提交 */
  function setBusy(busy) {
    sending = busy;
    if (!submitBtn) { return; }
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? '提交中…' : '提交评论';
  }

  function errorMapHtml(errors) {
    var out = '';
    for (var k in errors) {
      if (Object.prototype.hasOwnProperty.call(errors, k) && errors[k]) {
        out += '<div>' + escapeHtml(errors[k]) + '</div>';
      }
    }
    return out || '<div>提交失败，请稍后重试。</div>';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function insertComment(html, pid) {
    if (!html) { return false; }
    var holder = document.createElement('div');
    holder.innerHTML = html.trim();
    var node = holder.firstElementChild;
    if (!node) { return false; }

    if (pid > 0) {
      var parentLi = document.getElementById('comment-' + pid);
      var main = parentLi && parentLi.querySelector('.cm-main');
      if (!main) { return false; }
      // 统一成 cm-main 下的 ul.comment-replies，避免层级错乱
      var ul = parentLi.querySelector('.comment-replies');
      if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'comment-replies';
        main.appendChild(ul);
      }
      // 回复节点只保留内容主体，去掉外层头像布局
      var item = document.createElement('li');
      item.id = node.id;
      item.innerHTML = node.querySelector('.cm-main') ? node.querySelector('.cm-main').innerHTML : node.innerHTML;
      var avatar = node.querySelector('.cm-avatar');
      if (avatar) {
        var a2 = avatar.cloneNode(true);
        a2.classList.add('small');
        item.insertBefore(a2, item.firstChild);
      }
      ul.appendChild(item);
      bindReplyButtons(item);
      tint(item);
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }

    if (!listEl) {
      listEl = document.createElement('ol');
      listEl.className = 'comment-list';
      var host = document.querySelector('.comments');
      if (host) {
        host.insertBefore(listEl, host.querySelector('.comment-form-wrap'));
      }
    }
    if (emptyEl && emptyEl.parentNode) {
      emptyEl.parentNode.removeChild(emptyEl);
      emptyEl = null;
    }
    listEl.appendChild(node);
    bindReplyButtons(node);
    tint(node);
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  function tint(el) {
    el.style.transition = 'background .6s';
    el.style.background = '#eef2ff';
    setTimeout(function () { el.style.background = ''; }, 1200);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) { return; }

    var content = textarea ? textarea.value.trim() : '';
    if (content.replace(/\s/g, '').length < 2) {
      showStatus('error', '<div>评论内容至少需要 2 个字。</div>');
      if (textarea) { textarea.focus(); }
      return;
    }

    // 冷却期内直接拦下，不浪费一次请求
    var now = Date.now();
    if (lockUntil > now) {
      showStatus('error', '<div>发言太频繁了，请 ' + Math.ceil((lockUntil - now) / 1000) + ' 秒后再试。</div>');
      return;
    }
    // 重复内容快速拦截
    if (content === lastSent && now - lastSentAt < 120000) {
      showStatus('error', '<div>你刚刚已经提交过同样的内容了，请勿重复提交。</div>');
      return;
    }

    setBusy(true);
    hideStatus();
    saveVisitor();

    if (elapsedInput) { elapsedInput.value = String(Math.max(1000, now - openedAt)); }

    var payload = new URLSearchParams(new FormData(form));
    var token = tokenInput ? tokenInput.value : '';

    fetch('/comment', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json',
        'X-Requested-With': 'fetch',
      },
      body: payload.toString(),
    })
      .then(function (r) {
        return r.json().then(function (d) { return { status: r.status, data: d }; })
          .catch(function () { return { status: r.status, data: { ok: false, error: '服务器返回异常（' + r.status + '）。' } }; });
      })
      .then(function (res) {
        var d = res.data || {};
        if (res.status === 419) {
          // 表单过期：换一个令牌，提示刷新
          tokenPromise = null; fetchToken(true);
          showStatus('error', '<div>' + escapeHtml(d.error || '表单已过期，请刷新页面后重试。') + '</div>');
          return;
        }
        if (!d.ok) {
          showStatus('error', d.errors ? errorMapHtml(d.errors) : escapeHtml(d.error || '提交失败。'));
          // 频率限制：按服务端给出的剩余秒数冷却
          var m = /(\d+)\s*秒/.exec(d.error || '');
          if (m) { lockUntil = Date.now() + parseInt(m[1], 10) * 1000; }
          return;
        }

        // 成功
        lastSent = content;
        lastSentAt = Date.now();
        if (textarea) { textarea.value = ''; }
        updateCounter();
        var inserted = insertComment(d.commentHtml, Number(d.parentId) || 0);
        if (countEl && d.count != null) { countEl.textContent = d.count; }

        if (d.status === 'approved') {
          showStatus('success', '<div>' + escapeHtml(d.message || '评论发表成功。') + '</div>');
          if (!inserted) {
            // 插入失败兜底：短暂提示后重载，保证一定能看到新评论
            setTimeout(function () { location.reload(); }, 900);
          }
        } else {
          showStatus('info', '<div>' + escapeHtml(d.message || '评论已提交，等待站长审核。') + '</div>');
        }
        // 重置回复状态
        if (parentId) { parentId.value = '0'; }
        if (replyHint) { replyHint.style.display = 'none'; }
        if (formTitle) { formTitle.textContent = '发表评论'; }
        // 冷却
        if (INTERVAL > 0) { lockUntil = Date.now() + INTERVAL * 1000; }
        openedAt = Date.now();
        tokenPromise = null;
        fetchToken(true);
      })
      .catch(function () {
        showStatus('error', '<div>网络异常，评论未提交。请检查连接后重试。</div>');
      })
      .then(function () { setBusy(false); });
  });

  // 失败后保留输入：页面刷新时从 sessionStorage 恢复（服务端重定向兜底场景）
  try {
    var draftKey = 'litecms_draft:' + location.pathname;
    var draft = sessionStorage.getItem(draftKey);
    if (draft && textarea && !textarea.value) {
      textarea.value = draft;
      updateCounter();
      sessionStorage.removeItem(draftKey);
    }
    if (textarea) {
      textarea.addEventListener('input', function () {
        try { sessionStorage.setItem(draftKey, textarea.value); } catch (e) {}
      });
    }
  } catch (e) { /* ignore */ }

  if (window.location.hash === '#comment-form') {
    setTimeout(function () {
      var el = document.getElementById('comment-form');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 100);
  }
})();

/*!
 * LiteCMS 前台主题 blue —— 交互脚本
 * - 侧栏实时时钟
 * - 移动端导航展开 / 收起
 * - 回到顶部
 * - 主题专属的少量细节（搜索框回车、时钟填充）
 * 不依赖 jQuery，浏览器原生实现。
 */
(function () {
  'use strict';

  var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  /* ------------------------------------------------------------ 实时时钟 */
  function startClock() {
    var dateEl = document.getElementById('dynDate');
    var weekEl = document.getElementById('dynWeek');
    var timeEl = document.getElementById('dynTime');
    if (!dateEl && !timeEl) {
      return;
    }

    function tick() {
      var d = new Date();
      if (dateEl) {
        dateEl.textContent = pad(d.getMonth() + 1) + '月' + pad(d.getDate()) + '日';
      }
      if (weekEl) {
        weekEl.textContent = WEEK[d.getDay()];
      }
      if (timeEl) {
        timeEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      }
    }

    tick();
    if (window.__hccClockTimer) {
      clearInterval(window.__hccClockTimer);
    }
    window.__hccClockTimer = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------ 时钟点击 → 填入搜索框 */
  function bindClockWidget() {
    var box = document.getElementById('widgetClock');
    var input = document.getElementById('q');
    if (!box || !input) {
      return;
    }
    box.addEventListener('click', function () {
      var d = new Date();
      input.value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      input.focus();
    });
  }

  /* ------------------------------------------------------------ 移动端导航 */
  function bindNav() {
    var toggle = document.getElementById('navToggle');
    var list = document.getElementById('navList');
    if (!toggle || !list) {
      return;
    }
    if (list.__navBound) {
      return; // 防止脚本被重复执行时重复绑定（开→关相互抵消）
    }
    list.__navBound = true;
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var opened = list.classList.toggle('open');
      toggle.classList.toggle('on', opened);
    });
    // 点击导航以外区域自动收起（toggle 的事件已 stopPropagation，不会走到这里）
    document.addEventListener('click', function (e) {
      if (!list.classList.contains('open')) {
        return;
      }
      if (list.contains(e.target)) {
        return;
      }
      list.classList.remove('open');
      toggle.classList.remove('on');
    });
    // 视口变大后清理状态，避免从移动端切回桌面时菜单卡住
    window.addEventListener('resize', function () {
      if (window.innerWidth > 414) {
        list.classList.remove('open');
        toggle.classList.remove('on');
      }
    });
  }

  /* ------------------------------------------------------------ 回到顶部 */
  function bindToTop() {
    var btn = document.getElementById('HccTop');
    if (!btn) {
      return;
    }
    var timer = null;

    function onScroll() {
      if (timer) {
        return;
      }
      timer = setTimeout(function () {
        timer = null;
        var top = window.pageYOffset || document.documentElement.scrollTop || 0;
        btn.style.display = top > 320 ? 'block' : 'none';
      }, 120);
    }

    btn.addEventListener('click', function () {
      if (window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------ 正文图片自适应 */
  function bindImages() {
    var box = document.querySelector('.article-content');
    if (!box) {
      return;
    }
    var imgs = box.getElementsByTagName('img');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].setAttribute('loading', 'lazy');
      imgs[i].style.maxWidth = '100%';
      imgs[i].style.height = 'auto';
    }
  }

  /* ------------------------------------------------------------ 启动 */
  function boot() {
    if (window.__hccThemeBooted) {
      return; // 防重入
    }
    window.__hccThemeBooted = true;
    var steps = [startClock, bindClockWidget, bindNav, bindToTop, bindImages];
    for (var i = 0; i < steps.length; i++) {
      try { steps[i](); } catch (e) { /* 单个挂件失败不影响其余功能 */ }
    }
  }

  // 脚本位于 </body> 前，DOM 已解析完毕，直接执行；再做一次 DOMContentLoaded 兜底。
  boot();
  document.addEventListener('DOMContentLoaded', boot);
})();

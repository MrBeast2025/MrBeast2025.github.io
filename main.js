/* ============================================================
 *  main.js —— 渲染与交互
 *  把 content.js 的内容画到页面上。一般情况下不用改这个文件。
 * ============================================================ */

(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var SHOT_MODE = /[?&]shot=1/.test(window.location.search);
  var NO_AUTOPLAY = /[?&]shot=1/.test(window.location.search) || /[?&]autoplay=off/.test(window.location.search);

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function ico(name) {
    var NS = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("style", "width:14px;height:14px");
    var p = document.createElementNS(NS, "path");
    p.setAttribute("fill", "currentColor");
    p.setAttribute("d", name === "sun"
      ? "M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0-4v2m0 17v2M3.5 12h-2m19 0h-2M5.9 5.9 4.5 4.5m15 15-1.4-1.4m0-12.2 1.4-1.4m-15 15 1.4-1.4"
      : "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z");
    s.appendChild(p);
    return s;
  }

  function fail(msg) {
    var m = $("#main");
    if (!m) return;
    m.innerHTML = "";
    var box = el("div", "content-error");
    box.appendChild(el("p", null, "内容加载失败：请检查 content.js 里的逗号和引号是否配对。"));
    box.appendChild(el("p", null, msg));
    m.appendChild(box);
  }

  /* ---------------- 左栏 ---------------- */

  function renderRail(c) {
    var r = c.rail || {};
    if ($("#rail-name")) $("#rail-name").textContent = r.name || "";
    if ($("#rail-latin")) $("#rail-latin").textContent = r.latin || "";

    var lines = $("#rail-lines");
    if (lines) {
      (r.lines || []).forEach(function (t, i) {
        lines.appendChild(el("p", "rail-line" + (i === 1 ? " rail-status" : ""), t));
      });
    }

    var m = $("#metrics");
    if (m) {
      (r.metrics || []).forEach(function (x) {
        var row = el("div", "metric-row");
        row.appendChild(el("span", "metric-value", x.value));
        row.appendChild(el("span", "metric-label", x.label));
        m.appendChild(row);
      });
    }
    if ($("#metrics-note")) $("#metrics-note").textContent = r.metricsNote || "";

    var nav = $("#rail-nav");
    if (nav) {
      (c.nav || []).forEach(function (n) {
        var a = el("a", null, n.text);
        a.href = "#" + n.id;
        a.setAttribute("data-target", n.id);
        nav.appendChild(a);
      });
    }

    var foot = $("#rail-foot");
    if (foot) {
      (r.footer || []).forEach(function (t) { foot.appendChild(el("span", null, t)); });
      if (c.contact && c.contact.email) {
        var mail = el("a", null, c.contact.email);
        mail.href = "mailto:" + c.contact.email;
        foot.appendChild(mail);
      }
      if (c.contact && c.contact.github) {
        var gh = el("a", null, "GitHub");
        gh.href = c.contact.github;
        gh.target = "_blank";
        gh.rel = "noopener";
        foot.appendChild(gh);
      }
      var t = el("button", "contact-btn", "");
      t.type = "button";
      t.id = "theme-toggle";
      t.style.fontSize = "11.5px";
      t.appendChild(el("span", null, "切换深色 / 浅色"));
      foot.appendChild(t);
    }
  }

  /* ---------------- 右栏 ---------------- */

  function entryShell(e) {
    var sec = el("section", "entry");
    sec.id = e.id;
    sec.appendChild(el("p", "entry-no", "编号 " + e.no));
    sec.appendChild(el("h2", "entry-title", e.title));
    if (e.lede) sec.appendChild(el("p", "entry-lede", e.lede));
    return sec;
  }

  function labeled(key, node) {
    var w = el("div", "labeled");
    w.appendChild(el("p", "labeled-key", key));
    w.appendChild(node);
    return w;
  }

  function para(text) { return el("p", null, text); }

  function stepList(items) {
    var ul = el("ul", "steps");
    items.forEach(function (t, i) {
      var li = el("li");
      li.appendChild(el("span", "n", String(i + 1).padStart(2, "0")));
      li.appendChild(el("span", null, t));
      ul.appendChild(li);
    });
    return ul;
  }

  function bulletList(items) {
    var ul = el("ul");
    items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    return ul;
  }

  function ledgerNode(l) {
    var t = el("table", "ledger");
    if (l.caption) t.appendChild(el("caption", null, l.caption));
    if (l.head) {
      var thead = el("thead");
      var tr = el("tr");
      l.head.forEach(function (h) { tr.appendChild(el("th", null, h)); });
      thead.appendChild(tr);
      t.appendChild(thead);
    }
    var tb = el("tbody");
    (l.rows || []).forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (cell, i) {
        tr.appendChild(el("td", i === row.length - 1 ? "num" : null, cell));
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    if (l.foot) {
      var tf = el("tfoot");
      var trf = el("tr");
      var td = el("td");
      td.setAttribute("colspan", String((l.head || ["", "", ""]).length));
      td.textContent = l.foot;
      trf.appendChild(td);
      tf.appendChild(trf);
      t.appendChild(tf);
    }
    return t;
  }

  function workNode(w) {
    var box = el("article", "work");
    var head = el("div", "work-head");
    head.appendChild(el("h3", "work-title", w.title));
    box.appendChild(head);
    if (w.meta) box.appendChild(el("p", "work-meta", w.meta));
    if (w.role) box.appendChild(el("p", "work-role", w.role));
    if (w.background) box.appendChild(labeled("背景", para(w.background)));
    if (w.method && w.method.length) box.appendChild(labeled("做法", stepList(w.method)));
    if (w.ledger) box.appendChild(labeled("台账", ledgerNode(w.ledger)));
    if (w.gallery && w.gallery.length) box.appendChild(carouselNode(w.gallery, w.title));
    if (w.results && w.results.length) box.appendChild(labeled("结果", bulletList(w.results)));
    if (w.review) box.appendChild(labeled("复盘", para(w.review)));
    if (w.transferable) box.appendChild(labeled("可迁移的方法", para(w.transferable)));
    if (w.tags && w.tags.length) {
      var tags = el("div", "tags");
      w.tags.forEach(function (x) { tags.appendChild(el("span", "tag", x)); });
      box.appendChild(tags);
    }
    if (w.todo) box.appendChild(el("p", "todo", "待补充 · " + w.todo));
    return box;
  }

  function renderEntries(c) {
    var main = $("#main");
    (c.entries || []).forEach(function (e) {
      var sec = entryShell(e);
      (e.works || []).forEach(function (w) { sec.appendChild(workNode(w)); });
      main.appendChild(sec);
    });

    var stats = el("section", "entry");
    stats.id = "skills";
    stats.appendChild(el("p", "entry-no", "编号 04"));
    stats.appendChild(el("h2", "entry-title", "技能"));
    stats.appendChild(el("p", "entry-lede", "按实际使用频率分档，不写百分比。"));
    (c.skills || []).forEach(function (s) {
      var row = el("div", "skill");
      var left = el("div");
      left.appendChild(el("p", "skill-group", s.group));
      var lv = el("span", "skill-level", s.level);
      lv.setAttribute("data-l", s.level || "");
      left.appendChild(lv);
      row.appendChild(left);
      var items = el("div", "skill-items");
      (s.items || []).forEach(function (x) { items.appendChild(el("span", null, x)); });
      row.appendChild(items);
      stats.appendChild(row);
    });
    main.appendChild(stats);

    var exp = el("section", "entry");
    exp.id = "experience";
    exp.appendChild(el("p", "entry-no", "编号 05"));
    exp.appendChild(el("h2", "entry-title", "经历"));
    if (c.experienceHint) exp.appendChild(el("p", "exp-hint", c.experienceHint));

    function expHead(e, interactive) {
      var head = el("div", "exp-head");
      if (interactive) head.setAttribute("id", "exp-head-" + (e.period + e.org).replace(/[^a-zA-Z0-9]/g, ""));
      head.appendChild(el("span", "exp-date", e.period));
      head.appendChild(el("span", "exp-org", e.org));
      if (e.role) head.appendChild(el("span", "exp-role", e.role));
      return head;
    }
    function expBody(e) {
      var box = el("div", "exp-body");
      if (e.points && e.points.length) box.appendChild(bulletList(e.points));
      return box;
    }

    var items = c.experience || [];
    items.forEach(function (e, idx) {
      var latest = idx === 0;
      if (latest) {
        var box = el("div", "exp");
        box.appendChild(expHead(e, false));
        box.appendChild(expBody(e));
        exp.appendChild(box);
        return;
      }
      var d = el("details", "exp exp-item");
      var s = el("summary", "exp-summary");
      s.setAttribute("aria-labelledby", "exp-head-" + (e.period + e.org).replace(/[^a-zA-Z0-9]/g, ""));
      s.appendChild(expHead(e, true));
      var glyph = el("span", "exp-glyph", "+");
      glyph.setAttribute("aria-hidden", "true");
      s.appendChild(glyph);
      d.appendChild(s);
      d.appendChild(expBody(e));
      d.addEventListener("toggle", function () {
        glyph.textContent = d.open ? "\u2212" : "+";
        s.setAttribute("aria-expanded", d.open ? "true" : "false");
      });
      s.setAttribute("aria-expanded", "false");
      exp.appendChild(d);
    });
    main.appendChild(exp);

    var aw = c.awards || {};
    var awards = el("section", "entry");
    awards.id = "awards";
    awards.appendChild(el("p", "entry-no", "编号 06"));
    awards.appendChild(el("h2", "entry-title", "奖项与证书"));
    [["奖项", aw.honors], ["证书", aw.certificates]].forEach(function (pair) {
      if (!pair[1] || !pair[1].length) return;
      var row = el("div", "award-line");
      row.appendChild(el("span", "k", pair[0]));
      row.appendChild(el("span", null, pair[1].join(" · ")));
      awards.appendChild(row);
    });
    main.appendChild(awards);

    var tr = el("section", "entry");
    tr.id = "traits";
    tr.appendChild(el("p", "entry-no", "编号 07"));
    tr.appendChild(el("h2", "entry-title", "工作方式"));
    var tw = el("div", "traits");
    (c.traits || []).forEach(function (t) {
      var row = el("div", "trait");
      row.appendChild(el("p", "trait-label", t.label));
      row.appendChild(el("p", "trait-text", t.text));
      tw.appendChild(row);
    });
    tr.appendChild(tw);
    main.appendChild(tr);

    var ct = c.contact || {};
    var co = el("section", "entry");
    co.id = "contact";
    co.appendChild(el("p", "entry-no", "编号 08"));
    co.appendChild(el("h2", "entry-title", "联系方式"));
    if (ct.email) {
      var r1 = el("div", "contact-line");
      r1.appendChild(el("span", "k", "邮箱"));
      var b1 = el("button", "contact-btn", ct.email);
      b1.type = "button";
      b1.id = "copy-email";
      b1.title = "点击复制";
      r1.appendChild(b1);
      co.appendChild(r1);
    }
    if (ct.github) {
      var r2 = el("div", "contact-line");
      r2.appendChild(el("span", "k", "GitHub"));
      var a2 = el("a", "contact-btn", ct.githubLabel || ct.github);
      a2.href = ct.github;
      a2.target = "_blank";
      a2.rel = "noopener";
      r2.appendChild(a2);
      co.appendChild(r2);
    }
    if (ct.wechatQr) {
      var r3 = el("div", "contact-line");
      r3.appendChild(el("span", "k", "微信"));
      var box3 = el("div");
      var hint = el("span", "contact-hint", "二维码待补充：把图片放到 images/wechat-qr.png");
      var img = el("img", "qr");
      img.src = ct.wechatQr;
      img.alt = "微信二维码";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.remove(); });
      box3.appendChild(img);
      box3.appendChild(hint);
      r3.appendChild(box3);
      co.appendChild(r3);
    }
    if (ct.note) co.appendChild(el("p", "contact-hint", ct.note));
    main.appendChild(co);

    var f = c.footer || {};
    var ft = el("section", "entry");
    ft.appendChild(el("p", "contact-hint", (f.note || "") + "  © " + (f.copyright || "") + " · 最近更新 " + ((c.site || {}).updatedAt || "")));
    main.appendChild(ft);
  }

  function carouselNode(items, title) {
    var root = el("div", "carousel");
    root.setAttribute("role", "group");
    root.setAttribute("aria-roledescription", "轮播图");
    root.setAttribute("aria-label", (title || "") + " 项目配图");
    root.setAttribute("tabindex", "0");
    root.setAttribute("data-autoplay", NO_AUTOPLAY ? "false" : "true");

    var slides = el("div", "slides");
    items.forEach(function (it, i) {
      var s = el("div", "slide");
      s.setAttribute("data-caption", it.caption || "");
      s.setAttribute("role", "group");
      s.setAttribute("aria-label", (i + 1) + " / " + items.length);
      var img = el("img");
      img.src = it.src;
      img.alt = it.alt || "";
      img.setAttribute("loading", i === 0 ? "eager" : "lazy");
      img.setAttribute("decoding", "async");
      img.setAttribute("width", "1200");
      img.setAttribute("height", "750");
      s.appendChild(img);
      slides.appendChild(s);
    });
    root.appendChild(slides);

    var prev = el("button", "c-btn c-prev", "\u2039");
    prev.type = "button";
    prev.setAttribute("aria-label", "上一张");
    var next = el("button", "c-btn c-next", "\u203A");
    next.type = "button";
    next.setAttribute("aria-label", "下一张");
    root.appendChild(prev);
    root.appendChild(next);

    var dots = el("div", "c-dots");
    items.forEach(function (it, i) {
      var d = el("button", "c-dot");
      d.type = "button";
      d.setAttribute("aria-label", "第 " + (i + 1) + " 张");
      d.setAttribute("aria-current", i === 0 ? "true" : "false");
      dots.appendChild(d);
    });

    var bar = el("div", "c-bar");
    var cap = el("p", "c-cap", items[0].caption || "");
    var cnt = el("p", "c-count", "1 / " + items.length);
    bar.appendChild(cap);
    bar.appendChild(cnt);

    var wrap = el("div", "c-wrap");
    wrap.appendChild(root);
    wrap.appendChild(bar);
    wrap.appendChild(dots);
    return wrap;
  }

  function initCarousels() {
    var roots = Array.prototype.slice.call(document.querySelectorAll(".carousel"));
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hoverable = window.matchMedia && window.matchMedia("(hover: hover)").matches;

    roots.forEach(function (root) {
      var slides = root.querySelector(".slides");
      var imgs = Array.prototype.slice.call(root.querySelectorAll(".slide"));
      if (!slides || imgs.length < 2) {
        if (root.querySelector(".c-btn")) {
          Array.prototype.forEach.call(root.querySelectorAll(".c-btn"), function (b) { b.style.display = "none"; });
        }
        return;
      }
      var wrap = root.parentNode;
      var btns = Array.prototype.slice.call(root.querySelectorAll(".c-btn"));
      var dots = Array.prototype.slice.call(wrap.querySelectorAll(".c-dot"));
      var cap = wrap.querySelector(".c-cap");
      var cnt = wrap.querySelector(".c-count");
      var i = 0;
      var timer = null;
      var startX = null;
      var captions = imgs.map(function (s) { return s.getAttribute("data-caption") || ""; });

      function render() {
        slides.style.transform = "translateX(-" + (i * 100) + "%)";
        dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
        if (cap) cap.textContent = captions[i] || "";
        if (cnt) cnt.textContent = (i + 1) + " / " + imgs.length;
      }
      function go(n) {
        i = (n + imgs.length) % imgs.length;
        render();
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } root.setAttribute("data-playing", "false"); }
      function play() {
        if (reduce || root.getAttribute("data-autoplay") !== "true" || timer) return;
        root.setAttribute("data-playing", "true");
        timer = setInterval(function () { go(i + 1); }, 6000);
      }

      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          stop();
          go(b.classList.contains("c-prev") ? i - 1 : i + 1);
          if (hoverable) play();
        });
      });
      dots.forEach(function (d, k) {
        d.addEventListener("click", function () { stop(); go(k); if (hoverable) play(); });
      });
      root.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowLeft") { ev.preventDefault(); stop(); go(i - 1); }
        else if (ev.key === "ArrowRight") { ev.preventDefault(); stop(); go(i + 1); }
      });
      root.addEventListener("mouseenter", function () { if (hoverable) stop(); });
      root.addEventListener("mouseleave", function () { play(); });
      root.addEventListener("focusin", function () { stop(); });
      root.addEventListener("focusout", function () { play(); });
      root.addEventListener("touchstart", function (ev) {
        startX = ev.touches[0].clientX;
        stop();
      }, { passive: true });
      root.addEventListener("touchend", function (ev) {
        if (startX === null) return;
        var dx = ev.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
        play();
      }, { passive: true });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else play();
      });

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) play(); else stop(); });
        }, { threshold: 0.4 });
        io.observe(root);
      } else {
        play();
      }

      render();
    });
  }

  /* ---------------- 交互 ---------------- */


  function initTheme() {
    var btns = [$("#theme-toggle")];
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = saved || (prefersLight ? "light" : "dark");
    function apply(t) {
      document.documentElement.setAttribute("data-theme", t);
      btns.forEach(function (b) { if (b) b.textContent = t === "dark" ? "切换浅色模式" : "切换深色模式"; });
    }
    apply(theme);
    btns.forEach(function (b) {
      if (!b) return;
      b.addEventListener("click", function () {
        theme = theme === "dark" ? "light" : "dark";
        apply(theme);
        try { localStorage.setItem("theme", theme); } catch (e) {}
      });
    });
  }

  function initCopy() {
    var email = (typeof content !== "undefined" && content.contact && content.contact.email) || "";
    var b = $("#copy-email");
    if (!b || !email) return;
    function toast(msg) {
      var old = $(".toast");
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var t = el("div", "toast", msg);
      document.body.appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 1800);
    }
    function fallback() {
      var ta = el("textarea");
      ta.value = email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    b.addEventListener("click", function () {
      function done(ok) { toast(ok ? "已复制 " + email : "复制失败，请手动选中：" + email); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(fallback()); });
      } else {
        done(fallback());
      }
    });
  }

  function expandAllDetails() {
    Array.prototype.forEach.call(document.querySelectorAll("details.exp-item"), function (d) {
      d.open = true;
      var s = d.querySelector(".exp-summary");
      if (s) s.setAttribute("aria-expanded", "true");
      var g = d.querySelector(".exp-glyph");
      if (g) g.textContent = "\u2212";
    });
  }
  var refreshOpenExp = function () {};

  function initOpenRefresh() {
    refreshOpenExp = function () {
      Array.prototype.forEach.call(document.querySelectorAll("details.exp-item[open]"), function (d) {
        d.style.height = "auto";
        var h = d.offsetHeight;
        if (h > 0) d.style.height = h + "px";
      });
    };
    window.addEventListener("load", refreshOpenExp);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshOpenExp).catch(function () {});
    }
  }

  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll("#rail-nav a"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("data-target")] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (x) { x.classList.remove("is-active"); });
          a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  function boot() {
    var c = typeof content !== "undefined" ? content : null;
    if (!c) { fail("没有读到 content.js 里的 content 对象。"); return; }
    try {
      if (c.site && c.site.title) document.title = c.site.title;
      renderRail(c);
      renderEntries(c);
      initTheme();
      initCopy();
      initActiveNav();
      initCarousels();
      if (SHOT_MODE) { expandAllDetails(); refreshOpenExp = function () {}; }
      else { initOpenRefresh(); }
      if (SHOT_MODE || !window.requestAnimationFrame) {
        document.body.classList.add("loaded");
      } else {
        requestAnimationFrame(function () { document.body.classList.add("loaded"); });
      }
    } catch (err) {
      fail(String(err && err.message ? err.message : err));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
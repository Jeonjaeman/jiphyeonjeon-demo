/*!
 * edu.js — 집현전 데모 2안(에듀 라이트) 인터랙션
 * 레퍼런스(로보토리에듀) 기법 재구현:
 *  - 헤더: 스크롤 다운 시 숨김 / 업 시 노출, 스크롤 시 그림자
 *  - .opacity 요소 IO 리빌(한 번만), data-delay 스태거
 *  - 히어로 Swiper(fade, fraction 페이지네이션, 좌우 버튼, 프로그레스 바)
 *  - 스티키 단계 섹션(.step-stage): 스크롤 위치로 단계 index 계산 → 좌측 목록 .on, 우측 비주얼 data-step
 *  - 변호사 Swiper, 사례 Swiper
 *  - 카운터 업, 스크롤 탑
 */
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 헤더 숨김/노출 */
  function initHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var last = 0;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle("is-scrolled", y > 10);
      if (y > last && y > 120) header.classList.add("is-hidden"); else header.classList.remove("is-hidden");
      last = y <= 0 ? 0 : y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 리빌 */
  function initReveal() {
    var els = document.querySelectorAll(".opacity");
    if (!("IntersectionObserver" in window) || reduced) { els.forEach(function (e) { e.classList.add("on"); }); return; }
    function show(el) {
      if (el.classList.contains("on")) return;
      var d = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(function () { el.classList.add("on"); }, d);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        show(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
    /* 폴백: 점프 스크롤·탭 전환 등 IO가 놓치는 경우를 뷰포트 좌표로 보정 */
    function sweep() {
      var vh = window.innerHeight;
      els.forEach(function (e) {
        if (e.classList.contains("on")) return;
        var r = e.getBoundingClientRect();
        if (r.height > 0 && r.top < vh * 0.94 && r.bottom > 0) show(e);
      });
    }
    var t = null;
    window.addEventListener("scroll", function () { if (!t) t = setTimeout(function () { t = null; sweep(); }, 120); }, { passive: true });
    window.addEventListener("load", sweep);
    setTimeout(sweep, 300);
    setInterval(sweep, 400);
    window.JHJ_SWEEP = sweep;
  }

  /* 카운터 */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    function run(el) {
      var to = parseFloat(el.getAttribute("data-count")) || 0, suf = el.getAttribute("data-suffix") || "";
      var t0 = null, dur = 1400;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e).toLocaleString() + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      if (reduced) { el.textContent = to.toLocaleString() + suf; return; }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* 히어로 Swiper */
  function initHero() {
    if (!window.Swiper) return;
    var el = document.querySelector(".hero__swiper");
    if (!el) return;
    var bar = document.querySelector(".hero__progress i");
    var sw = new Swiper(el, {
      loop: true, speed: 900, effect: "fade", fadeEffect: { crossFade: true },
      autoplay: reduced ? false : { delay: 6000, disableOnInteraction: false },
      pagination: { el: ".hero__fraction", type: "fraction", formatFractionCurrent: function (n) { return ("0" + n).slice(-2); }, formatFractionTotal: function (n) { return ("0" + n).slice(-2); } },
      navigation: { nextEl: ".hero__next", prevEl: ".hero__prev" },
      on: {
        autoplayTimeLeft: function (s, t, p) { if (bar) bar.style.transform = "scaleX(" + (1 - p) + ")"; },
      },
    });
    var pause = document.querySelector(".hero__pause");
    if (pause) pause.addEventListener("click", function () {
      var on = pause.getAttribute("aria-pressed") === "true";
      if (on) { sw.autoplay.start(); } else { sw.autoplay.stop(); }
      pause.setAttribute("aria-pressed", String(!on));
      pause.textContent = on ? "||" : "▶";
    });
  }

  /* 스티키 단계 섹션 */
  function initStepStage() {
    var stage = document.querySelector(".step-stage");
    if (!stage) return;
    var items = stage.querySelectorAll(".step-list li");
    var visual = stage.querySelector(".step-visual");
    var n = items.length;
    var cur = -1;
    function update() {
      var rect = stage.getBoundingClientRect();
      var total = stage.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      var idx = Math.min(n - 1, Math.floor(p * n));
      if (idx === cur) return;
      cur = idx;
      items.forEach(function (li, i) { li.classList.toggle("on", i === idx); });
      if (visual) {
        visual.setAttribute("data-step", String(idx + 1));
        visual.querySelectorAll(".step-visual__panel").forEach(function (p, i) { p.classList.toggle("on", i === idx); });
      }
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
    items.forEach(function (li, i) {
      li.addEventListener("click", function () {
        var total = stage.offsetHeight - window.innerHeight;
        var y = stage.offsetTop + (total * (i + 0.5)) / n;
        window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      });
    });
  }

  /* 변호사·사례 Swiper */
  function initSwipers() {
    if (!window.Swiper) return;
    var l = document.querySelector(".lawyer-swiper");
    if (l) new Swiper(l, {
      slidesPerView: 1.15, spaceBetween: 16, grabCursor: true, speed: 600,
      navigation: { nextEl: ".lawyer-next", prevEl: ".lawyer-prev" },
      breakpoints: { 640: { slidesPerView: 2.2, spaceBetween: 20 }, 1024: { slidesPerView: 4, spaceBetween: 24 } },
    });
    var c = document.querySelector(".case-swiper");
    if (c) new Swiper(c, {
      slidesPerView: 1, spaceBetween: 24, speed: 700, autoHeight: true,
      pagination: { el: ".case-pagination", clickable: true },
      navigation: { nextEl: ".case-next", prevEl: ".case-prev" },
    });
  }

  function initScrollTop() {
    var b = document.getElementById("scroll-top");
    if (!b) return;
    window.addEventListener("scroll", function () { b.classList.toggle("is-visible", window.scrollY > 600); }, { passive: true });
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
  }

  /* 서브: 탭 / 아코디언 */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (g) {
      var tabs = g.querySelectorAll("[data-tab]"), panels = g.querySelectorAll("[data-panel]");
      function act(name) {
        tabs.forEach(function (t) { t.classList.toggle("is-active", t.getAttribute("data-tab") === name); });
        panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== name; });
        if (history.replaceState) history.replaceState(null, "", "#" + name);
      }
      tabs.forEach(function (t) { t.addEventListener("click", function () { act(t.getAttribute("data-tab")); window.scrollTo({ top: g.offsetTop - 80, behavior: "smooth" }); }); });
      var init = (location.hash && location.hash.slice(1)) || tabs[0].getAttribute("data-tab");
      var ok = Array.prototype.some.call(tabs, function (t) { return t.getAttribute("data-tab") === init; });
      act(ok ? init : tabs[0].getAttribute("data-tab"));
    });
    document.querySelectorAll("[data-acc]").forEach(function (item) {
      var btn = item.querySelector("button");
      btn.addEventListener("click", function () { item.classList.toggle("is-open"); btn.setAttribute("aria-expanded", item.classList.contains("is-open")); });
    });
  }

  /* 스크롤스파이(서브 로컬 내비) */
  function initSpy() {
    var links = document.querySelectorAll(".subnav a[href^='#']");
    if (!links.length) return;
    var secs = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
    function on() {
      var y = window.scrollY + 140, cur = null;
      secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
      links.forEach(function (a) { a.classList.toggle("is-active", cur && a.getAttribute("href") === "#" + cur.id); });
    }
    window.addEventListener("scroll", on, { passive: true }); on();
  }

  function init() {
    initHeader(); initReveal(); initCounters(); initHero(); initStepStage(); initSwipers(); initScrollTop(); initTabs(); initSpy();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

/*!
 * cine.js — 집현전 데모 3안(시네마틱) 인터랙션
 * 레퍼런스(IPARK) 기법 재구현:
 *  - Lenis 스무스 스크롤 + GSAP ScrollTrigger 연동
 *  - 히어로: 로드 시 clip-path 리빌(아래→위), 라인 마스크 타이포, 헤더 흰색/검정 테마 전환
 *  - Essence 300vh 스테이지: sticky 뷰포트, 좌측 세로 이미지 3장 translateY(lerp), 우측 index/타이틀 크로스페이드
 *  - Businesses 500vh 스테이지: 풀블리드 이미지 3장 임계값(.1/.5/.9)별 슬라이드업, 카드 아코디언
 *  - 변호사 Swiper(4/뷰) + 핀(pinSpacing:false)으로 다음 섹션이 덮으며 올라옴
 *  - 약속 섹션 핀(+50%) 타이틀 리빌, 리스트 IO 리빌
 *  - three.js 파티클 필드(마지막 CTA 배경, 마우스 패럴랙스)
 */
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(Math.max(v, a), b); };

  /* Lenis */
  function initLenis() {
    if (!window.Lenis || reduced) return;
    window.lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      window.lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { window.lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { window.lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  /* 헤더: 히어로 위 흰색, 지나면 검정. 스크롤 다운 시 숨김 */
  function initHeader() {
    var header = document.getElementById("header"); if (!header) return;
    var hero = document.querySelector(".hero, .subhero");
    var last = 0;
    function on() {
      var y = window.scrollY;
      header.classList.toggle("header--scrolled", y > 40);
      if (hero) header.classList.toggle("header--white", y < hero.offsetHeight - 80);
      else header.classList.remove("header--white");
      header.classList.toggle("header--hidden", y > last && y > 200 && !document.body.classList.contains("is-locked"));
      last = y;
    }
    window.addEventListener("scroll", on, { passive: true }); on();
  }

  /* 라인 마스크 리빌 (IO) */
  function initLines() {
    var els = document.querySelectorAll(".line-mask");
    if (!("IntersectionObserver" in window) || reduced) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.2 });
    els.forEach(function (e) { io.observe(e); });
    var rv = document.querySelectorAll(".rv");
    var io2 = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io2.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (e) { io2.observe(e); });
    /* 폴백: 점프 스크롤·탭 전환 등 IO가 놓치는 경우를 뷰포트 좌표로 보정 */
    function sweep() {
      var vh = window.innerHeight;
      var all = document.querySelectorAll(".rv:not(.is-in), .line-mask:not(.is-in)");
      all.forEach(function (e) {
        var r = e.getBoundingClientRect();
        if (r.height > 0 && r.top < vh * 0.94 && r.bottom > 0) e.classList.add("is-in");
      });
    }
    var t = null;
    window.addEventListener("scroll", function () { if (!t) t = setTimeout(function () { t = null; sweep(); }, 120); }, { passive: true });
    window.addEventListener("load", sweep);
    setTimeout(sweep, 300);
    setInterval(sweep, 400);
    window.JHJ_SWEEP = sweep;
  }

  /* 히어로 리빌 */
  function initHero() {
    var hero = document.querySelector(".hero"); if (!hero) return;
    var v = hero.querySelector("video");
    function reveal() { hero.classList.add("is-revealed"); }
    if (reduced) { reveal(); return; }
    if (v) {
      var done = false;
      var go = function () { if (done) return; done = true; setTimeout(reveal, 150); };
      v.addEventListener("loadeddata", go, { once: true });
      v.addEventListener("canplay", go, { once: true });
      setTimeout(go, 1800);
      v.play && v.play().catch(function () {});
    } else setTimeout(reveal, 200);
    var cue = hero.querySelector(".hero__cue");
    if (cue) cue.addEventListener("click", function (e) {
      e.preventDefault();
      var t = document.querySelector("#essence");
      if (window.lenis) window.lenis.scrollTo(t, { offset: -40 }); else t.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* Essence 300vh 스테이지 */
  function initEssence() {
    var sec = document.querySelector("#essence"); if (!sec) return;
    var stage = sec.querySelector(".essence__stage");
    var items = sec.querySelectorAll(".essence__visual-item");
    var idxs = sec.querySelectorAll(".essence__index span");
    var texts = sec.querySelectorAll(".essence__text");
    var n = items.length;
    if (reduced || window.innerWidth < 1025) { stage.setAttribute("data-reduced", "true"); return; }
    var target = 0, cur = 0, active = -1, raf = null;
    function measure() {
      var r = stage.getBoundingClientRect();
      var total = stage.offsetHeight - window.innerHeight;
      target = clamp(-r.top / Math.max(1, total), 0, 1);
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      cur = lerp(cur, target, 0.12);
      if (Math.abs(cur - target) < 0.0005) cur = target;
      var seg = 1 / n;
      items.forEach(function (it, i) {
        if (i === 0) return;
        var p = clamp((cur - seg * (i - 0.5)) / (seg * 0.6), 0, 1);
        it.style.transform = "translateY(" + ((1 - p) * 100) + "%)";
      });
      var a = Math.min(n - 1, Math.floor(cur * n + 0.0001));
      if (a !== active) {
        active = a; stage.setAttribute("data-active", String(a));
        idxs.forEach(function (s, i) { s.classList.toggle("is-on", i === a); });
        texts.forEach(function (t, i) { t.classList.toggle("is-on", i === a); });
      }
      raf = (cur !== target) ? requestAnimationFrame(tick) : null;
    }
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();
  }

  /* Businesses 500vh 스테이지 */
  function initBusiness() {
    var sec = document.querySelector("#business"); if (!sec) return;
    var stage = sec.querySelector(".biz__stage");
    var items = sec.querySelectorAll(".biz__visual-item");
    var cards = sec.querySelectorAll(".biz__card");
    var dots = sec.querySelectorAll(".biz__nav button");
    var th = [0.1, 0.5, 0.9];
    var active = -1;
    if (reduced || window.innerWidth < 1025) { stage.setAttribute("data-reduced", "true"); cards.forEach(function (c) { c.classList.add("is-open"); }); return; }
    function setActive(i) {
      if (i === active) return; active = i;
      stage.setAttribute("data-active", String(i));
      cards.forEach(function (c, k) { c.classList.toggle("is-open", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
    }
    function on() {
      var r = stage.getBoundingClientRect();
      var total = stage.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / Math.max(1, total), 0, 1);
      stage.classList.toggle("is-revealed", p > 0.02);
      items.forEach(function (it, i) {
        if (i === 0) return;
        var start = th[i - 1] + 0.1, end = th[i - 1] + 0.3;
        var q = clamp((p - start) / (end - start), 0, 1);
        it.style.transform = "translateY(" + ((1 - q) * 100) + "%)";
      });
      var a = p < th[0] + 0.2 ? 0 : p < th[1] + 0.2 ? 1 : 2;
      setActive(a);
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(on); }, { passive: true });
    window.addEventListener("resize", on);
    on();
    cards.forEach(function (c, i) {
      c.querySelector(".biz__card-toggle").addEventListener("click", function () {
        var total = stage.offsetHeight - window.innerHeight;
        var y = stage.offsetTop + total * (i === 0 ? 0.05 : i === 1 ? 0.45 : 0.85);
        if (window.lenis) window.lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { cards[i].querySelector(".biz__card-toggle").click(); }); });
  }

  /* 변호사 Swiper + 핀 겹침 */
  function initAttorneys() {
    var sec = document.querySelector("#attorneys"); if (!sec) return;
    if (window.Swiper) {
      new Swiper(sec.querySelector(".atty-swiper"), {
        slidesPerView: 1.3, spaceBetween: 16, speed: reduced ? 0 : 600, grabCursor: true,
        navigation: { nextEl: ".atty-next", prevEl: ".atty-prev" },
        breakpoints: { 640: { slidesPerView: 2.2, spaceBetween: 20 }, 1025: { slidesPerView: 4, spaceBetween: 24 } },
      });
    }
    if (!hasGsap || reduced || window.innerWidth < 1025) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({ trigger: sec, start: "bottom bottom", end: "+=120%", pin: true, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true });
    var promise = document.querySelector("#promise");
    if (promise) {
      ScrollTrigger.create({
        trigger: promise, start: "top top", end: "+=60%", pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: function () { promise.classList.add("is-in"); },
      });
    }
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* three.js 파티클 필드 */
  function initThree() {
    var wrap = document.querySelector("[data-three]"); if (!wrap || !window.THREE || reduced) return;
    var W = wrap.clientWidth, H = wrap.clientHeight;
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    wrap.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.z = 14;
    var N = 900, pos = new Float32Array(N * 3), base = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var x = (Math.random() - 0.5) * 36, y = (Math.random() - 0.5) * 20, z = (Math.random() - 0.5) * 16;
      pos[i * 3] = base[i * 3] = x; pos[i * 3 + 1] = base[i * 3 + 1] = y; pos[i * 3 + 2] = base[i * 3 + 2] = z;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: 0xd9b56a, size: 0.07, transparent: true, opacity: 0.85, depthWrite: false });
    var pts = new THREE.Points(geo, mat); scene.add(pts);
    var lineGeo = new THREE.BufferGeometry();
    var lp = [];
    for (var k = 0; k < 160; k++) { var a = Math.floor(Math.random() * N), b = Math.floor(Math.random() * N); lp.push(base[a * 3], base[a * 3 + 1], base[a * 3 + 2], base[b * 3], base[b * 3 + 1], base[b * 3 + 2]); }
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lp), 3));
    var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xd9b56a, transparent: true, opacity: 0.08 })); scene.add(lines);
    var mx = 0, my = 0, tx = 0, ty = 0, visible = false;
    window.addEventListener("mousemove", function (e) { tx = (e.clientX / window.innerWidth - 0.5); ty = (e.clientY / window.innerHeight - 0.5); }, { passive: true });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(wrap);
    var t = 0;
    function loop() {
      if (!visible) return;
      t += 0.004; mx = lerp(mx, tx, 0.04); my = lerp(my, ty, 0.04);
      var p = geo.attributes.position.array;
      for (var i = 0; i < N; i++) { p[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 2 + base[i * 3] * 0.4) * 0.35; }
      geo.attributes.position.needsUpdate = true;
      pts.rotation.y = lines.rotation.y = mx * 0.35 + t * 0.15;
      pts.rotation.x = lines.rotation.x = my * 0.25;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    window.addEventListener("resize", function () { W = wrap.clientWidth; H = wrap.clientHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); });
  }

  /* 서브: 탭·아코디언·스파이 */
  function initSub() {
    document.querySelectorAll("[data-tabs]").forEach(function (g) {
      var tabs = g.querySelectorAll("[data-tab]"), panels = g.querySelectorAll("[data-panel]");
      function act(name) {
        tabs.forEach(function (t) { t.classList.toggle("is-active", t.getAttribute("data-tab") === name); });
        panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== name; });
        if (history.replaceState) history.replaceState(null, "", "#" + name);
        if (hasGsap) ScrollTrigger.refresh();
      }
      tabs.forEach(function (t) { t.addEventListener("click", function () { act(t.getAttribute("data-tab")); }); });
      var init = (location.hash && location.hash.slice(1)) || tabs[0].getAttribute("data-tab");
      var ok = Array.prototype.some.call(tabs, function (t) { return t.getAttribute("data-tab") === init; });
      act(ok ? init : tabs[0].getAttribute("data-tab"));
    });
    var links = document.querySelectorAll(".subnav a[href^='#']");
    if (links.length) {
      var secs = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
      function spy() { var y = window.scrollY + 140, cur = null; secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; }); links.forEach(function (a) { a.classList.toggle("is-active", cur && a.getAttribute("href") === "#" + cur.id); }); }
      window.addEventListener("scroll", spy, { passive: true }); spy();
      links.forEach(function (a) { a.addEventListener("click", function (e) { var t = document.querySelector(a.getAttribute("href")); if (t && window.lenis) { e.preventDefault(); window.lenis.scrollTo(t, { offset: -90 }); } }); });
    }
  }

  function init() { initLenis(); initHeader(); initLines(); initHero(); initEssence(); initBusiness(); initAttorneys(); initThree(); initSub(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

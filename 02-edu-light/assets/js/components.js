/*!
 * components.js — 집현전 데모 2안(에듀 라이트) 공통 헤더·푸터·면책공고 인젝션
 * 템플릿 리터럴만 사용(fetch 없음) → file:// 더블클릭에서도 동작.
 */
(function () {
  "use strict";

  var BRAND = {
    nameKo: "법무법인 집현전",
    sub: "의료전문센터",
    nameEn: "JIPHYEONJEON Medical Law Center",
    phone: "02-581-1045",
    phoneHref: "tel:025811045",
    fax: "02-581-1042",
    email: "jhj5811028@daum.net",
    address: "서울특별시 서초구 반포대로 106, 4층~5층(서초동, 태홍빌딩)",
    regNo: "264-81-25415",
    ceo: "김용호, 봉만수",
    adLawyer: "김용호 대표변호사",
  };

  var NAV = [
    { label: "법무법인 소개", href: "about.html", page: "about", sub: [
      { label: "법무법인 소개", href: "about.html#intro" },
      { label: "인사말", href: "about.html#greeting" },
      { label: "변호사 소개", href: "about.html#attorneys" },
    ] },
    { label: "의료인 형사사건", href: "criminal.html", page: "criminal", sub: [
      { label: "의료법 위반", href: "criminal.html" },
    ] },
    { label: "면허취소·정지·재교부", href: "license.html", page: "license", sub: [
      { label: "의사면허 재교부", href: "license.html" },
      { label: "행정심판·행정소송", href: "admin-law.html" },
    ] },
    { label: "의료사고·의료분쟁", href: "malpractice.html", page: "malpractice", sub: [
      { label: "의료사고 손해배상", href: "malpractice.html" },
    ] },
    { label: "상담·오시는 길", href: "contact.html", page: "contact", sub: [
      { label: "상담 안내", href: "contact.html#reserve" },
      { label: "오시는 길", href: "contact.html#location" },
    ] },
  ];

  var DISCLAIMER = [
    ["정보의 일반성", "본 사이트의 내용은 일반적인 정보 제공을 위한 것으로, 특정 개인이나 상황에 대한 전문적인 상담, 진단, 조언을 대체하지 않습니다."],
    ["개별 상황에 따른 차이", "동일한 내용이라도 개인의 상황, 시기, 조건 등에 따라 결과가 달라질 수 있으며, 그에 따른 책임은 전적으로 본인에게 있습니다."],
    ["전문가의 판단 필요", "구체적인 사안이나 중요한 결정이 필요한 경우 반드시 관련 분야의 전문가와 상담하시기 바랍니다."],
    ["법적 책임의 제한", "본 사이트의 정보로 인해 발생하는 직·간접적인 손해에 대하여 어떠한 법적 책임도 지지 않습니다."],
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function page() { return document.body.getAttribute("data-page") || ""; }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var p = page();
    var items = NAV.map(function (n) {
      var cur = n.page === p ? ' aria-current="page"' : "";
      var subs = n.sub.map(function (s) { return '<li><a href="' + s.href + '">' + esc(s.label) + "</a></li>"; }).join("");
      return '<li class="gnb__item"><a class="gnb__link" href="' + n.href + '"' + cur + ">" + esc(n.label) + '</a><ul class="gnb__sub">' + subs + "</ul></li>";
    }).join("");
    var mobile = NAV.map(function (n) {
      var subs = n.sub.map(function (s) { return '<li><a href="' + s.href + '">' + esc(s.label) + "</a></li>"; }).join("");
      return '<li class="mnav__item"><button type="button" class="mnav__link" data-mnav-toggle>' + esc(n.label) + '<span aria-hidden="true">+</span></button><ul class="mnav__sub">' + subs + "</ul></li>";
    }).join("");

    el.innerHTML =
      '<header class="header" id="header">' +
      '<div class="header__inner">' +
      '<a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true">集</span><span class="logo__text">' + BRAND.nameKo + "<small>" + BRAND.sub + "</small></span></a>" +
      '<nav class="gnb" aria-label="주 메뉴"><ul class="gnb__list">' + items + "</ul></nav>" +
      '<div class="header__util">' +
      '<a class="header__phone" href="' + BRAND.phoneHref + '"><span aria-hidden="true">&#9742;</span> ' + BRAND.phone + "</a>" +
      '<a class="btn btn--primary btn--sm header__cta" href="contact.html#contact-form">상담신청</a>' +
      '<button type="button" class="hamburger" id="hamburger" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>' +
      "</div></div>" +
      '<div class="mnav" id="mnav"><ul class="mnav__list">' + mobile + "</ul>" +
      '<div class="mnav__foot"><a class="btn btn--primary btn--block" href="contact.html#contact-form">온라인 상담신청</a><p>상담전화 ' + BRAND.phone + "</p></div></div>" +
      "</header>";

    var hb = document.getElementById("hamburger");
    var mnav = document.getElementById("mnav");
    hb.addEventListener("click", function () {
      var open = hb.getAttribute("aria-expanded") === "true";
      hb.setAttribute("aria-expanded", String(!open));
      mnav.classList.toggle("is-open", !open);
      document.body.classList.toggle("is-locked", !open);
    });
    mnav.querySelectorAll("[data-mnav-toggle]").forEach(function (b) {
      b.addEventListener("click", function () { b.parentNode.classList.toggle("is-open"); });
    });
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var dis = DISCLAIMER.map(function (d, i) {
      return '<div class="disclaimer__item"><span class="disclaimer__num">0' + (i + 1) + "</span><h3>" + esc(d[0]) + "</h3><p>" + esc(d[1]) + "</p></div>";
    }).join("");
    var links = NAV.map(function (n) { return '<a href="' + n.href + '">' + esc(n.label) + "</a>"; }).join("");
    el.innerHTML =
      '<section class="disclaimer" aria-labelledby="disclaimer-title"><div class="container">' +
      '<div class="sec-head sec-head--center"><span class="sec-head__eyebrow">DISCLAIMER</span><h2 id="disclaimer-title">면책공고</h2></div>' +
      '<p class="disclaimer__lead">본 사이트에서 제공하는 모든 정보는 일반적인 정보 제공을 목적으로 하며, 개별적인 상황에 따라 결과가 달라질 수 있습니다.</p>' +
      '<div class="disclaimer__grid">' + dis + "</div></div></section>" +
      '<footer class="footer"><div class="container footer__inner">' +
      '<div class="footer__brand"><span class="logo__mark" aria-hidden="true">集</span><div>' + BRAND.nameKo + " " + BRAND.sub + "<small>" + BRAND.nameEn + "</small></div></div>" +
      '<nav class="footer__links" aria-label="푸터 메뉴">' + links + '<a href="admin-law.html">행정심판·행정소송</a><a href="privacy.html">개인정보처리방침</a></nav>' +
      '<dl class="footer__info">' +
      "<div><dt>대표변호사</dt><dd>" + BRAND.ceo + "</dd></div>" +
      "<div><dt>주소</dt><dd>" + BRAND.address + "</dd></div>" +
      "<div><dt>전화</dt><dd>" + BRAND.phone + " / 팩스 " + BRAND.fax + "</dd></div>" +
      "<div><dt>이메일</dt><dd>" + BRAND.email + "</dd></div>" +
      "<div><dt>사업자등록번호</dt><dd>" + BRAND.regNo + "</dd></div>" +
      "<div><dt>광고책임변호사</dt><dd>" + BRAND.adLawyer + "</dd></div>" +
      "</dl>" +
      '<p class="footer__copy">&copy; ' + new Date().getFullYear() + " " + BRAND.nameKo + " " + BRAND.sub + ". All rights reserved.</p>" +
      "</div></footer>" +
      '<button type="button" class="scroll-top" id="scroll-top" aria-label="맨 위로">&#8593;</button>';
  }

  function init() {
    try { renderHeader(); } catch (e) { console.warn("header", e); }
    try { renderFooter(); } catch (e) { console.warn("footer", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.JHJ_BRAND = BRAND;
})();

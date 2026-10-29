/*!
 * components.js — 헤더(메가메뉴 포함) · 모바일 드릴다운 · 푸터 · 퀵메뉴 ·
 * 데모 고지 바 · 상담/사이트맵 오버레이 DOM 인젝션 (리뉴얼 v2)
 *
 * [P0-1] 마운트 지점은 각 페이지 HTML에 높이 예약(min-height) 플레이스홀더로 이미 존재
 *        (#demo-bar, #site-header, #site-footer, #quickmenu) — 여기서는 그 내부만 채운다.
 *        v2: 헤더/알림바는 이제 고정(fixed) 오버레이라 흐름상 높이가 0이므로
 *        플레이스홀더 min-height도 0 — 인젝션 전/후 어차피 흐름 높이 차이가 없다.
 * [P1-1] 플레이스홀더 안에는 정적 최소 내비 씨앗(홈/상담신청)이 이미 있고, 인젝션이 이를
 *        대체한다. 전체를 try/catch로 감싸 인젝션 실패 시에도 씨앗이 생존한다.
 * 상담/사이트맵 오버레이는 페이지 HTML에 플레이스홀더가 없으므로 body 끝에
 * 런타임 추가(insertAdjacentHTML)한다 — 오버레이는 기본 숨김(overlay 클래스
 * 자체가 opacity:0/visibility:hidden)이라 인젝션 시점이 늦어도 CLS가 없다.
 * fetch/XHR 절대 금지 — 템플릿 리터럴 문자열만 사용(file:// CORS 회피).
 *
 * 근거: .omc/plans/renewal-unist-spec.md §4 / .omc/handoffs/p0-foundation.md
 */
(function () {
  "use strict";

  var BRAND = {
    nameKo: "법무법인 집현전",
    nameSub: "의료전문센터",
    nameEn: "JIPHYEONJEON Medical Law Center",
    symbol: "集",
    slogan: "의료인의 법률문제를 함께 살핍니다",
    sloganEn: "MEDICINE MEETS LAW.",
    phone: "02-581-1045",
    phoneHref: "tel:025811045",
    fax: "02-581-1042",
    email: "jhj5811028@daum.net",
    address: "서울특별시 서초구 반포대로 106, 4층~5층(서초동, 태홍빌딩)",
    regNo: "264-81-25415",
    ceo: "김용호, 봉만수",
    adLawyer: "김용호 대표변호사",
  };

  /* 실제 서브페이지에 존재하는 앵커 id만 사용(회귀 방지 — 존재하지 않는
     해시로 링크하지 않는다). 각 페이지 소유 워커가 id를 바꾸면 이 표도 갱신할 것. */
  var NAV_ITEMS = [
    { href: "about.html", label: "법무법인 소개", page: "about", id: "about" },
    { href: "criminal.html", label: "의료인 형사사건", page: "criminal", id: "criminal" },
    { href: "license.html", label: "면허취소·정지·재교부", page: "license", id: "license" },
    { href: "malpractice.html", label: "의료사고·의료분쟁", page: "malpractice", id: "malpractice" },
    { href: "contact.html", label: "상담·오시는 길", page: "contact", id: "contact" },
  ];

  var MEGAMENU = {
    about: {
      label: "ABOUT",
      cols: [
        {
          title: "법무법인 소개",
          links: [
            { label: "법무법인 소개", href: "about.html#intro" },
            { label: "인사말", href: "about.html#greeting" },
          ],
        },
        {
          title: "구성원",
          links: [
            { label: "변호사 소개", href: "about.html#attorneys" },
          ],
        },
      ],
    },
    criminal: {
      label: "CRIMINAL",
      cols: [
        {
          title: "의료인 형사사건",
          links: [
            { label: "의료법 위반", href: "criminal.html" },
            { label: "주요 위반 유형", href: "criminal.html#types" },
            { label: "대응 절차", href: "criminal.html#process" },
          ],
        },
      ],
    },
    license: {
      label: "LICENSE",
      cols: [
        {
          title: "면허취소·정지·재교부",
          links: [
            { label: "의사면허 재교부", href: "license.html" },
            { label: "행정심판·행정소송", href: "admin-law.html" },
          ],
        },
      ],
    },
    malpractice: {
      label: "MALPRACTICE",
      cols: [
        {
          title: "의료사고·의료분쟁",
          links: [
            { label: "의료사고 손해배상", href: "malpractice.html" },
            { label: "손해배상 구성 요소", href: "malpractice.html#elements" },
          ],
        },
      ],
    },
    contact: {
      label: "CONTACT",
      cols: [
        {
          title: "상담·오시는 길",
          links: [
            { label: "온라인 상담신청", href: "contact.html#contact-form" },
            { label: "오시는 길", href: "contact.html#location" },
            { label: "전화상담 " + BRAND.phone, href: BRAND.phoneHref },
          ],
        },
      ],
    },
  };

  var SITEMAP_GROUPS = [
    { label: "HOME", links: [{ label: "홈", href: "index.html" }] },
    {
      label: "ABOUT",
      links: [
        { label: "법무법인 소개", href: "about.html#intro" },
        { label: "인사말", href: "about.html#greeting" },
        { label: "변호사 소개", href: "about.html#attorneys" },
      ],
    },
    {
      label: "CRIMINAL",
      links: [
        { label: "의료법 위반", href: "criminal.html" },
      ],
    },
    {
      label: "LICENSE",
      links: [
        { label: "의사면허 재교부", href: "license.html" },
        { label: "행정심판·행정소송", href: "admin-law.html" },
      ],
    },
    {
      label: "MALPRACTICE",
      links: [
        { label: "의료사고 손해배상", href: "malpractice.html" },
      ],
    },
    {
      label: "CONTACT",
      links: [
        { label: "온라인 상담신청", href: "contact.html#contact-form" },
        { label: "오시는 길", href: "contact.html#location" },
        { label: "전화상담 " + BRAND.phone, href: BRAND.phoneHref },
      ],
    },
    {
      label: "OTHER",
      links: [
        { label: "개인정보처리방침", href: "privacy.html" },
        { label: "관리자", href: "admin.html" },
      ],
    },
  ];

  var CONSULT_CHIPS = [
    { label: "의료법 위반", href: "criminal.html" },
    { label: "의사면허 취소·재교부", href: "license.html" },
    { label: "행정처분 불복", href: "admin-law.html" },
    { label: "의료사고 손해배상", href: "malpractice.html" },
    { label: "의료광고 위반", href: "criminal.html#types" },
    { label: "진료기록·설명의무", href: "criminal.html#types" },
  ];

  var DISCLAIMER = {
    eyebrow: "DISCLAIMER",
    title: "면책공고",
    lead: "본 사이트에서 제공하는 모든 정보는 일반적인 정보 제공을 목적으로 하며, 개별적인 상황에 따라 결과가 달라질 수 있습니다.",
    items: [
      { title: "정보의 일반성", desc: "본 사이트의 내용은 일반적인 정보 제공을 위한 것으로, 특정 개인이나 상황에 대한 전문적인 상담, 진단, 조언을 대체하지 않습니다." },
      { title: "개별 상황에 따른 차이", desc: "동일한 내용이라도 개인의 상황, 시기, 조건 등에 따라 결과가 달라질 수 있으며, 그에 따른 책임은 전적으로 본인에게 있습니다." },
      { title: "전문가의 판단 필요", desc: "구체적인 사안이나 중요한 결정이 필요한 경우 반드시 관련 분야의 전문가와 상담하시기 바랍니다." },
      { title: "법적 책임의 제한", desc: "본 사이트의 정보로 인해 발생하는 직·간접적인 손해에 대하여 어떠한 법적 책임도 지지 않습니다." },
    ],
  };

  function currentPage() {
    return document.body.getAttribute("data-page") || "";
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ------------------------------------------------------------------ */
  /* 데모 고지 상단 알림 바                                              */
  /* ------------------------------------------------------------------ */
  function renderDemoBar() {
    var el = document.getElementById("demo-bar");
    if (!el) return;
    el.innerHTML = "";
  }

  /* ------------------------------------------------------------------ */
  /* 헤더 / GNB / 메가메뉴                                               */
  /* ------------------------------------------------------------------ */
  function megamenuColHtml(col) {
    var linksHtml = col.links
      .map(function (l) {
        return '<a href="' + l.href + '">' + escapeHtml(l.label) + "</a>";
      })
      .join("");
    return (
      '<div class="megamenu__col"><p class="megamenu__col-title">' +
      escapeHtml(col.title) +
      "</p>" +
      linksHtml +
      "</div>"
    );
  }

  function gnbItemHtml(item, page) {
    var current = item.page === page ? ' aria-current="page"' : "";
    var menu = item.id && MEGAMENU[item.id];
    if (!menu) {
      return (
        '<div class="gnb__item"><a class="gnb__link" href="' +
        item.href +
        '"' +
        current +
        ">" +
        escapeHtml(item.label) +
        "</a></div>"
      );
    }
    var colsHtml = menu.cols.map(megamenuColHtml).join("");
    return (
      '<div class="gnb__item" data-menu="' +
      item.id +
      '"><a class="gnb__link" href="' +
      item.href +
      '"' +
      current +
      ">" +
      escapeHtml(item.label) +
      '</a><div class="megamenu" id="megamenu-' +
      item.id +
      '"><div class="megamenu__scrim" aria-hidden="true"></div>' +
      '<div class="megamenu__panel"><div class="megamenu__inner container container--wide">' +
      colsHtml +
      '</div><p class="ghost-type ghost-type--md megamenu__watermark" aria-hidden="true">' +
      menu.label +
      "</p></div></div></div>"
    );
  }

  function mobileNavLinksHtml(page) {
    return NAV_ITEMS.map(function (item) {
      var current = item.page === page ? ' aria-current="page"' : "";
      var menu = item.id && MEGAMENU[item.id];
      if (menu) {
        return (
          '<li><button type="button" class="mobile-nav__link" data-drilldown="' +
          item.id +
          '"' +
          current +
          ">" +
          escapeHtml(item.label) +
          '<span class="ico" aria-hidden="true">&#8250;</span></button></li>'
        );
      }
      return (
        '<li><a class="mobile-nav__link" href="' +
        item.href +
        '"' +
        current +
        ">" +
        escapeHtml(item.label) +
        "</a></li>"
      );
    }).join("");
  }

  function drilldownPanelHtml(id) {
    var menu = MEGAMENU[id];
    if (!menu) return "";
    var allLinks = [];
    menu.cols.forEach(function (col) {
      allLinks = allLinks.concat(col.links);
    });
    var linksHtml = allLinks
      .map(function (l) {
        return '<li><a href="' + l.href + '">' + escapeHtml(l.label) + "</a></li>";
      })
      .join("");
    return (
      '<div class="mobile-nav__panel mobile-nav__panel--secondary" data-drilldown-panel="' +
      id +
      '">' +
      '<button type="button" class="mobile-nav__back" data-drilldown-back>' +
      '<span aria-hidden="true">&#8249;</span> 뒤로</button>' +
      '<p class="mobile-nav__panel-title">' +
      menu.label +
      "</p>" +
      '<ul class="mobile-nav__sublist">' +
      linksHtml +
      "</ul></div>"
    );
  }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var page = currentPage();

    var gnbHtml = NAV_ITEMS.map(function (item) {
      return gnbItemHtml(item, page);
    }).join("");

    var drillHtml = Object.keys(MEGAMENU)
      .map(function (id) {
        return drilldownPanelHtml(id);
      })
      .join("");

    el.innerHTML =
      '<div class="site-header" id="site-header-inner">' +
      '<div class="site-header__inner">' +
      '<a class="site-header__logo site-header__logo--symbol" href="index.html">' +
      '<span class="logo-symbol" aria-hidden="true">' +
      BRAND.symbol +
      "</span><span>" +
      BRAND.nameKo +
      "<small>" +
      BRAND.nameSub +
      "</small></span></a>" +
      '<nav class="gnb gnb--desktop" aria-label="주 메뉴">' +
      gnbHtml +
      '<div class="gnb-bg" id="gnb-bg" aria-hidden="true"><p class="ghost-type ghost-type--sm gnb-bg__watermark" id="gnb-watermark"></p></div>' +
      "</nav>" +
      '<div class="site-header__utils">' +
      '<button type="button" class="header-util-btn" id="consult-trigger" aria-haspopup="dialog" aria-controls="consult-overlay">상담</button>' +
      '<button type="button" class="header-util-btn header-util-btn--icon" id="sitemap-trigger" aria-haspopup="dialog" aria-controls="sitemap-overlay" aria-label="전체메뉴">' +
      '<span class="header-util-btn__grid" aria-hidden="true"><span></span><span></span><span></span><span></span></span></button>' +
      '<a class="site-header__phone" href="' +
      BRAND.phoneHref +
      '"><span class="ico" aria-hidden="true">&#9742;</span><span>' +
      BRAND.phone +
      "</span></a>" +
      '<button type="button" class="hamburger" id="hamburger-btn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mobile-nav">' +
      "<span></span><span></span><span></span>" +
      "</button>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="mobile-nav" id="mobile-nav">' +
      '<div class="mobile-nav__panel mobile-nav__panel--primary">' +
      '<ul class="mobile-nav__list">' +
      mobileNavLinksHtml(page) +
      "</ul>" +
      '<div class="mobile-nav__footer">' +
      "<span>상담전화 " +
      BRAND.phone +
      "</span>" +
      '<a href="contact.html#contact-form">온라인 상담신청</a>' +
      "</div>" +
      "</div>" +
      drillHtml +
      "</div>";

    bindHeaderInteractions();
  }

  function bindHeaderInteractions() {
    var hamburger = document.getElementById("hamburger-btn");
    var mobileNav = document.getElementById("mobile-nav");
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener("click", function () {
      var expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("is-open", !expanded);
      document.body.classList.toggle("scroll-locked", !expanded);
      if (expanded) {
        mobileNav.removeAttribute("data-panel");
      }
    });

    mobileNav.querySelectorAll("a.mobile-nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        hamburger.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
        document.body.classList.remove("scroll-locked");
      });
    });

    /* 2패널 드릴다운: 진입/복귀. ui.js에서 다루기엔 마크업 직결 구조라
       기본 골격만 여기서 바인딩(강화 로직은 ui.js가 담당하지 않아도
       독립 동작하도록 자체 완결). */
    mobileNav.querySelectorAll("[data-drilldown]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mobileNav.setAttribute("data-panel", btn.getAttribute("data-drilldown"));
      });
    });

    mobileNav.querySelectorAll("[data-drilldown-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mobileNav.removeAttribute("data-panel");
      });
    });

    mobileNav.querySelectorAll(".mobile-nav__sublist a").forEach(function (link) {
      link.addEventListener("click", function () {
        hamburger.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
        document.body.classList.remove("scroll-locked");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 푸터                                                               */
  /* ------------------------------------------------------------------ */
  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;

    var sloganParts = BRAND.sloganEn.split(" ");
    var lastWord = sloganParts.pop();
    var sloganHead = sloganParts.join(" ");

    var disclaimerHtml =
      '<section class="disclaimer" aria-labelledby="disclaimer-title">' +
      '<div class="container disclaimer__inner">' +
      '<p class="disclaimer__eyebrow font-display">' +
      DISCLAIMER.eyebrow +
      "</p>" +
      '<h2 class="disclaimer__title" id="disclaimer-title">' +
      DISCLAIMER.title +
      "</h2>" +
      '<p class="disclaimer__lead">' +
      DISCLAIMER.lead +
      "</p>" +
      '<div class="disclaimer__grid">' +
      DISCLAIMER.items
        .map(function (it, i) {
          return (
            '<div class="disclaimer__item"><span class="disclaimer__num font-num">0' +
            (i + 1) +
            "</span><h3>" +
            escapeHtml(it.title) +
            "</h3><p>" +
            escapeHtml(it.desc) +
            "</p></div>"
          );
        })
        .join("") +
      "</div></div></section>";

    el.innerHTML =
      disclaimerHtml +
      '<footer class="site-footer">' +
      '<div class="site-footer__slogan">' +
      '<p class="site-footer__slogan-text font-display">' +
      sloganHead +
      ' <em>' +
      lastWord +
      "</em></p>" +
      "</div>" +
      '<div class="site-footer__inner">' +
      "<div>" +
      '<div class="site-footer__brand">' +
      BRAND.nameKo +
      " " +
      BRAND.nameSub +
      "<small>" +
      BRAND.nameEn +
      "</small></div>" +
      '<dl class="site-footer__info">' +
      "<div><dt>대표변호사</dt><dd>" +
      BRAND.ceo +
      "</dd></div>" +
      "<div><dt>주소</dt><dd>" +
      BRAND.address +
      "</dd></div>" +
      "<div><dt>사업자등록번호</dt><dd>" +
      BRAND.regNo +
      "</dd></div>" +
      "<div><dt>전화</dt><dd>" +
      BRAND.phone +
      " / 팩스 " +
      BRAND.fax +
      "</dd></div>" +
      "<div><dt>이메일</dt><dd>" +
      BRAND.email +
      "</dd></div>" +
      "<div><dt>광고책임변호사</dt><dd>" +
      BRAND.adLawyer +
      "</dd></div>" +
      "</dl>" +
      "</div>" +
      "<div>" +
      '<div class="site-footer__heading">바로가기</div>' +
      '<nav class="site-footer__links" aria-label="푸터 메뉴">' +
      '<a href="index.html">홈</a>' +
      NAV_ITEMS.map(function (item) {
        return '<a href="' + item.href + '">' + escapeHtml(item.label) + "</a>";
      }).join("") +
      '<a href="admin-law.html">행정심판·행정소송</a>' +
      '<a href="privacy.html">개인정보처리방침</a>' +
      '<a href="admin.html">관리자</a>' +
      "</nav>" +
      "</div>" +
      "<div>" +
      '<div class="site-footer__heading">상담 채널</div>' +
      '<nav class="site-footer__links">' +
      '<a href="' +
      BRAND.phoneHref +
      '">전화상담 ' +
      BRAND.phone +
      "</a>" +
      '<a href="contact.html#contact-form">온라인 상담신청</a>' +
      '<a href="contact.html#location">방문 상담 예약 안내</a>' +
      "</nav>" +
      "</div>" +
      "</div>" +
      '<div class="site-footer__bottom">' +
      "<span>&copy; " +
      new Date().getFullYear() +
      " " +
      BRAND.nameKo +
      " " +
      BRAND.nameSub +
      ". All rights reserved.</span>" +
      "</div>" +
      "</footer>";
  }

  /* ------------------------------------------------------------------ */
  /* 플로팅 퀵메뉴                                                       */
  /* ------------------------------------------------------------------ */
  function renderQuickmenu() {
    var el = document.getElementById("quickmenu");
    if (!el) return;

    el.innerHTML =
      '<div class="quickmenu" id="quickmenu-inner">' +
      '<a class="quickmenu__btn quickmenu__btn--kakao" href="contact.html#contact-form" aria-label="온라인 상담신청">' +
      '<span class="ico" aria-hidden="true">&#128172;</span><span>상담신청</span>' +
      "</a>" +
      '<a class="quickmenu__btn quickmenu__btn--phone" href="' +
      BRAND.phoneHref +
      '" aria-label="전화상담 ' +
      BRAND.phone +
      '">' +
      '<span class="ico" aria-hidden="true">&#9742;</span><span>전화상담</span>' +
      "</a>" +
      '<button type="button" class="quickmenu__btn quickmenu__btn--top" id="quickmenu-top" aria-label="맨 위로">' +
      '<span class="ico" aria-hidden="true">&#8593;</span><span>TOP</span>' +
      "</button>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ */
  /* 상담 오버레이 · 사이트맵 오버레이 (페이지 HTML에 플레이스홀더 없음 —      */
  /* body 끝에 런타임 추가. 기본 숨김 상태이므로 CLS 영향 없음)              */
  /* ------------------------------------------------------------------ */
  function renderOverlays() {
    if (document.getElementById("consult-overlay")) return;

    var chipsHtml = CONSULT_CHIPS.map(function (c) {
      return (
        '<a class="overlay-consult__chip" href="' +
        c.href +
        '">' +
        escapeHtml(c.label) +
        "</a>"
      );
    }).join("");

    var consultHtml =
      '<div class="overlay" id="consult-overlay" role="dialog" aria-modal="true" aria-labelledby="consult-overlay-title" data-lenis-prevent>' +
      '<button type="button" class="overlay__close" data-overlay-close aria-label="상담창 닫기">&times;</button>' +
      '<div class="overlay-consult">' +
      '<p class="ghost-type ghost-type--lg ghost-type--center" style="top:18%" aria-hidden="true">CONSULT</p>' +
      '<div class="overlay-consult__inner">' +
      '<p class="overlay-consult__eyebrow font-display">JIPHYEONJEON MEDICAL LAW CENTER</p>' +
      '<h2 class="overlay-consult__title" id="consult-overlay-title">사건의 현재 단계부터 알려주십시오.<br>의료현장을 아는 변호사가 상담으로 연결해 드립니다.</h2>' +
      '<form class="overlay-consult__form" id="consult-overlay-form" action="contact.html" method="get">' +
      '<input class="overlay-consult__input" type="text" name="q" placeholder="예: 보건소에서 업무정지 사전통지를 받았습니다" aria-label="상담 내용 입력" autocomplete="off">' +
      '<button type="submit" class="overlay-consult__submit">상담 연결</button>' +
      "</form>" +
      '<div class="overlay-consult__chips">' +
      chipsHtml +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    var groupsHtml = SITEMAP_GROUPS.map(function (g) {
      var linksHtml = g.links
        .map(function (l) {
          return '<a href="' + l.href + '">' + escapeHtml(l.label) + "</a>";
        })
        .join("");
      return (
        '<div><span class="overlay-sitemap__group-label font-display">' +
        g.label +
        '</span><nav class="overlay-sitemap__links">' +
        linksHtml +
        "</nav></div>"
      );
    }).join("");

    var sitemapHtml =
      '<div class="overlay" id="sitemap-overlay" role="dialog" aria-modal="true" aria-labelledby="sitemap-overlay-title" data-lenis-prevent>' +
      '<button type="button" class="overlay__close" data-overlay-close aria-label="사이트맵 닫기">&times;</button>' +
      '<div class="overlay-sitemap__inner">' +
      '<h2 class="overlay-sitemap__title" id="sitemap-overlay-title">SITE MAP</h2>' +
      '<div class="overlay-sitemap__grid">' +
      groupsHtml +
      "</div>" +
      "</div>" +
      "</div>";

    document.body.insertAdjacentHTML("beforeend", consultHtml + sitemapHtml);
  }

  /* ------------------------------------------------------------------ */
  /* 부트스트랩 — 각 인젝션을 개별 try/catch로 격리(하나 실패해도 나머지 진행) */
  /* ------------------------------------------------------------------ */
  function safe(fn, label) {
    try {
      fn();
    } catch (err) {
      /* [P1-1] 인젝션 실패 시 플레이스홀더의 정적 씨앗 내비가 그대로 생존한다. */
      if (window.console && console.warn) {
        console.warn("[components.js] " + label + " 인젝션 실패, 씨앗 내비 유지:", err);
      }
    }
  }

  function init() {
    safe(renderDemoBar, "demo-bar");
    safe(renderHeader, "site-header");
    safe(renderFooter, "site-footer");
    safe(renderQuickmenu, "quickmenu");
    safe(renderOverlays, "overlays");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.JHJ_BRAND = BRAND; window.JEONGDO_BRAND = BRAND;
})();

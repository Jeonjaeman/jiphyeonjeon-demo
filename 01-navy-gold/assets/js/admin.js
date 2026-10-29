/*!
 * admin.js — admin.html 전용 (worker-4 소유)
 * 로그인 없는 정적 관리자 목업: 시드 상담 8건 + localStorage 'jhj_inquiries' 병합(dedup: id 키, P1-4)
 * + 이미지 교체 미리보기 목업 + 텍스트 수정 목업(비영속). fetch/XHR 없음.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "jhj_inquiries";

  /* ------------------------------------------------------------------ */
  /* 시드 상담 데이터 8건 (하드코딩)                                       */
  /* ------------------------------------------------------------------ */
  var SEED_INQUIRIES = [
    { id: "SEED-0001", name: "김민수", phone: "010-2231-5567", title: "보건소 업무정지 사전통지 대응 문의", body: "의료광고 관련으로 업무정지 15일 사전통지를 받았습니다. 의견 제출 기한이 열흘 남았습니다.", date: "2026-09-02T09:12:00+09:00", status: "완료" },
    { id: "SEED-0002", name: "이수진", phone: "010-8842-1290", title: "의사면허 재교부 신청 가능 여부", body: "2023년 면허 취소 후 형 집행이 끝났습니다. 재교부 신청 요건을 확인하고 싶습니다.", date: "2026-09-10T14:30:00+09:00", status: "상담중" },
    { id: "SEED-0003", name: "박현우", phone: "010-5567-3321", title: "진료기록부 관련 경찰 출석요구", body: "진료기록부 기재 누락으로 출석요구서를 받았습니다. 조사 전 상담을 원합니다.", date: "2026-09-18T11:05:00+09:00", status: "접수" },
    { id: "SEED-0004", name: "최유리", phone: "010-3345-9981", title: "수술 후 신경손상 손해배상 상담", body: "수술 이후 신경손상이 남았습니다. 손해배상 청구 절차를 알고 싶습니다.", date: "2026-09-21T16:45:00+09:00", status: "완료" },
    { id: "SEED-0005", name: "정태호", phone: "010-7789-2214", title: "면허정지 처분 행정심판 문의", body: "면허정지 1개월 처분을 받았습니다. 행정심판과 행정소송 중 어느 쪽이 적합한지 문의드립니다.", date: "2026-09-25T10:20:00+09:00", status: "상담중" },
    { id: "SEED-0006", name: "한소영", phone: "010-4412-7756", title: "비급여 광고 사전심의 위반 통보", body: "SNS 광고 건으로 의료광고 사전심의 위반 통보를 받았습니다.", date: "2026-10-01T13:10:00+09:00", status: "접수" },
    { id: "SEED-0007", name: "오지훈", phone: "010-9987-3345", title: "의료기관 명의대여 혐의 수사", body: "의료기관 개설 관련 명의대여 혐의로 수사가 시작되었습니다.", date: "2026-10-05T09:50:00+09:00", status: "접수" },
    { id: "SEED-0008", name: "강민재", phone: "010-6623-8890", title: "의료분쟁 조정 신청 대응", body: "환자 측이 의료분쟁조정중재원에 조정을 신청했습니다. 답변서 준비를 도와주십시오.", date: "2026-10-08T15:00:00+09:00", status: "완료" },
  ];

  /* ------------------------------------------------------------------ */
  /* 유틸                                                                */
  /* ------------------------------------------------------------------ */
  function readStoredInquiries() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  /* [P1-4] dedup 키: id(타임스탬프+연락처 해시 조합, form.js가 생성) 기준으로 병합 */
  function mergeInquiries(seed, stored) {
    var map = {};
    var order = [];
    seed.concat(stored).forEach(function (item) {
      if (!item || !item.id) return;
      if (!(item.id in map)) order.push(item.id);
      map[item.id] = item; /* 동일 id는 후순위(최신 저장분)로 덮어씀 */
    });
    return order
      .map(function (id) {
        return map[id];
      })
      .sort(function (a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }

  function maskName(name) {
    var s = String(name || "");
    if (s.length <= 1) return s;
    if (s.length === 2) return s[0] + "○";
    return s[0] + "○".repeat(s.length - 2) + s[s.length - 1];
  }

  function maskPhone(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (digits.length < 7) return phone;
    var head = digits.slice(0, 3);
    var tail = digits.slice(-2);
    return head + "-****-**" + tail;
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      var pad = function (n) {
        return String(n).padStart(2, "0");
      };
      return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate());
    } catch (e) {
      return iso;
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ------------------------------------------------------------------ */
  /* 토스트 (form.js와 동일 패턴, admin.html은 form.js를 로드하지 않으므로 자체 구현) */
  /* ------------------------------------------------------------------ */
  function showToast(message, variant) {
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.className = "toast" + (variant ? " toast--" + variant : "");
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    document.body.appendChild(toast);

    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3200);
  }

  /* ------------------------------------------------------------------ */
  /* 사이드바 내비게이션 (대시보드 / 상담관리 / 콘텐츠 관리)                  */
  /* ------------------------------------------------------------------ */
  function initSectionNav() {
    var links = document.querySelectorAll("[data-admin-section]");
    var panels = document.querySelectorAll("[data-admin-panel]");

    function activate(name) {
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-admin-section") === name);
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-admin-panel") !== name;
      });
    }

    links.forEach(function (link) {
      if (link.hasAttribute("disabled")) return;
      link.addEventListener("click", function () {
        activate(link.getAttribute("data-admin-section"));
        var sidebar = document.getElementById("admin-sidebar");
        var toggle = document.getElementById("admin-sidebar-toggle");
        if (sidebar && sidebar.classList.contains("is-open") && window.innerWidth <= 900) {
          sidebar.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  function initSidebarToggle() {
    var toggle = document.getElementById("admin-sidebar-toggle");
    var sidebar = document.getElementById("admin-sidebar");
    if (!toggle || !sidebar) return;
    toggle.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ------------------------------------------------------------------ */
  /* 대시보드 요약 카드                                                   */
  /* ------------------------------------------------------------------ */
  function renderStats(list) {
    var total = document.getElementById("stat-total");
    var pending = document.getElementById("stat-pending");
    var inProgress = document.getElementById("stat-progress");
    var done = document.getElementById("stat-done");
    if (!total) return;

    total.textContent = list.length;
    pending.textContent = list.filter(function (i) {
      return i.status === "접수";
    }).length;
    inProgress.textContent = list.filter(function (i) {
      return i.status === "상담중";
    }).length;
    done.textContent = list.filter(function (i) {
      return i.status === "완료";
    }).length;
  }

  /* ------------------------------------------------------------------ */
  /* 상담관리 테이블                                                      */
  /* ------------------------------------------------------------------ */
  var ALL_INQUIRIES = [];

  function renderTable(list) {
    var tbody = document.getElementById("admin-table-body");
    var count = document.getElementById("admin-count");
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="admin-empty">검색 결과가 없습니다.</div></td></tr>';
    } else {
      tbody.innerHTML = list
        .map(function (item) {
          return (
            "<tr data-id=\"" + escapeHtml(item.id) + "\">" +
            "<td>" + escapeHtml(item.id) + "</td>" +
            "<td>" + escapeHtml(maskName(item.name)) + "</td>" +
            "<td>" + escapeHtml(maskPhone(item.phone)) + "</td>" +
            "<td class=\"is-title\">" + escapeHtml(item.title) + "</td>" +
            "<td>" + formatDate(item.date) + "</td>" +
            "<td><span class=\"status-badge status-badge--" + escapeHtml(item.status) + "\">" + escapeHtml(item.status) + "</span></td>" +
            "</tr>"
          );
        })
        .join("");
    }

    if (count) count.textContent = "총 " + list.length + "건";

    tbody.querySelectorAll("tr[data-id]").forEach(function (row) {
      row.addEventListener("click", function () {
        var id = row.getAttribute("data-id");
        var record = ALL_INQUIRIES.filter(function (i) {
          return i.id === id;
        })[0];
        if (record) openDetail(record, row);
      });
    });
  }

  function initSearch() {
    var input = document.getElementById("admin-search");
    if (!input) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var filtered = !q
        ? ALL_INQUIRIES
        : ALL_INQUIRIES.filter(function (item) {
            return (
              (item.name || "").toLowerCase().indexOf(q) !== -1 ||
              (item.phone || "").toLowerCase().indexOf(q) !== -1 ||
              (item.title || "").toLowerCase().indexOf(q) !== -1
            );
          });
      renderTable(filtered);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 상세 패널                                                            */
  /* ------------------------------------------------------------------ */
  function openDetail(record, rowEl) {
    var panel = document.getElementById("admin-detail");
    var backdrop = document.getElementById("admin-detail-backdrop");
    if (!panel) return;

    document.querySelectorAll(".admin-table tbody tr").forEach(function (r) {
      r.classList.toggle("is-selected", r === rowEl);
    });

    panel.innerHTML =
      '<button type="button" class="admin-detail__close" data-detail-close>&larr; 닫기</button>' +
      "<dl>" +
      "<div><dt>접수 ID</dt><dd>" + escapeHtml(record.id) + "</dd></div>" +
      "<div><dt>이름</dt><dd>" + escapeHtml(maskName(record.name)) + "</dd></div>" +
      "<div><dt>연락처</dt><dd>" + escapeHtml(maskPhone(record.phone)) + "</dd></div>" +
      "<div><dt>제목</dt><dd>" + escapeHtml(record.title) + "</dd></div>" +
      "<div><dt>내용</dt><dd>" + escapeHtml(record.body || "") + "</dd></div>" +
      "<div><dt>접수일</dt><dd>" + formatDate(record.date) + "</dd></div>" +
      "<div><dt>상태</dt><dd><span class=\"status-badge status-badge--" + escapeHtml(record.status) + "\">" + escapeHtml(record.status) + "</span></dd></div>" +
      "</dl>";

    panel.hidden = false;
    if (backdrop) backdrop.hidden = false;
    window.requestAnimationFrame(function () {
      panel.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
    });

    var closeBtn = panel.querySelector("[data-detail-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeDetail);
  }

  function closeDetail() {
    var panel = document.getElementById("admin-detail");
    var backdrop = document.getElementById("admin-detail-backdrop");
    if (!panel) return;
    panel.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    window.setTimeout(function () {
      panel.hidden = true;
      if (backdrop) backdrop.hidden = true;
    }, 320);
  }

  function initDetailBackdrop() {
    var backdrop = document.getElementById("admin-detail-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeDetail);
  }

  /* ------------------------------------------------------------------ */
  /* 이미지 교체 목업 — 미리보기만, 안내 토스트                             */
  /* ------------------------------------------------------------------ */
  function initImageReplace() {
    var inputs = document.querySelectorAll("[data-image-replace]");
    inputs.forEach(function (input) {
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var card = input.closest(".admin-image-card");
        var img = card ? card.querySelector("img") : null;
        if (img) {
          var url = URL.createObjectURL(file);
          img.src = url;
        }
        showToast("이미지가 미리보기로 교체되었습니다");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 텍스트 수정 목업 — 저장 시 비영속 토스트만                              */
  /* ------------------------------------------------------------------ */
  function initTextEdit() {
    var saveBtn = document.getElementById("admin-save-text");
    if (!saveBtn) return;
    saveBtn.addEventListener("click", function () {
      showToast("저장되었습니다");
    });
  }

  /* ------------------------------------------------------------------ */
  /* 부트스트랩                                                          */
  /* ------------------------------------------------------------------ */
  function init() {
    ALL_INQUIRIES = mergeInquiries(SEED_INQUIRIES, readStoredInquiries());
    renderStats(ALL_INQUIRIES);
    renderTable(ALL_INQUIRIES);
    initSearch();
    initSectionNav();
    initSidebarToggle();
    initDetailBackdrop();
    initImageReplace();
    initTextEdit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

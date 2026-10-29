/*!
 * kb.js — 한국식 줄나눔
 * 브라우저의 자동 줄바꿈(글자가 꽉 차면 아무 데서나 끊김) 대신 문장·절 단위로 줄을 나눈다.
 *  - 문장 끝(…다. / …요.)에서 항상 나눔
 *  - 한 줄이 길면 연결어미(…며 / …지만 / …는데 / …면서 …) 뒤에서 나눔
 *  - 그래도 길면 절이 끝나는 쉼표(…으로, / …경우,) 뒤에서 나눔(명사 나열의 쉼표는 제외)
 *  - " · " 구분자로 이어진 정보 줄은 항목마다 나눔
 * 삽입하는 <br class="kb">는 640px 이하에서 CSS로 숨겨 좁은 화면에서는 자연 줄바꿈을 따른다.
 * 대상: p, dd, li, blockquote, figcaption 안의 텍스트(내비·폼·버튼·표·코드·data-no-kb 제외)
 */
(function () {
  "use strict";
  var MIN = 30;
  var SKIP = "nav, header, footer, form, button, a, table, code, pre, textarea, select, option, label, [data-no-kb], .gnb, .megamenu, .fullnav, .mnav, .subnav, .hero__fraction";
  var SENT = /(?<=[가-힣]\.)\s+(?=[^\s])/;
  var CONJ = /(?<=[가-힣](?:으며|며|지만|는데|면서|다면|라면|으면|고자|거나|으나))\s+(?=[가-힣])/;
  var DOT = /\s·\s/;
  /* 쉼표는 명사 나열("상담, 진단, 조언")이 아니라 절이 끝난 자리("…으로, …며, …경우,")에서만 나눈다 */
  var CLAUSE = /(?:으로|며|면|하고|되고|이고|하여|되어|경우|는데|지만|라면|다가)$/;

  function splitComma(s) {
    var out = [], depth = 0, start = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "(" || c === "（") depth++;
      else if (c === ")" || c === "）") depth--;
      else if (c === "," && depth === 0 && s[i + 1] === " " && CLAUSE.test(s.slice(0, i))) {
        var left = s.slice(start, i + 1), right = s.slice(i + 2);
        if (left.trim().length >= 12 && right.trim().length >= 12) { out.push(left); start = i + 2; }
      }
    }
    out.push(s.slice(start));
    return out;
  }

  function splitBy(s, re, minSide, maxLen) {
    if (s.length <= maxLen) return [s];
    var parts = s.split(re), out = [], buf = "";
    parts.forEach(function (p) {
      buf = buf ? buf + " " + p : p;
      if (buf.length >= minSide) { out.push(buf); buf = ""; }
    });
    if (buf) { if (out.length) out[out.length - 1] += " " + buf; else out.push(buf); }
    return out;
  }

  function segments(text) {
    var t = text.replace(/\s+/g, " ").trim();
    if (t.length < MIN) return null;
    var out = [];
    if (DOT.test(t) && t.length > 40 && !SENT.test(t)) {
      return t.split(DOT);
    }
    splitBy(t, SENT, 8, 0).forEach(function (s) {
      splitBy(s, CONJ, 12, 38).forEach(function (c) {
        if (c.length > 40) splitComma(c).forEach(function (x) { out.push(x.trim()); });
        else out.push(c.trim());
      });
    });
    return out.length > 1 ? out : null;
  }

  function apply(root) {
    var els = (root || document).querySelectorAll("p, dd, li, blockquote, figcaption");
    Array.prototype.forEach.call(els, function (el) {
      if (el.closest(SKIP)) return;
      if (el.querySelector("br, img, svg, ul, ol, p, div")) return;
      var nodes = [];
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = walker.nextNode())) if (n.nodeValue.trim().length >= MIN && !n.parentNode.closest(SKIP)) nodes.push(n);
      nodes.forEach(function (node) {
        var segs = segments(node.nodeValue);
        if (!segs) return;
        var frag = document.createDocumentFragment();
        segs.forEach(function (s, i) {
          if (i) { var br = document.createElement("br"); br.className = "kb"; frag.appendChild(br); }
          frag.appendChild(document.createTextNode(s));
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
  }

  window.JHJ_KB = apply;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { apply(); });
  else apply();
})();

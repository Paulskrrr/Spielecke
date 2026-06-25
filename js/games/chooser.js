/*
 * games/chooser.js — Chooser
 *
 * A spinning wheel that lands on a random person from the roster. No content,
 * no scoring — just "who's it?". The wheel is an SVG; spinning is a CSS rotate
 * transition on the wheel element, with a fixed pointer at the top.
 *
 * Uses the shared roster. Not a drinking game.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var COLORS = ["#ff4d5e", "#ff8a3d", "#ffcf33", "#36d399", "#3aa0ff", "#a06bff", "#ff5fa2"];

  var els = null, ctx = null;
  var totalRotation = 0, spinning = false, spinTimer = null;

  var module = {
    meta: {
      id: "chooser",
      name: "Chooser",
      tagline: "Spin the wheel. Let fate pick the victim.",
      icon: "🎡",
      minPlayers: 2,
      supportsDrinking: false,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      totalRotation = 0; spinning = false;
      render();
    },
    unmount: function () {
      if (spinTimer !== null) { global.clearTimeout(spinTimer); spinTimer = null; }
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; spinning = false;
    },
  };

  function names() {
    return (ctx.players || []).filter(function (p) { return p && p.name; }).map(function (p) { return p.name; });
  }

  function render() {
    var ns = names();
    if (ns.length < 1) {
      els.innerHTML =
        '<section class="screen game-setup">' +
        '  <h2 class="screen-title pop">🎡 ' + t("Chooser") + "</h2>" +
        '  <div class="roster-warn" style="display:block">' + t("⚠ Add some players from the header (👥) to spin.") + "</div>" +
        "</section>";
      return;
    }

    els.innerHTML =
      '<section class="screen chooser-screen">' +
      '  <h2 class="screen-title pop">🎡 ' + t("Chooser") + "</h2>" +
      '  <div class="wheel-wrap">' +
      '    <div class="wheel-pointer"></div>' +
      '    <div id="chooser-wheel" class="wheel">' + wheelSvg(ns) + "</div>" +
      "  </div>" +
      '  <div id="chooser-result" class="chooser-result">&nbsp;</div>' +
      '  <button id="chooser-spin" class="btn btn-primary btn-block btn-xl">' + t("SPIN 🎯") + "</button>" +
      '  <button id="chooser-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "</section>";

    els.querySelector("#chooser-spin").addEventListener("click", spin);
    els.querySelector("#chooser-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function wheelSvg(ns) {
    var n = ns.length;
    var seg = 360 / n;
    var cx = 100, cy = 100, r = 98;
    var parts = ['<svg viewBox="0 0 200 200" class="wheel-svg">'];
    for (var i = 0; i < n; i++) {
      var a0 = -90 + i * seg, a1 = a0 + seg;
      var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
      var large = seg > 180 ? 1 : 0;
      var fill = COLORS[i % COLORS.length];
      if (n === 1) {
        parts.push('<circle cx="100" cy="100" r="' + r + '" fill="' + fill + '" stroke="#241b4d" stroke-width="2"/>');
      } else {
        parts.push('<path d="M' + cx + ',' + cy + ' L' + p0.x + ',' + p0.y +
          ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + p1.x + ',' + p1.y + ' Z" fill="' + fill +
          '" stroke="#241b4d" stroke-width="2"/>');
      }
      var mid = a0 + seg / 2;
      var lp = pt(cx, cy, r * 0.6, mid);
      parts.push('<text x="' + lp.x.toFixed(1) + '" y="' + lp.y.toFixed(1) +
        '" transform="rotate(' + (mid + 90).toFixed(1) + ' ' + lp.x.toFixed(1) + ' ' + lp.y.toFixed(1) +
        ')" text-anchor="middle" dominant-baseline="central" class="wheel-label">' + esc(trunc(ns[i])) + "</text>");
    }
    parts.push('<circle cx="100" cy="100" r="10" fill="#fff" stroke="#241b4d" stroke-width="3"/>');
    parts.push("</svg>");
    return parts.join("");
  }

  function spin() {
    if (spinning) return;
    var ns = names();
    if (!ns.length) return;
    spinning = true;
    var spinBtn = els.querySelector("#chooser-spin");
    spinBtn.disabled = true;
    var resultEl = els.querySelector("#chooser-result");
    resultEl.innerHTML = "&nbsp;";

    var n = ns.length, seg = 360 / n;
    var idx = Math.floor(Math.random() * n);
    var center = idx * seg + seg / 2;
    var jitter = (Math.random() * 2 - 1) * (seg * 0.35);
    var base = totalRotation + 360 * 5;
    var newTotal = base - (base % 360) + ((360 - center) % 360) + jitter;
    if (newTotal <= totalRotation) newTotal += 360;
    totalRotation = newTotal;

    var wheel = els.querySelector("#chooser-wheel");
    wheel.style.transition = "transform 4.2s cubic-bezier(0.17, 0.67, 0.21, 1)";
    wheel.style.transform = "rotate(" + newTotal + "deg)";

    spinTimer = global.setTimeout(function () {
      spinTimer = null;
      spinning = false;
      if (!els) return;
      var rEl = els.querySelector("#chooser-result");
      if (rEl) rEl.innerHTML = '👉 <span class="chooser-name">' + esc(ns[idx]) + "</span>";
      var b = els.querySelector("#chooser-spin");
      if (b) { b.disabled = false; b.textContent = t("SPIN AGAIN 🎯"); }
    }, 4400);
  }

  function pt(cx, cy, r, ang) {
    var rad = ang * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function trunc(s) { s = String(s); return s.length > 10 ? s.slice(0, 9) + "…" : s; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.chooser = module;
})(window);

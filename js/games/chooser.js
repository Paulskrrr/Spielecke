// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/chooser.js — Chooser
 *
 * A spinning wheel that lands on a random person from the roster. The wheel is
 * an SVG; spinning is a CSS rotate transition, with a fixed pointer at the top.
 *
 * Two modes:
 *   - Normal: spin → a name → spin again. "Who's it?", no state.
 *   - 🎯 Elimination: the spun name drops OFF the wheel and it visibly shrinks
 *     round by round; when one remains it's the last one standing — set to win
 *     or lose via a toggle. Drinking mode: whoever gets spun drinks as they go.
 *
 * Uses the shared roster. Optional 🍻 drinking mode.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var COLORS = ["#ff4d5e", "#ff8a3d", "#ffcf33", "#36d399", "#3aa0ff", "#a06bff", "#ff5fa2"];

  var els = null, ctx = null;
  var drinking = false, elim = false, lastWins = true;
  var totalRotation = 0, spinning = false, spinTimer = null;
  var remaining = null;     // elimination survivors (names[]) or null when not in a run
  var pendingElim = false;  // true between an elimination spin landing and confirming it
  var lastIdx = -1;

  var module = {
    meta: {
      id: "chooser",
      name: "Chooser",
      tagline: "Spin the wheel. Let fate pick the victim.",
      icon: "🎡",
      minPlayers: 2,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      totalRotation = 0; spinning = false; pendingElim = false; remaining = null;
      drinking = context.store.get("drinking", false) === true;
      elim = context.store.get("elim", false) === true;
      lastWins = context.store.get("lastWins", true) !== false;
      render();
    },
    unmount: function () {
      if (spinTimer !== null) { global.clearTimeout(spinTimer); spinTimer = null; }
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; spinning = false; pendingElim = false; remaining = null;
    },
  };

  function fullRoster() {
    return (ctx.players || []).filter(function (p) { return p && p.name; }).map(function (p) { return p.name; });
  }
  // The names currently on the wheel: the survivor list in an elimination run,
  // otherwise the whole roster.
  function pool() { return (elim && remaining) ? remaining : fullRoster(); }

  function render() {
    totalRotation = 0; spinning = false; pendingElim = false;
    var full = fullRoster();
    if (full.length < 1) {
      els.innerHTML =
        '<section class="screen game-setup">' +
        '  <h2 class="screen-title pop">🎡 ' + t("Chooser") + "</h2>" +
        '  <div class="roster-warn" style="display:block">' + t("⚠ Add some players from the header (👥) to spin.") + "</div>" +
        "</section>";
      return;
    }
    // Entering elimination mode (or a fresh run) seeds the survivor list.
    if (elim && remaining === null) remaining = full.slice();
    if (elim && remaining.length <= 1) { renderFinale(remaining[0] || full[0]); return; }

    var ns = pool();
    els.innerHTML =
      '<section class="screen chooser-screen">' +
      '  <h2 class="screen-title pop">🎡 ' + t("Chooser") + "</h2>" +
      '  <div id="chooser-wheelwrap" class="wheel-wrap" role="button" data-primary>' +
      '    <div class="wheel-pointer"></div>' +
      '    <div id="chooser-wheel" class="wheel">' + wheelSvg(ns) + "</div>" +
      "  </div>" +
      '  <div id="chooser-result" class="chooser-result">&nbsp;</div>' +
      '  <div id="chooser-action"></div>' +
      '  <div id="chooser-hint" class="tap-hint">' + t("👆 Tap to spin") + "</div>" +
      '  <div class="chooser-opts">' +
      '    <label class="toggle"><input type="checkbox" id="chooser-drink"' + (drinking ? " checked" : "") + ' /><span>' + t("🍻 Drinking mode") + "</span></label>" +
      '    <label class="toggle"><input type="checkbox" id="chooser-elim"' + (elim ? " checked" : "") + ' /><span>' + t("🎯 Elimination") + "</span></label>" +
      (elim
        ? '    <div class="chooser-elim-opts">' +
          '      <span class="muted small">' + t("Last one standing:") + "</span>" +
          '      <button class="chip' + (lastWins ? " chip--active" : "") + '" id="ch-win">' + t("🏆 wins") + "</button>" +
          '      <button class="chip' + (!lastWins ? " chip--active" : "") + '" id="ch-lose">' + t("💀 loses") + "</button>" +
          '      <span class="muted small">· ' + t("{n} still in").replace("{n}", ns.length) + "</span>" +
          "    </div>"
        : "") +
      "  </div>" +
      "</section>";

    global.Spielecke.tappable(els.querySelector("#chooser-wheelwrap"), spin);

    els.querySelector("#chooser-drink").addEventListener("change", function (e) {
      drinking = e.target.checked; ctx.store.set("drinking", drinking);
    });
    els.querySelector("#chooser-elim").addEventListener("change", function (e) {
      elim = e.target.checked; ctx.store.set("elim", elim);
      remaining = elim ? fullRoster().slice() : null;
      render();
    });
    var winBtn = els.querySelector("#ch-win"), loseBtn = els.querySelector("#ch-lose");
    if (winBtn) winBtn.addEventListener("click", function () { setLastWins(true); });
    if (loseBtn) loseBtn.addEventListener("click", function () { setLastWins(false); });
  }

  function setLastWins(v) {
    if (lastWins === v) return;
    lastWins = v; ctx.store.set("lastWins", lastWins);
    els.querySelector("#ch-win").classList.toggle("chip--active", lastWins);
    els.querySelector("#ch-lose").classList.toggle("chip--active", !lastWins);
  }

  function renderFinale(name) {
    var line = lastWins
      ? "🏆 " + t("{name} survives — winner!").replace("{name}", esc(name))
      : "💀 " + t("{name} is the last one left!").replace("{name}", esc(name));
    els.innerHTML =
      '<section class="screen chooser-screen chooser-finale">' +
      '  <h2 class="screen-title pop">🎡 ' + t("Chooser") + "</h2>" +
      '  <div class="chooser-finale-badge">' + (lastWins ? "🏆" : "💀") + "</div>" +
      '  <div class="chooser-result chooser-result--big">' + line + "</div>" +
      '  <button id="chooser-restart" class="btn btn-primary btn-block btn-xl" data-primary>' + t("New round 🔁") + "</button>" +
      "</section>";
    els.querySelector("#chooser-restart").addEventListener("click", function () {
      remaining = fullRoster().slice();
      render();
    });
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
    if (spinning || pendingElim) return;
    var ns = pool();
    if (ns.length < 2) return; // nothing to decide with a single segment
    spinning = true;
    var hintEl = els.querySelector("#chooser-hint");
    if (hintEl) hintEl.style.visibility = "hidden";
    var actionEl = els.querySelector("#chooser-action");
    if (actionEl) actionEl.innerHTML = "";
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
    lastIdx = idx;

    var wheel = els.querySelector("#chooser-wheel");
    wheel.style.transition = "transform 4.2s cubic-bezier(0.17, 0.67, 0.21, 1)";
    wheel.style.transform = "rotate(" + newTotal + "deg)";

    spinTimer = global.setTimeout(function () {
      spinTimer = null;
      spinning = false;
      if (!els) return;
      var name = ns[idx];
      var rEl = els.querySelector("#chooser-result");

      if (elim) {
        pendingElim = true;
        if (rEl) rEl.innerHTML = "🚫 " + t("{name} is out!").replace("{name}", esc(name)) +
          (drinking ? ' <span class="chooser-name">' + t("drinks!") + " 🍻</span>" : "");
        var aEl = els.querySelector("#chooser-action");
        if (aEl) {
          aEl.innerHTML = '<button id="chooser-next" class="btn btn-primary btn-block btn-xl" data-primary>' + t("Next ▶️") + "</button>";
          els.querySelector("#chooser-next").addEventListener("click", function () {
            if (remaining) remaining.splice(lastIdx, 1);
            render();
          });
        }
      } else {
        if (rEl) rEl.innerHTML = '👉 <span class="chooser-name">' + esc(name) + "</span>" +
          (drinking ? " " + t("drinks!") + " 🍻" : "");
        var hEl = els.querySelector("#chooser-hint");
        if (hEl) { hEl.style.visibility = "visible"; hEl.textContent = t("👆 Tap to spin again"); }
      }
    }, 4400);
  }

  function pt(cx, cy, r, ang) {
    var rad = ang * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function trunc(s) { s = String(s); return s.length > 10 ? s.slice(0, 9) + "…" : s; }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.chooser = module;
})(window);

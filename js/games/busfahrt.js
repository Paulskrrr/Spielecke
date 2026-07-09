// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/busfahrt.js — „Die Busfahrt" (Ride the Bus, final guessing phase only)
 *
 * One player is the Busfahrer; the app deals a row of four face-down cards and
 * the driver climbs an escalating 4-step guessing ladder:
 *   1. Farbe              Rot oder Schwarz?
 *   2. Höher oder Tiefer  vs. the previous card
 *   3. Innen / Außen      next value between the first two, or outside?
 *   4. Suit               name the exact suit (1-in-4)
 * Any wrong guess sends them back to step 1, the row re-deals, and they trinken
 * sips equal to the step they failed at. Clear all four to escape.
 *
 * Reuses the shared deck/card-face component (Spielecke.Cards) and the shell
 * contract (roster for the Busfahrer, namespaced store for config, goHome()).
 * The single reveal-animation timer is cleared on unmount.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var Cards = global.Spielecke.Cards;

  // ── Config block (spec: defaults, all configurable) ──────────────────────
  var DEFAULTS = {
    tieWrong: true,      // step 2/3 on equal value counts as wrong (spec §3 default)
    escapeHandsOut: false, // on a clean escape the driver hands out the sips instead
  };

  var STEP_SIPS = [1, 2, 3, 4]; // sips for failing at step 1..4 (scales with step)

  var els = null, ctx = null, settings = null;
  var driverIdx = 0;
  var row = [];          // the four dealt cards
  var step = 0;          // 0..3 = current rung; 4 = escaped
  var revealTimer = null;
  var busy = false;      // guard against double-taps mid-reveal
  var busPos = 0;        // where the little bus sits on the timeline (0..4)

  var module = {
    meta: {
      id: "busfahrt",
      name: "Ride the Bus",
      tagline: "Four guesses to escape. One slip and you're back on board.",
      icon: "🚌",
      minPlayers: 1,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        tieWrong: context.store.get("tieWrong", DEFAULTS.tieWrong) !== false,
        escapeHandsOut: context.store.get("escapeHandsOut", DEFAULTS.escapeHandsOut) === true,
      };
      driverIdx = 0;
      renderSetup();
    },
    unmount: function () {
      clearTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; row = []; step = 0; busy = false; busPos = 0;
    },
  };

  function clearTimer() {
    if (revealTimer !== null) { global.clearTimeout(revealTimer); revealTimer = null; }
  }

  function names() {
    return (ctx.players || []).filter(function (p) { return p && p.name; }).map(function (p) { return p.name; });
  }
  function driverName() {
    var ns = names();
    return ns.length ? ns[driverIdx % ns.length] : t("the driver");
  }

  // ── Setup ────────────────────────────────────────────────────────────────
  function renderSetup() {
    clearTimer();
    var ns = names();
    var roleBlock = ns.length
      ? '<h3 class="sub">' + t("Busfahrer") + "</h3>" +
        '<div class="chip-row" id="bf-driver">' +
        ns.map(function (n, i) { return '<button class="chip" data-i="' + i + '">' + esc(n) + "</button>"; }).join("") +
        "</div>"
      : '<p class="muted small">' + t("No players yet — add some from the header (👥) to rotate the Busfahrer, or just pass the laptop.") + "</p>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🚌 ' + t("Ride the Bus") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      "  " + roleBlock +
      '  <h3 class="sub">' + t("House rules") + "</h3>" +
      '  <label class="toggle"><input type="checkbox" id="bf-tie"' + (settings.tieWrong ? " checked" : "") + " /><span>" + t("Tie counts as wrong (steps 2 & 3)") + "</span></label>" +
      '  <label class="toggle"><input type="checkbox" id="bf-hand"' + (settings.escapeHandsOut ? " checked" : "") + " /><span>" + t("On escape the driver hands out the sips") + "</span></label>" +
      '  <button id="bf-start" class="btn btn-primary btn-block btn-xl">' + t("Board the bus 🚌") + "</button>" +
      "</section>";

    if (ns.length) {
      highlight("#bf-driver", String(driverIdx), "data-i");
      els.querySelectorAll("#bf-driver .chip").forEach(function (c) {
        c.addEventListener("click", function () {
          driverIdx = parseInt(c.getAttribute("data-i"), 10) || 0;
          highlight("#bf-driver", String(driverIdx), "data-i");
        });
      });
    }
    els.querySelector("#bf-tie").addEventListener("change", function (e) {
      settings.tieWrong = e.target.checked; ctx.store.set("tieWrong", settings.tieWrong);
    });
    els.querySelector("#bf-hand").addEventListener("change", function (e) {
      settings.escapeHandsOut = e.target.checked; ctx.store.set("escapeHandsOut", settings.escapeHandsOut);
    });
    els.querySelector("#bf-start").addEventListener("click", startRide);
  }

  function startRide() {
    busPos = 0;   // fresh ride starts the bus at the depot
    deal();
    renderRide();
  }

  // The little bus on its timeline: 4 stops (one per rung) ending at the 🏁.
  // The bus is rendered at its current position, then slid to the target so it
  // animates between renders — like the horses in the Horse Race.
  function busLineHtml() {
    var ticks = "";
    for (var i = 1; i <= 3; i++) {
      ticks += '<span class="bf-tick" style="left:' + (i / 4 * 100) + '%"></span>';
    }
    return (
      '<div class="bf-line">' +
      '  <div class="bf-line__track">' + ticks +
      '    <span class="bf-line__bus" id="bf-bus" style="left:' + (busPos / 4 * 100) + '%">🚌</span>' +
      '    <span class="bf-line__finish">🏁</span>' +
      "  </div>" +
      "</div>"
    );
  }
  // Slide the already-rendered bus to `target` (0..4). Double rAF guarantees the
  // start position paints first so the CSS transition actually animates.
  function moveBus(target) {
    busPos = target;
    if (!els) return;
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        var b = els && els.querySelector("#bf-bus");
        if (b) b.style.left = (target / 4 * 100) + "%";
      });
    });
  }

  function deal() {
    row = Cards.shuffle(Cards.newDeck()).slice(0, 4);
    step = 0;
    busy = false;
  }

  // ── Ride screen ───────────────────────────────────────────────────────────
  var STEPS = [
    { key: "colour", q: "Step 1 — Farbe: Rot oder Schwarz?",
      opts: [{ v: "red", label: "🔴 Rot" }, { v: "black", label: "⚫️ Schwarz" }] },
    { key: "highlow", q: "Step 2 — Höher oder Tiefer?",
      opts: [{ v: "high", label: "⬆️ Höher" }, { v: "low", label: "⬇️ Tiefer" }] },
    { key: "inout", q: "Step 3 — Innerhalb oder Außerhalb?",
      opts: [{ v: "in", label: "↔️ Innen" }, { v: "out", label: "⤢ Außen" }] },
    { key: "suit", q: "Step 4 — Welche Farbe genau?",
      opts: [{ v: "S", label: "♠" }, { v: "H", label: "♥" }, { v: "D", label: "♦" }, { v: "C", label: "♣" }] },
  ];

  function renderRide() {
    var def = STEPS[step];
    // The row: positions < step revealed, position == step is the live flip card,
    // positions > step stay as plain backs.
    var cardsHtml = "";
    for (var i = 0; i < 4; i++) {
      var live = i === step;
      if (i < step) {
        cardsHtml += '<div class="bf-slot bf-slot--done">' + Cards.faceHtml(row[i], { small: true }) + "</div>";
      } else if (live) {
        cardsHtml += '<div class="bf-slot bf-slot--live">' + Cards.flipHtml(row[i], { id: "bf-flip", small: true }) + "</div>";
      } else {
        cardsHtml += '<div class="bf-slot">' + Cards.backHtml({ small: true }) + "</div>";
      }
    }

    var optBtns = def.opts.map(function (o) {
      return '<button class="btn btn-guess" data-v="' + esc(o.v) + '">' + esc(o.label) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen bf-screen">' +
      '  <div class="bf-head"><span class="bf-driver">🚌 ' + esc(driverName()) + "</span>" +
      '    <span class="bf-rung">' + t("Step") + " " + (step + 1) + "/4</span></div>" +
      busLineHtml() +
      '  <div class="bf-row">' + cardsHtml + "</div>" +
      '  <p class="bf-q">' + t(def.q) + "</p>" +
      '  <div class="bf-guesses" id="bf-guesses">' + optBtns + "</div>" +
      '  <div class="bf-result" id="bf-result">&nbsp;</div>' +
      "</section>";

    els.querySelectorAll("#bf-guesses .btn-guess").forEach(function (b) {
      b.addEventListener("click", function () { guess(b.getAttribute("data-v")); });
    });
    moveBus(step);
  }

  function guess(v) {
    if (busy) return;
    busy = true;
    var card = row[step];
    var correct = judge(v, card);

    // Lock the buttons and flip the live card.
    els.querySelectorAll("#bf-guesses .btn-guess").forEach(function (b) { b.disabled = true; });
    var flip = els.querySelector("#bf-flip");
    Cards.reveal(flip);

    revealTimer = global.setTimeout(function () {
      revealTimer = null;
      if (!els) return;
      if (correct === "tie" || correct === false) {
        fail();
      } else {
        step++;
        if (step >= 4) escape();
        else { busy = false; renderRide(); }
      }
    }, 720);
  }

  // Returns true / false / "tie" (tie only when settings.tieWrong is false).
  function judge(v, card) {
    var def = STEPS[step];
    if (def.key === "colour") return Cards.colour(card) === v;
    if (def.key === "suit") return card.suit === v;
    if (def.key === "highlow") {
      var prev = Cards.value(row[step - 1]);
      var cur = Cards.value(card);
      if (cur === prev) return settings.tieWrong ? false : "tie";
      return v === "high" ? cur > prev : cur < prev;
    }
    if (def.key === "inout") {
      var a = Cards.value(row[0]), b = Cards.value(row[1]);
      var lo = Math.min(a, b), hi = Math.max(a, b), cv = Cards.value(card);
      if (cv === lo || cv === hi) return settings.tieWrong ? false : "tie"; // on the line
      var inside = cv > lo && cv < hi;
      return v === "in" ? inside : !inside;
    }
    return false;
  }

  function fail() {
    var sips = STEP_SIPS[step];
    var resEl = els.querySelector("#bf-result");
    if (resEl) {
      resEl.innerHTML =
        '<div class="bf-fail">' + t("Wrong! ❌") + "<br/>" +
        '<b>' + esc(driverName()) + "</b> " + t("trinkt") + " " +
        '<span class="bf-sips">' + sips + " " + t(sips === 1 ? "sip" : "sips") + "</span><br/>" +
        '<span class="muted small">' + t("Back to the start of the row.") + "</span></div>" +
        '<button id="bf-retry" class="btn btn-primary btn-block btn-xl">' + t("New row 🔁") + "</button>";
      els.querySelector("#bf-retry").addEventListener("click", function () { deal(); renderRide(); });
    }
  }

  function escape() {
    clearTimer();
    var handsOut = settings.escapeHandsOut;
    els.innerHTML =
      '<section class="screen bf-screen bf-escape">' +
      busLineHtml() +
      '  <div class="bf-row">' +
      row.map(function (c) { return '<div class="bf-slot bf-slot--done">' + Cards.faceHtml(c, { small: true }) + "</div>"; }).join("") +
      "  </div>" +
      '  <h2 class="screen-title pop">🎉 ' + t("Escaped the bus!") + "</h2>" +
      '  <p class="bf-q"><b>' + esc(driverName()) + "</b> " +
      (handsOut
        ? t("cleared all four — hand out the sips you collected!")
        : t("cleared all four — no drinks. The bus rolls on.")) +
      "</p>" +
      '  <button id="bf-next" class="btn btn-primary btn-block btn-xl">' + t("Next Busfahrer ▶️") + "</button>" +
      '  <button id="bf-again" class="btn btn-block">' + t("Same driver, ride again 🔁") + "</button>" +
      "</section>";

    els.querySelector("#bf-next").addEventListener("click", function () {
      var n = names().length;
      if (n) driverIdx = (driverIdx + 1) % n;
      busPos = 0; deal(); renderRide();
    });
    els.querySelector("#bf-again").addEventListener("click", function () { busPos = 0; deal(); renderRide(); });

    moveBus(4); // roll the bus into the final station
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(an) === value);
    });
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.busfahrt = module;
})(window);

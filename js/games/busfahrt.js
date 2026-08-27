// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/busfahrt.js — „Die Busfahrt" (Ride the Bus, final guessing phase only)
 *
 * One player is the driver; the app deals a row of four face-down cards and
 * they climb an escalating 4-step guessing ladder:
 *   1. Colour       red or black?
 *   2. Higher/lower vs. the previous card
 *   3. Inside/outside the range of the first two cards
 *   4. Suit         name the exact suit (1-in-4)
 * A tie at step 2/3 replays that rung with a fresh card — no fail, no drink.
 * Any wrong guess sends the driver back to step 1, the row re-deals, and they
 * drink sips equal to the step they failed at (sips accumulate across
 * retries within a boarding session). Clear all four to escape.
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
  var totalSips = 0;     // sips racked up from fails during this boarding session

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
        escapeHandsOut: context.store.get("escapeHandsOut", DEFAULTS.escapeHandsOut) === true,
      };
      driverIdx = 0;
      renderSetup();
    },
    unmount: function () {
      clearTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; row = []; step = 0; busy = false; busPos = 0; totalSips = 0;
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
      ? '<h3 class="sub">' + t("Driver") + "</h3>" +
        '<div class="chip-row" id="bf-driver">' +
        ns.map(function (n, i) { return '<button class="chip" data-i="' + i + '">' + esc(n) + "</button>"; }).join("") +
        "</div>"
      : '<p class="muted small">' + t("No players yet — add some from the header (👥) to rotate the driver, or just pass the phone.") + "</p>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🚌 ' + t("Ride the Bus") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      "  " + roleBlock +
      '  <h3 class="sub">' + t("House rules") + "</h3>" +
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
    els.querySelector("#bf-hand").addEventListener("change", function (e) {
      settings.escapeHandsOut = e.target.checked; ctx.store.set("escapeHandsOut", settings.escapeHandsOut);
    });
    els.querySelector("#bf-start").addEventListener("click", startRide);
  }

  function startRide() {
    busPos = 0;    // fresh ride starts the bus at the depot
    totalSips = 0; // fresh boarding session, no sips owed yet
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
  // The rung badge in the header already reads "Step n/4", so the question
  // itself stays short — it has to fit on one line under a full-height card.
  var STEPS = [
    { key: "colour", q: "Red or black?",
      opts: [{ v: "red", label: "🔴 Red" }, { v: "black", label: "⚫️ Black" }] },
    { key: "highlow", q: "Higher or lower?",
      opts: [{ v: "high", label: "⬆️ Higher" }, { v: "low", label: "⬇️ Lower" }] },
    { key: "inout", q: "Inside or outside?",
      opts: [{ v: "in", label: "↔️ Inside" }, { v: "out", label: "⤢ Outside" }] },
    { key: "suit", q: "Which suit exactly?",
      opts: [{ v: "S", label: "♠" }, { v: "H", label: "♥" }, { v: "D", label: "♦" }, { v: "C", label: "♣" }] },
  ];

  function renderRide() {
    var def = STEPS[step];
    // Only the card being guessed is on stage, big enough to read across the
    // table. Cards already turned over stay as a small strip above it (steps 2
    // and 3 are read off them); the ones still face-down carry no information at
    // all — the bus timeline already shows how many stops are left — so they go.
    var refs = "";
    for (var i = 0; i < step; i++) refs += Cards.faceHtml(row[i], { hero: true });

    var optBtns = def.opts.map(function (o) {
      return '<button class="btn btn-guess" data-v="' + esc(o.v) + '">' + esc(t(o.label)) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen bf-screen bf-ride">' +
      '  <div class="bf-head"><span class="bf-driver">🚌 ' + esc(driverName()) + "</span>" +
      '    <span class="bf-rung">' + t("Step") + " " + (step + 1) + "/4</span></div>" +
      busLineHtml() +
      (refs ? '  <div class="bf-refs">' + refs + "</div>" : "") +
      '  <div class="bf-stage">' + Cards.flipHtml(row[step], { id: "bf-flip", hero: true }) + "</div>" +
      '  <div class="bf-foot">' +
      '    <p class="bf-q">' + t(def.q) + "</p>" +
      // Step 4's four options are single suit glyphs — they go on one row, or
      // the second row pushes the card off the bottom of the screen.
      '    <div class="bf-guesses' + (def.opts.length > 2 ? " bf-guesses--quad" : "") +
      '" id="bf-guesses">' + optBtns + "</div>" +
      '    <div class="bf-result" id="bf-result"></div>' +
      "  </div>" +
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
      if (correct === "tie") {
        // Push: redraw this rung's card and ask the same question again.
        redrawCurrentCard();
        busy = false;
        renderRide();
      } else if (correct === false) {
        fail();
      } else {
        step++;
        if (step >= 4) escape();
        else { busy = false; renderRide(); }
      }
    }, 720);
  }

  // Replaces the live card at the current step with a fresh one (used to
  // re-ask a tied round without ending it).
  function redrawCurrentCard() {
    var fresh = Cards.shuffle(Cards.newDeck());
    for (var i = 0; i < fresh.length; i++) {
      if (fresh[i].rank !== row[step].rank || fresh[i].suit !== row[step].suit) {
        row[step] = fresh[i];
        return;
      }
    }
  }

  // Returns true / false / "tie" (a tie replays the rung instead of failing).
  function judge(v, card) {
    var def = STEPS[step];
    if (def.key === "colour") return Cards.colour(card) === v;
    if (def.key === "suit") return card.suit === v;
    if (def.key === "highlow") {
      var prev = Cards.value(row[step - 1]);
      var cur = Cards.value(card);
      if (cur === prev) return "tie";
      return v === "high" ? cur > prev : cur < prev;
    }
    if (def.key === "inout") {
      var a = Cards.value(row[0]), b = Cards.value(row[1]);
      var lo = Math.min(a, b), hi = Math.max(a, b), cv = Cards.value(card);
      if (cv === lo || cv === hi) return "tie"; // on the line
      var inside = cv > lo && cv < hi;
      return v === "in" ? inside : !inside;
    }
    return false;
  }

  function fail() {
    var sips = STEP_SIPS[step];
    totalSips += sips;
    // The guess row has done its job — swap it out for the verdict so the
    // retry button lands under the thumb instead of below the fold.
    var guesses = els.querySelector("#bf-guesses");
    if (guesses) guesses.hidden = true;
    var resEl = els.querySelector("#bf-result");
    if (resEl) {
      resEl.innerHTML =
        '<div class="bf-fail">' + t("Wrong! ❌") + "<br/>" +
        '<b>' + esc(driverName()) + "</b> " + t("drinks") + " " +
        '<span class="bf-sips">' + sips + " " + t(sips === 1 ? "sip" : "sips") + "</span><br/>" +
        '<span class="muted small">' + t("Back to the start of the row.") + "</span></div>" +
        '<button id="bf-retry" class="btn btn-primary btn-block btn-xl">' + t("New row 🔁") + "</button>";
      els.querySelector("#bf-retry").addEventListener("click", function () { deal(); renderRide(); });
    }
  }

  function escape() {
    clearTimer();
    var handsOut = settings.escapeHandsOut;
    var resultMsg;
    if (handsOut && totalSips > 0) {
      resultMsg = t("cleared all four — hand out the {n} sips you collected!").replace("{n}", totalSips);
    } else if (handsOut) {
      resultMsg = t("cleared all four on the first try — no sips to hand out. The bus rolls on.");
    } else {
      resultMsg = t("cleared all four — no drinks. The bus rolls on.");
    }
    els.innerHTML =
      '<section class="screen bf-screen bf-escape">' +
      busLineHtml() +
      '  <div class="bf-refs bf-refs--final">' +
      row.map(function (c) { return Cards.faceHtml(c, { hero: true }); }).join("") +
      "  </div>" +
      '  <div class="bf-stage bf-stage--msg">' +
      '    <div><h2 class="screen-title pop">🎉 ' + t("Escaped the bus!") + "</h2>" +
      '    <p class="bf-q"><b>' + esc(driverName()) + "</b> " + resultMsg + "</p></div>" +
      "  </div>" +
      '  <div class="bf-foot">' +
      '    <button id="bf-next" class="btn btn-primary btn-block btn-xl">' + t("Next driver ▶️") + "</button>" +
      '    <button id="bf-again" class="btn btn-block">' + t("Same driver, ride again 🔁") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#bf-next").addEventListener("click", function () {
      var n = names().length;
      if (n) driverIdx = (driverIdx + 1) % n;
      busPos = 0; totalSips = 0; deal(); renderRide();
    });
    els.querySelector("#bf-again").addEventListener("click", function () { busPos = 0; totalSips = 0; deal(); renderRide(); });

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

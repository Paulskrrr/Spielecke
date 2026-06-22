/*
 * games/wavelength.js — Wavelength (one device, pass-around)
 *
 * A spectrum runs between two opposites (e.g. Cold ↔ Hot). One player — the
 * clue-giver — secretly sees a hidden target band on the dial and gives a clue.
 * Everyone else moves a slider to where they think the target is. Reveal, then
 * judge by distance.
 *
 * Drink outcome (hard requirement):
 *   - bullseye  => clue-giver's a legend, everyone else drinks
 *   - way off   => the guessers drink
 *   - in between => no drinks
 *
 * Content lives in content/wavelength.js (Spielecke.WavelengthSpectrums) —
 * opposite pairs, a different shape from the shared term database.
 */
(function (global) {
  "use strict";

  var BULLSEYE = 10; // |guess - target| within this = nailed it
  var MISS = 30;     // beyond this = way off
  var TARGET_BAND = BULLSEYE; // half-width of the highlighted target zone
  var DEFAULTS = { pool: "mixed" };

  // Per-mount state
  var els = null;
  var ctx = null;
  var settings = null;
  var spectrum = null;  // { left, right }
  var target = 50;      // 0..100 centre
  var guess = 50;

  var module = {
    meta: {
      id: "wavelength",
      name: "Wavelength",
      tagline: "Read the room. One clue, one dial — how close can they land?",
      icon: "📡",
      minPlayers: 3,
      isDrinkingGame: true,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = { pool: context.store.get("pool", DEFAULTS.pool) || DEFAULTS.pool };
      renderSetup();
    },

    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; spectrum = null;
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var pools = global.Spielecke.WavelengthSpectrums || {};
    var chips = ['<button class="chip" data-pool="mixed">🎯 Mixed</button>']
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">📡 Wavelength</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      '  <p class="muted small">One player sees a hidden spot on the dial and gives a one-line clue between the two ends. Everyone else slides to their guess. Closest = glory, way off = drinks.</p>' +
      '  <h3 class="sub">Spectrum pool</h3>' +
      '  <div class="chip-row" id="wl-pools">' + chips + "</div>" +
      '  <button id="wl-start" class="btn btn-primary btn-block btn-xl">Start round 🎯</button>' +
      "</section>";

    highlight("#wl-pools", settings.pool, "data-pool");
    els.querySelectorAll("#wl-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool");
        ctx.store.set("pool", settings.pool);
        highlight("#wl-pools", settings.pool, "data-pool");
      });
    });
    els.querySelector("#wl-start").addEventListener("click", startRound);
  }

  // --- Round: clue-giver sees the hidden target ----------------------------
  function startRound() {
    spectrum = pickSpectrum(settings.pool);
    // keep the band fully on the dial
    target = Math.round(TARGET_BAND + Math.random() * (100 - 2 * TARGET_BAND));
    guess = 50;
    renderHandover();
  }

  function renderHandover() {
    els.innerHTML =
      '<section class="screen wl-handover">' +
      '  <div class="pass-emoji">🙈</div>' +
      '  <h2 class="pass-name pop">Clue-giver only</h2>' +
      '  <p class="muted">Everyone else: look away! One person picks up the phone to see the secret target.</p>' +
      '  <button id="wl-show" class="btn btn-primary btn-block btn-xl">Show me the target 🎯</button>' +
      "</section>";
    els.querySelector("#wl-show").addEventListener("click", renderTarget);
  }

  function renderTarget() {
    els.innerHTML =
      '<section class="screen wl-target">' +
      '  <h2 class="screen-title pop">Give a clue!</h2>' +
      poles(spectrum) +
      track({ showTarget: true }) +
      '  <p class="muted small">Think of a clue between the two ends that points right at the band — then hide and let the table guess.</p>' +
      '  <button id="wl-hide" class="btn btn-block btn-xl">Hide & let them guess 🤐</button>' +
      "</section>";
    els.querySelector("#wl-hide").addEventListener("click", renderGuess);
  }

  // --- Guess phase: the table moves the dial -------------------------------
  function renderGuess() {
    els.innerHTML =
      '<section class="screen wl-guess">' +
      '  <h2 class="screen-title pop">Where is it?</h2>' +
      poles(spectrum) +
      track({ showTarget: false, showGuess: true }) +
      '  <input id="wl-slider" class="wl-slider" type="range" min="0" max="100" value="' + guess + '" />' +
      '  <button id="wl-lock" class="btn btn-primary btn-block btn-xl">Lock it in 🔒</button>' +
      "</section>";

    var slider = els.querySelector("#wl-slider");
    slider.addEventListener("input", function () {
      guess = parseInt(slider.value, 10);
      var marker = els.querySelector("#wl-guess-marker");
      if (marker) marker.style.left = guess + "%";
    });
    els.querySelector("#wl-lock").addEventListener("click", renderReveal);
  }

  // --- Reveal & outcome ----------------------------------------------------
  function renderReveal() {
    var d = Math.abs(guess - target);
    var emoji, title, line;
    if (d <= BULLSEYE) {
      emoji = "🎯"; title = "BULLSEYE!";
      line = "The clue-giver's a legend — <strong>everyone else drinks!</strong> 🍻";
    } else if (d <= MISS) {
      emoji = "👍"; title = "So close!";
      line = "Decent reading. No drinks this round.";
    } else {
      emoji = "💀"; title = "Way off!";
      line = "Total miss — <strong>the guessers drink!</strong> 🍺";
    }

    els.innerHTML =
      '<section class="screen wl-reveal">' +
      '  <div class="result-emoji">' + emoji + "</div>" +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      poles(spectrum) +
      track({ showTarget: true, showGuess: true }) +
      '  <p class="result-sub">' + line + "</p>" +
      '  <div class="stack">' +
      '    <button id="wl-next" class="btn btn-primary btn-block btn-xl">Next round 🔁</button>' +
      '    <button id="wl-settings" class="btn btn-block">Change pool</button>' +
      '    <button id="wl-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#wl-next").addEventListener("click", startRound);
    els.querySelector("#wl-settings").addEventListener("click", renderSetup);
    els.querySelector("#wl-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- View helpers --------------------------------------------------------
  function poles(s) {
    return (
      '<div class="wl-poles">' +
      '  <span class="wl-pole wl-pole--left">' + esc(s.left) + "</span>" +
      '  <span class="wl-pole wl-pole--right">' + esc(s.right) + "</span>" +
      "</div>"
    );
  }

  function track(opts) {
    var parts = ['<div class="wl-track">'];
    if (opts.showTarget) {
      parts.push(
        '<div class="wl-band" style="left:' + (target - TARGET_BAND) + "%;width:" +
        (2 * TARGET_BAND) + '%"></div>'
      );
    }
    if (opts.showGuess) {
      parts.push('<div id="wl-guess-marker" class="wl-marker" style="left:' + guess + '%"></div>');
    }
    parts.push("</div>");
    return parts.join("");
  }

  // --- Spectrum picking ----------------------------------------------------
  function pickSpectrum(pool) {
    var pools = global.Spielecke.WavelengthSpectrums || {};
    var keys = Object.keys(pools);
    if (!keys.length) return { left: "Cold", right: "Hot" };
    var list;
    if (pool === "mixed" || !pools[pool]) {
      list = keys.reduce(function (a, k) { return a.concat(pools[k].pairs || []); }, []);
    } else {
      list = pools[pool].pairs || [];
    }
    if (!list.length) return { left: "Cold", right: "Hot" };
    return list[Math.floor(Math.random() * list.length)];
  }

  // --- Utils ---------------------------------------------------------------
  function highlight(sel, value, attrName) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(attrName) === value);
    });
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.wavelength = module;
})(window);

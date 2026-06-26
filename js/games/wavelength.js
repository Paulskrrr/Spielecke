/*
 * games/wavelength.js — Wavelength (one device, pass-around)
 *
 * A spectrum runs between two opposites (e.g. Cold ↔ Hot). One player — the
 * clue-giver — secretly sees a hidden target band on the dial and gives a clue.
 * Everyone else moves a slider to where they think the target is. Reveal, then
 * judge by distance.
 *
 * Content lives in content/wavelength.js (Spielecke.WavelengthSpectrums).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function pools() { return global.Spielecke.L(global.Spielecke.WavelengthSpectrums) || {}; }
  function Pools() { return global.Spielecke.Pools; }

  // Concentric scoring zones, measured as half-width (%) out from the target
  // centre. The closer you land to the middle, the more you score — so a sharp
  // read beats one that just clips the edge. Ordered centre → outermost.
  var ZONES = [
    { half: 4,  pts: 4, cls: "bull" },
    { half: 10, pts: 3, cls: "near" },
    { half: 18, pts: 2, cls: "far" },
  ];
  var MAX_HALF = ZONES[ZONES.length - 1].half; // keep the whole target on-track

  var els = null;
  var ctx = null;
  var settings = null;
  var spectrum = null;
  var target = 50;
  var guess = 50;
  var clue = "";

  var module = {
    meta: {
      id: "wavelength",
      name: "Wavelength",
      tagline: "Read the room. One clue, one dial — how close can they land?",
      icon: "📡",
      minPlayers: 3,
      supportsDrinking: false,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = { pools: Pools().load(context.store, pools()) };
      renderSetup();
    },

    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; spectrum = null; clue = "";
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var chips = Pools().chipsHtml(pools(), t);

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">📡 ' + t("Wavelength") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <p class="muted small">' + t("One player sees a hidden spot on the dial and gives a one-line clue between the two ends. Everyone else slides to their guess. Closest = glory, way off = drinks.") + "</p>" +
      '  <h3 class="sub">' + t("Spectrum pool") + "</h3>" +
      '  <div class="chip-row" id="wl-pools">' + chips + "</div>" +
      '  <button id="wl-start" class="btn btn-primary btn-block btn-xl">' + t("Start round 🎯") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#wl-pools"), pools(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    els.querySelector("#wl-start").addEventListener("click", startRound);
  }

  // --- Round: clue-giver sees the hidden target ----------------------------
  function startRound() {
    spectrum = pickSpectrum();
    target = Math.round(MAX_HALF + Math.random() * (100 - 2 * MAX_HALF));
    guess = 50;
    clue = "";
    renderHandover();
  }

  function renderHandover() {
    els.innerHTML =
      '<section class="screen wl-handover">' +
      '  <div class="pass-emoji">🙈</div>' +
      '  <h2 class="pass-name pop">' + t("Clue-giver only") + "</h2>" +
      '  <p class="muted">' + t("Everyone else: look away! One person picks up the phone to see the secret target.") + "</p>" +
      '  <button id="wl-show" class="btn btn-primary btn-block btn-xl">' + t("Show me the target 🎯") + "</button>" +
      "</section>";
    els.querySelector("#wl-show").addEventListener("click", renderTarget);
  }

  function renderTarget() {
    els.innerHTML =
      '<section class="screen wl-target">' +
      '  <h2 class="screen-title pop">' + t("Give a clue!") + "</h2>" +
      spectrumView(spectrum, { showTarget: true }) +
      '  <p class="muted small">' + t("Write a clue between the two ends that points right at the band — the others only see your clue, not the target.") + "</p>" +
      '  <input id="wl-clue" class="text-input wl-clue-input" type="text" maxlength="60" placeholder="' + attr(t("Your clue…")) + '" value="' + attr(clue) + '" />' +
      '  <button id="wl-hide" class="btn btn-primary btn-block btn-xl" disabled>' + t("Hide & let them guess 🤐") + "</button>" +
      "</section>";

    var input = els.querySelector("#wl-clue");
    var hide = els.querySelector("#wl-hide");
    function sync() { clue = input.value.trim(); hide.disabled = clue.length === 0; }
    input.addEventListener("input", sync);
    sync();
    hide.addEventListener("click", function () {
      clue = input.value.trim();
      if (clue) renderGuess();
    });
  }

  // --- Guess phase: the table moves the dial -------------------------------
  function renderGuess() {
    els.innerHTML =
      '<section class="screen wl-guess">' +
      '  <h2 class="screen-title pop">' + t("Where is it?") + "</h2>" +
      clueBanner() +
      spectrumView(spectrum, { showGuess: true, slider: true }) +
      '  <button id="wl-lock" class="btn btn-primary btn-block btn-xl">' + t("Lock it in 🔒") + "</button>" +
      "</section>";

    var slider = els.querySelector("#wl-slider");
    slider.addEventListener("input", function () {
      guess = parseInt(slider.value, 10);
      var marker = els.querySelector("#wl-guess-marker");
      if (marker) marker.style.setProperty("--pos", guess + "%");
    });
    els.querySelector("#wl-lock").addEventListener("click", renderReveal);
  }

  // --- Reveal & outcome ----------------------------------------------------
  function renderReveal() {
    var d = Math.abs(guess - target);
    var zone = zoneFor(d);
    var points = zone ? zone.pts : 0;
    var emoji, title, lead, end;
    if (zone && zone.cls === "bull") {
      emoji = "🎯"; title = t("BULLSEYE!");
      lead = t("The clue-giver's a legend — "); end = t(" points!");
    } else if (zone && zone.cls === "near") {
      emoji = "🔥"; title = t("So close!");
      lead = t("Great read — "); end = t(" points.");
    } else if (zone) {
      emoji = "👍"; title = t("On the board!");
      lead = t("Decent reading — "); end = t(" points.");
    } else {
      emoji = "💀"; title = t("Way off!");
      lead = t("Total miss — "); end = t(" points.");
    }
    var line = lead + "<strong>" + points + end + "</strong>";

    els.innerHTML =
      '<section class="screen wl-reveal">' +
      '  <div class="result-emoji">' + emoji + "</div>" +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      clueBanner() +
      spectrumView(spectrum, { showTarget: true, showGuess: true }) +
      '  <p class="result-sub">' + line + "</p>" +
      '  <div class="stack">' +
      '    <button id="wl-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>" +
      '    <button id="wl-settings" class="btn btn-block">' + t("Change pool") + "</button>" +
      '    <button id="wl-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#wl-next").addEventListener("click", startRound);
    els.querySelector("#wl-settings").addEventListener("click", renderSetup);
    els.querySelector("#wl-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- View helpers --------------------------------------------------------
  // The whole spectrum: the two end-labels bracket the dial so they read as the
  // poles of the axis — stacked above/below the vertical track on mobile, left/
  // right of the horizontal track on desktop (layout is pure CSS). When
  // `opts.slider` is set the guess slider is dropped in alongside the track.
  function spectrumView(s, opts) {
    opts = opts || {};
    var slider = opts.slider
      ? '<input id="wl-slider" class="wl-slider" type="range" min="0" max="100" value="' + guess + '" />'
      : "";
    return (
      '<div class="wl-spectrum">' +
      '  <span class="wl-pole wl-pole--left">' + esc(s.left) + "</span>" +
      '  <div class="wl-dial">' + track(opts) + slider + "</div>" +
      '  <span class="wl-pole wl-pole--right">' + esc(s.right) + "</span>" +
      "</div>"
    );
  }

  // The clue-giver's written hint, shown to everyone during the guess + reveal.
  function clueBanner() {
    if (!clue) return "";
    return (
      '<div class="wl-clue">' +
      '  <span class="wl-clue__label">' + t("The clue") + "</span>" +
      '  <span class="wl-clue__text">" ' + esc(clue) + ' "</span>' +
      "</div>"
    );
  }

  function zoneFor(d) {
    for (var i = 0; i < ZONES.length; i++) {
      if (d <= ZONES[i].half) return ZONES[i];
    }
    return null;
  }

  function track(opts) {
    var parts = ['<div class="wl-track">'];
    if (opts.showTarget) {
      // Render widest zone first so the narrower, higher-scoring rings layer on
      // top of it — giving the nested "target" look.
      for (var i = ZONES.length - 1; i >= 0; i--) {
        var z = ZONES[i];
        parts.push(
          '<div class="wl-zone wl-zone--' + z.cls + '" style="--start:' +
          (target - z.half) + "%;--size:" + (2 * z.half) + '%"></div>'
        );
      }
      parts.push('<div class="wl-center" style="--pos:' + target + '%"></div>');
    }
    if (opts.showGuess) {
      parts.push('<div id="wl-guess-marker" class="wl-marker" style="--pos:' + guess + '%"></div>');
    }
    parts.push("</div>");
    return parts.join("");
  }

  // --- Spectrum picking ----------------------------------------------------
  function pickSpectrum() {
    var list = Pools().gather(settings.pools, pools(), "pairs");
    if (!list.length) return { left: "Cold", right: "Hot" };
    return list[Math.floor(Math.random() * list.length)];
  }

  // --- Utils ---------------------------------------------------------------
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.wavelength = module;
})(window);

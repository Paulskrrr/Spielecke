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

  var BULLSEYE = 10;
  var MISS = 30;
  var TARGET_BAND = BULLSEYE;

  var els = null;
  var ctx = null;
  var settings = null;
  var spectrum = null;
  var target = 50;
  var guess = 50;

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
      ctx = null; settings = null; spectrum = null;
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
    target = Math.round(TARGET_BAND + Math.random() * (100 - 2 * TARGET_BAND));
    guess = 50;
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
      poles(spectrum) +
      track({ showTarget: true }) +
      '  <p class="muted small">' + t("Think of a clue between the two ends that points right at the band — then hide and let the table guess.") + "</p>" +
      '  <button id="wl-hide" class="btn btn-block btn-xl">' + t("Hide & let them guess 🤐") + "</button>" +
      "</section>";
    els.querySelector("#wl-hide").addEventListener("click", renderGuess);
  }

  // --- Guess phase: the table moves the dial -------------------------------
  function renderGuess() {
    els.innerHTML =
      '<section class="screen wl-guess">' +
      '  <h2 class="screen-title pop">' + t("Where is it?") + "</h2>" +
      poles(spectrum) +
      track({ showTarget: false, showGuess: true }) +
      '  <input id="wl-slider" class="wl-slider" type="range" min="0" max="100" value="' + guess + '" />' +
      '  <button id="wl-lock" class="btn btn-primary btn-block btn-xl">' + t("Lock it in 🔒") + "</button>" +
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
    var points = Math.max(0, 100 - d * 2);
    var emoji, title, line;
    if (d <= BULLSEYE) {
      emoji = "🎯"; title = t("BULLSEYE!");
      line = t("The clue-giver's a legend — ") + "<strong>" + points + t(" points!") + "</strong>";
    } else if (d <= MISS) {
      emoji = "👍"; title = t("So close!");
      line = t("Decent reading — ") + "<strong>" + points + t(" points.") + "</strong>";
    } else {
      emoji = "💀"; title = t("Way off!");
      line = t("Total miss — ") + "<strong>" + points + t(" points.") + "</strong>";
    }

    els.innerHTML =
      '<section class="screen wl-reveal">' +
      '  <div class="result-emoji">' + emoji + "</div>" +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      poles(spectrum) +
      track({ showTarget: true, showGuess: true }) +
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

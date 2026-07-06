/*
 * games/ballon.js — Ballon (push-your-luck)
 *
 * The phone is a balloon passed around. On your turn you PUMP it as often as you
 * dare (each pump adds a sip to the visible pot and inflates the balloon), then
 * PASS it on. A hidden burst point — scaled to the player count — pops the
 * balloon on some pump; whoever pumped it that far holds it when it blows and
 * drinks the whole pot. Pure risk: pot is public, the burst point is not.
 *
 * No content file — fully procedural. Web Audio + haptics mirror hotpotato.js.
 * Contract: meta + mount + unmount(); unmount MUST close audio and clear state.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var els = null;
  var ctx = null;
  var settings = null;
  var pumps = 0;          // cumulative pumps on the current balloon
  var threshold = 0;      // hidden burst point (pumps at which it pops)
  var pumpedThisTurn = 0; // must pump >= 1 before you may pass
  var popped = false;
  var audio = null;

  var module = {
    meta: {
      id: "ballon",
      name: "Ballon",
      tagline: "Pump it, pass it, pray. Hold it when it blows and you drink.",
      icon: "🎈",
      minPlayers: 2,
      supportsDrinking: true,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = {
        soundOn: context.store.get("soundOn", true) !== false,
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },

    unmount: function () {
      teardownAudio();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; pumps = 0; threshold = 0; pumpedThisTurn = 0; popped = false;
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var count = (ctx.players || []).length;
    var warn = count > 0 && count < module.meta.minPlayers
      ? '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", module.meta.minPlayers) + "</div>"
      : "";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🎈 ' + t("Ballon") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      warn +
      '  <p class="muted small">' + t("Pump as many sips into the pot as you dare, then pass. The balloon pops on a hidden pump — hold it then and you drink the pot.") + "</p>" +
      '  <label class="toggle"><input type="checkbox" id="ba-sound"' + (settings.soundOn ? " checked" : "") + " /><span>" + t("🔊 Pump & pop sound") + "</span></label>" +
      '  <label class="toggle"><input type="checkbox" id="ba-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="ba-start" class="btn btn-primary btn-block btn-xl">' + t("Start pumping 🎈") + "</button>" +
      "</section>";

    els.querySelector("#ba-sound").addEventListener("change", function (e) {
      settings.soundOn = e.target.checked; ctx.store.set("soundOn", settings.soundOn);
    });
    els.querySelector("#ba-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#ba-start").addEventListener("click", newBalloon);
  }

  // --- New balloon ---------------------------------------------------------
  function newBalloon() {
    var p = Math.max(2, (ctx.players || []).length || 5);
    // Hidden burst point scaled to the group so a balloon lives ~1–1.5 laps.
    var lo = Math.ceil(2.5 * p), hi = Math.ceil(5 * p);
    threshold = lo + Math.floor(Math.random() * (hi - lo + 1));
    pumps = 0; pumpedThisTurn = 0; popped = false;
    setupAudio();
    renderPlay();
  }

  // --- Play ----------------------------------------------------------------
  function renderPlay() {
    pumpedThisTurn = 0;
    els.innerHTML =
      '<section class="screen ballon-play">' +
      '  <div class="ballon-pot" id="ba-pot">' + potLabel() + "</div>" +
      '  <div class="ballon-stage"><div class="ballon-body" id="ba-body">🎈</div></div>' +
      '  <button id="ba-pump" class="btn btn-pass ballon-pump">' + t("PUMP 🎈") + "</button>" +
      '  <button id="ba-pass" class="btn btn-block ballon-pass" disabled>' + t("Pass on ➡️") + "</button>" +
      '  <div class="tap-hint" id="ba-hint">' + t("Pump at least once, then pass.") + "</div>" +
      "</section>";

    sizeBalloon();
    els.querySelector("#ba-pump").addEventListener("click", onPump);
    els.querySelector("#ba-pass").addEventListener("click", onPass);
  }

  function onPump() {
    if (popped) return;
    pumps++; pumpedThisTurn++;
    if (pumps >= threshold) { pop(); return; }
    blip();
    buzz(8);
    var pot = els && els.querySelector("#ba-pot");
    if (pot) pot.textContent = potLabel();
    var pass = els && els.querySelector("#ba-pass");
    if (pass && pumpedThisTurn >= 1) pass.disabled = false;
    var hint = els && els.querySelector("#ba-hint");
    if (hint) hint.textContent = t("Pumped {n} this turn.").replace("{n}", pumpedThisTurn);
    sizeBalloon();
  }

  function onPass() {
    if (popped || pumpedThisTurn < 1) return;
    buzz(15);
    renderPlay(); // same balloon (pot + hidden threshold persist), next holder
  }

  function potLabel() {
    return t("Pot: {n} sips 🍺").replace("{n}", pumps);
  }

  // Balloon grows with cumulative pumps, eased toward a cap so it never overflows.
  function sizeBalloon() {
    var body = els && els.querySelector("#ba-body");
    if (!body) return;
    var frac = threshold > 0 ? Math.min(pumps / threshold, 0.98) : 0;
    var scale = 1 + frac * 2.2;            // 1x … ~3.2x
    body.style.transform = "scale(" + scale.toFixed(3) + ")";
    body.classList.toggle("is-tense", frac > 0.66);
  }

  // --- Pop -----------------------------------------------------------------
  function pop() {
    popped = true;
    popSound();
    buzz([120, 60, 200]);
    var line = settings.drinking
      ? t("Whoever's holding it drinks the pot — {n} sips! 🍺").replace("{n}", pumps)
      : t("Whoever's holding it loses the round! Pot was {n}.").replace("{n}", pumps);
    els.innerHTML =
      '<section class="screen ballon-boom">' +
      '  <div class="ballon-flash">💥</div>' +
      '  <h2 class="result-title pop">' + t("POP!") + "</h2>" +
      '  <p class="result-sub">' + line + "</p>" +
      '  <div class="stack">' +
      '    <button id="ba-again" class="btn btn-primary btn-block btn-xl">' + t("New balloon 🎈") + "</button>" +
      '    <button id="ba-setup" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#ba-again").addEventListener("click", newBalloon);
    els.querySelector("#ba-setup").addEventListener("click", function () { teardownAudio(); renderSetup(); });
  }

  // --- Audio + haptics (Web Audio, pathless; torn down on unmount) ----------
  function setupAudio() {
    teardownAudio();
    if (!settings.soundOn) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    try { audio = { ctx: new AC() }; } catch (e) { audio = null; }
  }
  function teardownAudio() {
    if (audio && audio.ctx) { try { audio.ctx.close(); } catch (e) { /* ignore */ } }
    audio = null;
  }
  // A pump blip that rises in pitch as the balloon fills — audible tension.
  function blip() {
    if (!audio || !audio.ctx) return;
    var frac = threshold > 0 ? Math.min(pumps / threshold, 1) : 0;
    tone(360 + frac * 900, 0.05, 0.14, "square");
  }
  function popSound() {
    if (!audio || !audio.ctx) return;
    var ac = audio.ctx, now = ac.currentTime, seconds = 0.5;
    var buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    var src = ac.createBufferSource(); src.buffer = buffer;
    var lp = ac.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(2200, now);
    lp.frequency.exponentialRampToValueAtTime(140, now + seconds);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.9, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    src.connect(lp).connect(g).connect(ac.destination);
    src.start(now); src.stop(now + seconds);
  }
  function tone(freq, dur, gain, type) {
    var ac = audio.ctx, now = ac.currentTime;
    var osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type || "square"; osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(now); osc.stop(now + dur + 0.02);
  }
  function buzz(pattern) {
    try {
      if (global.navigator && typeof global.navigator.vibrate === "function") global.navigator.vibrate(pattern);
    } catch (e) { /* ignore */ }
  }

  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.ballon = module;
})(window);

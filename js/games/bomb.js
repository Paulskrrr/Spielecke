/*
 * games/bomb.js — The Bomb (spec Part 2)
 *
 * Hot-potato word game. A category shows on screen, the device is the bomb.
 * The holder says an answer, taps Pass, hands the phone on. A hidden, randomised
 * fuse counts down; whoever's holding it at zero loses and drinks.
 *
 * Design choice (confirmed): PURE PHYSICAL PASS — the app does not track whose
 * turn it is, so it can't name the loser. Less bookkeeping, more chaos. The
 * shared roster is shown for context but turn logic stays out of the app.
 *
 * Content lives in bomb.categories.js (Spielecke.BombCategories), not here.
 *
 * Contract: meta + mount(container, context) + unmount(). unmount() MUST kill
 * the fuse, the tick scheduler, and all audio — verified by the shell.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  // --- Fixed fuse: always random in this range, hidden from players -------
  var FUSE_MIN = 20;  // seconds
  var FUSE_MAX = 90;  // seconds

  // --- Configurable defaults (spec §2.4); persisted per-game via context.store
  var DEFAULTS = {
    soundOn: true,
  };
  function Pools() { return global.Spielecke.Pools; }

  // --- Per-mount state (reset every mount) --------------------------------
  var els = null;        // container
  var ctx = null;        // shell context
  var settings = null;   // live, persisted
  var fuseTimeout = null;
  var tickTimeout = null;
  var audio = null;      // { ctx } or null
  var currentPrompt = "";
  // Wall-clock target for detonation + the fuse's total length. iOS freezes
  // setTimeout while the screen is locked/backgrounded, so fuseTimeout's
  // remaining budget can't be trusted after a hidden spell — these two let
  // onVisibilityChange reconcile against real elapsed time instead.
  var fuseDeadline = 0;
  var fuseTotalMs = 0;
  var wakeLock = null;   // WakeLockSentinel while a fuse is live, where supported

  // ========================================================================
  // Module
  // ========================================================================
  var module = {
    meta: {
      id: "bomb",
      name: "The Bomb",
      tagline: "Name it fast, pass it faster. Don't be holding it when it blows.",
      icon: "💣",
      minPlayers: 2,
      supportsDrinking: true,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = loadSettings(context.store);
      global.document.addEventListener("visibilitychange", onVisibilityChange);
      renderSetup();
    },

    unmount: function () {
      stopFuse();
      teardownAudio();
      global.document.removeEventListener("visibilitychange", onVisibilityChange);
      if (els) {
        els.innerHTML = "";
        els = null;
      }
      ctx = null;
      settings = null;
      currentPrompt = "";
    },
  };

  // ========================================================================
  // Settings persistence
  // ========================================================================
  function loadSettings(store) {
    return {
      soundOn: store.get("soundOn", DEFAULTS.soundOn) !== false,
      pools: Pools().load(store, categories()),
      drinking: store.get("drinking", false) === true,
    };
  }

  function saveSettings() {
    if (!ctx) return;
    ctx.store.set("soundOn", settings.soundOn);
    Pools().save(ctx.store, settings.pools);
    ctx.store.set("drinking", settings.drinking);
  }

  // ========================================================================
  // Screen: Setup (spec §2.2 step 2, §2.4)
  // ========================================================================
  function renderSetup() {
    stopFuse();
    var playerCount = (ctx.players || []).length;

    var chips = Pools().chipsHtml(categories(), t);

    var warn =
      playerCount > 0 && playerCount < module.meta.minPlayers
        ? '<div class="roster-warn" style="display:block">' +
          t("⚠ The Bomb is best with {n}+ players. Add more from the header.").replace(
            "{n}",
            module.meta.minPlayers
          ) +
          "</div>"
        : "";

    els.innerHTML =
      '<section class="screen bomb-setup">' +
      '  <h2 class="screen-title neon">💣 ' + t("The Bomb") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      warn +
      '  <h3 class="bomb-sub">' + t("Category pool") + "</h3>" +
      '  <div class="chip-row" id="bomb-pools">' + chips + "</div>" +
      '  <div class="fuse-note">' + t("⏱️ The fuse is random — and hidden from everyone.") + "</div>" +
      '  <label class="toggle">' +
      '    <input type="checkbox" id="bomb-sound"' + (settings.soundOn ? " checked" : "") + " />" +
      "    <span>" + t("🔊 Ticking & explosion sound") + "</span>" +
      "  </label>" +
      '  <label class="toggle">' +
      '    <input type="checkbox" id="bomb-drink"' + (settings.drinking ? " checked" : "") + " />" +
      "    <span>" + t("🍻 Drinking mode") + "</span>" +
      "  </label>" +
      '  <button id="bomb-start" class="btn btn-primary btn-block btn-xl">' + t("ARM & START 💥") + "</button>" +
      "</section>";

    // Pool chips (multi-select)
    Pools().bind(els.querySelector("#bomb-pools"), categories(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; saveSettings(); });

    // Sound toggle
    els.querySelector("#bomb-sound").addEventListener("change", function (e) {
      settings.soundOn = e.target.checked;
      saveSettings();
    });

    els.querySelector("#bomb-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked;
      saveSettings();
    });

    // Start
    els.querySelector("#bomb-start").addEventListener("click", startRound);
  }

  // ========================================================================
  // Screen: Playing (spec §2.2 steps 3–4)
  // ========================================================================
  function startRound() {
    currentPrompt = pickPrompt();
    fuseTotalMs = randomFuseMs();
    fuseDeadline = Date.now() + fuseTotalMs;

    els.innerHTML =
      '<section class="screen bomb-play">' +
      '  <div class="bomb-status">' + t("💣 LIVE — pass it on!") + "</div>" +
      '  <div class="bomb-prompt-wrap">' +
      '    <div class="bomb-prompt">' + esc(currentPrompt) + "</div>" +
      "  </div>" +
      '  <button id="bomb-pass" class="btn btn-pass">' + t("PASS ➡️") + "</button>" +
      '  <button id="bomb-quit" class="btn btn-ghost btn-block">' + t("Give up · back to setup") + "</button>" +
      "</section>";

    setupAudio();
    scheduleTicks();
    armFuseTimer();
    requestWakeLock();

    els.querySelector("#bomb-pass").addEventListener("click", onPass);
    els.querySelector("#bomb-quit").addEventListener("click", renderSetup);
  }

  // Arms fuseTimeout for whatever's left of fuseDeadline. Called both at the
  // start of a round and when reconciling after the tab was hidden.
  function armFuseTimer() {
    fuseTimeout = global.setTimeout(detonate, Math.max(0, fuseDeadline - Date.now()));
  }

  // iOS suspends JS timers (and the AudioContext) while the screen is locked
  // or the app is backgrounded, so a fuseTimeout scheduled before that can
  // fire arbitrarily late. On return, settle against the wall clock: detonate
  // immediately if the deadline already passed, otherwise re-arm for exactly
  // what's left. wakeLock is auto-released on hide, so re-request it too.
  function onVisibilityChange() {
    if (global.document.hidden || !fuseDeadline) return;
    resumeAudio();
    if (Date.now() >= fuseDeadline) {
      stopFuse();
      detonate();
    } else {
      if (fuseTimeout !== null) { global.clearTimeout(fuseTimeout); }
      armFuseTimer();
      requestWakeLock();
    }
  }

  // Pure physical pass: the fuse keeps running regardless. Pass just gives a
  // tactile "handed off" pulse so the next player knows it's live.
  function onPass() {
    var btn = els && els.querySelector("#bomb-pass");
    if (!btn) return;
    btn.classList.remove("pulse");
    // reflow to restart the animation
    void btn.offsetWidth;
    btn.classList.add("pulse");
    buzz(15);
    blip();
  }

  // ========================================================================
  // Screen: Detonation (spec §2.2 step 5)
  // ========================================================================
  function detonate() {
    stopFuse();
    explosionSound();
    buzz([120, 60, 200]);

    els.innerHTML =
      '<section class="screen bomb-boom">' +
      '  <div class="boom-flash">💥</div>' +
      '  <h2 class="boom-title">' + t("BOOM!") + "</h2>" +
      '  <p class="boom-sub">' +
      (settings.drinking
        ? t("🔥 Whoever's holding it drinks!")
        : t("🔥 Whoever's holding it loses the round!")) +
      "</p>" +
      '  <div class="boom-actions">' +
      '    <button id="bomb-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>" +
      '    <button id="bomb-setup" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#bomb-next").addEventListener("click", startRound);
    els.querySelector("#bomb-setup").addEventListener("click", renderSetup);
  }

  // ========================================================================
  // Fuse helpers
  // ========================================================================
  function randomFuseMs() {
    var secs = FUSE_MIN + Math.random() * (FUSE_MAX - FUSE_MIN);
    return Math.round(secs * 1000);
  }

  function pickPrompt() {
    var list = Pools().gather(settings.pools, categories(), "prompts");
    if (!list.length) return t("Name something. Anything. Go!");
    return list[Math.floor(Math.random() * list.length)];
  }

  function stopFuse() {
    if (fuseTimeout !== null) {
      global.clearTimeout(fuseTimeout);
      fuseTimeout = null;
    }
    stopTicks();
    releaseWakeLock();
    fuseDeadline = 0;
    fuseTotalMs = 0;
  }

  // Ticking that accelerates as the fuse burns down (spec §2.2 step 3, §2.4).
  // Cosmetic only — detonation is driven by the precise fuseTimeout above.
  // Paced off fuseDeadline (not a locally-captured start time) so the pacing
  // stays correct if it's recomputed right after a visibilitychange reconcile.
  function scheduleTicks() {
    function next() {
      var remaining = fuseDeadline - Date.now();
      var frac = Math.min(1, Math.max(0, 1 - remaining / fuseTotalMs)); // 0..1
      // interval shrinks from ~650ms down to ~110ms near the end
      var interval = 650 - frac * 540;
      tick();
      tickTimeout = global.setTimeout(next, Math.max(90, interval));
    }
    next();
  }

  // ========================================================================
  // Screen Wake Lock — best-effort, keeps the screen from locking mid-fuse.
  // Unsupported browsers (incl. iOS Safari < 16.4) silently no-op; the
  // visibilitychange reconciliation above is the fallback that keeps the
  // fuse honest even without it.
  // ========================================================================
  function requestWakeLock() {
    try {
      if (global.navigator && global.navigator.wakeLock && typeof global.navigator.wakeLock.request === "function") {
        global.navigator.wakeLock.request("screen").then(function (lock) {
          wakeLock = lock;
        }, function () { /* denied / unsupported — ignore */ });
      }
    } catch (e) {
      /* ignore */
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      try { wakeLock.release(); } catch (e) { /* ignore */ }
      wakeLock = null;
    }
  }

  function stopTicks() {
    if (tickTimeout !== null) {
      global.clearTimeout(tickTimeout);
      tickTimeout = null;
    }
  }

  // ========================================================================
  // Audio (Web Audio API — no asset files, stays pure-static & pathless)
  // Respects the sound toggle, fully silenceable, torn down on unmount.
  // ========================================================================
  function setupAudio() {
    teardownAudio();
    if (!settings.soundOn) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    try {
      audio = { ctx: new AC() };
    } catch (e) {
      audio = null;
    }
  }

  function teardownAudio() {
    if (audio && audio.ctx) {
      try {
        audio.ctx.close();
      } catch (e) {
        /* ignore */
      }
    }
    audio = null;
  }

  // iOS suspends a live AudioContext on screen lock / call interruption and
  // does not auto-resume it — without this, ticks and the explosion go
  // permanently silent for the rest of the round even with sound toggled on.
  function resumeAudio() {
    if (audio && audio.ctx && audio.ctx.state !== "running") {
      try { audio.ctx.resume(); } catch (e) { /* ignore */ }
    }
  }

  function tick() {
    if (!audio || !audio.ctx) return;
    beep(900, 0.04, 0.12, "square");
  }

  function blip() {
    if (!audio || !audio.ctx) return;
    beep(1400, 0.05, 0.18, "triangle");
  }

  function beep(freq, dur, gain, type) {
    resumeAudio();
    var ac = audio.ctx;
    var now = ac.currentTime;
    var osc = ac.createOscillator();
    var g = ac.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function explosionSound() {
    if (!audio || !audio.ctx) return;
    resumeAudio();
    var ac = audio.ctx;
    var now = ac.currentTime;
    // white-noise burst through a falling low-pass = a satisfying "boom"
    var seconds = 0.9;
    var buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    var src = ac.createBufferSource();
    src.buffer = buffer;
    var lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1800, now);
    lp.frequency.exponentialRampToValueAtTime(120, now + seconds);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.9, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    src.connect(lp).connect(g).connect(ac.destination);
    src.start(now);
    src.stop(now + seconds);
  }

  // Haptics where supported (silently ignored on desktop).
  function buzz(pattern) {
    try {
      if (global.navigator && typeof global.navigator.vibrate === "function") {
        global.navigator.vibrate(pattern);
      }
    } catch (e) {
      /* ignore */
    }
  }

  // ========================================================================
  // Utils
  // ========================================================================
  var esc = global.Spielecke.esc;

  function categories() { return global.Spielecke.L(global.Spielecke.BombCategories) || {}; }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.bomb = module;
})(window);

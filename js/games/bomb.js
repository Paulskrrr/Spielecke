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

  // --- Fixed fuse: always random in this range, hidden from players -------
  var FUSE_MIN = 20;  // seconds
  var FUSE_MAX = 120; // seconds

  // --- Configurable defaults (spec §2.4); persisted per-game via context.store
  var DEFAULTS = {
    soundOn: true,
    pool: "mixed", // "mixed" = draw from all pools
  };

  // --- Per-mount state (reset every mount) --------------------------------
  var els = null;        // container
  var ctx = null;        // shell context
  var settings = null;   // live, persisted
  var fuseTimeout = null;
  var tickTimeout = null;
  var audio = null;      // { ctx } or null
  var currentPrompt = "";

  // ========================================================================
  // Module
  // ========================================================================
  var module = {
    meta: {
      id: "bomb",
      name: "The Bomb",
      tagline: "Name it fast, pass it faster. Don't be holding it when it blows.",
      icon: "💣",
      minPlayers: 3,
      supportsDrinking: true,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = loadSettings(context.store);
      renderSetup();
    },

    unmount: function () {
      stopFuse();
      teardownAudio();
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
      pool: store.get("pool", DEFAULTS.pool) || DEFAULTS.pool,
      drinking: store.get("drinking", false) === true,
    };
  }

  function saveSettings() {
    if (!ctx) return;
    ctx.store.set("soundOn", settings.soundOn);
    ctx.store.set("pool", settings.pool);
    ctx.store.set("drinking", settings.drinking);
  }

  // ========================================================================
  // Screen: Setup (spec §2.2 step 2, §2.4)
  // ========================================================================
  function renderSetup() {
    stopFuse();
    var pools = global.Spielecke.BombCategories || {};
    var playerCount = (ctx.players || []).length;

    var chips = ['<button class="chip" data-pool="mixed">🎯 Mixed (all)</button>']
      .concat(
        Object.keys(pools).map(function (key) {
          return (
            '<button class="chip" data-pool="' + attr(key) + '">' +
            esc(pools[key].label || key) +
            "</button>"
          );
        })
      )
      .join("");

    var warn =
      playerCount > 0 && playerCount < module.meta.minPlayers
        ? '<div class="roster-warn" style="display:block">⚠ The Bomb is best with ' +
          module.meta.minPlayers +
          "+ players. Add more from the header.</div>"
        : "";

    els.innerHTML =
      '<section class="screen bomb-setup">' +
      '  <h2 class="screen-title neon">💣 The Bomb</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      warn +
      '  <h3 class="bomb-sub">Category pool</h3>' +
      '  <div class="chip-row" id="bomb-pools">' + chips + "</div>" +
      '  <div class="fuse-note">⏱️ Fuse is random between <strong>' + FUSE_MIN +
      "s</strong> and <strong>" + FUSE_MAX +
      's</strong> — hidden from everyone.</div>' +
      '  <label class="toggle">' +
      '    <input type="checkbox" id="bomb-sound"' + (settings.soundOn ? " checked" : "") + " />" +
      "    <span>🔊 Ticking &amp; explosion sound</span>" +
      "  </label>" +
      '  <label class="toggle">' +
      '    <input type="checkbox" id="bomb-drink"' + (settings.drinking ? " checked" : "") + " />" +
      "    <span>🍻 Drinking mode</span>" +
      "  </label>" +
      '  <button id="bomb-start" class="btn btn-primary btn-block btn-xl">ARM &amp; START 💥</button>' +
      "</section>";

    // Pool chips
    highlightPool();
    els.querySelectorAll("#bomb-pools .chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        settings.pool = chip.getAttribute("data-pool");
        saveSettings();
        highlightPool();
      });
    });

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

  function highlightPool() {
    els.querySelectorAll("#bomb-pools .chip").forEach(function (chip) {
      chip.classList.toggle(
        "chip--active",
        chip.getAttribute("data-pool") === settings.pool
      );
    });
  }

  // ========================================================================
  // Screen: Playing (spec §2.2 steps 3–4)
  // ========================================================================
  function startRound() {
    currentPrompt = pickPrompt(settings.pool);
    var fuseMs = randomFuseMs();

    els.innerHTML =
      '<section class="screen bomb-play">' +
      '  <div class="bomb-status">💣 LIVE — pass it on!</div>' +
      '  <div class="bomb-prompt-wrap">' +
      '    <div class="bomb-prompt">' + esc(currentPrompt) + "</div>" +
      "  </div>" +
      '  <button id="bomb-pass" class="btn btn-pass">PASS ➡️</button>' +
      '  <button id="bomb-quit" class="btn btn-ghost btn-block">Give up · back to setup</button>' +
      "</section>";

    setupAudio();
    scheduleTicks(fuseMs);

    fuseTimeout = global.setTimeout(detonate, fuseMs);

    els.querySelector("#bomb-pass").addEventListener("click", onPass);
    els.querySelector("#bomb-quit").addEventListener("click", renderSetup);
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
    fuseTimeout = null;
    stopTicks();
    explosionSound();
    buzz([120, 60, 200]);

    els.innerHTML =
      '<section class="screen bomb-boom">' +
      '  <div class="boom-flash">💥</div>' +
      '  <h2 class="boom-title">BOOM!</h2>' +
      '  <p class="boom-sub">' +
      (settings.drinking
        ? "🔥 Whoever's holding it <strong>drinks!</strong>"
        : "🔥 Whoever's holding it <strong>loses the round!</strong>") +
      "</p>" +
      '  <div class="boom-actions">' +
      '    <button id="bomb-next" class="btn btn-primary btn-block btn-xl">Next round 🔁</button>' +
      '    <button id="bomb-setup" class="btn btn-block">Change settings</button>' +
      '    <button id="bomb-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";

    els.querySelector("#bomb-next").addEventListener("click", startRound);
    els.querySelector("#bomb-setup").addEventListener("click", renderSetup);
    els.querySelector("#bomb-home").addEventListener("click", function () {
      ctx.goHome();
    });
  }

  // ========================================================================
  // Fuse helpers
  // ========================================================================
  function randomFuseMs() {
    var secs = FUSE_MIN + Math.random() * (FUSE_MAX - FUSE_MIN);
    return Math.round(secs * 1000);
  }

  function pickPrompt(pool) {
    var pools = global.Spielecke.BombCategories || {};
    var keys = Object.keys(pools);
    if (!keys.length) return "Name something. Anything. Go!";

    var list;
    if (pool === "mixed" || !pools[pool]) {
      list = keys.reduce(function (acc, k) {
        return acc.concat(pools[k].prompts || []);
      }, []);
    } else {
      list = pools[pool].prompts || [];
    }
    if (!list.length) return "Name something. Anything. Go!";
    return list[Math.floor(Math.random() * list.length)];
  }

  function stopFuse() {
    if (fuseTimeout !== null) {
      global.clearTimeout(fuseTimeout);
      fuseTimeout = null;
    }
    stopTicks();
  }

  // Ticking that accelerates as the fuse burns down (spec §2.2 step 3, §2.4).
  // Cosmetic only — detonation is driven by the precise fuseTimeout above.
  function scheduleTicks(fuseMs) {
    var start = Date.now();
    function next() {
      var elapsed = Date.now() - start;
      var frac = Math.min(elapsed / fuseMs, 1); // 0..1
      // interval shrinks from ~650ms down to ~110ms near the end
      var interval = 650 - frac * 540;
      tick();
      tickTimeout = global.setTimeout(next, Math.max(90, interval));
    }
    next();
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

  function tick() {
    if (!audio || !audio.ctx) return;
    beep(900, 0.04, 0.12, "square");
  }

  function blip() {
    if (!audio || !audio.ctx) return;
    beep(1400, 0.05, 0.18, "triangle");
  }

  function beep(freq, dur, gain, type) {
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
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function attr(s) {
    return esc(s).replace(/'/g, "&#39;");
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.bomb = module;
})(window);

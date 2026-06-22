/*
 * games/whoami.js — Who Am I? (Heads-Up style)
 *
 * One player holds the phone to their forehead (can't see it). A big identity
 * shows on screen; the rest of the table shouts clues. Holder taps GOT IT or
 * SKIP, racing a visible countdown. When time's up: score it.
 *
 * Drink outcome (hard requirement): fewer than TARGET correct => you drink.
 *
 * Content comes from the SHARED term database (content/terms.js,
 * Spielecke.Terms) so Who Am I? and Imposter stay editable in one place.
 *
 * Contract: meta + mount + unmount. unmount() kills the timer and audio.
 */
(function (global) {
  "use strict";

  var ROUND_OPTIONS = [30, 60, 90]; // seconds
  var TARGET = 3; // get at least this many or drink

  var DEFAULTS = { roundSeconds: 60, pool: "mixed", soundOn: true };

  // Per-mount state
  var els = null;
  var ctx = null;
  var settings = null;
  var countdownTimer = null;
  var audio = null;

  var queue = [];      // shuffled identity queue
  var score = 0;
  var remaining = 0;   // seconds left

  var module = {
    meta: {
      id: "whoami",
      name: "Who Am I?",
      tagline: "Phone on your forehead. They shout, you guess. Beat the clock.",
      icon: "🙈",
      minPlayers: 2,
      isDrinkingGame: true,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = loadSettings(context.store);
      renderSetup();
    },

    unmount: function () {
      stopCountdown();
      teardownAudio();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; queue = []; score = 0;
    },
  };

  // --- Settings ------------------------------------------------------------
  function loadSettings(store) {
    var rs = parseInt(store.get("roundSeconds", DEFAULTS.roundSeconds), 10);
    if (ROUND_OPTIONS.indexOf(rs) === -1) rs = DEFAULTS.roundSeconds;
    return {
      roundSeconds: rs,
      pool: store.get("pool", DEFAULTS.pool) || DEFAULTS.pool,
      soundOn: store.get("soundOn", DEFAULTS.soundOn) !== false,
    };
  }
  function saveSettings() {
    if (!ctx) return;
    ctx.store.set("roundSeconds", settings.roundSeconds);
    ctx.store.set("pool", settings.pool);
    ctx.store.set("soundOn", settings.soundOn);
  }

  // --- Setup screen --------------------------------------------------------
  function renderSetup() {
    stopCountdown();
    var pools = global.Spielecke.Terms || {};

    var poolChips = ['<button class="chip" data-pool="mixed">🎯 Mixed</button>']
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    var timeChips = ROUND_OPTIONS.map(function (s) {
      return '<button class="chip" data-secs="' + s + '">' + s + "s</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🙈 Who Am I?</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      '  <p class="muted small">Hold the phone to your forehead so you can’t see it. The table shouts clues. Tap <strong>GOT IT</strong> when you guess, <strong>SKIP</strong> to pass.</p>' +
      '  <h3 class="sub">Category</h3>' +
      '  <div class="chip-row" id="wa-pools">' + poolChips + "</div>" +
      '  <h3 class="sub">Round length</h3>' +
      '  <div class="chip-row" id="wa-times">' + timeChips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="wa-sound"' + (settings.soundOn ? " checked" : "") + " /><span>🔊 Sounds</span></label>" +
      '  <button id="wa-start" class="btn btn-primary btn-block btn-xl">START TURN ▶️</button>' +
      "</section>";

    highlight("#wa-pools", "pool", settings.pool, "data-pool");
    highlight("#wa-times", "secs", String(settings.roundSeconds), "data-secs");

    els.querySelectorAll("#wa-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool"); saveSettings();
        highlight("#wa-pools", "pool", settings.pool, "data-pool");
      });
    });
    els.querySelectorAll("#wa-times .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.roundSeconds = parseInt(c.getAttribute("data-secs"), 10); saveSettings();
        highlight("#wa-times", "secs", String(settings.roundSeconds), "data-secs");
      });
    });
    els.querySelector("#wa-sound").addEventListener("change", function (e) {
      settings.soundOn = e.target.checked; saveSettings();
    });
    els.querySelector("#wa-start").addEventListener("click", startTurn);
  }

  // --- Play screen ---------------------------------------------------------
  function startTurn() {
    score = 0;
    remaining = settings.roundSeconds;
    queue = buildQueue(settings.pool);
    setupAudio();

    els.innerHTML =
      '<section class="screen whoami-play">' +
      '  <div class="play-hud"><span id="wa-time" class="hud-time">' + remaining + "s</span>" +
      '    <span id="wa-score" class="hud-score">✅ 0</span></div>' +
      '  <div class="whoami-word-wrap"><div id="wa-word" class="whoami-word">' + esc(nextWord()) + "</div></div>" +
      '  <div class="whoami-actions">' +
      '    <button id="wa-skip" class="btn btn-skip">SKIP ⏭️</button>' +
      '    <button id="wa-got" class="btn btn-got">GOT IT ✅</button>' +
      "  </div>" +
      '  <button id="wa-quit" class="btn btn-ghost btn-block">End turn early</button>' +
      "</section>";

    els.querySelector("#wa-got").addEventListener("click", function () {
      score++; blip(); buzz(15); advance();
    });
    els.querySelector("#wa-skip").addEventListener("click", function () {
      buzz(8); advance();
    });
    els.querySelector("#wa-quit").addEventListener("click", finishTurn);

    countdownTimer = global.setInterval(function () {
      remaining--;
      var t = els && els.querySelector("#wa-time");
      if (t) {
        t.textContent = remaining + "s";
        if (remaining <= 5) t.classList.add("hud-time--danger");
      }
      if (remaining <= 0) finishTurn();
    }, 1000);
  }

  function advance() {
    var w = els && els.querySelector("#wa-word");
    var s = els && els.querySelector("#wa-score");
    if (w) w.textContent = nextWord();
    if (s) s.textContent = "✅ " + score;
  }

  // --- Result screen -------------------------------------------------------
  function finishTurn() {
    stopCountdown();
    buzzer();
    var passed = score >= TARGET;
    els.innerHTML =
      '<section class="screen whoami-result">' +
      '  <div class="result-emoji">' + (passed ? "🎉" : "🍺") + "</div>" +
      '  <h2 class="result-title pop">' + score + " correct!</h2>" +
      '  <p class="result-sub">' +
      (passed
        ? "Nailed it — pass the phone on."
        : "Under " + TARGET + " — <strong>you drink!</strong>") +
      "</p>" +
      '  <div class="stack">' +
      '    <button id="wa-next" class="btn btn-primary btn-block btn-xl">Next player ▶️</button>' +
      '    <button id="wa-settings" class="btn btn-block">Change settings</button>' +
      '    <button id="wa-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#wa-next").addEventListener("click", startTurn);
    els.querySelector("#wa-settings").addEventListener("click", renderSetup);
    els.querySelector("#wa-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Word queue ----------------------------------------------------------
  function buildQueue(pool) {
    var pools = global.Spielecke.Terms || {};
    var keys = Object.keys(pools);
    var items;
    if (pool === "mixed" || !pools[pool]) {
      items = keys.reduce(function (a, k) { return a.concat(pools[k].terms || []); }, []);
    } else {
      items = (pools[pool].terms || []).slice();
    }
    return shuffle(items.slice());
  }
  function nextWord() {
    if (!queue.length) queue = buildQueue(settings.pool);
    return queue.length ? queue.pop() : "Make one up!";
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function stopCountdown() {
    if (countdownTimer !== null) { global.clearInterval(countdownTimer); countdownTimer = null; }
  }

  // --- Audio (Web Audio; no files) -----------------------------------------
  function setupAudio() {
    teardownAudio();
    if (!settings.soundOn) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    try { audio = { ctx: new AC() }; } catch (e) { audio = null; }
  }
  function teardownAudio() {
    if (audio && audio.ctx) { try { audio.ctx.close(); } catch (e) {} }
    audio = null;
  }
  function beep(freq, dur, gain, type) {
    if (!audio || !audio.ctx) return;
    var ac = audio.ctx, now = ac.currentTime;
    var osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type || "square"; osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(now); osc.stop(now + dur + 0.02);
  }
  function blip() { beep(1200, 0.08, 0.18, "triangle"); }
  function buzzer() {
    if (!audio || !audio.ctx) return;
    beep(180, 0.5, 0.25, "sawtooth");
  }
  function buzz(p) {
    try { if (global.navigator && global.navigator.vibrate) global.navigator.vibrate(p); } catch (e) {}
  }

  // --- Utils ---------------------------------------------------------------
  function highlight(sel, key, value, attrName) {
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
  global.Spielecke.Games.whoami = module;
})(window);

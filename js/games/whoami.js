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

  function t(k) { return global.Spielecke.t(k); }

  var ROUND_OPTIONS = [30, 60, 90]; // seconds
  var TARGET = 3; // beat this for a 🎉

  var DEFAULTS = { roundSeconds: 60, pool: "mixed", soundOn: true, mode: "categories" };

  // Per-mount state
  var els = null;
  var ctx = null;
  var settings = null;
  var countdownTimer = null;
  var audio = null;

  var queue = [];      // shuffled identity queue — persists across turns within a session
  var queuePool = null; // which pool the current queue was built for
  var score = 0;
  var remaining = 0;   // seconds left

  var module = {
    meta: {
      id: "whoami",
      name: "Who Am I?",
      tagline: "Phone on your forehead. They shout, you guess. Beat the clock.",
      icon: "🙈",
      minPlayers: 2,
      supportsDrinking: false,
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
      ctx = null; settings = null; queue = []; queuePool = null; score = 0;
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
      mode: store.get("mode", DEFAULTS.mode) === "custom" ? "custom" : "categories",
    };
  }
  function saveSettings() {
    if (!ctx) return;
    ctx.store.set("roundSeconds", settings.roundSeconds);
    ctx.store.set("pool", settings.pool);
    ctx.store.set("soundOn", settings.soundOn);
    ctx.store.set("mode", settings.mode);
  }

  // --- Setup screen --------------------------------------------------------
  function renderSetup() {
    stopCountdown();
    var pools = poolsFor();

    var modeChips =
      '<div class="chip-row" id="wa-modes">' +
      '  <button class="chip" data-mode="categories">' + t("📚 Categories") + "</button>" +
      '  <button class="chip" data-mode="custom">' + t("✍️ Custom sticky") + "</button>" +
      "</div>";

    var body;
    if (settings.mode === "custom") {
      body =
        '  <p class="muted small">' + t("No sticky notes handy? Type a character for your mate, hand them the phone, and they hold it to their forehead while you give clues.") + "</p>" +
        '  <input id="wa-custom" class="text-input" type="text" maxlength="60" placeholder="' + attr(t("Type a character / thing…")) + '" />' +
        '  <button id="wa-show" class="btn btn-primary btn-block btn-xl">' + t("Show on sticky note 🪧") + "</button>";
    } else {
      var poolChips = ['<button class="chip" data-pool="mixed">' + t("🎯 Mixed") + "</button>"]
        .concat(Object.keys(pools).map(function (k) {
          return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
        })).join("");
      var timeChips = ROUND_OPTIONS.map(function (s) {
        return '<button class="chip" data-secs="' + s + '">' + s + "s</button>";
      }).join("");
      body =
        '  <p class="muted small">' + t("Hold the phone to your forehead so you can't see it. The table shouts clues. Tap") + ' <strong>' + t("GOT IT ✅") + '</strong> ' + t("when you guess,") + ' <strong>' + t("SKIP ⏭️") + '</strong> ' + t("to pass.") + '</p>' +
        '  <h3 class="sub">' + t("Category") + "</h3>" +
        '  <div class="chip-row" id="wa-pools">' + poolChips + "</div>" +
        '  <h3 class="sub">' + t("Round length") + "</h3>" +
        '  <div class="chip-row" id="wa-times">' + timeChips + "</div>" +
        '  <label class="toggle"><input type="checkbox" id="wa-sound"' + (settings.soundOn ? " checked" : "") + " /><span>" + t("🔊 Sounds") + "</span></label>" +
        '  <button id="wa-start" class="btn btn-primary btn-block btn-xl">' + t("START TURN ▶️") + "</button>";
    }

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🙈 ' + t("Who Am I?") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      modeChips +
      body +
      "</section>";

    highlight("#wa-modes", "mode", settings.mode, "data-mode");
    els.querySelectorAll("#wa-modes .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.mode = c.getAttribute("data-mode"); saveSettings();
        renderSetup();
      });
    });

    if (settings.mode === "custom") {
      var input = els.querySelector("#wa-custom");
      input.focus();
      var go = function () {
        var v = (input.value || "").trim();
        if (v) renderSticky(v);
      };
      els.querySelector("#wa-show").addEventListener("click", go);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
      return;
    }

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

  // --- Custom sticky-note mode --------------------------------------------
  function renderSticky(text) {
    els.innerHTML =
      '<section class="screen whoami-sticky">' +
      '  <p class="muted small">' + t("Forehead time! Others give clues.") + "</p>" +
      '  <div class="sticky-note"><span class="sticky-note__text">' + esc(text) + "</span></div>" +
      '  <button id="wa-new" class="btn btn-primary btn-block btn-xl">' + t("New character ✍️") + "</button>" +
      '  <button id="wa-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "</section>";
    els.querySelector("#wa-new").addEventListener("click", renderSetup);
    els.querySelector("#wa-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Play screen ---------------------------------------------------------
  function startTurn() {
    score = 0;
    remaining = settings.roundSeconds;
    if (!queue.length || queuePool !== settings.pool) {
      queue = buildQueue(settings.pool);
      queuePool = settings.pool;
    }
    setupAudio();

    els.innerHTML =
      '<section class="screen whoami-play">' +
      '  <div class="play-hud"><span id="wa-time" class="hud-time">' + remaining + "s</span>" +
      '    <span id="wa-score" class="hud-score">✅ 0</span></div>' +
      '  <div class="whoami-word-wrap"><div id="wa-word" class="whoami-word">' + esc(nextWord()) + "</div></div>" +
      '  <div class="whoami-actions">' +
      '    <button id="wa-skip" class="btn btn-skip">' + t("SKIP ⏭️") + "</button>" +
      '    <button id="wa-got" class="btn btn-got">' + t("GOT IT ✅") + "</button>" +
      "  </div>" +
      '  <button id="wa-quit" class="btn btn-ghost btn-block">' + t("End turn early") + "</button>" +
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
      '  <div class="result-emoji">' + (passed ? "🎉" : "😬") + "</div>" +
      '  <h2 class="result-title pop">' + score + t(" correct!") + "</h2>" +
      '  <p class="result-sub">' +
      (passed
        ? t("Nailed it — beat that, next player!")
        : t("Beatable — under {TARGET}. Pass it on.").replace("{TARGET}", TARGET)) +
      "</p>" +
      '  <div class="stack">' +
      '    <button id="wa-next" class="btn btn-primary btn-block btn-xl">' + t("Next player ▶️") + "</button>" +
      '    <button id="wa-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      '    <button id="wa-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#wa-next").addEventListener("click", startTurn);
    els.querySelector("#wa-settings").addEventListener("click", renderSetup);
    els.querySelector("#wa-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Word queue ----------------------------------------------------------
  function buildQueue(pool) {
    var pools = poolsFor();
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
  // Shared term pools this game should offer (excludes drawing-only pools).
  function poolsFor() {
    return global.Spielecke.termPoolsFor
      ? global.Spielecke.termPoolsFor("whoami")
      : (global.Spielecke.Terms || {});
  }
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

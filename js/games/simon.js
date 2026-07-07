/*
 * games/simon.js — Simon sagt (BETA, voice-driven)
 *
 * The phone is the announcer. It reads commands aloud (Web Speech; falls back to
 * a big on-screen phrase + beep), randomly prefixing "Simon sagt:" — obey ONLY
 * the prefixed ones. The cadence accelerates. The app can't see reactions (no
 * sync), so the TABLE judges: tap ❌ to knock out whoever slipped. Last one in wins.
 *
 * Content: js/content/simon.js (Spielecke.SimonCommands), category pools.
 * Contract: meta + mount + unmount(); unmount MUST cancel speech + timers + audio.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function Pools() { return global.Spielecke.Pools; }

  // Timing: the pause is measured AFTER the phrase finishes being spoken (not a
  // fixed interval), so a long command is never cut off by the next one. The gap
  // still shrinks as the round speeds up, but stays comfortably long.
  var START_GAP = 1500, MIN_GAP = 850, STEP = 70;

  var els = null, ctx = null, settings = null;
  var alive = [];
  var callTimer = null, speakTimer = null, callCount = 0, running = false;
  var audio = null;

  var module = {
    meta: {
      id: "simon",
      name: "Simon Says",
      tagline: "Do what Simon says — never what he doesn't. Slip up and you drink.",
      icon: "🗣️",
      minPlayers: 3,
      supportsDrinking: true,
      beta: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pools: Pools().load(context.store, catalogue()),
        drinking: context.store.get("drinking", false) === true,
        voice: context.store.get("voice", true) !== false,
      };
      renderSetup();
    },
    unmount: function () {
      stopCaller();
      cancelSpeech();
      teardownAudio();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; alive = [];
    },
  };

  function catalogue() { return global.Spielecke.L(global.Spielecke.SimonCommands) || {}; }
  function roster() { return (ctx.players || []).filter(function (p) { return p && p.name; }); }

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    stopCaller();
    cancelSpeech();
    teardownAudio(); // don't leave the AudioContext open while sitting in setup
    var r = roster();
    var enough = r.length >= module.meta.minPlayers;
    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🗣️ ' + t("Simon Says") + ' <span class="badge badge-beta">' + t("BETA") + "</span></h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      (enough ? "" : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", module.meta.minPlayers) + "</div>") +
      '  <h3 class="sub">' + t("Command categories") + "</h3>" +
      '  <div class="chip-row" id="si-pools">' + Pools().chipsHtml(catalogue(), t) + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="si-voice"' + (settings.voice ? " checked" : "") + " /><span>" + t("🔊 Read commands aloud") + "</span></label>" +
      '  <label class="toggle"><input type="checkbox" id="si-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="si-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start 🗣️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#si-pools"), catalogue(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    els.querySelector("#si-voice").addEventListener("change", function (e) {
      settings.voice = e.target.checked; ctx.store.set("voice", settings.voice);
    });
    els.querySelector("#si-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    if (enough) els.querySelector("#si-start").addEventListener("click", function () {
      alive = roster().slice();
      setupAudio();
      renderPlay();
      startCaller(true);
    });
  }

  // --- Play ----------------------------------------------------------------
  function renderPlay() {
    els.innerHTML =
      '<section class="screen si-play">' +
      '  <div class="si-alive" id="si-alive">' + aliveLabel() + "</div>" +
      '  <div class="si-phrase" id="si-phrase">…</div>' +
      '  <div class="si-pulse" id="si-pulse"></div>' +
      '  <div class="stack">' +
      '    <button id="si-out" class="btn btn-skip btn-block btn-xl">' + t("❌ Someone slipped") + "</button>" +
      '    <button id="si-stop" class="btn btn-ghost btn-block">' + t("⏸ Pause") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#si-out").addEventListener("click", function () { pauseFor(renderEliminate); });
    els.querySelector("#si-stop").addEventListener("click", function () { pauseFor(renderPaused); });
  }

  function aliveLabel() {
    return t("{n} still in").replace("{n}", alive.length);
  }

  function pauseFor(next) { stopCaller(); cancelSpeech(); next(); }

  function renderPaused() {
    els.innerHTML =
      '<section class="screen si-paused">' +
      '  <h2 class="screen-title pop">⏸ ' + t("Paused") + "</h2>" +
      '  <div class="stack">' +
      '    <button id="si-resume" class="btn btn-primary btn-block btn-xl">' + t("Resume ▶️") + "</button>" +
      '    <button id="si-quit" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#si-resume").addEventListener("click", function () { renderPlay(); startCaller(); });
    els.querySelector("#si-quit").addEventListener("click", renderSetup);
  }

  function renderEliminate() {
    var buttons = alive.map(function (p) {
      return '<button class="btn btn-block si-elim" data-id="' + attr(p.id) + '">' + esc(p.name) + "</button>";
    }).join("");
    els.innerHTML =
      '<section class="screen si-eliminate">' +
      '  <h2 class="screen-title pop">' + t("Who slipped up?") + "</h2>" +
      '  <p class="muted small">' + (settings.drinking ? t("They drink and drop out.") : t("They drop out.")) + "</p>" +
      '  <div class="stack">' + buttons + "</div>" +
      '  <button id="si-cancel" class="btn btn-ghost btn-block">' + t("← Nobody, resume") + "</button>" +
      "</section>";
    els.querySelectorAll(".si-elim").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        alive = alive.filter(function (p) { return p.id !== id; });
        if (alive.length <= 1) renderWinner();
        else { renderPlay(); startCaller(); }
      });
    });
    els.querySelector("#si-cancel").addEventListener("click", function () { renderPlay(); startCaller(); });
  }

  function renderWinner() {
    stopCaller(); cancelSpeech();
    var champ = alive.length ? alive[0].name : t("nobody");
    els.innerHTML =
      '<section class="screen si-winner">' +
      '  <div class="reveal-emoji">👑</div>' +
      '  <h2 class="result-title pop">' + esc(champ) + "</h2>" +
      '  <p class="result-sub">' + t("Last one standing — Simon's favourite!") + "</p>" +
      '  <div class="stack">' +
      '    <button id="si-again" class="btn btn-primary btn-block btn-xl">' + t("New round 🔁") + "</button>" +
      '    <button id="si-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#si-again").addEventListener("click", function () {
      alive = roster().slice(); renderPlay(); startCaller(true);
    });
    els.querySelector("#si-settings").addEventListener("click", renderSetup);
  }

  // --- Caller loop (accelerating) ------------------------------------------
  // The built-up speed survives pauses and eliminations — only a genuinely new
  // round (fresh=true) starts back at the slow cadence. Otherwise the game
  // would reset to a crawl after every knockout and never actually get fast.
  function startCaller(fresh) { running = true; if (fresh) callCount = 0; scheduleCall(600); }
  function stopCaller() {
    running = false;
    if (callTimer !== null) { global.clearTimeout(callTimer); callTimer = null; }
    if (speakTimer !== null) { global.clearTimeout(speakTimer); speakTimer = null; }
  }
  function scheduleCall(ms) { callTimer = global.setTimeout(doCall, ms); }

  function doCall() {
    if (!running || !els) return;
    callCount++;
    var cmds = Pools().gather(settings.pools, catalogue(), "commands");
    var cmd = cmds.length ? cmds[Math.floor(Math.random() * cmds.length)] : t("take a sip");
    var simon = Math.random() < 0.66;
    var phrase = (simon ? t("Simon says:") + " " : "") + cmd;

    var el = els.querySelector("#si-phrase");
    if (el) { el.textContent = phrase; el.classList.toggle("si-phrase--simon", simon); }
    var pulse = els.querySelector("#si-pulse");
    if (pulse) { pulse.classList.remove("is-beat"); void pulse.offsetWidth; pulse.classList.add("is-beat"); }
    blip(simon);

    // Queue the next command only once THIS one has finished being spoken, then
    // wait out the gap — so nothing is ever clipped mid-phrase.
    var gap = Math.max(MIN_GAP, START_GAP - callCount * STEP);
    speakThen(phrase, function () { if (running) scheduleCall(gap); });
  }

  // --- Voice + audio -------------------------------------------------------
  // Speak `text`, then call `done` when it finishes. Falls back to a length-based
  // timer when speech is off/unavailable, and always keeps a safety timer in case
  // the engine never fires onend (common right after a cancel()), so the round
  // can never stall waiting on a lost speech event.
  function speakThen(text, done) {
    var fired = false;
    function finish() {
      if (fired) return;
      fired = true;
      if (speakTimer !== null) { global.clearTimeout(speakTimer); speakTimer = null; }
      done();
    }
    var estimate = estimateMs(text);
    var spoke = false;
    var synth = settings.voice ? global.speechSynthesis : null;
    if (synth && typeof global.SpeechSynthesisUtterance === "function") {
      try {
        synth.cancel();
        var u = new global.SpeechSynthesisUtterance(text);
        u.lang = (global.Spielecke.getLang && global.Spielecke.getLang() === "en") ? "en-US" : "de-DE";
        u.rate = 1.05;
        u.onend = finish; u.onerror = finish;
        synth.speak(u);
        spoke = true;
      } catch (e) { /* fall through to the timer below */ }
    }
    // Voice off → hold the phrase for its estimated read time. Voice on → a
    // generous cap past the estimate as a safety net if onend is dropped.
    speakTimer = global.setTimeout(finish, spoke ? estimate + 1600 : estimate);
  }

  // Rough spoken length (ms) so the voice-off rhythm still tracks phrase length
  // and the safety cap scales with it.
  function estimateMs(text) {
    return Math.min(4200, 550 + String(text).length * 60);
  }

  function cancelSpeech() { try { if (global.speechSynthesis) global.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }

  function setupAudio() {
    teardownAudio();
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    try { audio = { ctx: new AC() }; } catch (e) { audio = null; }
  }
  function teardownAudio() {
    if (audio && audio.ctx) { try { audio.ctx.close(); } catch (e) { /* ignore */ } }
    audio = null;
  }
  function blip(simon) {
    if (!audio || !audio.ctx) return;
    var ac = audio.ctx, now = ac.currentTime;
    var osc = ac.createOscillator(), g = ac.createGain();
    osc.type = "sine"; osc.frequency.value = simon ? 720 : 520;
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(g).connect(ac.destination);
    osc.start(now); osc.stop(now + 0.14);
  }

  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.simon = module;
})(window);

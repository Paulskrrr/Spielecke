/*
 * games/quiz.js — Quiz Out (turn-based knockout quiz)
 *
 * Players take turns. Each turn shows a 4-option question; a wrong answer costs
 * a life. After every full round (each surviving player has answered once) the
 * difficulty climbs a level. Lose all your hearts and you're out — last player
 * standing wins. Hearts (1–5) are configured before the start.
 *
 * Uses the shared roster for turn order + per-player lives.
 * Content: content/quiz.js (Spielecke.QuizQuestions), an array of levels.
 * Drinking-capable: in drinking mode a wrong answer also = drink.
 */
(function (global) {
  "use strict";

  var MIN_PLAYERS = 2;
  var HEART_OPTIONS = [1, 2, 3, 4, 5];
  var LEVEL_NAMES = ["Warm-up", "Easy", "Medium", "Hard", "Brutal", "Insane"];
  var DEFAULTS = { hearts: 3, drinking: false };

  var els = null, ctx = null, settings = null;
  var players = [];      // [{ name, lives }]
  var roundQueue = [];   // players still to act this round
  var round = -1;        // -> level index after beginRound()
  var used = {};         // used question indices per level
  var currentPlayer = null, currentQ = null, currentOpts = null;

  var module = {
    meta: {
      id: "quiz",
      name: "Quiz Out",
      tagline: "Answer or lose a heart. Last one standing wins.",
      icon: "🧠",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        hearts: clampHearts(context.store.get("hearts", DEFAULTS.hearts)),
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; roundQueue = []; used = {};
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">Players (' + roster.length + "): " + esc(roster.map(function (p) { return p.name; }).join(", ")) + "</p>"
      : '<div class="roster-warn" style="display:block">⚠ Needs at least ' + MIN_PLAYERS + " players. Add them from the header (👥).</div>";

    var hearts = HEART_OPTIONS.map(function (h) {
      return '<button class="chip" data-hearts="' + h + '">' + h + " " + (h === 1 ? "❤️" : "❤️") + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🧠 Quiz Out</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      note +
      '  <h3 class="sub">Hearts each</h3>' +
      '  <div class="chip-row" id="qz-hearts">' + hearts + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="qz-drink"' + (settings.drinking ? " checked" : "") + " /><span>🍻 Drinking mode (wrong = drink too)</span></label>" +
      '  <button id="qz-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">Start quiz ▶️</button>" +
      "</section>";

    highlight("#qz-hearts", String(settings.hearts), "data-hearts");
    els.querySelectorAll("#qz-hearts .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.hearts = clampHearts(c.getAttribute("data-hearts"));
        ctx.store.set("hearts", settings.hearts);
        highlight("#qz-hearts", String(settings.hearts), "data-hearts");
      });
    });
    els.querySelector("#qz-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#qz-start");
    if (enough) start.addEventListener("click", function () { startGame(roster); });
  }

  // --- Game loop -----------------------------------------------------------
  function startGame(roster) {
    players = roster.map(function (p) { return { name: p.name, lives: settings.hearts }; });
    roundQueue = []; round = -1; used = {};
    nextTurn();
  }

  function active() { return players.filter(function (p) { return p.lives > 0; }); }

  function beginRound() {
    round++;
    roundQueue = active().slice();
  }

  function nextTurn() {
    var alive = active();
    if (alive.length <= 1) { renderWin(alive[0] || null); return; }
    if (roundQueue.length === 0) beginRound();
    currentPlayer = roundQueue.shift();
    renderPass();
  }

  function levelIndex() {
    var max = (global.Spielecke.QuizQuestions || []).length - 1;
    return Math.max(0, Math.min(round, max));
  }
  function levelName() {
    var i = levelIndex();
    return LEVEL_NAMES[i] || ("Level " + (i + 1));
  }

  function renderPass() {
    els.innerHTML =
      '<section class="screen qz-pass">' +
      '  <div class="qz-hud"><span class="badge">Round ' + (round + 1) + "</span>" +
      (settings.drinking ? '<span class="badge badge-drink">🍻 drink</span>' : "") +
      "  </div>" +
      '  <div class="pass-emoji">🧠</div>' +
      '  <h2 class="pass-name pop">' + esc(currentPlayer.name) + "</h2>" +
      '  <div class="qz-lives">' + hearts(currentPlayer) + "</div>" +
      '  <p class="muted">Difficulty: <strong>' + esc(levelName()) + "</strong> · " +
      active().length + " left in the game</p>" +
      '  <button id="qz-go" class="btn btn-primary btn-block btn-xl">I\'m ' + esc(currentPlayer.name) + " — go</button>" +
      "</section>";
    els.querySelector("#qz-go").addEventListener("click", renderQuestion);
  }

  function renderQuestion() {
    currentQ = pickQuestion(levelIndex());
    currentOpts = shuffleOptions(currentQ);

    var opts = currentOpts.map(function (o, i) {
      return '<button class="btn quiz-option" data-i="' + i + '">' + esc(o.text) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen qz-question">' +
      '  <div class="qz-hud"><span class="badge">' + esc(levelName()) + "</span>" +
      '    <span class="qz-lives-mini"></span></div>' +
      '  <div class="quiz-q">' + esc(currentQ.q) + "</div>" +
      '  <div class="quiz-options">' + opts + "</div>" +
      "</section>";
    // fill the mini lives + name in the hud (set as text to avoid quoting issues)
    var mini = els.querySelector(".qz-lives-mini");
    if (mini) mini.textContent = currentPlayer.name + " " + heartsPlain(currentPlayer);

    els.querySelectorAll(".quiz-option").forEach(function (b) {
      b.addEventListener("click", function () {
        answer(parseInt(b.getAttribute("data-i"), 10));
      });
    });
  }

  function answer(i) {
    var chosen = currentOpts[i];
    var correctText = currentOpts[indexOfCorrect()].text;
    if (chosen.correct) {
      renderFeedback(true, null);
    } else {
      currentPlayer.lives--;
      // if eliminated, drop from this round's remaining queue
      if (currentPlayer.lives <= 0) {
        roundQueue = roundQueue.filter(function (p) { return p !== currentPlayer; });
      }
      renderFeedback(false, correctText);
    }
  }

  function indexOfCorrect() {
    for (var i = 0; i < currentOpts.length; i++) if (currentOpts[i].correct) return i;
    return 0;
  }

  function renderFeedback(ok, correctText) {
    var eliminated = !ok && currentPlayer.lives <= 0;
    var sub;
    if (ok) {
      sub = "Safe — well played.";
    } else if (eliminated) {
      sub = "Answer: <strong>" + esc(correctText) + "</strong>. 💀 <strong>" + esc(currentPlayer.name) +
        "</strong> is OUT!" + (settings.drinking ? " 🍺 Drink!" : "");
    } else {
      sub = "Answer: <strong>" + esc(correctText) + "</strong>. −1 heart." +
        (settings.drinking ? " 🍺 Drink!" : "");
    }

    els.innerHTML =
      '<section class="screen qz-feedback">' +
      '  <div class="result-emoji">' + (ok ? "✅" : (eliminated ? "💀" : "❌")) + "</div>" +
      '  <h2 class="result-title pop">' + (ok ? "Correct!" : "Wrong!") + "</h2>" +
      '  <p class="result-sub">' + sub + "</p>" +
      '  <div class="qz-lives">' + hearts(currentPlayer) + "</div>" +
      '  <button id="qz-next" class="btn btn-primary btn-block btn-xl">Next player ▶️</button>' +
      "</section>";
    els.querySelector("#qz-next").addEventListener("click", nextTurn);
  }

  function renderWin(winner) {
    els.innerHTML =
      '<section class="screen qz-win">' +
      '  <div class="boom-flash">🏆</div>' +
      '  <h2 class="boom-title">' + (winner ? esc(winner.name) + " wins!" : "Game over") + "</h2>" +
      '  <p class="result-sub">' + (winner ? "Last one standing — quiz champion!" : "Everyone's out!") + "</p>" +
      '  <div class="stack">' +
      '    <button id="qz-again" class="btn btn-primary btn-block btn-xl">Play again 🔁</button>' +
      '    <button id="qz-settings" class="btn btn-block">Change settings</button>' +
      '    <button id="qz-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#qz-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startGame(roster); else renderSetup();
    });
    els.querySelector("#qz-settings").addEventListener("click", renderSetup);
    els.querySelector("#qz-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Questions -----------------------------------------------------------
  function pickQuestion(level) {
    var levels = global.Spielecke.QuizQuestions || [];
    var pool = levels[level] || levels[0] || [];
    if (!pool.length) return { q: "1 + 1 = ?", options: ["2", "1", "3", "11"], answer: 0 };
    var u = used[level] = used[level] || {};
    var avail = [];
    for (var i = 0; i < pool.length; i++) if (!u[i]) avail.push(i);
    if (!avail.length) { used[level] = u = {}; for (var k = 0; k < pool.length; k++) avail.push(k); }
    var pick = avail[Math.floor(Math.random() * avail.length)];
    u[pick] = true;
    return pool[pick];
  }

  function shuffleOptions(q) {
    var arr = q.options.map(function (t, i) { return { text: t, correct: i === q.answer }; });
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  // --- Helpers -------------------------------------------------------------
  function clampHearts(v) {
    var n = parseInt(v, 10);
    if (isNaN(n)) n = DEFAULTS.hearts;
    return Math.max(1, Math.min(5, n));
  }
  function hearts(p) {
    var full = "", empty = "";
    for (var i = 0; i < p.lives; i++) full += "❤️";
    for (var j = 0; j < settings.hearts - p.lives; j++) empty += "🤍";
    return full + empty;
  }
  function heartsPlain(p) {
    var s = "";
    for (var i = 0; i < p.lives; i++) s += "❤️";
    return s;
  }
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) { c.classList.toggle("chip--active", c.getAttribute(an) === value); });
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.quiz = module;
})(window);

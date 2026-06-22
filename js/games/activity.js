/*
 * games/activity.js — Activity (two-team board race)
 *
 * Two teams race along a map. Each field is one of three types — shown by ICON
 * and COLOUR, never words:
 *   💬 explain   ✏️ draw   🎭 charade
 * On your turn you're on a field of one type; pick a 2/3/4-point word; one team
 * member performs it (that way) while their team guesses, against a fixed 60s
 * clock. Guess in time → move forward by the point value. First team to the
 * finish 🏆 wins.
 *
 * One device. The two team tokens are "figures" that move along the board.
 * Content: content/activity.js (Spielecke.ActivityWords), tiered by points.
 * Not a drinking game.
 */
(function (global) {
  "use strict";

  var TYPED = 14;            // number of playable fields
  var FINISH = TYPED;        // index of the finish tile (reach it to win)
  var ROUND_SECONDS = 60;    // always 60s
  var TYPES = ["explain", "draw", "charade"];
  var TYPE_INFO = {
    explain: { icon: "💬", label: "Explain", how: "Explain it — no gestures, don't say the word" },
    draw: { icon: "✏️", label: "Draw", how: "Draw it on paper — no words or letters" },
    charade: { icon: "🎭", label: "Charade", how: "Act it out — no talking, no sounds" },
  };
  var FIGURES = ["🦊", "🐲", "🦁", "🦄", "🤖", "👽", "🦖", "🐺", "🦅", "🐯"];

  var els = null, ctx = null;
  var board = [];            // board[i] = type for i in 0..FINISH-1
  var teams = null;          // [{ figure, color, pos }, ...]
  var current = 0;           // whose turn
  var points = 0, curType = "", curWord = "";
  var timer = null, remaining = 0;

  var module = {
    meta: {
      id: "activity",
      name: "Activity",
      tagline: "Two teams. Explain, draw, act. First to the finish wins.",
      icon: "🗺️",
      minPlayers: 4,
      supportsDrinking: false,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      teams = [
        { figure: context.store.get("fig0", FIGURES[0]), color: "blue", pos: 0 },
        { figure: context.store.get("fig1", FIGURES[1]), color: "red", pos: 0 },
      ];
      renderSetup();
    },
    unmount: function () {
      stopTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; teams = null; board = [];
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    stopTimer();
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var split = roster.length >= 2 ? suggestSplit(roster) : null;

    els.innerHTML =
      '<section class="screen act-setup">' +
      '  <h2 class="screen-title pop">🗺️ Activity</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      '  <div class="act-teams">' +
      teamSetupCard(0, split && split[0]) +
      '    <div class="act-vs">VS</div>' +
      teamSetupCard(1, split && split[1]) +
      "  </div>" +
      (split ? '<button id="act-shuffle" class="btn btn-block">🔀 Shuffle teams</button>' : "") +
      '  <div class="act-legend">' +
      legendItem("explain") + legendItem("draw") + legendItem("charade") +
      "  </div>" +
      '  <button id="act-start" class="btn btn-primary btn-block btn-xl">Start game ▶️</button>' +
      "</section>";

    teams.forEach(function (t, i) {
      els.querySelector("#act-fig" + i).addEventListener("click", function () {
        cycleFigure(i);
        ctx.store.set("fig" + i, teams[i].figure);
        renderSetup();
      });
    });
    if (split) {
      els.querySelector("#act-shuffle").addEventListener("click", renderSetup);
    }
    els.querySelector("#act-start").addEventListener("click", startGame);
  }

  function teamSetupCard(i, members) {
    var t = teams[i];
    return (
      '<div class="act-team act-team--' + t.color + '">' +
      '  <button id="act-fig' + i + '" class="act-figure" aria-label="Change figure">' + t.figure + "</button>" +
      '  <div class="act-team__name">Team ' + (i === 0 ? "A" : "B") + "</div>" +
      (members && members.length
        ? '<div class="act-team__members">' + esc(members.join(", ")) + "</div>"
        : '<div class="act-team__members muted">tap figure to change</div>') +
      "</div>"
    );
  }

  function legendItem(type) {
    var info = TYPE_INFO[type];
    return (
      '<span class="act-legend__item act-' + type + '">' +
      info.icon + " " + info.label + "</span>"
    );
  }

  function cycleFigure(i) {
    var other = teams[1 - i].figure;
    var idx = FIGURES.indexOf(teams[i].figure);
    for (var n = 0; n < FIGURES.length; n++) {
      idx = (idx + 1) % FIGURES.length;
      if (FIGURES[idx] !== other) { teams[i].figure = FIGURES[idx]; return; }
    }
  }

  function suggestSplit(roster) {
    var names = roster.map(function (p) { return p.name; });
    for (var i = names.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = names[i]; names[i] = names[j]; names[j] = t; }
    var a = [], b = [];
    names.forEach(function (n, i) { (i % 2 === 0 ? a : b).push(n); });
    return [a, b];
  }

  // --- Game start / turn ---------------------------------------------------
  function startGame() {
    board = [];
    for (var i = 0; i < TYPED; i++) board.push(TYPES[Math.floor(Math.random() * TYPES.length)]);
    teams[0].pos = 0; teams[1].pos = 0;
    current = 0;
    renderTurn();
  }

  function renderTurn() {
    stopTimer();
    var t = teams[current];
    curType = board[t.pos];
    var info = TYPE_INFO[curType];

    els.innerHTML =
      '<section class="screen act-turn">' +
      '  <div class="act-layout">' +
      '    <div class="act-board-wrap">' + renderBoard() + "</div>" +
      '    <div class="act-controls">' +
      '      <div class="act-turn-head act-team--' + t.color + '">' + t.figure + " Team " + (current === 0 ? "A" : "B") + "’s turn</div>" +
      '      <div class="act-type-banner act-' + curType + '">' + info.icon + " " + info.label + "</div>" +
      '      <p class="muted">Your field is a <strong>' + info.label + '</strong> field. Pick how risky:</p>' +
      '      <div class="act-points">' +
      pointBtn(2) + pointBtn(3) + pointBtn(4) +
      "      </div>" +
      '      <button id="act-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "    </div>" +
      "  </div>" +
      "</section>";

    els.querySelectorAll("[data-pts]").forEach(function (b) {
      b.addEventListener("click", function () {
        points = parseInt(b.getAttribute("data-pts"), 10);
        renderReveal();
      });
    });
    els.querySelector("#act-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function pointBtn(p) {
    return '<button class="btn act-point" data-pts="' + p + '">' +
      '<span class="act-point__n">' + p + "</span>" +
      '<span class="act-point__l">points</span></button>';
  }

  function renderReveal() {
    var t = teams[current];
    var info = TYPE_INFO[curType];
    curWord = pickWord(points);
    els.innerHTML =
      '<section class="screen act-reveal">' +
      '  <div class="pass-emoji">' + t.figure + "</div>" +
      '  <h2 class="pass-name pop">Team ' + (current === 0 ? "A" : "B") + " — performer only</h2>" +
      '  <div class="act-type-banner act-' + curType + '">' + info.icon + " " + info.label + " · " + points + " pts</div>" +
      '  <p class="muted">One of you performs, the rest guess. Tap to see the word — don\'t show your team!</p>' +
      '  <button id="act-show" class="btn btn-primary btn-block btn-xl">Show the word 👀</button>' +
      "</section>";
    els.querySelector("#act-show").addEventListener("click", renderPerform);
  }

  function renderPerform() {
    var info = TYPE_INFO[curType];
    remaining = ROUND_SECONDS;
    els.innerHTML =
      '<section class="screen act-perform">' +
      '  <div class="act-hud"><span id="act-time" class="hud-time">' + remaining + "s</span>" +
      '    <span class="hud-score act-' + curType + '">' + info.icon + " " + points + " pts</span></div>" +
      '  <div class="act-instruction">' + info.how + "</div>" +
      '  <div class="act-word-wrap"><div class="act-word">' + esc(curWord) + "</div></div>" +
      '  <div class="act-perform-actions">' +
      '    <button id="act-miss" class="btn btn-skip">Missed ❌</button>' +
      '    <button id="act-got" class="btn btn-got">Guessed ✅</button>' +
      "  </div>" +
      "</section>";

    els.querySelector("#act-got").addEventListener("click", function () { finishTurn(true); });
    els.querySelector("#act-miss").addEventListener("click", function () { finishTurn(false); });

    timer = global.setInterval(function () {
      remaining--;
      var el = els && els.querySelector("#act-time");
      if (el) { el.textContent = remaining + "s"; if (remaining <= 10) el.classList.add("hud-time--danger"); }
      if (remaining <= 0) finishTurn(false);
    }, 1000);
  }

  function finishTurn(success) {
    stopTimer();
    var t = teams[current];
    if (success) t.pos = Math.min(t.pos + points, FINISH);

    if (t.pos >= FINISH) { renderWin(); return; }

    var info = TYPE_INFO[curType];
    els.innerHTML =
      '<section class="screen act-result">' +
      '  <div class="result-emoji">' + (success ? "✅" : "❌") + "</div>" +
      '  <h2 class="result-title pop">' + (success ? "+" + points + "!" : "No move") + "</h2>" +
      '  <p class="result-sub">' +
      (success
        ? t.figure + " Team " + (current === 0 ? "A" : "B") + " moves " + points + " forward."
        : "The word was <strong>" + esc(curWord) + "</strong>. " + t.figure + " stays put.") +
      "</p>" +
      '  <div class="act-board-wrap">' + renderBoard() + "</div>" +
      '  <button id="act-next" class="btn btn-primary btn-block btn-xl">Next team ▶️</button>' +
      "</section>";
    els.querySelector("#act-next").addEventListener("click", function () {
      current = 1 - current;
      renderTurn();
    });
  }

  function renderWin() {
    var t = teams[current];
    els.innerHTML =
      '<section class="screen act-win">' +
      '  <div class="boom-flash">🏆</div>' +
      '  <h2 class="boom-title">' + t.figure + " wins!</h2>" +
      '  <p class="result-sub">Team ' + (current === 0 ? "A" : "B") + " completed the map first!</p>" +
      '  <div class="act-board-wrap">' + renderBoard() + "</div>" +
      '  <div class="stack">' +
      '    <button id="act-again" class="btn btn-primary btn-block btn-xl">Rematch 🔁</button>' +
      '    <button id="act-setup" class="btn btn-block">Change teams</button>' +
      '    <button id="act-home2" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#act-again").addEventListener("click", startGame);
    els.querySelector("#act-setup").addEventListener("click", renderSetup);
    els.querySelector("#act-home2").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Board rendering -----------------------------------------------------
  function renderBoard() {
    var tiles = [];
    for (var i = 0; i <= FINISH; i++) {
      var isFinish = i === FINISH;
      var type = isFinish ? "finish" : board[i];
      var icon = isFinish ? "🏆" : TYPE_INFO[type].icon;
      var tokens = teams
        .map(function (t) { return t.pos === i ? '<span class="act-token act-token--' + t.color + '">' + t.figure + "</span>" : ""; })
        .join("");
      var startCls = i === 0 ? " act-tile--start" : "";
      tiles.push(
        '<div class="act-tile act-' + type + startCls + '">' +
        '<span class="act-tile__icon">' + icon + "</span>" +
        (tokens ? '<span class="act-tile__tokens">' + tokens + "</span>" : "") +
        "</div>"
      );
    }
    return '<div class="act-board">' + tiles.join("") + "</div>";
  }

  // --- Helpers -------------------------------------------------------------
  function pickWord(p) {
    var pools = global.Spielecke.ActivityWords || {};
    var tier = pools[p] || pools[2] || { words: ["Beer"] };
    var words = tier.words || ["Beer"];
    return words[Math.floor(Math.random() * words.length)];
  }
  function stopTimer() {
    if (timer !== null) { global.clearInterval(timer); timer = null; }
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.activity = module;
})(window);

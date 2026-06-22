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
    draw: { icon: "✏️", label: "Draw", how: "Draw it — no words or letters" },
    charade: { icon: "🎭", label: "Charade", how: "Act it out — no talking, no sounds" },
  };
  var FIGURES = ["🦊", "🐲", "🦁", "🦄", "🤖", "👽", "🦖", "🐺", "🦅", "🐯"];

  var els = null, ctx = null;
  var board = [];            // board[i] = type for i in 0..FINISH-1
  var teams = null;          // [{ figure, color, pos }, ...]
  var current = 0;           // whose turn
  var points = 0, curType = "", curWord = "";
  var timer = null, remaining = 0;
  var drinking = false;
  // drawing board (for "draw" fields)
  var canvas = null, cctx = null, drawing = false, lastX = 0, lastY = 0, drawFrozen = false;

  var module = {
    meta: {
      id: "activity",
      name: "Activity",
      tagline: "Two teams. Explain, draw, act. First to the finish wins.",
      icon: "🗺️",
      minPlayers: 4,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      drinking = context.store.get("drinking", false) === true;
      teams = [
        { figure: context.store.get("fig0", FIGURES[0]), color: "blue", pos: 0 },
        { figure: context.store.get("fig1", FIGURES[1]), color: "red", pos: 0 },
      ];
      renderSetup();
    },
    unmount: function () {
      stopTimer();
      teardownCanvas();
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
      '  <label class="toggle"><input type="checkbox" id="act-drink"' + (drinking ? " checked" : "") + " /><span>🍻 Drinking mode (fail → you drink, win → they drink)</span></label>" +
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
    els.querySelector("#act-drink").addEventListener("change", function (e) {
      drinking = e.target.checked; ctx.store.set("drinking", drinking);
    });
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
    els.querySelector("#act-show").addEventListener("click", function () {
      if (curType === "draw") renderDrawPreview(); else renderPerform();
    });
  }

  // explain / charade — word stays on screen for the performer
  function renderPerform() {
    var info = TYPE_INFO[curType];
    els.innerHTML =
      '<section class="screen act-perform">' +
      '  <div class="act-hud"><span id="act-time" class="hud-time">' + ROUND_SECONDS + "s</span>" +
      '    <span class="hud-score act-' + curType + '">' + info.icon + " " + points + " pts</span></div>" +
      '  <div class="act-instruction">' + info.how + "</div>" +
      '  <div class="act-word-wrap"><div class="act-word">' + esc(curWord) + "</div></div>" +
      actionButtons() +
      "</section>";
    wireActions();
    startCountdown(null);
  }

  // draw — performer reads the word privately, then draws on screen (team watches)
  function renderDrawPreview() {
    var info = TYPE_INFO.draw;
    els.innerHTML =
      '<section class="screen act-reveal">' +
      '  <div class="act-type-banner act-draw">' + info.icon + " Draw · " + points + " pts</div>" +
      '  <p class="muted">Only the drawer looks. Memorise it — then draw it for your team.</p>' +
      '  <div class="act-word-wrap"><div class="act-word">' + esc(curWord) + "</div></div>" +
      '  <button id="act-draw-start" class="btn btn-primary btn-block btn-xl">Start drawing 🖌️</button>' +
      "</section>";
    els.querySelector("#act-draw-start").addEventListener("click", renderDrawPlay);
  }

  function renderDrawPlay() {
    els.innerHTML =
      '<section class="screen act-drawplay">' +
      '  <div class="act-hud"><span id="act-time" class="hud-time">' + ROUND_SECONDS + "s</span>" +
      '    <span class="hud-score act-draw">✏️ ' + points + " pts</span></div>" +
      '  <canvas id="act-canvas" class="doodle-canvas"></canvas>' +
      '  <button id="act-clear" class="btn btn-skip btn-block">Clear 🧽</button>' +
      actionButtons() +
      "</section>";
    setupCanvas();
    els.querySelector("#act-clear").addEventListener("click", clearCanvas);
    wireActions();
    startCountdown(function () { drawFrozen = true; });
  }

  function actionButtons() {
    return (
      '<div class="act-perform-actions">' +
      '  <button id="act-miss" class="btn btn-skip">Missed ❌</button>' +
      '  <button id="act-got" class="btn btn-got">Guessed ✅</button>' +
      "</div>"
    );
  }
  function wireActions() {
    els.querySelector("#act-got").addEventListener("click", function () { finishTurn(true); });
    els.querySelector("#act-miss").addEventListener("click", function () { finishTurn(false); });
  }

  // 60s countdown. When it hits 0 the round is NOT auto-lost — time is just up
  // (you can still decide win/lose; for draw you can no longer draw). onZero is
  // an optional hook (e.g. freeze the canvas).
  function startCountdown(onZero) {
    remaining = ROUND_SECONDS;
    stopTimer();
    timer = global.setInterval(function () {
      remaining--;
      var el = els && els.querySelector("#act-time");
      if (el) {
        if (remaining <= 0) { el.textContent = "⏰ TIME!"; el.classList.add("hud-time--danger"); }
        else { el.textContent = remaining + "s"; if (remaining <= 10) el.classList.add("hud-time--danger"); }
      }
      if (remaining <= 0) { stopTimer(); if (onZero) onZero(); }
    }, 1000);
  }

  // --- Drawing board (Pointer Events: mouse + touch) -----------------------
  function setupCanvas() {
    canvas = els.querySelector("#act-canvas");
    if (!canvas) return;
    drawFrozen = false; drawing = false;
    var rect = canvas.getBoundingClientRect();
    var dpr = global.devicePixelRatio || 1;
    var w = rect.width || 300, h = rect.height || 340;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cctx = canvas.getContext("2d");
    cctx.scale(dpr, dpr);
    cctx.lineJoin = "round"; cctx.lineCap = "round";
    cctx.lineWidth = 4; cctx.strokeStyle = "#241b4d";
    clearCanvas();
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onUp);
  }
  function cpos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function onDown(e) {
    if (drawFrozen) return;
    e.preventDefault(); drawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    var p = cpos(e); lastX = p.x; lastY = p.y;
    cctx.beginPath(); cctx.arc(lastX, lastY, cctx.lineWidth / 2, 0, Math.PI * 2);
    cctx.fillStyle = "#241b4d"; cctx.fill();
  }
  function onMove(e) {
    if (!drawing || drawFrozen) return;
    e.preventDefault();
    var p = cpos(e);
    cctx.beginPath(); cctx.moveTo(lastX, lastY); cctx.lineTo(p.x, p.y); cctx.stroke();
    lastX = p.x; lastY = p.y;
  }
  function onUp(e) {
    if (drawing) { try { canvas.releasePointerCapture(e.pointerId); } catch (err) {} }
    drawing = false;
  }
  function clearCanvas() {
    if (!cctx || !canvas) return;
    cctx.save(); cctx.setTransform(1, 0, 0, 1, 0, 0);
    cctx.fillStyle = "#ffffff"; cctx.fillRect(0, 0, canvas.width, canvas.height);
    cctx.restore();
  }
  function teardownCanvas() {
    if (canvas) {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    }
    canvas = null; cctx = null; drawing = false; drawFrozen = false;
  }

  function finishTurn(success) {
    stopTimer();
    teardownCanvas();
    var t = teams[current];
    var other = teams[1 - current];
    if (success) t.pos = Math.min(t.pos + points, FINISH);

    if (t.pos >= FINISH) { renderWin(); return; }

    var info = TYPE_INFO[curType];
    els.innerHTML =
      '<section class="screen act-result">' +
      '  <div class="result-emoji">' + (success ? "✅" : "❌") + "</div>" +
      '  <h2 class="result-title pop">' + (success ? "+" + points + "!" : "No move") + "</h2>" +
      '  <p class="result-sub">' +
      (success
        ? t.figure + " Team " + (current === 0 ? "A" : "B") + " moves " + points + " forward." +
          (drinking ? " 🍺 " + other.figure + " Team " + (current === 0 ? "B" : "A") + " drinks!" : "")
        : "The word was <strong>" + esc(curWord) + "</strong>. " + t.figure + " stays put." +
          (drinking ? " 🍺 Team " + (current === 0 ? "A" : "B") + " drinks!" : "")) +
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

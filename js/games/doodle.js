/*
 * games/doodle.js — Doodle Drama (drawing telephone)
 *
 * One device, passed around. A secret word goes to player 1, who DRAWS it.
 * Player 2 sees only that drawing and GUESSES a word. Player 3 draws that guess.
 * And so on down the roster — draw, guess, draw, guess. At the end, reveal the
 * whole chain and watch it fall apart. Not a drinking game — pure carnage.
 *
 * Drawing uses a <canvas> with Pointer Events, so the same code works with a
 * mouse on a laptop and a finger on a phone. No libraries, stays pure-static.
 *
 * Uses the shared roster (pass order) and the shared term DB for the seed word.
 * Drawings are kept in memory for the session only (too big for localStorage).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 2;

  var els = null, ctx = null, settings = null;
  var players = [], secretWord = "", chain = [], step = 0;
  // active drawing state
  var canvas = null, cctx = null, drawing = false, lastX = 0, lastY = 0;

  var module = {
    meta: {
      id: "doodle",
      name: "Doodle Drama",
      tagline: "Draw it, guess it, draw it again. Watch it fall apart.",
      icon: "🎨",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: false,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = { pools: Pools().load(context.store, poolsFor()) };
      renderSetup();
    },
    unmount: function () {
      teardownCanvas();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; chain = []; secretWord = "";
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    teardownCanvas();
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var chips = Pools().chipsHtml(poolsFor(), t);

    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">' + t("Chain order ({n}): {names}").replace("{n}", roster.length).replace("{names}", esc(roster.map(function (p) { return p.name; }).join(" → "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🎨 ' + t("Doodle Drama") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <h3 class="sub">' + t("Word pool") + "</h3>" +
      '  <div class="chip-row" id="dd-pools">' + chips + "</div>" +
      '  <button id="dd-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start drawing 🖌️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#dd-pools"), poolsFor(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    var start = els.querySelector("#dd-start");
    if (enough) start.addEventListener("click", function () { startChain(roster); });
  }

  function startChain(roster) {
    players = roster.map(function (p) { return p.name; });
    secretWord = pickWord();
    chain = [{ kind: "seed", value: secretWord }];
    step = 0;
    renderPassTo();
  }

  // Even steps draw, odd steps guess. Step 0 draws the secret word.
  function isDrawStep(i) { return i % 2 === 0; }

  function renderPassTo() {
    teardownCanvas();
    var name = players[step];
    var task = isDrawStep(step) ? "draw" : "guess";
    els.innerHTML =
      '<section class="screen dd-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", step + 1).replace("{n}", players.length) + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("No peeking — {name} is about to {task}.").replace("{name}", esc(name)).replace("{task}", t(task)) + "</p>" +
      '  <button id="dd-go" class="btn btn-primary btn-block btn-xl">' + t("I\'m {name} — go").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#dd-go").addEventListener("click", function () {
      if (isDrawStep(step)) renderDraw(); else renderGuess();
    });
  }

  // --- Draw step -----------------------------------------------------------
  function renderDraw() {
    var prevText = chain[chain.length - 1].value; // seed word or previous guess
    els.innerHTML =
      '<section class="screen dd-draw">' +
      '  <div class="dd-target">' + t("Draw: ") + "<strong>" + esc(prevText) + "</strong></div>" +
      '  <canvas id="dd-canvas" class="doodle-canvas"></canvas>' +
      '  <div class="dd-tools">' +
      '    <button id="dd-clear" class="btn btn-skip">' + t("Clear 🧹") + "</button>" +
      '    <button id="dd-done" class="btn btn-got">' + t("Done ✅") + "</button>" +
      "  </div>" +
      "</section>";
    setupCanvas();
    els.querySelector("#dd-clear").addEventListener("click", clearCanvas);
    els.querySelector("#dd-done").addEventListener("click", function () {
      var data = canvas.toDataURL("image/png");
      chain.push({ kind: "drawing", by: players[step], value: data });
      advance();
    });
  }

  // --- Guess step ----------------------------------------------------------
  function renderGuess() {
    var prevImg = chain[chain.length - 1].value; // a drawing dataURL
    els.innerHTML =
      '<section class="screen dd-guess">' +
      '  <div class="dd-target">' + t("What is this?") + "</div>" +
      '  <img class="doodle-show" src="' + prevImg + '" alt="drawing to guess" />' +
      '  <input id="dd-input" class="text-input" type="text" placeholder="' + t("Your guess…") + '" maxlength="40" />' +
      '  <button id="dd-submit" class="btn btn-primary btn-block btn-xl">' + t("Lock guess 🔒") + "</button>" +
      "</section>";
    var input = els.querySelector("#dd-input");
    input.focus();
    els.querySelector("#dd-submit").addEventListener("click", function () {
      var v = (input.value || "").trim() || "(no idea)";
      chain.push({ kind: "guess", by: players[step], value: v });
      advance();
    });
  }

  function advance() {
    teardownCanvas();
    step++;
    if (step >= players.length) renderReveal();
    else renderPassTo();
  }

  // --- Reveal --------------------------------------------------------------
  function renderReveal() {
    var items = ['<div class="dd-seed">' + t("The word was: ") + "<strong>" + esc(secretWord) + "</strong></div>"];
    for (var i = 1; i < chain.length; i++) {
      var e = chain[i];
      if (e.kind === "drawing") {
        items.push(
          '<div class="dd-item"><div class="dd-by">' + t("{name} drew:").replace("{name}", esc(e.by)) + "</div>" +
          '<img class="doodle-thumb" src="' + e.value + '" alt="drawing" /></div>'
        );
      } else {
        items.push(
          '<div class="dd-item"><div class="dd-by">' + t("{name} guessed:").replace("{name}", esc(e.by)) + "</div>" +
          '<div class="dd-guesstext">' + esc(e.value) + "</div></div>"
        );
      }
    }
    var lastGuess = null;
    for (var j = chain.length - 1; j >= 1; j--) { if (chain[j].kind === "guess") { lastGuess = chain[j].value; break; } }
    var verdict = lastGuess
      ? (lastGuess.toLowerCase() === secretWord.toLowerCase()
          ? t("🎉 The chain survived!")
          : "💀 " + t("From {a} to {b}.").replace("{a}", "<strong>" + esc(secretWord) + "</strong>").replace("{b}", "<strong>" + esc(lastGuess) + "</strong>"))
      : "";

    els.innerHTML =
      '<section class="screen dd-reveal">' +
      '  <h2 class="result-title pop">' + t("The chain 🎨") + "</h2>" +
      (verdict ? '<p class="result-sub">' + verdict + "</p>" : "") +
      '  <div class="dd-chain">' + items.join("") + "</div>" +
      '  <div class="stack">' +
      '    <button id="dd-again" class="btn btn-primary btn-block btn-xl">' + t("New chain 🔁") + "</button>" +
      '    <button id="dd-settings" class="btn btn-block">' + t("Change pool") + "</button>" +
      '    <button id="dd-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#dd-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startChain(roster); else renderSetup();
    });
    els.querySelector("#dd-settings").addEventListener("click", renderSetup);
    els.querySelector("#dd-home").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Canvas (Pointer Events: mouse + touch) ------------------------------
  function setupCanvas() {
    canvas = els.querySelector("#dd-canvas");
    if (!canvas) return;
    var dpr = global.devicePixelRatio || 1;
    // Use the CONTENT box (clientWidth/Height excludes the 4px border), not the
    // border-box from getBoundingClientRect — otherwise the bitmap is sized for
    // the outer edge and gets squeezed into the content box, drifting the cursor.
    var w = canvas.clientWidth || 300;
    var h = canvas.clientHeight || 340;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cctx = canvas.getContext("2d");
    cctx.scale(dpr, dpr);
    cctx.lineJoin = "round";
    cctx.lineCap = "round";
    cctx.lineWidth = 4;
    cctx.strokeStyle = "#241b4d";
    clearCanvas();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onUp);
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    // r.left/top sit on the OUTER border edge; the drawing origin is the content
    // box, so shift inward by the border width (clientLeft/clientTop).
    return { x: e.clientX - r.left - canvas.clientLeft, y: e.clientY - r.top - canvas.clientTop };
  }
  function onDown(e) {
    e.preventDefault();
    drawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    var p = pos(e); lastX = p.x; lastY = p.y;
    // a dot for taps
    cctx.beginPath();
    cctx.arc(lastX, lastY, cctx.lineWidth / 2, 0, Math.PI * 2);
    cctx.fillStyle = "#241b4d";
    cctx.fill();
  }
  function onMove(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pos(e);
    cctx.beginPath();
    cctx.moveTo(lastX, lastY);
    cctx.lineTo(p.x, p.y);
    cctx.stroke();
    lastX = p.x; lastY = p.y;
  }
  function onUp(e) {
    if (drawing) { try { canvas.releasePointerCapture(e.pointerId); } catch (err) {} }
    drawing = false;
  }
  function clearCanvas() {
    if (!cctx || !canvas) return;
    var dpr = global.devicePixelRatio || 1;
    cctx.save();
    cctx.setTransform(1, 0, 0, 1, 0, 0);
    cctx.fillStyle = "#ffffff";
    cctx.fillRect(0, 0, canvas.width, canvas.height);
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
    canvas = null; cctx = null; drawing = false;
  }

  // --- Utils ---------------------------------------------------------------
  // Shared term pools this game should offer (includes drawing-only pools).
  function poolsFor() {
    return global.Spielecke.termPoolsFor
      ? global.Spielecke.termPoolsFor("doodle")
      : (global.Spielecke.Terms || {});
  }
  function pickWord() {
    var list = Pools().gather(settings.pools, poolsFor(), "terms");
    if (!list.length) return "cat";
    return list[Math.floor(Math.random() * list.length)];
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.doodle = module;
})(window);

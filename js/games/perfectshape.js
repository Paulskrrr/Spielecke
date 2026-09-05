// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/perfectshape.js — Perfect Shape (freehand accuracy duel)
 *
 * One device, passed around. Everyone draws the SAME shape freehand on a blank
 * canvas — a circle, a pentagon, a spiral — no rulers, no guides, one shot. At
 * the end every attempt is laid over the ideal shape, one after another, and
 * underneath they're ranked by how well they fit.
 *
 * Drawing is the same canvas + Pointer Events setup as Doodle Drama, so mouse
 * and finger behave identically. Multiple strokes are allowed (the cross needs
 * two) with an undo for the last one.
 *
 * SCORING (games/shapefit.js — the maths that makes the ranking fair):
 * the attempt and the ideal outline are both resampled to evenly spaced points,
 * the attempt is moved/scaled/rotated onto the ideal one (best fit), and the
 * average two-way distance between the two curves becomes the accuracy. So WHERE
 * on the canvas you draw and HOW BIG doesn't matter — only the shape does.
 * Rotation is only forgiven within a few degrees (a square must not score as a
 * diamond); a circle and a line may rotate freely, since for them it means
 * nothing.
 *
 * Attempts live in memory for the round only — nothing is stored.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 2;
  var TIME_LIMIT = 20;      // seconds, only when time pressure is switched on
  var REVEAL_DRAW_MS = 520; // how long one attempt takes to draw itself on
  var REVEAL_GAP_MS = 420;  // beat between two attempts

  // Attempt colours — one per player, in roster order (wraps at 9).
  var INK = ["#3aa0ff", "#ff4d5e", "#36d399", "#a06bff", "#ff8a3d", "#14b8a6", "#ff5fa2", "#6c63ff", "#ffcf33"];

  var els = null, ctx = null, settings = null;
  var players = [], attempts = [], step = 0, shape = null, tpl = null, lastKey = null;
  // active drawing state
  var canvas = null, cctx = null, drawing = false, strokes = null, cur = null;
  var drawTimer = null, drawTimeLeft = 0;
  // reveal state
  var ranked = [], revealIdx = 0, revealRaf = null, revealTimer = null, revealDone = false;

  var module = {
    meta: {
      id: "perfectshape",
      name: "Perfect Shape",
      tagline: "Freehand the shape. The maths decides who actually nailed it.",
      icon: "📐",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: false,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pools: Pools().load(context.store, shapePools()),
        timed: context.store.get("timed", false) === true,
        hardcore: context.store.get("hardcore", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      teardownCanvas();
      stopReveal();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null;
      players = []; attempts = []; ranked = []; shape = null; tpl = null;
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    teardownCanvas();
    stopReveal();
    // Fresh order every round so the same person doesn't always draw first (and
    // doesn't always draw last, with everyone else's attempt still in mind).
    var roster = shuffle((ctx.players || []).filter(function (p) { return p && p.name; }));
    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">' + t("Turn order ({n}): {names}").replace("{n}", roster.length).replace("{names}", esc(roster.map(function (p) { return p.name; }).join(" → "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">📐 ' + t("Perfect Shape") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <p class="muted small">' + t("Everyone draws the same shape freehand. Position and size don\'t matter — only the shape does.") + "</p>" +
      '  <h3 class="sub">' + t("Difficulty") + "</h3>" +
      '  <div class="chip-row" id="ps-pools">' + Pools().chipsHtml(shapePools(), t) + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ps-timed"' + (settings.timed ? " checked" : "") + " /><span>" + t("⏱️ Time pressure ({n}s)").replace("{n}", TIME_LIMIT) + "</span></label>" +
      '  <label class="toggle"><input type="checkbox" id="ps-hardcore"' + (settings.hardcore ? " checked" : "") + " /><span>" + t("🙈 Hardcore: hide the reference") + "</span></label>" +
      '  <button id="ps-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start drawing ✏️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#ps-pools"), shapePools(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    els.querySelector("#ps-timed").addEventListener("change", function (e) {
      settings.timed = e.target.checked; ctx.store.set("timed", settings.timed);
    });
    els.querySelector("#ps-hardcore").addEventListener("change", function (e) {
      settings.hardcore = e.target.checked; ctx.store.set("hardcore", settings.hardcore);
    });
    var start = els.querySelector("#ps-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    players = roster.map(function (p) { return p.name; });
    shape = pickShape();
    tpl = ShapeFit.template(shape);
    attempts = [];
    step = 0;
    renderPassTo();
  }

  // --- Pass the phone ------------------------------------------------------
  function renderPassTo() {
    teardownCanvas();
    var name = players[step];
    els.innerHTML =
      '<section class="screen ps-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", step + 1).replace("{n}", players.length) + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <div class="ps-task">' + t("The shape:") + " <strong>" + esc(shape.name) + "</strong></div>" +
      '  <p class="muted">' + t("Same shape for everyone. Nobody sees the others until the end.") + "</p>" +
      '  <button id="ps-go" class="btn btn-primary btn-block btn-xl">' + t("I\'m {name} — go").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#ps-go").addEventListener("click", renderDraw);
  }

  // --- Draw ----------------------------------------------------------------
  function renderDraw() {
    var badge = shape.level === "hard"
      ? '<span class="ps-level ps-level--hard">' + t("Hard") + "</span>"
      : '<span class="ps-level ps-level--easy">' + t("Easy") + "</span>";

    els.innerHTML =
      '<section class="screen ps-draw">' +
      '  <div class="ps-draw-head">' +
      '    <div class="ps-headline">' +
      '      <div class="ps-shapename">' + esc(shape.name) + " " + badge + "</div>" +
      '      <div class="muted small">' + esc(shape.hint) + "</div>" +
      "    </div>" +
      (settings.hardcore ? "" : '    <canvas id="ps-ref" class="ps-ref" aria-hidden="true"></canvas>') +
      (settings.timed ? '    <div class="ps-timer" id="ps-timer">' + fmtSecs(TIME_LIMIT) + "</div>" : "") +
      "  </div>" +
      '  <canvas id="ps-canvas" class="ps-canvas"></canvas>' +
      '  <div class="ps-tools">' +
      '    <button id="ps-undo" class="btn btn-skip" disabled>' + t("Undo ↩️") + "</button>" +
      '    <button id="ps-clear" class="btn btn-skip" disabled>' + t("Clear 🧹") + "</button>" +
      '    <button id="ps-done" class="btn btn-got" data-primary disabled>' + t("Done ✅") + "</button>" +
      "  </div>" +
      "</section>";

    if (!settings.hardcore) paintReference(els.querySelector("#ps-ref"));
    setupCanvas();
    els.querySelector("#ps-undo").addEventListener("click", function () {
      if (strokes.length) { strokes.pop(); redraw(); syncTools(); }
    });
    els.querySelector("#ps-clear").addEventListener("click", function () {
      strokes = []; redraw(); syncTools();
    });
    els.querySelector("#ps-done").addEventListener("click", finishTurn);
    if (settings.timed) startDrawTimer();
  }

  // Enable/disable the tools from what's on the canvas — nothing drawn, nothing
  // to undo, clear or submit.
  function syncTools() {
    if (!els) return;
    var any = !!(strokes && strokes.length);
    ["#ps-undo", "#ps-clear", "#ps-done"].forEach(function (sel) {
      var b = els.querySelector(sel);
      if (b) b.disabled = !any;
    });
  }

  // Score the attempt right here (a few ms) so the reveal can run without a
  // pause, then move on. Fires from "Done" or from the timer running out —
  // guarded by the canvas being alive so it can only land once per turn.
  function finishTurn() {
    if (!canvas) return;
    stopDrawTimer();
    var result = ShapeFit.score(strokes, tpl, ShapeFit.freeRotation(shape));
    attempts.push({
      name: players[step],
      color: INK[step % INK.length],
      strokes: strokes,
      score: result ? result.score : 0,
      fit: result ? result.fit : null,
    });
    teardownCanvas();
    step++;
    if (step >= players.length) renderReveal();
    else renderPassTo();
  }

  // --- Drawing timer -------------------------------------------------------
  function startDrawTimer() {
    stopDrawTimer();
    drawTimeLeft = TIME_LIMIT;
    updateDrawTimer();
    drawTimer = global.setInterval(function () {
      drawTimeLeft--;
      updateDrawTimer();
      if (drawTimeLeft <= 0) finishTurn();
    }, 1000);
  }
  function stopDrawTimer() {
    if (drawTimer !== null) { global.clearInterval(drawTimer); drawTimer = null; }
  }
  function updateDrawTimer() {
    var el = els && els.querySelector("#ps-timer");
    if (!el) return;
    el.textContent = fmtSecs(Math.max(0, drawTimeLeft));
    el.classList.toggle("is-urgent", drawTimeLeft <= 5);
  }
  function fmtSecs(s) { var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }

  // --- Canvas (Pointer Events: mouse + touch) ------------------------------
  function setupCanvas() {
    canvas = els.querySelector("#ps-canvas");
    if (!canvas) return;
    strokes = [];
    var dpr = global.devicePixelRatio || 1;
    // Content box, not the border box — see the same note in doodle.js: sizing
    // the bitmap to the outer edge drifts the cursor away from the pen.
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
    redraw();

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onUp);
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left - canvas.clientLeft, y: e.clientY - r.top - canvas.clientTop };
  }
  function onDown(e) {
    e.preventDefault();
    drawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    var p = pos(e);
    cur = [p.x, p.y];
    strokes.push(cur);
    dot(cctx, p.x, p.y);
    syncTools();
  }
  function onMove(e) {
    if (!drawing || !cur) return;
    e.preventDefault();
    var p = pos(e);
    var n = cur.length;
    cctx.beginPath();
    cctx.moveTo(cur[n - 2], cur[n - 1]);
    cctx.lineTo(p.x, p.y);
    cctx.stroke();
    cur.push(p.x, p.y);
  }
  function onUp(e) {
    if (drawing) { try { canvas.releasePointerCapture(e.pointerId); } catch (err) {} }
    drawing = false; cur = null;
  }
  function dot(c, x, y) {
    c.beginPath();
    c.arc(x, y, c.lineWidth / 2, 0, Math.PI * 2);
    c.fillStyle = c.strokeStyle;
    c.fill();
  }

  // Repaint the whole canvas from `strokes` — used by undo and clear.
  function redraw() {
    if (!cctx || !canvas) return;
    var dpr = global.devicePixelRatio || 1;
    cctx.save();
    cctx.setTransform(1, 0, 0, 1, 0, 0);
    cctx.fillStyle = "#ffffff";
    cctx.fillRect(0, 0, canvas.width, canvas.height);
    cctx.restore();
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    strokes.forEach(function (s) {
      if (s.length < 4) { dot(cctx, s[0], s[1]); return; }
      cctx.beginPath();
      cctx.moveTo(s[0], s[1]);
      for (var i = 2; i < s.length; i += 2) cctx.lineTo(s[i], s[i + 1]);
      cctx.stroke();
    });
  }

  function teardownCanvas() {
    stopDrawTimer();
    if (canvas) {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    }
    canvas = null; cctx = null; drawing = false; cur = null; strokes = null;
  }

  // --- Reveal --------------------------------------------------------------
  // Every attempt is laid over the ideal outline, worst first, so the winner's
  // line is the last one to land — and the ranking underneath fills in from the
  // bottom up as they appear.
  function renderReveal() {
    stopReveal();
    revealDone = false;
    revealIdx = 0;
    ranked = attempts.slice().sort(function (a, b) {
      return b.score - a.score || a.name.localeCompare(b.name);
    });
    ranked.forEach(function (a, i) { a.rank = i; });

    var rows = ranked.map(function (a) {
      var medal = a.rank === 0 ? "🥇" : a.rank === 1 ? "🥈" : a.rank === 2 ? "🥉" : (a.rank + 1) + ".";
      return (
        '<li class="ps-row" data-rank="' + a.rank + '">' +
        '  <span class="ps-medal">' + medal + "</span>" +
        '  <span class="ps-dot" style="background:' + a.color + '"></span>' +
        '  <span class="ps-name">' + esc(a.name) + "</span>" +
        '  <span class="ps-bar"><i style="width:' + a.score.toFixed(1) + "%;background:" + a.color + '"></i></span>' +
        '  <span class="ps-score">' + pct(a.score) + "</span>" +
        "</li>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen ps-reveal">' +
      '  <h2 class="result-title pop">' + esc(shape.name) + "</h2>" +
      '  <p class="result-sub">' + t("Everyone\'s attempt, over the ideal shape.") + "</p>" +
      '  <canvas id="ps-stage" class="ps-stage"></canvas>' +
      '  <p class="muted small ps-skip-hint" id="ps-hint">' + t("👆 Tap to show them all at once") + "</p>" +
      '  <ol class="ps-rank" id="ps-rank">' + rows + "</ol>" +
      '  <div class="ps-outro" id="ps-outro" hidden>' +
      '    <div class="ps-verdict" id="ps-verdict"></div>' +
      '    <button id="ps-again" class="btn btn-primary btn-block btn-xl">' + t("Next shape 🔁") + "</button>" +
      '    <button id="ps-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";

    var stage = els.querySelector("#ps-stage");
    sizeStage(stage);
    paintStage(stage, 0, 0);
    stage.addEventListener("click", skipReveal);
    els.querySelector("#ps-hint").addEventListener("click", skipReveal);
    els.querySelector("#ps-again").addEventListener("click", function () {
      var roster = shuffle((ctx.players || []).filter(function (p) { return p && p.name; }));
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#ps-settings").addEventListener("click", renderSetup);

    revealTimer = global.setTimeout(revealNext, REVEAL_GAP_MS);
  }

  // Attempts land worst → best, each drawing itself on over REVEAL_DRAW_MS.
  function revealNext() {
    revealTimer = null;
    var order = ranked.length - 1 - revealIdx; // worst first
    if (order < 0) { finishReveal(); return; }
    var stage = els && els.querySelector("#ps-stage");
    if (!stage) return;

    var reduced = prefersReducedMotion();
    var t0 = 0;
    function frame(now) {
      revealRaf = null;
      if (!t0) t0 = now;
      var p = reduced ? 1 : Math.min(1, (now - t0) / REVEAL_DRAW_MS);
      paintStage(stage, revealIdx, p);
      if (p < 1) { revealRaf = global.requestAnimationFrame(frame); return; }
      showRow(order);
      revealIdx++;
      revealTimer = global.setTimeout(revealNext, REVEAL_GAP_MS);
    }
    revealRaf = global.requestAnimationFrame(frame);
  }

  function showRow(rank) {
    var row = els && els.querySelector('.ps-row[data-rank="' + rank + '"]');
    if (row) row.classList.add("is-in");
  }

  function skipReveal() {
    if (revealDone) return;
    stopReveal();
    var stage = els.querySelector("#ps-stage");
    revealIdx = ranked.length;
    paintStage(stage, revealIdx, 1);
    ranked.forEach(function (a) { showRow(a.rank); });
    finishReveal();
  }

  function finishReveal() {
    stopReveal();
    revealDone = true;
    var hint = els && els.querySelector("#ps-hint");
    if (hint) hint.hidden = true;
    var outro = els && els.querySelector("#ps-outro");
    var verdict = els && els.querySelector("#ps-verdict");
    if (verdict && ranked.length) {
      var win = ranked[0];
      verdict.innerHTML =
        '<div class="ps-winline">🥇 ' + esc(win.name) + " — " + pct(win.score) + "</div>" +
        '<div class="muted">' + t(verdictFor(win.score)) + "</div>";
    }
    if (outro) outro.hidden = false;
  }

  function stopReveal() {
    if (revealRaf !== null) { global.cancelAnimationFrame(revealRaf); revealRaf = null; }
    if (revealTimer !== null) { global.clearTimeout(revealTimer); revealTimer = null; }
  }

  // A line for the winner's number — flattery scales with the score.
  function verdictFor(score) {
    if (score >= 95) return "That's not a hand, that's a printer.";
    if (score >= 88) return "Suspiciously clean.";
    if (score >= 78) return "Solid. The hand knew what it wanted.";
    if (score >= 65) return "Good enough to win this table.";
    if (score >= 50) return "Won the round. Let's not frame it.";
    return "Somebody had to win.";
  }

  // --- Painting ------------------------------------------------------------
  function sizeStage(cv) {
    var dpr = global.devicePixelRatio || 1;
    var w = cv.clientWidth || 300, h = cv.clientHeight || 340;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    var c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  }

  // Map the shared normalised space (centroid 0, RMS radius 1) into a canvas.
  // The ideal shape reaches maxX/maxY out from the centre, so `pad` is the
  // fraction of the canvas it fills — the rest is headroom for attempts that
  // overshoot it.
  function viewFor(cv, pad) {
    var w = cv.clientWidth || 300, h = cv.clientHeight || 340;
    var k = Math.min((w * pad) / (2 * tpl.maxX), (h * pad) / (2 * tpl.maxY));
    return { k: k, cx: w / 2, cy: h / 2 };
  }

  // The ideal outline, plus `count` finished attempts and one in progress at
  // `partial` (0..1). Repainted every frame — a handful of polylines, cheap.
  function paintStage(cv, count, partial) {
    if (!cv) return;
    var c = cv.getContext("2d");
    var dpr = global.devicePixelRatio || 1;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, cv.width, cv.height);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var v = viewFor(cv, 0.78);

    c.lineWidth = 3.5;
    c.lineJoin = "round";
    c.lineCap = "round";
    for (var i = 0; i <= count && i < ranked.length; i++) {
      var a = ranked[ranked.length - 1 - i];
      if (!a) continue;
      var p = i === count ? partial : 1;
      if (p <= 0) continue;
      c.strokeStyle = a.color;
      c.globalAlpha = i === count ? 1 : 0.85;
      paintAttempt(c, a, v, p);
    }
    c.globalAlpha = 1;

    // The ideal shape goes on TOP, dashed and half-transparent: with everyone's
    // ink piled up it would vanish underneath, and it's the thing every line is
    // being judged against.
    c.save();
    c.setLineDash([8, 7]);
    c.lineWidth = 3;
    c.globalAlpha = 0.55;
    c.strokeStyle = "#241b4d";
    tpl.subs.forEach(function (sub) {
      strokePath(c, sub.pts, sub.closed, v);
    });
    c.restore();
  }

  // Draw one attempt through its best-fit transform, so every attempt lands on
  // top of the ideal shape no matter where or how big it was drawn.
  function paintAttempt(c, a, v, progress) {
    if (!a.fit) return;
    var total = 0, i;
    for (i = 0; i < a.strokes.length; i++) total += a.strokes[i].length / 2;
    var budget = Math.max(1, Math.round(total * progress));
    for (i = 0; i < a.strokes.length; i++) {
      if (budget <= 0) break;
      var s = a.strokes[i];
      var n = Math.min(s.length / 2, budget);
      budget -= n;
      var pts = [];
      for (var j = 0; j < n; j++) {
        var q = ShapeFit.place(s[j * 2], s[j * 2 + 1], a.fit);
        pts.push(q[0], q[1]);
      }
      strokePath(c, pts, false, v);
    }
  }

  function strokePath(c, pts, closed, v) {
    if (!pts || pts.length < 2) return;
    if (pts.length === 2) { // a lone tap
      c.beginPath();
      c.arc(v.cx + pts[0] * v.k, v.cy + pts[1] * v.k, c.lineWidth / 2, 0, Math.PI * 2);
      c.fillStyle = c.strokeStyle;
      c.fill();
      return;
    }
    c.beginPath();
    c.moveTo(v.cx + pts[0] * v.k, v.cy + pts[1] * v.k);
    for (var i = 2; i < pts.length; i += 2) c.lineTo(v.cx + pts[i] * v.k, v.cy + pts[i + 1] * v.k);
    if (closed) c.closePath();
    c.stroke();
  }

  // The little "this is what you're aiming at" thumbnail on the drawing screen.
  function paintReference(cv) {
    if (!cv) return;
    var c = sizeStage(cv);
    c.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    var v = viewFor(cv, 0.74);
    c.lineWidth = 2.5;
    c.lineJoin = "round";
    c.lineCap = "round";
    c.strokeStyle = "#241b4d";
    tpl.subs.forEach(function (sub) { strokePath(c, sub.pts, sub.closed, v); });
  }

  // --- Shape picking -------------------------------------------------------
  function shapePools() {
    return global.Spielecke.L(global.Spielecke.PerfectShapes) || {};
  }
  function pickShape() {
    var list = Pools().gather(settings.pools, shapePools(), "shapes");
    if (!list.length) list = shapePools().easy ? shapePools().easy.shapes : [];
    if (!list.length) return { key: "circle", name: "Circle", hint: "", gen: "circle", level: "easy" };
    var pool = list.length > 1 ? list.filter(function (s) { return s.key !== lastKey; }) : list;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    lastKey = pick.key;
    return pick;
  }

  function pct(score) {
    var s = score.toFixed(1);
    return (global.Spielecke.getLang() === "de" ? s.replace(".", ",") : s) + "%";
  }
  function prefersReducedMotion() {
    try { return global.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  var esc = global.Spielecke.esc;
  var shuffle = global.Spielecke.shuffle;

  var ShapeFit = global.Spielecke.ShapeFit;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.perfectshape = module;
})(window);

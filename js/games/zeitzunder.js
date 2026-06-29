/*
 * games/zeitzunder.js — Zeitzünder (asymmetric co-op bomb defusal)
 *
 * See ZEITZUNDER.md for the full design vision. In short: one screen is the
 * bomb (a MacBook on the table), the others are EXPERTS holding the manual on
 * their phones, and the only "network" is the people talking in the room.
 *
 *   - The DEFUSER operates the bomb: a real 3D cube they physically flip around
 *     (drag or arrow keys). There is NO map, NO labels, NO guidance — they are
 *     deliberately lost, describing raw shapes to the experts. The six faces are
 *     arranged on RANDOM sides of the cube every game, so nothing is memorised.
 *   - The EXPERT reads the manual (rules, tables, legends — padded with useless
 *     bureaucratic spam to dig through) but never sees the bomb.
 *
 * Three action stages — WIRES, KEYPAD, DIALS — must be committed in an order the
 * bomb hides in its firing sigils, and each stage reads values off OTHER faces,
 * so you flip all over the cube to solve any one thing.
 *
 * Solver ↔ manual lockstep: the rule TABLES below are the single source of
 * truth; the host solver and the expert manual both read them, so they can't
 * drift. The pure engine is exposed under module._test for the audit/UI tests.
 *
 * Contract: meta + mount + unmount. unmount() kills the countdown, audio and
 * the global key handler — no leaks (spec §1.3).
 */
(function (global) {
  "use strict";

  function t(k) {
    return (global.Spielecke && global.Spielecke.t) ? global.Spielecke.t(k) : k;
  }
  var esc = (global.Spielecke && global.Spielecke.esc)
    ? global.Spielecke.esc
    : function (s) { return String(s); };
  var shuffle = (global.Spielecke && global.Spielecke.shuffle)
    ? global.Spielecke.shuffle
    : function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
      };

  // ========================================================================
  // RULE TABLES — single source of truth (solver + manual both read these)
  // ========================================================================
  var STAGES = ["WIRES", "KEYPAD", "DIALS"];
  var SYMBOLS = ["Δ", "Ψ", "Ω", "Σ", "Φ", "Θ", "Λ", "Ξ", "Π"];
  var SYMBOL_TABLE = {
    A: ["Δ", "Ψ", "Ω"], B: ["Σ", "Φ", "Θ"], C: ["Λ", "Ξ", "Π"], D: ["Ψ", "Σ", "Λ"],
    E: ["Ω", "Θ", "Ξ"], F: ["Δ", "Φ", "Π"], G: ["Π", "Ω", "Σ"], H: ["Θ", "Λ", "Δ"]
  };
  var DECODER_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  // KEYPAD: after the row + SIG reversal, the serial's LAST DIGIT adds one more
  // key by grid position (or none). Forces the defuser to read the serial out.
  // 3×3 grid positions: 0 top-left, 2 top-right, 4 centre, 8 bottom-right.
  var KEYPAD_SUFFIX = { 0: -1, 1: -1, 2: 4, 3: 4, 4: 0, 5: 0, 6: 8, 7: 8, 8: 2, 9: 2 };
  var POS_NAME = { "-1": "(none)", "0": "top-left glyph", "2": "top-right glyph", "4": "centre glyph", "8": "bottom-right glyph" };
  var FIRING_SIGILS = { "❖": "WIRES", "◈": "WIRES", "✦": "KEYPAD", "⬡": "KEYPAD", "✺": "DIALS", "✪": "DIALS" };
  var SIGILS_BY_STAGE = { WIRES: ["❖", "◈"], KEYPAD: ["✦", "⬡"], DIALS: ["✺", "✪"] };
  var LETTER_BANK = (function () {
    var pattern = [2, 7, 4, 9, 1, 6, 3, 8, 0, 5], map = {};
    for (var i = 0; i < 26; i++) map[String.fromCharCode(65 + i)] = pattern[i % 10];
    return map;
  })();
  var COLORS = [
    { key: "red", hex: "#c0392b", label: "red" },
    { key: "blue", hex: "#2c6fbb", label: "blue" },
    { key: "yellow", hex: "#d4a017", label: "yellow" },
    { key: "green", hex: "#2e8b57", label: "green" },
    { key: "white", hex: "#e8e8e8", label: "white" }
  ];
  var COLOR_KEYS = COLORS.map(function (c) { return c.key; });
  function colorHex(key) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i].key === key) return COLORS[i].hex; return "#ccc"; }
  function colorName(key) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i].key === key) return COLORS[i].label; return key; }
  var INDICATORS = ["CLR", "SIG", "VNT"];

  // ========================================================================
  // BOMB GENERATION + SOLVING (pure — testable under Node via _test)
  // ========================================================================
  function rint(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rint(arr.length)]; }

  function generate() {
    var L1 = String.fromCharCode(65 + rint(26)), L2 = String.fromCharCode(65 + rint(26));
    var d1 = rint(10), d2 = rint(10);
    var serial = { letters: L1 + L2, d1: d1, d2: d2, text: L1 + L2 + "-" + d1 + d2 };
    var batteries = rint(5);
    var indicators = {}; INDICATORS.forEach(function (k) { indicators[k] = Math.random() < 0.5; });
    var colourKey = shuffle(COLOR_KEYS);
    var decoderLetter = pick(DECODER_LETTERS);
    var keypadLayout = shuffle(SYMBOLS);
    var wires = []; for (var i = 0; i < 5; i++) wires.push({ color: pick(COLOR_KEYS), number: 1 + rint(9) });
    var stageOrder = shuffle(STAGES);
    var sigils = stageOrder.map(function (st) { return pick(SIGILS_BY_STAGE[st]); });
    var bomb = { serial: serial, batteries: batteries, indicators: indicators, colourKey: colourKey, decoderLetter: decoderLetter, keypadLayout: keypadLayout, wires: wires, sigils: sigils };
    bomb.solution = solve(bomb);
    return bomb;
  }
  function solve(b) {
    var order = b.sigils.map(function (s) { return FIRING_SIGILS[s]; });
    if (b.serial.d2 % 2 === 0) order = order.slice().reverse();
    var sum = b.serial.d1 + b.serial.d2, a = sum % 10, bb = LETTER_BANK[b.serial.letters.charAt(0)];
    if (b.indicators.VNT) { var tmp = a; a = bb; bb = tmp; }
    var seq = SYMBOL_TABLE[b.decoderLetter].slice();
    if (b.indicators.SIG) seq.reverse();
    var suf = KEYPAD_SUFFIX[b.serial.d2];
    if (suf >= 0) seq.push(b.keypadLayout[suf]);
    return { order: order, dialA: a, dialB: bb, keypad: seq };
  }
  function solveWire(dials, b) {
    var channel = dials.a + dials.b;
    for (var i = 0; i < b.wires.length; i++) if (b.wires[i].number === channel) return i;
    var best = -1, bestP = 999;
    for (var j = 0; j < b.wires.length; j++) { var p = b.colourKey.indexOf(b.wires[j].color); if (p < bestP) { bestP = p; best = j; } }
    return best;
  }
  function audit(b) {
    var problems = [], sol = b.solution, seen = {};
    if (sol.order.length !== 3) problems.push("order length");
    sol.order.forEach(function (s) { if (STAGES.indexOf(s) < 0) problems.push("bad stage"); if (seen[s]) problems.push("dup"); seen[s] = true; });
    if (!(sol.dialA >= 0 && sol.dialA <= 9)) problems.push("dialA");
    if (!(sol.dialB >= 0 && sol.dialB <= 9)) problems.push("dialB");
    if (!sol.keypad.length) problems.push("keypad");
    sol.keypad.forEach(function (g) { if (SYMBOLS.indexOf(g) < 0) problems.push("glyph"); });
    var w = solveWire({ a: sol.dialA, b: sol.dialB }, b);
    if (!(w >= 0 && w < b.wires.length)) problems.push("wire");
    return { ok: problems.length === 0, problems: problems, wire: w };
  }

  // ========================================================================
  // Cube geometry — six slots on a real cube, random face arrangement
  // ========================================================================
  var SLOTS = ["F", "K", "R", "L", "U", "D"];
  var SLOT_TF = {
    F: "translateZ(calc(var(--zz-size)/2))",
    K: "rotateY(180deg) translateZ(calc(var(--zz-size)/2))",
    R: "rotateY(90deg) translateZ(calc(var(--zz-size)/2))",
    L: "rotateY(-90deg) translateZ(calc(var(--zz-size)/2))",
    U: "rotateX(90deg) translateZ(calc(var(--zz-size)/2))",
    D: "rotateX(-90deg) translateZ(calc(var(--zz-size)/2))"
  };
  // Outward normal of each slot in CSS axes (x right, y down, z toward viewer).
  var SLOT_NORMAL = { F: [0, 0, 1], K: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0], U: [0, -1, 0], D: [0, 1, 0] };
  var ID = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  function RY(s) { return s > 0 ? [[0, 0, 1], [0, 1, 0], [-1, 0, 0]] : [[0, 0, -1], [0, 1, 0], [1, 0, 0]]; }
  function RX(s) { return s > 0 ? [[1, 0, 0], [0, 0, -1], [0, 1, 0]] : [[1, 0, 0], [0, 0, 1], [0, -1, 0]]; }
  // Roll about the viewing axis (Z) — re-orients the current face's "up" when
  // the bomb is handed over sideways/upside down. s>0 = 90° clockwise on screen.
  function RZ(s) { return s > 0 ? [[0, -1, 0], [1, 0, 0], [0, 0, 1]] : [[0, 1, 0], [-1, 0, 0], [0, 0, 1]]; }
  function matMul(A, B) {
    var C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) { var s = 0; for (var k = 0; k < 3; k++) s += A[i][k] * B[k][j]; C[i][j] = s; }
    return C;
  }
  function applyVec(M, n) { return [M[0][0] * n[0] + M[0][1] * n[1] + M[0][2] * n[2], M[1][0] * n[0] + M[1][1] * n[1] + M[1][2] * n[2], M[2][0] * n[0] + M[2][1] * n[1] + M[2][2] * n[2]]; }
  function frontSlot(M) {
    for (var i = 0; i < SLOTS.length; i++) { var w = applyVec(M, SLOT_NORMAL[SLOTS[i]]); if (w[0] === 0 && w[1] === 0 && w[2] === 1) return SLOTS[i]; }
    return "F";
  }
  function cubeCss(M) {
    return "matrix3d(" + [M[0][0], M[1][0], M[2][0], 0, M[0][1], M[1][1], M[2][1], 0, M[0][2], M[1][2], M[2][2], 0, 0, 0, 0, 1].join(",") + ")";
  }
  // Push the cube back by half its size so the front-facing side sits at z=0:
  // no perspective scaling, exact size, no overflow onto the HUD — still a cube.
  function cubeTransform(M, extra) {
    return "translateZ(calc(var(--zz-size) / -2)) " + cubeCss(M) + (extra || "");
  }

  // ========================================================================
  // Module state
  // ========================================================================
  var DEFAULTS = { seconds: 270, sound: true };
  var DIFFICULTIES = [
    { id: "chill", label: "🌿 Rookie", seconds: 360 },
    { id: "standard", label: "💣 Standard", seconds: 270 },
    { id: "lethal", label: "💀 Lethal", seconds: 180 }
  ];
  var MAX_STRIKES = 3;
  // Multi-expert variation point: today a single expert holds the whole book.
  var EXPERT_ID = 1, EXPERT_COUNT = 1;

  var els = null, ctx = null, settings = null;
  var role = null, bomb = null;
  var assignment = {};       // slot -> logical face id
  var M = ID;                // cube orientation
  var activeFace = "core";   // logical face currently at front
  var dials = { a: 0, b: 0 };
  var entry = [], solved = {}, solvedCount = 0, strikes = 0, timeLeft = 0;
  var manualPages = [], manualIdx = 0;
  var timer = null, audio = null, keyHandler = null, busy = false, justDragged = false;

  var module = {
    meta: {
      id: "zeitzunder", name: "Zeitzünder",
      tagline: "One screen, one manual, the room in between. Talk fast — defuse together.",
      icon: "🧨", minPlayers: 2, supportsDrinking: false
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        seconds: parseInt(context.store.get("seconds", DEFAULTS.seconds), 10) || DEFAULTS.seconds,
        sound: context.store.get("sound", DEFAULTS.sound) !== false
      };
      role = null; renderRolePicker();
    },
    unmount: function () {
      stopTimer(); teardownAudio(); detachKeys();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; bomb = null; role = null;
      solved = {}; solvedCount = 0; strikes = 0; entry = []; busy = false; M = ID;
    }
  };

  // ========================================================================
  // Screen: role picker / setup
  // ========================================================================
  function renderRolePicker() {
    stopTimer(); detachKeys();
    var diffChips = DIFFICULTIES.map(function (d) { return '<button class="chip" data-diff="' + d.id + '">' + t(d.label) + "</button>"; }).join("");
    els.innerHTML =
      '<section class="screen game-setup zz-setup">' +
      '  <h2 class="screen-title pop">🧨 ' + t("Zeitzünder") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <p class="muted small">' + t("One screen is the bomb, the others are experts with the manual. The bomb-holder describes; the experts read the rules back. Nobody can win alone.") + "</p>" +
      '  <div class="zz-roles">' +
      '    <button id="zz-be-bomb" class="zz-role zz-role--bomb"><span class="zz-role__icon">💣</span><span class="zz-role__name">' + t("I'm the bomb") + "</span><span class=\"zz-role__hint\">" + t("This screen on the table (a MacBook). You poke it, you can't read the manual.") + "</span></button>" +
      '    <button id="zz-be-expert" class="zz-role zz-role--expert"><span class="zz-role__icon">📖</span><span class="zz-role__name">' + t("I'm an expert") + "</span><span class=\"zz-role__hint\">" + t("Open on your phone. You hold the manual, you never see the bomb.") + "</span></button>" +
      "  </div>" +
      '  <h3 class="sub">' + t("Fuse length") + "</h3>" +
      '  <div class="chip-row" id="zz-diffs">' + diffChips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="zz-sound"' + (settings.sound ? " checked" : "") + " /><span>" + t("🔊 Ticking & alarms") + "</span></label>" +
      '  <p class="muted small">' + t("Tip: works best with 2 players to learn it, then add experts and split the manual between them.") + "</p>" +
      "</section>";
    highlight("#zz-diffs", diffIdForSeconds(settings.seconds), "data-diff");
    els.querySelectorAll("#zz-diffs .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        var id = c.getAttribute("data-diff"), d = DIFFICULTIES.filter(function (x) { return x.id === id; })[0];
        settings.seconds = d ? d.seconds : DEFAULTS.seconds; ctx.store.set("seconds", settings.seconds);
        highlight("#zz-diffs", id, "data-diff");
      });
    });
    els.querySelector("#zz-sound").addEventListener("change", function (e) { settings.sound = e.target.checked; ctx.store.set("sound", settings.sound); });
    els.querySelector("#zz-be-bomb").addEventListener("click", function () { role = "host"; newBomb(); });
    els.querySelector("#zz-be-expert").addEventListener("click", function () { role = "expert"; renderManual(); });
  }
  function diffIdForSeconds(s) { for (var i = 0; i < DIFFICULTIES.length; i++) if (DIFFICULTIES[i].seconds === s) return DIFFICULTIES[i].id; return "standard"; }

  // ========================================================================
  // HOST: build a fresh bomb and render the cube
  // ========================================================================
  function newBomb() {
    bomb = generate();
    // Randomise which face lives on which side of the cube — no memorising.
    var faces = shuffle(["core", "wires", "keypad", "dials", "guts", "decoder"]);
    assignment = {}; SLOTS.forEach(function (s, i) { assignment[s] = faces[i]; });
    M = ID; activeFace = assignment.F;
    dials = { a: 0, b: 0 }; entry = []; solved = {}; solvedCount = 0; strikes = 0;
    timeLeft = settings.seconds; busy = false;
    renderBomb();
  }

  function renderBomb() {
    var facesHtml = SLOTS.map(function (slot) {
      var lid = assignment[slot];
      return '<div class="zz-face" data-face="' + lid + '" data-slot="' + slot + '" style="transform:' + SLOT_TF[slot] + '">' +
        '<div class="zz-plate">' + screws() + faceContent(lid) + "</div></div>";
    }).join("");

    els.innerHTML =
      '<section class="screen zz-bomb">' +
      hudHtml() +
      '  <div class="zz-stage">' +
      '    <button class="zz-flip zz-roll" data-flip="roll" aria-label="' + t("Rotate 90° clockwise") + '">↻</button>' +
      '    <button class="zz-flip zz-flip--up" data-flip="up" aria-label="' + t("Flip up") + '">▲</button>' +
      '    <button class="zz-flip zz-flip--left" data-flip="left" aria-label="' + t("Flip left") + '">◀</button>' +
      '    <div class="zz-rig" id="zz-rig"><div class="zz-cube" id="zz-cube">' + facesHtml + "</div></div>" +
      '    <button class="zz-flip zz-flip--right" data-flip="right" aria-label="' + t("Flip right") + '">▶</button>' +
      '    <button class="zz-flip zz-flip--down" data-flip="down" aria-label="' + t("Flip down") + '">▼</button>' +
      "  </div>" +
      '  <button id="zz-quit" class="zz-quit" aria-label="' + t("Abort") + '">✕</button>' +
      "</section>";

    attachBomb();
    applyCube(false);
    setupAudio();
    startTimer();
    updateLeds();
  }

  function screws() {
    return '<i class="zz-screw zz-screw--tl"></i><i class="zz-screw zz-screw--tr"></i><i class="zz-screw zz-screw--bl"></i><i class="zz-screw zz-screw--br"></i>';
  }

  // --- HUD (timer + strikes — pressure, not guidance) ----------------------
  function hudHtml() {
    return '<div class="zz-hud" id="zz-hud"><div class="zz-timer" id="zz-timer">' + fmt(timeLeft) + '</div><div class="zz-strikes" id="zz-strikes">' + strikeDots() + "</div></div>";
  }
  function strikeDots() { var o = ""; for (var i = 0; i < MAX_STRIKES; i++) o += '<span class="zz-x' + (i < strikes ? " is-lit" : "") + '">✕</span>'; return o; }

  // --- Face contents (NO titles, NO labels — the defuser is lost) ----------
  function faceContent(lid) {
    if (lid === "core") return coreFace();
    if (lid === "wires") return wiresFace();
    if (lid === "keypad") return keypadFace();
    if (lid === "dials") return dialsFace();
    if (lid === "guts") return gutsFace();
    if (lid === "decoder") return decoderFace();
    return "";
  }
  function coreFace() {
    var sig = bomb.sigils.map(function (s) { return '<span class="zz-sigil">' + s + "</span>"; }).join("");
    var leds = STAGES.map(function (st) { return '<span class="zz-led" data-stage="' + st + '"><i></i></span>'; }).join("");
    return '<div class="zz-coreface">' +
      '<div class="zz-serial">' + esc(bomb.serial.text) + "</div>" +
      '<div class="zz-sigrow">' + sig + "</div>" +
      '<div class="zz-ledrow">' + leds + "</div></div>";
  }
  function wiresFace() {
    var w = bomb.wires.map(function (wire, i) {
      return '<button class="zz-wire" data-i="' + i + '"><span class="zz-wire__bolt"></span><span class="zz-wire__line" style="background:' + colorHex(wire.color) + '"></span><span class="zz-wire__num">' + wire.number + "</span></button>";
    }).join("");
    return '<div class="zz-wires" id="zz-wires">' + w + "</div>";
  }
  function keypadFace() {
    var grid = bomb.keypadLayout.map(function (g, pos) { return '<button class="zz-key" data-glyph="' + esc(g) + '" data-pos="' + pos + '">' + g + "</button>"; }).join("");
    return '<div class="zz-keypad">' +
      '<div class="zz-keys" id="zz-keys">' + grid + "</div>" +
      '<div class="zz-entry" id="zz-entry"></div>' +
      '<div class="zz-keyactions"><button id="zz-key-clear" class="zz-mini" aria-label="clear">✕</button><button id="zz-key-submit" class="zz-mini zz-mini--go" aria-label="submit">✓</button></div></div>';
  }
  function dialsFace() {
    return '<div class="zz-dialface"><div class="zz-dials">' + dialHtml("a") + dialHtml("b") + "</div>" +
      '<button id="zz-dial-confirm" class="zz-mini zz-mini--go" aria-label="confirm">✓</button></div>';
  }
  function dialHtml(which) {
    return '<div class="zz-dial"><button class="zz-dial__btn" data-dial="' + which + '" data-dir="1">▲</button>' +
      '<div class="zz-dial__val" id="zz-dial-' + which + '">' + dials[which] + "</div>" +
      '<button class="zz-dial__btn" data-dial="' + which + '" data-dir="-1">▼</button>' +
      '<div class="zz-dial__lbl">' + (which === "a" ? "A" : "B") + "</div></div>";
  }
  function gutsFace() {
    var batt = ""; for (var i = 0; i < 4; i++) batt += '<span class="zz-batt' + (i < bomb.batteries ? " is-on" : "") + '"></span>';
    var inds = INDICATORS.map(function (k) { return '<span class="zz-ind' + (bomb.indicators[k] ? " is-lit" : "") + '">' + k + "</span>"; }).join("");
    return '<div class="zz-gutsface"><div class="zz-batts">' + batt + "</div><div class=\"zz-inds\">" + inds + "</div></div>";
  }
  function decoderFace() {
    var key = bomb.colourKey.map(function (c, i) { return '<span class="zz-ckey"><b>' + (i + 1) + '</b><i style="background:' + colorHex(c) + '"></i></span>'; }).join("");
    return '<div class="zz-decoderface"><div class="zz-letter">' + bomb.decoderLetter + '</div><div class="zz-ckeys">' + key + "</div></div>";
  }

  // --- Wiring & cube control ----------------------------------------------
  function attachBomb() {
    els.querySelectorAll("#zz-wires .zz-wire").forEach(function (b) { b.addEventListener("click", function () { if (!justDragged) attemptCut(parseInt(b.getAttribute("data-i"), 10)); }); });
    els.querySelectorAll("#zz-keys .zz-key").forEach(function (b) { b.addEventListener("click", function () { if (!justDragged) keypadPress(b.getAttribute("data-glyph")); }); });
    var kc = els.querySelector("#zz-key-clear"); if (kc) kc.addEventListener("click", function () { if (justDragged) return; entry = []; updateEntry(); });
    var ks = els.querySelector("#zz-key-submit"); if (ks) ks.addEventListener("click", function () { if (!justDragged) attemptKeypad(); });
    els.querySelectorAll(".zz-dial__btn").forEach(function (b) {
      b.addEventListener("click", function () {
        if (justDragged || solved.DIALS) return;
        var which = b.getAttribute("data-dial"), dir = parseInt(b.getAttribute("data-dir"), 10);
        dials[which] = (dials[which] + dir + 10) % 10;
        var v = els.querySelector("#zz-dial-" + which); if (v) v.textContent = dials[which];
        blip(620);
      });
    });
    var dc = els.querySelector("#zz-dial-confirm"); if (dc) dc.addEventListener("click", function () { if (!justDragged) attemptDials(); });
    els.querySelector("#zz-quit").addEventListener("click", renderRolePicker);
    els.querySelectorAll(".zz-flip").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.getAttribute("data-flip");
        rotate(d === "right" ? RY(-1) : d === "left" ? RY(1) : d === "up" ? RX(1) : d === "down" ? RX(-1) : RZ(1));
      });
    });
    attachDrag(els.querySelector("#zz-rig"));
    attachKeys();
    updateEntry();
  }

  function applyCube(animate) {
    var cube = els && els.querySelector("#zz-cube");
    if (!cube) return;
    if (!animate) cube.style.transition = "none";
    cube.style.transform = cubeTransform(M);
    if (!animate) { void cube.offsetWidth; cube.style.transition = ""; }
    var fs = frontSlot(M);
    activeFace = assignment[fs];
    els.querySelectorAll(".zz-face").forEach(function (f) { f.classList.toggle("is-front", f.getAttribute("data-slot") === fs); });
  }
  function rotate(rmat) { M = matMul(rmat, M); applyCube(true); clack(); }

  function attachDrag(rig) {
    if (!rig) return;
    var sx = 0, sy = 0, active = false, moved = false;
    var cube = els.querySelector("#zz-cube");
    rig.addEventListener("pointerdown", function (e) { active = true; moved = false; sx = e.clientX; sy = e.clientY; });
    rig.addEventListener("pointermove", function (e) {
      if (!active) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.sqrt(dx * dx + dy * dy) > 6) { moved = true; cube.style.transition = "none"; els.querySelectorAll(".zz-face").forEach(function (f) { f.style.pointerEvents = "none"; }); }
      if (moved) cube.style.transform = cubeTransform(M, " rotateY(" + (dx * 0.4) + "deg) rotateX(" + (-dy * 0.4) + "deg)");
    });
    function end(e) {
      if (!active) return; active = false;
      cube.style.transition = "";
      els.querySelectorAll(".zz-face").forEach(function (f) { f.style.pointerEvents = ""; });
      if (!moved) return;
      justDragged = true; setTimeout(function () { justDragged = false; }, 60);
      var dx = (e.clientX || sx) - sx, dy = (e.clientY || sy) - sy;
      if (Math.abs(dx) >= Math.abs(dy)) { if (Math.abs(dx) > 34) rotate(RY(dx > 0 ? 1 : -1)); else applyCube(true); }
      else { if (Math.abs(dy) > 34) rotate(RX(dy > 0 ? 1 : -1)); else applyCube(true); }
    }
    rig.addEventListener("pointerup", end);
    rig.addEventListener("pointercancel", end);
    rig.addEventListener("pointerleave", end);
    rig.addEventListener("click", function (e) { if (justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  }

  function attachKeys() {
    detachKeys();
    keyHandler = function (e) {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) < 0) return;
      e.preventDefault();
      if (e.key === "ArrowRight") rotate(RY(-1));
      else if (e.key === "ArrowLeft") rotate(RY(1));
      else if (e.key === "ArrowUp") rotate(RX(1));
      else rotate(RX(-1));
    };
    global.addEventListener("keydown", keyHandler);
  }
  function detachKeys() { if (keyHandler) { global.removeEventListener("keydown", keyHandler); keyHandler = null; } }

  // ========================================================================
  // Stage attempts
  // ========================================================================
  function nextStage() { return bomb.solution.order[solvedCount]; }
  function attemptCut(i) {
    if (busy || solved.WIRES) return;
    if (nextStage() !== "WIRES") { strike("seq"); return; }
    busy = true;
    var btn = els.querySelector('#zz-wires .zz-wire[data-i="' + i + '"]');
    if (solveWire(dials, bomb) === i) { if (btn) btn.classList.add("is-cut"); solveStage("WIRES"); }
    else { if (btn) { btn.classList.add("is-bad"); setTimeout(function () { if (btn) btn.classList.remove("is-bad"); }, 600); } strike("wrong"); }
    setTimeout(function () { busy = false; }, 450);
  }
  function keypadPress(g) { if (solved.KEYPAD) return; entry.push(g); updateEntry(); blip(880); }
  function updateEntry() {
    var box = els && els.querySelector("#zz-entry"); if (!box) return;
    box.innerHTML = entry.length ? entry.map(function (g) { return "<span>" + g + "</span>"; }).join("") : '<span class="zz-entry__dot"></span><span class="zz-entry__dot"></span><span class="zz-entry__dot"></span>';
  }
  function attemptKeypad() {
    if (solved.KEYPAD) return;
    if (nextStage() !== "KEYPAD") { strike("seq"); entry = []; updateEntry(); return; }
    if (arraysEqual(entry, bomb.solution.keypad)) solveStage("KEYPAD");
    else { strike("wrong"); entry = []; updateEntry(); }
  }
  function attemptDials() {
    if (solved.DIALS) return;
    if (nextStage() !== "DIALS") { strike("seq"); return; }
    if (dials.a === bomb.solution.dialA && dials.b === bomb.solution.dialB) solveStage("DIALS");
    else strike("wrong");
  }
  function solveStage(name) {
    if (solved[name]) return;
    solved[name] = true; solvedCount++; chime(); updateLeds(); disableFace(name); flashFace(name);
    if (solvedCount >= STAGES.length) defused();
  }
  function disableFace(name) {
    if (name === "WIRES") els.querySelectorAll("#zz-wires .zz-wire").forEach(function (b) { b.disabled = true; });
    else if (name === "KEYPAD") { els.querySelectorAll("#zz-keys .zz-key").forEach(function (b) { b.disabled = true; }); var s = els.querySelector("#zz-key-submit"), c = els.querySelector("#zz-key-clear"); if (s) s.disabled = true; if (c) c.disabled = true; }
    else if (name === "DIALS") { els.querySelectorAll(".zz-dial__btn").forEach(function (b) { b.disabled = true; }); var d = els.querySelector("#zz-dial-confirm"); if (d) d.disabled = true; }
  }
  function flashFace(name) {
    var lid = name === "WIRES" ? "wires" : name === "KEYPAD" ? "keypad" : "dials";
    var f = els.querySelector('.zz-face[data-face="' + lid + '"]'); if (f) f.classList.add("is-solved");
  }
  function updateLeds() { els.querySelectorAll(".zz-led").forEach(function (l) { l.classList.toggle("is-on", !!solved[l.getAttribute("data-stage")]); }); }

  // ========================================================================
  // Strikes, timer, end states
  // ========================================================================
  function strike(kind) {
    strikes++;
    var s = els.querySelector("#zz-strikes"); if (s) s.innerHTML = strikeDots();
    var hud = els.querySelector("#zz-hud"); if (hud) { hud.classList.remove("zz-flash"); void hud.offsetWidth; hud.classList.add("zz-flash"); }
    toast(kind === "seq" ? t("✋ Out of sequence!") : t("✕ Wrong — strike!"));
    strikeSound();
    if (strikes >= MAX_STRIKES) { boom(); return; }
    timeLeft = Math.max(1, timeLeft - 15); updateTimer();
  }
  function toast(msg) {
    var old = els.querySelector(".zz-toast"); if (old) old.parentNode.removeChild(old);
    var d = document.createElement("div"); d.className = "zz-toast"; d.textContent = msg;
    var sec = els.querySelector(".zz-bomb"); if (sec) sec.appendChild(d);
    setTimeout(function () { if (d && d.parentNode) d.parentNode.removeChild(d); }, 1100);
  }
  function startTimer() {
    stopTimer();
    timer = global.setInterval(function () {
      timeLeft--; updateTimer();
      if (timeLeft <= 10 && timeLeft > 0) tick();
      if (timeLeft <= 0) boom();
    }, 1000);
  }
  function stopTimer() { if (timer) { global.clearInterval(timer); timer = null; } }
  function updateTimer() { var el = els && els.querySelector("#zz-timer"); if (!el) return; el.textContent = fmt(Math.max(0, timeLeft)); el.classList.toggle("is-danger", timeLeft <= 30); }

  function boom() {
    stopTimer(); boomSound(); buzz([120, 60, 200]);
    els.innerHTML =
      '<section class="screen zz-end zz-boom"><div class="boom-flash">💥</div><h2 class="boom-title">' + t("BOOM!") + "</h2>" +
      '<p class="boom-sub">' + (timeLeft <= 0 ? t("⏱️ Time ran out.") : t("💥 Three strikes. The wire was wrong.")) + "</p>" +
      '<div class="boom-actions"><button id="zz-retry" class="btn btn-primary btn-block btn-xl">' + t("New bomb 🔁") + '</button><button id="zz-setup" class="btn btn-block">' + t("Change settings") + "</button></div></section>";
    els.querySelector("#zz-retry").addEventListener("click", newBomb);
    els.querySelector("#zz-setup").addEventListener("click", renderRolePicker);
  }
  function defused() {
    stopTimer(); defuseSound();
    els.innerHTML =
      '<section class="screen zz-end zz-defused"><div class="boom-flash">🎉</div><h2 class="result-title pop">' + t("DEFUSED!") + "</h2>" +
      '<p class="result-sub">' + t("Cut it with {time} left and {n} strikes.").replace("{time}", fmt(Math.max(0, timeLeft))).replace("{n}", strikes) + "</p>" +
      '<div class="stack"><button id="zz-again" class="btn btn-primary btn-block btn-xl">' + t("Next bomb 🔁") + '</button><button id="zz-setup2" class="btn btn-block">' + t("Change settings") + "</button></div></section>";
    els.querySelector("#zz-again").addEventListener("click", newBomb);
    els.querySelector("#zz-setup2").addEventListener("click", renderRolePicker);
  }

  // ========================================================================
  // EXPERT: the manual (real rules + bureaucratic spam to dig through)
  // ========================================================================
  // The manual is a physical BOOKLET you flip through one page at a time — a
  // cover, then chapters. expertId/expertCount are the variation point: later,
  // different experts get different subsets of the pages (see buildBook).
  function renderManual() {
    stopTimer(); detachKeys();
    manualPages = buildBook(EXPERT_ID, EXPERT_COUNT);
    manualIdx = 0;
    var leaves = manualPages.map(function (p, i) { return leafHtml(p, i, manualPages.length); }).join("");
    els.innerHTML =
      '<section class="screen zz-manual">' +
      '  <div class="zz-bookrow">' +
      '    <button id="zz-prev" class="zz-bookbtn" aria-label="' + t("Previous page") + '">‹</button>' +
      '    <div class="zz-book" id="zz-book">' + leaves + "</div>" +
      '    <button id="zz-next" class="zz-bookbtn" aria-label="' + t("Next page") + '">›</button>' +
      "  </div>" +
      "</section>";
    var book = els.querySelector("#zz-book");
    book.querySelector('.zz-leaf[data-idx="0"]').classList.add("is-current");
    updatePager();
    els.querySelector("#zz-prev").addEventListener("click", function () { turn(-1); });
    els.querySelector("#zz-next").addEventListener("click", function () { turn(1); });
    attachManualNav(book);
  }

  function leafHtml(p, i, n) {
    if (p.cover) return coverLeaf(i);
    return '<div class="zz-leaf" data-idx="' + i + '"><div class="zz-paper' + (p.spam ? " zz-paper--spam" : "") + '">' +
      (p.postit ? postitHtml() : "") +
      '<h3 class="zz-paper__h">' + p.icon + " " + t(p.title) + "</h3>" +
      (p.coffee ? '<div class="zz-coffeewrap">' + p.html + '<div class="zz-coffee">' + coffeeSvg() + "</div></div>" : p.html) +
      '</div><div class="zz-pagenum">' + i + " / " + (n - 1) + "</div></div>";
  }
  function coverLeaf(i) {
    return '<div class="zz-leaf" data-idx="' + i + '"><div class="zz-cover">' +
      '<div class="zz-stamp">' + t("TOP SECRET") + "</div>" +
      '<div class="zz-cover__art">🧨📖</div>' +
      '<div class="zz-cover__title">' + t("Defusal Manual") + "</div>" +
      '<div class="zz-cover__expert">' + t("Expert {n}").replace("{n}", EXPERT_ID) + "</div>" +
      '<div class="zz-cover__warn">⏱️ ' + t("Do not open until the timer starts.") + "</div>" +
      '<div class="zz-cover__hint">' + t("Tap ▶ or swipe to flip through.") + "</div>" +
      "</div></div>";
  }
  function postitHtml() {
    return '<div class="zz-postit"><span class="zz-postit__l">' + t("Today's code") + '</span><b>4 7 2 9</b><span class="zz-postit__s">' + t("do not share") + "</span></div>";
  }
  // A real spilled-coffee splatter: smooth brown blobs roughened into organic,
  // jagged edges + speckle by an SVG turbulence/displacement filter. Dark pooled
  // centre, lighter halo, droplets flung outward. No image asset — pure static.
  function coffeeSvg() {
    return '<svg class="zz-coffee-svg" viewBox="0 0 240 170" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs><filter id="zzcoffee" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves="3" seed="11" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G"/>' +
      "</filter></defs>" +
      '<g filter="url(#zzcoffee)">' +
      // translucent soaked halo (lets edge text show faintly)
      '<g fill="#9a6630" fill-opacity="0.4"><ellipse cx="120" cy="86" rx="98" ry="62"/><ellipse cx="40" cy="66" rx="28" ry="22"/><ellipse cx="202" cy="104" rx="28" ry="24"/></g>' +
      // dense body
      '<g fill="#683c18" fill-opacity="0.9"><ellipse cx="120" cy="86" rx="78" ry="48"/><ellipse cx="72" cy="96" rx="32" ry="26"/><ellipse cx="170" cy="78" rx="32" ry="26"/></g>' +
      // near-opaque pooled centre (this is what makes text unreadable)
      '<g fill="#341d07" fill-opacity="0.97"><ellipse cx="118" cy="88" rx="50" ry="33"/><ellipse cx="146" cy="80" rx="22" ry="16"/><ellipse cx="92" cy="94" rx="20" ry="15"/></g>' +
      '<g fill="#1d0f02" fill-opacity="0.85"><circle cx="120" cy="90" r="2.6"/><circle cx="134" cy="96" r="1.8"/><circle cx="106" cy="82" r="1.6"/><circle cx="146" cy="92" r="1.5"/><circle cx="112" cy="100" r="1.7"/></g>' +
      "</g>" +
      '<g filter="url(#zzcoffee)" fill="#3a2208" fill-opacity="0.9">' +
      '<circle cx="220" cy="34" r="5"/><circle cx="231" cy="54" r="2.6"/>' +
      '<ellipse cx="22" cy="44" rx="7" ry="3" transform="rotate(20 22 44)"/><circle cx="12" cy="60" r="2.6"/>' +
      '<circle cx="58" cy="158" r="6"/><circle cx="76" cy="164" r="2.6"/><circle cx="42" cy="162" r="2.2"/>' +
      '<circle cx="210" cy="150" r="4.5"/><circle cx="226" cy="136" r="2.2"/><circle cx="180" cy="16" r="3"/>' +
      "</g></svg>";
  }

  // Pages for a given expert. Today: one expert holds the whole book. The hook
  // is here so multi-expert can deal disjoint chapter sets later.
  function buildBook(expertId, expertCount) {
    return [
      { cover: true },
      { icon: "📘", title: "Annex I — Foreword & Legal Notice", spam: true, html: manualForeword() },
      { icon: "🧭", title: "Ch. 1 — How to defuse", html: manualHowTo() },
      { icon: "⚠️", title: "Annex II — Safety Instructions", spam: true, html: manualSafety() },
      { icon: "🧩", title: "Ch. 2 — Firing order", html: manualOrder() },
      { icon: "📜", title: "Annex III — Data Protection (GDPR)", spam: true, postit: true, html: manualGdpr() },
      { icon: "🎛️", title: "Ch. 3 — Dials", html: manualDials() },
      { icon: "🧴", title: "Annex IV — Maintenance & Care", spam: true, html: manualMaintenance() },
      { icon: "🔌", title: "Wire-Cutting Reference Card", coffee: true, html: manualWiresRuined() },
      { icon: "🔡", title: "Ch. 4 — Keypad", html: manualKeypad() },
      { icon: "🧾", title: "Annex V — Warranty & Liability", spam: true, html: manualWarranty() },
      { icon: "🔎", title: "Ch. 5 — Reading the bomb", html: manualRef() },
      { icon: "🛠️", title: "Annex VI — Troubleshooting", spam: true, html: manualTroubleshoot() },
      { icon: "🔌", title: "Ch. 6 — Wires (full procedure)", html: manualWires() },
      { icon: "♻️", title: "Annex VII — Disposal, Conformity & Index", spam: true, html: manualDisposal() }
    ];
  }

  // --- Page turning --------------------------------------------------------
  function turn(dir) {
    var n = manualPages.length;
    var idx = Math.min(n - 1, Math.max(0, manualIdx + dir));
    if (idx === manualIdx) return;
    showPage(idx, dir);
  }
  function showPage(idx, dir) {
    var book = els && els.querySelector("#zz-book"); if (!book) return;
    var cur = book.querySelector(".zz-leaf.is-current");
    var next = book.querySelector('.zz-leaf[data-idx="' + idx + '"]');
    if (!next || cur === next) return;
    if (cur) {
      cur.classList.remove("is-current");
      cur.classList.add(dir > 0 ? "is-out-fwd" : "is-out-back");
      (function (c) { setTimeout(function () { c.classList.remove("is-out-fwd", "is-out-back"); }, 430); })(cur);
    }
    next.classList.remove("is-out-fwd", "is-out-back");
    next.classList.add("is-current");
    manualIdx = idx;
    updatePager();
    blip(760);
  }
  function updatePager() {
    var pc = els.querySelector("#zz-pagecount"), prev = els.querySelector("#zz-prev"), next = els.querySelector("#zz-next");
    if (pc) pc.textContent = manualIdx === 0 ? t("Cover") : (manualIdx + " / " + (manualPages.length - 1));
    if (prev) prev.disabled = manualIdx === 0;
    if (next) next.disabled = manualIdx === manualPages.length - 1;
  }
  function attachManualNav(book) {
    keyHandler = function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); turn(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); turn(-1); }
    };
    global.addEventListener("keydown", keyHandler);
    var sx = 0, sy = 0, active = false;
    book.addEventListener("pointerdown", function (e) { active = true; sx = e.clientX; sy = e.clientY; });
    function up(e) {
      if (!active) return; active = false;
      var dx = (e.clientX || sx) - sx, dy = (e.clientY || sy) - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1);
    }
    book.addEventListener("pointerup", up);
    book.addEventListener("pointercancel", up);
  }
  function manualHowTo() {
    return "<ol class='zz-steps'>" +
      "<li>" + t("Three jobs live on the device: <b>Wires</b>, <b>Keypad</b>, <b>Dials</b>. They must be committed in the right ORDER — see Firing Order.") + "</li>" +
      "<li>" + t("Every job reads values off OTHER faces. The defuser can't read this manual and you can't see the bomb — so make them flip the cube around and describe what they see.") + "</li>" +
      "<li>" + t("A wrong action, or acting out of order, is a strike. Three strikes — or the clock hitting zero — and it blows.") + "</li>" +
      "</ol>" +
      "<p class='zz-fine'>" + t("Read each instruction aloud and confirm it with the operator before it is carried out. Retain this manual for the duration of the engagement.") + "</p>";
  }
  function manualGdpr() {
    return "<p class='zz-fine'>" + t("In accordance with Regulation (EU) 2016/679 (GDPR), this Ordnance Device (\"the Controller\") processes the following categories of personal data of the End User (\"the Defuser\"): fingerprints, ambient panic levels, and last words.") + "</p>" +
      "<p class='zz-fine'>" + t("Lawful basis for processing is Art. 6(1)(d) — protection of the vital interests of the data subject, which the Controller notes are time-limited. You have the right to access, rectify and erase your data, provided the request is submitted in triplicate before detonation.") + "</p>" +
      "<p class='zz-fine'>" + t("Data may be transferred to third parties (next of kin, bomb disposal, the group chat). By continuing to hold the device you consent to cookies. 🍪") + "</p>" +
      "<p class='zz-fine muted'>" + t("(This chapter contains no defusal information. It is here to waste your time. The clock is still running.)") + "</p>";
  }
  function manualOrder() {
    var rows = Object.keys(FIRING_SIGILS).map(function (s) { return "<tr><td class='zz-sig'>" + s + "</td><td>" + t(stageLabel(FIRING_SIGILS[s])) + "</td></tr>"; }).join("");
    return "<p class='zz-fine'>" + t("The firing sequence is fixed at manufacture and cannot be reordered in the field.") + "</p>" +
      "<p>" + t("One face shows three sigils in a row. Translate each to a job, left to right — that's the order to commit them in.") + "</p>" +
      "<table class='zz-table'><thead><tr><th>" + t("Sigil") + "</th><th>" + t("Job") + "</th></tr></thead><tbody>" + rows + "</tbody></table>" +
      "<p class='zz-warn'>⚠ " + t("If the LAST digit of the serial is EVEN, reverse the order (read the sigils right to left).") + "</p>" +
      "<p class='zz-fine'>" + t("Note: committing a stage out of sequence is logged as a fault and cannot be undone.") + "</p>";
  }
  function manualDials() {
    var cells = "";
    for (var i = 0; i < 26; i++) { var L = String.fromCharCode(65 + i); cells += "<span class='zz-bankcell'><b>" + L + "</b>" + LETTER_BANK[L] + "</span>"; }
    return "<p class='zz-fine'>" + t("Each dial is a single-digit rotary encoder (0–9) with a detent at every position.") + "</p>" +
      "<p>" + t("Two dials, A and B (0–9 each).") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("<b>Dial A</b> = the two serial digits added together, then keep only the last digit (e.g. 7+8=15 → 5).") + "</li>" +
      "<li>" + t("<b>Dial B</b> = the serial's FIRST letter, looked up in the Letter Bank below.") + "</li>" +
      "<li class='zz-warn'>⚠ " + t("If indicator VNT is lit, SWAP the two targets (A takes B's number, B takes A's).") + "</li>" +
      "</ul><div class='zz-bank'>" + cells + "</div>" +
      "<p class='zz-fine'>" + t("Dials are factory-calibrated; field recalibration requires tools not supplied with this unit.") + "</p>";
  }
  function manualWires() {
    return "<p class='zz-fine'>" + t("Complete wire-cutting procedure. This chapter supersedes the quick-reference card.") + "</p>" +
      "<p>" + t("Five wires, each with a colour and a printed number.") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("First make sure the Dials are set to their targets. <b>Channel</b> = Dial A + Dial B.") + "</li>" +
      "<li>" + t("If a wire's NUMBER equals the Channel, cut it. (If several match, the leftmost.)") + "</li>" +
      "<li>" + t("Otherwise, cut the wire whose COLOUR is highest on the Decoder's colour-priority list (1 = highest). Ties → leftmost.") + "</li>" +
      "</ul><p class='muted small'>" + t("The cut reads the dials LIVE, so the dials must be right even if Wires comes first in the order.") + "</p>" +
      "<p class='zz-fine'>" + t("After cutting, do not re-strip or re-seat any severed conductor.") + "</p>";
  }
  // A DECOY: a believable wire quick-reference, but a coffee spill has soaked
  // the lower steps into illegibility. The complete procedure is in Ch. 6.
  function manualWiresRuined() {
    return "<p>" + t("Wire-cutting procedure (quick reference):") + "</p>" +
      "<ol class='zz-steps'>" +
      "<li>" + t("Set both dials to their target values and add them together to read the channel.") + "</li>" +
      "<li>" + t("Locate the wire whose printed number equals the channel; that is the wire to cut.") + "</li>" +
      "<li>" + t("If no number matches, use the colour-priority order: cut the highest-ranked colour present.") + "</li>" +
      "<li>" + t("Confirm the cut against the firing order before severing the wire.") + "</li>" +
      "</ol>" +
      "<p class='zz-fine'>" + t("Full procedure: Chapter 6.") + "</p>";
  }
  function manualWarranty() {
    return "<p class='zz-fine'>" + t("This device is sold AS-IS with no warranty of merchantability or fitness for a particular detonation. The manufacturer is not liable for incidental, consequential, or pyrotechnic damages.") + "</p>" +
      "<ul class='zz-rules'><li class='zz-fine'>" + t("Warranty void if device is opened, submerged, defused, or detonated.") + "</li>" +
      "<li class='zz-fine'>" + t("For support, please hold. Estimated wait time: longer than you have.") + "</li>" +
      "<li class='zz-fine'>" + t("Some assembly was required. We did not do it.") + "</li></ul>" +
      "<p class='zz-fine muted'>" + t("(Still no defusal information here. Flip back two chapters.)") + "</p>";
  }
  function manualKeypad() {
    var rows = DECODER_LETTERS.map(function (L) { return "<tr><td><b>" + L + "</b></td><td class='zz-glyphs'>" + SYMBOL_TABLE[L].map(function (g) { return "<span>" + g + "</span>"; }).join("") + "</td></tr>"; }).join("");
    return "<p class='zz-fine'>" + t("The keypad uses a non-standard glyph set for tamper resistance; positions are randomised per unit. Identify glyphs by shape, not location.") + "</p>" +
      "<p>" + t("Nine glyphs, scrambled. Press a sequence, then ✓.") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("Read the Decoder LETTER. Find its row in the Sequence table → press those glyphs in order.") + "</li>" +
      "<li class='zz-warn'>⚠ " + t("If indicator SIG is lit, press them in REVERSE order.") + "</li>" +
      "<li class='zz-warn'>⚠ " + t("Then read the serial's LAST DIGIT and press ONE final glyph by its grid position (table below).") + "</li>" +
      "</ul>" +
      "<table class='zz-table'><thead><tr><th>" + t("Last digit") + "</th><th>" + t("Final key") + "</th></tr></thead><tbody>" + keypadSuffixRows() + "</tbody></table>" +
      "<table class='zz-table'><thead><tr><th>" + t("Letter") + "</th><th>" + t("Sequence") + "</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }
  // Build the serial-suffix table straight from KEYPAD_SUFFIX so the manual can
  // never drift from the solver: group consecutive last-digits with the same key.
  function keypadSuffixRows() {
    var out = [], start = 0;
    for (var d = 0; d <= 9; d++) {
      if (d === 9 || KEYPAD_SUFFIX[d + 1] !== KEYPAD_SUFFIX[d]) {
        var label = start === d ? ("" + start) : (start + "–" + d);
        out.push("<tr><td><b>" + label + "</b></td><td>" + t(POS_NAME["" + KEYPAD_SUFFIX[d]]) + "</td></tr>");
        start = d + 1;
      }
    }
    return out.join("");
  }
  function manualRef() {
    return "<p class='zz-fine'>" + t("All indicators, labels and codes are printed at manufacture and are read-only.") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("<b>Serial</b>: two letters + two digits, e.g. KQ-37. Its digits and last digit drive the Dials, the Firing order AND the Keypad — keep it handy.") + "</li>" +
      "<li>" + t("<b>Indicators</b>: SIG affects the Keypad, VNT affects the Dials.") + " <span class='zz-warn'>" + t("CLR does NOTHING — it's a decoy.") + "</span></li>" +
      "<li>" + t("<b>Batteries</b>: 0–4 little cells.") + " <span class='zz-warn'>" + t("A decoy — no rule uses them.") + "</span></li>" +
      "<li>" + t("<b>Decoder</b>: a big letter A–H and a numbered list of colour swatches (the colour priority).") + "</li>" +
      "</ul>";
  }

  // --- Spam annexes (deadpan boilerplate to dig through) -------------------
  function manualForeword() {
    return "<p class='zz-fine'>" + t("Thank you for choosing this Ordnance Device. Please read this manual carefully and keep it for future reference.") + "</p>" +
      "<p class='zz-fine'>" + t("All specifications are subject to change without notice. Illustrations are not to scale. The actual device may differ from the unit described.") + "</p>" +
      "<p class='zz-fine'>" + t("Reproduction of this manual, in whole or in part, without written permission is prohibited.") + "</p>" +
      "<p class='zz-fine muted'>" + t("Manual revision 4.7.2 · printed on recycled paper · this page intentionally left unhelpful.") + "</p>";
  }
  function manualSafety() {
    return "<ul class='zz-rules'>" +
      "<li class='zz-fine'><b>" + t("WARNING:") + "</b> " + t("Risk of explosion. Do not expose the device to heat, sparks, open flame, or sudden disappointment.") + "</li>" +
      "<li class='zz-fine'>" + t("Keep out of reach of children, pets, and the easily startled.") + "</li>" +
      "<li class='zz-fine'>" + t("Do not operate while drowsy, intoxicated, or panicking. (The operator acknowledges the last may be unavoidable.)") + "</li>" +
      "<li class='zz-fine'>" + t("In the unlikely event of detonation, discontinue use immediately.") + "</li></ul>";
  }
  function manualMaintenance() {
    return "<ul class='zz-rules'>" +
      "<li class='zz-fine'>" + t("Wipe the casing with a soft, dry cloth. Do not submerge the device.") + "</li>" +
      "<li class='zz-fine'>" + t("Lubricate the dials annually with a non-conductive grease.") + "</li>" +
      "<li class='zz-fine'>" + t("Store in a cool, dry place, away from direct sunlight and bomb-disposal robots.") + "</li>" +
      "<li class='zz-fine'>" + t("Tighten all visible screws before each use. Do not tighten the invisible ones.") + "</li></ul>";
  }
  function manualTroubleshoot() {
    var data = [
      ["The device is ticking.", "This is normal."],
      ["The device has stopped ticking.", "Seek cover."],
      ["A wire was cut and nothing happened.", "Congratulations, or wait."],
      ["This manual is unhelpful.", "See Annex VI."]
    ];
    var rows = data.map(function (r) { return "<tr><td class='zz-fine'>" + t(r[0]) + "</td><td class='zz-fine'>" + t(r[1]) + "</td></tr>"; }).join("");
    return "<table class='zz-table'><thead><tr><th>" + t("Problem") + "</th><th>" + t("Solution") + "</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }
  function manualDisposal() {
    return "<ul class='zz-rules'>" +
      "<li class='zz-fine'>" + t("Dispose of this device only at an authorised collection point. Do not place in household recycling.") + "</li>" +
      "<li class='zz-fine'>" + t("This device complies with directives it has never heard of: CE, FCC, and vibes.") + "</li>" +
      "<li class='zz-fine'>" + t("Index — Wires: see Wires. Dials: see Dials. Panic: see everywhere.") + "</li></ul>";
  }

  // ========================================================================
  // Audio (Web Audio — respects the sound toggle)
  // ========================================================================
  function setupAudio() {
    teardownAudio();
    if (!settings || !settings.sound) return;
    var AC = global.AudioContext || global.webkitAudioContext; if (!AC) return;
    try { audio = { ctx: new AC() }; } catch (e) { audio = null; }
  }
  function teardownAudio() { if (audio && audio.ctx) { try { audio.ctx.close(); } catch (e) { /* ignore */ } } audio = null; }
  function beep(freq, dur, gain, type) {
    if (!audio || !audio.ctx) return;
    var ac = audio.ctx, now = ac.currentTime, osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type || "square"; osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g).connect(ac.destination); osc.start(now); osc.stop(now + dur + 0.02);
  }
  function tick() { beep(1500, 0.04, 0.12, "square"); }
  function blip(f) { beep(f || 800, 0.04, 0.06, "triangle"); }
  function clack() { beep(280, 0.05, 0.08, "square"); }
  function chime() { beep(700, 0.12, 0.12, "sine"); setTimeout(function () { beep(1050, 0.16, 0.12, "sine"); }, 110); }
  function strikeSound() { beep(160, 0.22, 0.18, "sawtooth"); }
  function defuseSound() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 0.12, "sine"); }, i * 130); }); }
  function boomSound() {
    if (!audio || !audio.ctx) return;
    var ac = audio.ctx, now = ac.currentTime, seconds = 0.9;
    var buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate), data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    var src = ac.createBufferSource(); src.buffer = buffer;
    var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(1800, now); lp.frequency.exponentialRampToValueAtTime(120, now + seconds);
    var g = ac.createGain(); g.gain.setValueAtTime(0.9, now); g.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    src.connect(lp).connect(g).connect(ac.destination); src.start(now); src.stop(now + seconds);
  }
  function buzz(p) { try { if (global.navigator && typeof global.navigator.vibrate === "function") global.navigator.vibrate(p); } catch (e) { /* ignore */ } }

  // ========================================================================
  // Utils
  // ========================================================================
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }
  function arraysEqual(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function stageLabel(st) { return st === "WIRES" ? "Wires" : st === "KEYPAD" ? "Keypad" : "Dials"; }
  function highlight(sel, value, an) { els.querySelectorAll(sel + " .chip").forEach(function (c) { c.classList.toggle("chip--active", c.getAttribute(an) === value); }); }

  module._test = {
    generate: generate, solve: solve, solveWire: solveWire, audit: audit,
    SYMBOLS: SYMBOLS, SYMBOL_TABLE: SYMBOL_TABLE, LETTER_BANK: LETTER_BANK,
    peek: function () { return { bomb: bomb, dials: dials, solved: solved, solvedCount: solvedCount, strikes: strikes, timeLeft: timeLeft, activeFace: activeFace, frontSlot: frontSlot(M) }; }
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.zeitzunder = module;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));

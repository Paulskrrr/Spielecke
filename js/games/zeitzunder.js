/*
 * games/zeitzunder.js — Zeitzünder (asymmetric co-op bomb defusal)
 *
 * A NEW genre for Spielecke: one screen, one manual, the room in between.
 *
 *   - The DEFUSER sits at the host screen (a MacBook on the table) and sees the
 *     bomb: a 3D cube you flip to reach its six faces. They can poke the bomb
 *     but the rules are not on their screen.
 *   - The EXPERT opens the same link on a phone and sees the MANUAL — the rules,
 *     tables and legends — but never the bomb.
 *   - Neither device talks to the other. The humans are the wire: the defuser
 *     reads out what they see, the expert reads back what to do. (spec §0 — no
 *     backend, no sync; the asymmetry does the work a network would.)
 *
 * The cube is ONE interlocking puzzle, not a linear checklist. Three action
 * stages — WIRES, KEYPAD, DIALS — must be solved in an order the bomb hides in
 * its firing sigils, and each stage reads values off OTHER faces (the dials feed
 * the wires; the decoder + guts feed the keypad; the serial feeds everything).
 * You flip all over the cube to solve any one thing.
 *
 * Solver ↔ manual lockstep: the rule TABLES below are the single source of
 * truth. The host generator/solver and the expert manual both read them, so the
 * page the expert flips to and the answer the bomb expects can never drift.
 *
 * Contract: meta + mount(container, context) + unmount(). unmount() MUST kill
 * the countdown interval, the audio and the key handler — no leaks (spec §1.3).
 */
(function (global) {
  "use strict";

  // Guarded helpers so this file also `require()`s cleanly under Node for the
  // solvability audit (where Spielecke isn't set up). In the browser these
  // resolve to the real shared helpers loaded earlier (ui.js, i18n.js).
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
  // RULE TABLES — the single source of truth (solver + manual both read these)
  // ========================================================================

  var STAGES = ["WIRES", "KEYPAD", "DIALS"];

  // The nine keypad glyphs. Distinct, render everywhere, abstract enough that
  // the defuser has to describe them carefully ("the trident", "the horseshoe").
  var SYMBOLS = ["Δ", "Ψ", "Ω", "Σ", "Φ", "Θ", "Λ", "Ξ", "Π"];

  // KEYPAD: the decoder letter (A–H) selects a row → three glyphs, in order.
  var SYMBOL_TABLE = {
    A: ["Δ", "Ψ", "Ω"],
    B: ["Σ", "Φ", "Θ"],
    C: ["Λ", "Ξ", "Π"],
    D: ["Ψ", "Σ", "Λ"],
    E: ["Ω", "Θ", "Ξ"],
    F: ["Δ", "Φ", "Π"],
    G: ["Π", "Ω", "Σ"],
    H: ["Θ", "Λ", "Δ"]
  };
  var DECODER_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // FIRING ORDER: each sigil decodes to a stage. Two sigils per stage so the
  // same order can look different across bombs.
  var FIRING_SIGILS = {
    "❖": "WIRES", "◈": "WIRES",
    "✦": "KEYPAD", "⬡": "KEYPAD",
    "✺": "DIALS", "✪": "DIALS"
  };
  var SIGILS_BY_STAGE = { WIRES: ["❖", "◈"], KEYPAD: ["✦", "⬡"], DIALS: ["✺", "✪"] };

  // DIALS: dial B target = the serial's first letter looked up here (0–9).
  // A fixed scramble (period-10 pattern) — shown as a grid in the manual.
  var LETTER_BANK = (function () {
    var pattern = [2, 7, 4, 9, 1, 6, 3, 8, 0, 5];
    var map = {};
    for (var i = 0; i < 26; i++) {
      map[String.fromCharCode(65 + i)] = pattern[i % 10];
    }
    return map;
  })();

  // Wire / colour-key palette. `key` is the stable id used by the rules; the
  // hex is only for rendering on the bomb.
  var COLORS = [
    { key: "red", hex: "#ff4d5e", label: "red" },
    { key: "blue", hex: "#3aa0ff", label: "blue" },
    { key: "yellow", hex: "#ffcf33", label: "yellow" },
    { key: "green", hex: "#36d399", label: "green" },
    { key: "white", hex: "#ffffff", label: "white" }
  ];
  var COLOR_KEYS = COLORS.map(function (c) { return c.key; });
  function colorHex(key) {
    for (var i = 0; i < COLORS.length; i++) if (COLORS[i].key === key) return COLORS[i].hex;
    return "#ccc";
  }

  // Casing indicators. CLR is a deliberate red herring — no rule reads it
  // (the manual says so). SIG reverses the keypad; VNT swaps the dials.
  var INDICATORS = ["CLR", "SIG", "VNT"];

  // ========================================================================
  // BOMB GENERATION + SOLVING (pure — testable under Node via _test)
  // ========================================================================

  function rint(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rint(arr.length)]; }

  function generate() {
    var L1 = String.fromCharCode(65 + rint(26));
    var L2 = String.fromCharCode(65 + rint(26));
    var d1 = rint(10), d2 = rint(10);
    var serial = { letters: L1 + L2, digits: "" + d1 + d2, d1: d1, d2: d2, text: L1 + L2 + "-" + d1 + d2 };

    var batteries = rint(5); // 0–4
    var indicators = {};
    INDICATORS.forEach(function (k) { indicators[k] = Math.random() < 0.5; });

    var colourKey = shuffle(COLOR_KEYS); // index 0 = highest priority
    var decoderLetter = pick(DECODER_LETTERS);
    var keypadLayout = shuffle(SYMBOLS); // 9 cells, index 4 = centre

    var wires = [];
    for (var i = 0; i < 5; i++) {
      wires.push({ color: pick(COLOR_KEYS), number: 1 + rint(9) }); // 1–9
    }

    // Firing sigils: a random order of the three stages, one sigil each.
    var stageOrder = shuffle(STAGES);
    var sigils = stageOrder.map(function (st) { return pick(SIGILS_BY_STAGE[st]); });

    var bomb = {
      serial: serial,
      batteries: batteries,
      indicators: indicators,
      colourKey: colourKey,
      decoderLetter: decoderLetter,
      keypadLayout: keypadLayout,
      wires: wires,
      sigils: sigils
    };
    bomb.solution = solve(bomb);
    return bomb;
  }

  function solve(b) {
    // FIRING ORDER: decode sigils → stages, reverse if last serial digit even.
    var order = b.sigils.map(function (s) { return FIRING_SIGILS[s]; });
    if (b.serial.d2 % 2 === 0) order = order.slice().reverse();

    // DIALS: A = digit-sum mod 10, B = first letter in the bank; VNT swaps.
    var sum = b.serial.d1 + b.serial.d2;
    var a = sum % 10;
    var bb = LETTER_BANK[b.serial.letters.charAt(0)];
    if (b.indicators.VNT) { var tmp = a; a = bb; bb = tmp; }

    // KEYPAD: row for the decoder letter; reverse on SIG; append centre if 3+ batteries.
    var seq = SYMBOL_TABLE[b.decoderLetter].slice();
    if (b.indicators.SIG) seq.reverse();
    if (b.batteries >= 3) seq.push(b.keypadLayout[4]);

    return { order: order, dialA: a, dialB: bb, keypad: seq };
  }

  // Which wire to cut for the dials CURRENTLY set (the cut reads live dial values).
  function solveWire(dials, b) {
    var channel = dials.a + dials.b;
    for (var i = 0; i < b.wires.length; i++) {
      if (b.wires[i].number === channel) return i; // first (leftmost) match
    }
    var best = -1, bestP = 999;
    for (var j = 0; j < b.wires.length; j++) {
      var p = b.colourKey.indexOf(b.wires[j].color);
      if (p < bestP) { bestP = p; best = j; }
    }
    return best;
  }

  // Self-check used by the test harness: confirm a generated bomb is solvable.
  function audit(b) {
    var problems = [];
    var sol = b.solution;
    if (sol.order.length !== 3) problems.push("order length");
    var seen = {};
    sol.order.forEach(function (s) {
      if (STAGES.indexOf(s) < 0) problems.push("bad stage " + s);
      if (seen[s]) problems.push("dup stage " + s);
      seen[s] = true;
    });
    if (!(sol.dialA >= 0 && sol.dialA <= 9)) problems.push("dialA range");
    if (!(sol.dialB >= 0 && sol.dialB <= 9)) problems.push("dialB range");
    if (!sol.keypad.length) problems.push("empty keypad");
    sol.keypad.forEach(function (g) { if (SYMBOLS.indexOf(g) < 0) problems.push("bad glyph " + g); });
    var w = solveWire({ a: sol.dialA, b: sol.dialB }, b);
    if (!(w >= 0 && w < b.wires.length)) problems.push("no wire");
    if (DECODER_LETTERS.indexOf(b.decoderLetter) < 0) problems.push("bad letter");
    if (b.sigils.length !== 3) problems.push("sigils");
    return { ok: problems.length === 0, problems: problems, wire: w };
  }

  // ========================================================================
  // Module state (browser only beyond this point)
  // ========================================================================
  var DEFAULTS = { seconds: 300, sound: true };
  var DIFFICULTIES = [
    { id: "chill", label: "🌿 Rookie", seconds: 360 },
    { id: "standard", label: "💣 Standard", seconds: 270 },
    { id: "lethal", label: "💀 Lethal", seconds: 180 }
  ];
  var MAX_STRIKES = 3;

  var els = null, ctx = null, settings = null;
  var role = null;           // "host" | "expert"
  var bomb = null;           // current generated bomb (host)
  var dials = { a: 0, b: 0 };
  var entry = [];            // keypad presses being built
  var solved = {};           // { WIRES:true, ... }
  var solvedCount = 0;
  var strikes = 0;
  var timeLeft = 0;
  var activeFace = "core";
  var timer = null;
  var audio = null;
  var keyHandler = null;
  var busy = false;          // brief input lock after a cut to swallow double taps

  var FACE_IDS = ["core", "wires", "keypad", "dials", "guts", "decoder"];
  var FACE_NAV = [
    { id: "core", icon: "🧩", label: "Core" },
    { id: "wires", icon: "🔌", label: "Wires" },
    { id: "keypad", icon: "🔡", label: "Keypad" },
    { id: "dials", icon: "🎛️", label: "Dials" },
    { id: "guts", icon: "🔋", label: "Guts" },
    { id: "decoder", icon: "🔠", label: "Decoder" }
  ];

  var module = {
    meta: {
      id: "zeitzunder",
      name: "Zeitzünder",
      tagline: "One screen, one manual, the room in between. Talk fast — defuse together.",
      icon: "🧨",
      minPlayers: 2,
      supportsDrinking: false
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = {
        seconds: parseInt(context.store.get("seconds", DEFAULTS.seconds), 10) || DEFAULTS.seconds,
        sound: context.store.get("sound", DEFAULTS.sound) !== false
      };
      role = null;
      renderRolePicker();
    },

    unmount: function () {
      stopTimer();
      teardownAudio();
      detachKeys();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; bomb = null; role = null;
      solved = {}; solvedCount = 0; strikes = 0; entry = []; busy = false;
    }
  };

  // ========================================================================
  // Screen: role picker / setup
  // ========================================================================
  function renderRolePicker() {
    stopTimer(); detachKeys();
    var diffChips = DIFFICULTIES.map(function (d) {
      return '<button class="chip" data-diff="' + d.id + '">' + t(d.label) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen game-setup zz-setup">' +
      '  <h2 class="screen-title pop">🧨 ' + t("Zeitzünder") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <p class="muted small">' + t("One screen is the bomb, the others are experts with the manual. The bomb-holder describes; the experts read the rules back. Nobody can win alone.") + "</p>" +
      '  <div class="zz-roles">' +
      '    <button id="zz-be-bomb" class="zz-role zz-role--bomb">' +
      '      <span class="zz-role__icon">💣</span>' +
      '      <span class="zz-role__name">' + t("I'm the bomb") + "</span>" +
      '      <span class="zz-role__hint">' + t("This screen on the table (a MacBook). You poke it, you can't read the manual.") + "</span>" +
      "    </button>" +
      '    <button id="zz-be-expert" class="zz-role zz-role--expert">' +
      '      <span class="zz-role__icon">📖</span>' +
      '      <span class="zz-role__name">' + t("I'm an expert") + "</span>" +
      '      <span class="zz-role__hint">' + t("Open on your phone. You hold the manual, you never see the bomb.") + "</span>" +
      "    </button>" +
      "  </div>" +
      '  <h3 class="sub">' + t("Fuse length") + "</h3>" +
      '  <div class="chip-row" id="zz-diffs">' + diffChips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="zz-sound"' + (settings.sound ? " checked" : "") + " /><span>" + t("🔊 Ticking & alarms") + "</span></label>" +
      '  <p class="muted small">' + t("Tip: works best with 2 players to learn it, then add experts and split the manual between them.") + "</p>" +
      "</section>";

    var curDiff = diffIdForSeconds(settings.seconds);
    highlight("#zz-diffs", curDiff, "data-diff");
    els.querySelectorAll("#zz-diffs .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        var id = c.getAttribute("data-diff");
        var d = DIFFICULTIES.filter(function (x) { return x.id === id; })[0];
        settings.seconds = d ? d.seconds : DEFAULTS.seconds;
        ctx.store.set("seconds", settings.seconds);
        highlight("#zz-diffs", id, "data-diff");
      });
    });
    els.querySelector("#zz-sound").addEventListener("change", function (e) {
      settings.sound = e.target.checked; ctx.store.set("sound", settings.sound);
    });
    els.querySelector("#zz-be-bomb").addEventListener("click", function () { role = "host"; newBomb(); });
    els.querySelector("#zz-be-expert").addEventListener("click", function () { role = "expert"; renderManual(); });
  }

  function diffIdForSeconds(s) {
    for (var i = 0; i < DIFFICULTIES.length; i++) if (DIFFICULTIES[i].seconds === s) return DIFFICULTIES[i].id;
    return "standard";
  }

  // ========================================================================
  // HOST: build a fresh bomb and render the cube
  // ========================================================================
  function newBomb() {
    bomb = generate();
    dials = { a: 0, b: 0 };
    entry = [];
    solved = {}; solvedCount = 0; strikes = 0;
    timeLeft = settings.seconds;
    activeFace = "core";
    busy = false;
    renderBomb();
  }

  function renderBomb() {
    els.innerHTML =
      '<section class="screen zz-bomb">' +
      hudHtml() +
      '  <div class="zz-scene"><div class="zz-cube" id="zz-cube">' +
      faceCore() + faceWires() + faceKeypad() + faceDials() + faceGuts() + faceDecoder() +
      "  </div></div>" +
      '  <div class="zz-nav" id="zz-nav">' +
      FACE_NAV.map(function (f) {
        return '<button class="zz-navbtn" data-face="' + f.id + '"><span>' + f.icon + "</span>" + t(f.label) + "</button>";
      }).join("") +
      "  </div>" +
      '  <p class="muted small zz-help">' + t("Flip the cube with the buttons or ← → ↑ ↓. Read what you see out loud — your expert has the rules.") + "</p>" +
      '  <button id="zz-quit" class="btn btn-ghost btn-block">' + t("Abort · back to setup") + "</button>" +
      "</section>";

    attachBomb();
    flipTo(activeFace);
    setupAudio();
    startTimer();
    updateLeds();
  }

  // --- HUD (always visible: timer, strikes, stage lamps) -------------------
  function hudHtml() {
    return (
      '<div class="zz-hud" id="zz-hud">' +
      '  <div class="zz-timer" id="zz-timer">' + fmt(timeLeft) + "</div>" +
      '  <div class="zz-strikes" id="zz-strikes">' + strikeDots() + "</div>" +
      "</div>"
    );
  }
  function strikeDots() {
    var out = "";
    for (var i = 0; i < MAX_STRIKES; i++) {
      out += '<span class="zz-x' + (i < strikes ? " is-lit" : "") + '">✕</span>';
    }
    return out;
  }

  // --- Faces ---------------------------------------------------------------
  function face(id, inner) {
    return '<div class="zz-face zz-face--' + id + '" data-face="' + id + '">' + inner + "</div>";
  }
  function faceTitle(icon, label) {
    return '<div class="zz-face__title">' + icon + " " + t(label) + "</div>";
  }

  function faceCore() {
    var sig = bomb.sigils.map(function (s) { return '<span class="zz-sigil">' + s + "</span>"; }).join("");
    var leds = STAGES.map(function (st) {
      return '<span class="zz-led" data-stage="' + st + '"><i></i>' + t(stageLabel(st)) + "</span>";
    }).join("");
    return face("core",
      faceTitle("🧩", "Core") +
      '<div class="zz-serial">' + t("Serial") + ' <b>' + esc(bomb.serial.text) + "</b></div>" +
      '<div class="zz-sigrow">' + sig + "</div>" +
      '<div class="zz-sublabel">' + t("Firing sigils") + "</div>" +
      '<div class="zz-ledrow">' + leds + "</div>"
    );
  }

  function faceWires() {
    var w = bomb.wires.map(function (wire, i) {
      return (
        '<button class="zz-wire" data-i="' + i + '">' +
        '  <span class="zz-wire__line" style="background:' + colorHex(wire.color) + '"></span>' +
        '  <span class="zz-wire__num">' + wire.number + "</span>" +
        "</button>"
      );
    }).join("");
    return face("wires",
      faceTitle("🔌", "Wires") +
      '<div class="zz-wires" id="zz-wires">' + w + "</div>" +
      '<div class="zz-hint muted small">' + t("Tap a wire to cut it.") + "</div>"
    );
  }

  function faceKeypad() {
    var grid = bomb.keypadLayout.map(function (g, pos) {
      return '<button class="zz-key" data-glyph="' + esc(g) + '" data-pos="' + pos + '">' + g + "</button>";
    }).join("");
    return face("keypad",
      faceTitle("🔡", "Keypad") +
      '<div class="zz-keys" id="zz-keys">' + grid + "</div>" +
      '<div class="zz-entry" id="zz-entry"></div>' +
      '<div class="zz-keyactions">' +
      '  <button id="zz-key-clear" class="zz-mini">' + t("Clear") + "</button>" +
      '  <button id="zz-key-submit" class="zz-mini zz-mini--go">' + t("Submit") + "</button>" +
      "</div>"
    );
  }

  function faceDials() {
    return face("dials",
      faceTitle("🎛️", "Dials") +
      '<div class="zz-dials">' +
      dialHtml("a") + dialHtml("b") +
      "</div>" +
      '<button id="zz-dial-confirm" class="zz-mini zz-mini--go">' + t("Confirm dials") + "</button>"
    );
  }
  function dialHtml(which) {
    return (
      '<div class="zz-dial">' +
      '  <button class="zz-dial__btn" data-dial="' + which + '" data-dir="1">▲</button>' +
      '  <div class="zz-dial__val" id="zz-dial-' + which + '">' + dials[which] + "</div>" +
      '  <button class="zz-dial__btn" data-dial="' + which + '" data-dir="-1">▼</button>' +
      '  <div class="zz-dial__lbl">' + (which === "a" ? "A" : "B") + "</div>" +
      "</div>"
    );
  }

  function faceGuts() {
    var batt = "";
    for (var i = 0; i < 4; i++) batt += '<span class="zz-batt' + (i < bomb.batteries ? " is-on" : "") + '"></span>';
    var inds = INDICATORS.map(function (k) {
      return '<span class="zz-ind' + (bomb.indicators[k] ? " is-lit" : "") + '">' + k + "</span>";
    }).join("");
    return face("guts",
      faceTitle("🔋", "Guts") +
      '<div class="zz-sublabel">' + t("Batteries") + "</div>" +
      '<div class="zz-batts">' + batt + '<b class="zz-battn">' + bomb.batteries + "</b></div>" +
      '<div class="zz-sublabel">' + t("Indicators") + "</div>" +
      '<div class="zz-inds">' + inds + "</div>"
    );
  }

  function faceDecoder() {
    var key = bomb.colourKey.map(function (c, i) {
      return '<span class="zz-ckey"><b>' + (i + 1) + "</b><i style=\"background:" + colorHex(c) + '"></i>' + t(colorName(c)) + "</span>";
    }).join("");
    return face("decoder",
      faceTitle("🔠", "Decoder") +
      '<div class="zz-sublabel">' + t("Decoder letter") + "</div>" +
      '<div class="zz-letter">' + bomb.decoderLetter + "</div>" +
      '<div class="zz-sublabel">' + t("Colour priority") + "</div>" +
      '<div class="zz-ckeys">' + key + "</div>"
    );
  }

  // --- Wiring up the bomb --------------------------------------------------
  function attachBomb() {
    els.querySelectorAll("#zz-nav .zz-navbtn").forEach(function (b) {
      b.addEventListener("click", function () { flipTo(b.getAttribute("data-face")); });
    });
    els.querySelectorAll("#zz-wires .zz-wire").forEach(function (b) {
      b.addEventListener("click", function () { attemptCut(parseInt(b.getAttribute("data-i"), 10)); });
    });
    els.querySelectorAll("#zz-keys .zz-key").forEach(function (b) {
      b.addEventListener("click", function () { keypadPress(b.getAttribute("data-glyph")); });
    });
    els.querySelector("#zz-key-clear").addEventListener("click", function () { entry = []; updateEntry(); });
    els.querySelector("#zz-key-submit").addEventListener("click", attemptKeypad);
    els.querySelectorAll(".zz-dial__btn").forEach(function (b) {
      b.addEventListener("click", function () {
        if (solved.DIALS) return;
        var which = b.getAttribute("data-dial");
        var dir = parseInt(b.getAttribute("data-dir"), 10);
        dials[which] = (dials[which] + dir + 10) % 10;
        var v = els.querySelector("#zz-dial-" + which);
        if (v) v.textContent = dials[which];
        blip(620);
      });
    });
    els.querySelector("#zz-dial-confirm").addEventListener("click", attemptDials);
    els.querySelector("#zz-quit").addEventListener("click", renderRolePicker);
    attachKeys();
    updateEntry();
  }

  // --- Cube navigation -----------------------------------------------------
  function flipTo(faceId) {
    if (FACE_IDS.indexOf(faceId) < 0 || !els) return;
    activeFace = faceId;
    els.querySelectorAll(".zz-face").forEach(function (f) {
      f.classList.toggle("is-active", f.getAttribute("data-face") === faceId);
    });
    els.querySelectorAll("#zz-nav .zz-navbtn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-face") === faceId);
    });
  }

  function attachKeys() {
    detachKeys();
    var SIDE = ["core", "wires", "keypad", "dials"];
    keyHandler = function (e) {
      var k = e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(k) < 0) return;
      e.preventDefault();
      if (k === "ArrowUp") return flipTo("guts");
      if (k === "ArrowDown") return flipTo("decoder");
      var idx = SIDE.indexOf(activeFace);
      if (idx < 0) idx = 0; // coming from guts/decoder → re-enter the ring at core
      idx = (idx + (k === "ArrowRight" ? 1 : SIDE.length - 1)) % SIDE.length;
      flipTo(SIDE[idx]);
    };
    global.addEventListener("keydown", keyHandler);
  }
  function detachKeys() {
    if (keyHandler) { global.removeEventListener("keydown", keyHandler); keyHandler = null; }
  }

  // ========================================================================
  // Stage attempts
  // ========================================================================
  function nextStage() { return bomb.solution.order[solvedCount]; }

  function attemptCut(i) {
    if (busy || solved.WIRES) return;
    if (nextStage() !== "WIRES") { strike("seq"); return; }
    busy = true;
    var btn = els.querySelector('#zz-wires .zz-wire[data-i="' + i + '"]');
    if (solveWire(dials, bomb) === i) {
      if (btn) btn.classList.add("is-cut");
      solveStage("WIRES");
    } else {
      if (btn) { btn.classList.add("is-bad"); setTimeout(function () { if (btn) btn.classList.remove("is-bad"); }, 600); }
      strike("wrong");
    }
    setTimeout(function () { busy = false; }, 450);
  }

  function keypadPress(g) {
    if (solved.KEYPAD) return;
    entry.push(g);
    updateEntry();
    blip(880);
  }
  function updateEntry() {
    var box = els && els.querySelector("#zz-entry");
    if (!box) return;
    box.innerHTML = entry.length
      ? entry.map(function (g) { return '<span>' + g + "</span>"; }).join("")
      : '<span class="zz-entry__ph">' + t("press the glyphs…") + "</span>";
  }
  function attemptKeypad() {
    if (solved.KEYPAD) return;
    if (nextStage() !== "KEYPAD") { strike("seq"); entry = []; updateEntry(); return; }
    if (arraysEqual(entry, bomb.solution.keypad)) {
      solveStage("KEYPAD");
    } else {
      strike("wrong"); entry = []; updateEntry();
    }
  }

  function attemptDials() {
    if (solved.DIALS) return;
    if (nextStage() !== "DIALS") { strike("seq"); return; }
    if (dials.a === bomb.solution.dialA && dials.b === bomb.solution.dialB) {
      solveStage("DIALS");
    } else {
      strike("wrong");
    }
  }

  function solveStage(name) {
    if (solved[name]) return;
    solved[name] = true; solvedCount++;
    chime();
    updateLeds();
    disableFace(name);
    flashFace(name, "is-solved");
    if (solvedCount >= STAGES.length) { defused(); }
  }

  function disableFace(name) {
    if (name === "WIRES") {
      els.querySelectorAll("#zz-wires .zz-wire").forEach(function (b) { b.disabled = true; });
    } else if (name === "KEYPAD") {
      els.querySelectorAll("#zz-keys .zz-key").forEach(function (b) { b.disabled = true; });
      var s = els.querySelector("#zz-key-submit"), c = els.querySelector("#zz-key-clear");
      if (s) s.disabled = true; if (c) c.disabled = true;
    } else if (name === "DIALS") {
      els.querySelectorAll(".zz-dial__btn").forEach(function (b) { b.disabled = true; });
      var d = els.querySelector("#zz-dial-confirm"); if (d) d.disabled = true;
    }
  }
  function flashFace(name, cls) {
    var sel = name === "WIRES" ? "wires" : name === "KEYPAD" ? "keypad" : "dials";
    var f = els.querySelector(".zz-face--" + sel);
    if (f) f.classList.add(cls);
  }

  function updateLeds() {
    els.querySelectorAll(".zz-led").forEach(function (l) {
      l.classList.toggle("is-on", !!solved[l.getAttribute("data-stage")]);
    });
  }

  // ========================================================================
  // Strikes, timer, end states
  // ========================================================================
  function strike(kind) {
    strikes++;
    var s = els.querySelector("#zz-strikes");
    if (s) s.innerHTML = strikeDots();
    var hud = els.querySelector("#zz-hud");
    if (hud) { hud.classList.remove("zz-flash"); void hud.offsetWidth; hud.classList.add("zz-flash"); }
    toast(kind === "seq" ? t("✋ Out of sequence!") : t("✕ Wrong — strike!"));
    strikeSound();
    if (strikes >= MAX_STRIKES) { boom(); return; }
    // each strike also burns time — the clock is the real enemy
    timeLeft = Math.max(1, timeLeft - 15);
    updateTimer();
  }

  function toast(msg) {
    var old = els.querySelector(".zz-toast");
    if (old) old.parentNode.removeChild(old);
    var d = document.createElement("div");
    d.className = "zz-toast";
    d.textContent = msg;
    var sec = els.querySelector(".zz-bomb");
    if (sec) sec.appendChild(d);
    setTimeout(function () { if (d && d.parentNode) d.parentNode.removeChild(d); }, 1100);
  }

  function startTimer() {
    stopTimer();
    timer = global.setInterval(function () {
      timeLeft--;
      updateTimer();
      if (timeLeft <= 10 && timeLeft > 0) tick();
      if (timeLeft <= 0) { boom(); }
    }, 1000);
  }
  function stopTimer() { if (timer) { global.clearInterval(timer); timer = null; } }
  function updateTimer() {
    var el = els && els.querySelector("#zz-timer");
    if (!el) return;
    el.textContent = fmt(Math.max(0, timeLeft));
    el.classList.toggle("is-danger", timeLeft <= 30);
  }

  function boom() {
    stopTimer();
    boomSound();
    buzz([120, 60, 200]);
    els.innerHTML =
      '<section class="screen zz-end zz-boom">' +
      '  <div class="boom-flash">💥</div>' +
      '  <h2 class="boom-title">' + t("BOOM!") + "</h2>" +
      '  <p class="boom-sub">' + endReason() + "</p>" +
      '  <div class="boom-actions">' +
      '    <button id="zz-retry" class="btn btn-primary btn-block btn-xl">' + t("New bomb 🔁") + "</button>" +
      '    <button id="zz-setup" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#zz-retry").addEventListener("click", newBomb);
    els.querySelector("#zz-setup").addEventListener("click", renderRolePicker);
  }
  function endReason() {
    if (timeLeft <= 0) return t("⏱️ Time ran out.");
    return t("💥 Three strikes. The wire was wrong.");
  }

  function defused() {
    stopTimer();
    defuseSound();
    els.innerHTML =
      '<section class="screen zz-end zz-defused">' +
      '  <div class="boom-flash">🎉</div>' +
      '  <h2 class="result-title pop">' + t("DEFUSED!") + "</h2>" +
      '  <p class="result-sub">' + t("Cut it with {time} left and {n} strikes.")
        .replace("{time}", fmt(Math.max(0, timeLeft))).replace("{n}", strikes) + "</p>" +
      '  <div class="stack">' +
      '    <button id="zz-again" class="btn btn-primary btn-block btn-xl">' + t("Next bomb 🔁") + "</button>" +
      '    <button id="zz-setup2" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#zz-again").addEventListener("click", newBomb);
    els.querySelector("#zz-setup2").addEventListener("click", renderRolePicker);
  }

  // ========================================================================
  // EXPERT: the manual (static reference — same every bomb)
  // ========================================================================
  function renderManual() {
    stopTimer(); detachKeys();
    var pages = manualPages();
    var nav = pages.map(function (p) {
      return '<a class="zz-mnav" href="#zz-pg-' + p.id + '">' + p.icon + " " + t(p.title) + "</a>";
    }).join("");
    var body = pages.map(function (p) {
      return '<article class="zz-page" id="zz-pg-' + p.id + '"><h3 class="zz-page__h">' + p.icon + " " + t(p.title) + "</h3>" + p.html + "</article>";
    }).join("");

    els.innerHTML =
      '<section class="screen zz-manual">' +
      '  <h2 class="screen-title pop">📖 ' + t("Defusal Manual") + "</h2>" +
      '  <p class="muted small">' + t("You can't see the bomb. Ask what's on each face, find the matching page, read the steps back.") + "</p>" +
      '  <nav class="zz-mnavrow">' + nav + "</nav>" +
      body +
      '  <button id="zz-manual-back" class="btn btn-ghost btn-block">' + t("← Back") + "</button>" +
      "</section>";
    els.querySelector("#zz-manual-back").addEventListener("click", renderRolePicker);
  }

  function manualPages() {
    return [
      { id: "start", icon: "🧭", title: "How to defuse", html: manualHowTo() },
      { id: "order", icon: "🧩", title: "Firing order", html: manualOrder() },
      { id: "dials", icon: "🎛️", title: "Dials", html: manualDials() },
      { id: "wires", icon: "🔌", title: "Wires", html: manualWires() },
      { id: "keypad", icon: "🔡", title: "Keypad", html: manualKeypad() },
      { id: "ref", icon: "🔎", title: "Reading the bomb", html: manualRef() }
    ];
  }

  function manualHowTo() {
    return (
      "<ol class='zz-steps'>" +
      "<li>" + t("The bomb has three jobs: <b>Wires</b>, <b>Keypad</b>, <b>Dials</b>. They must be done in the right ORDER — see Firing Order.") + "</li>" +
      "<li>" + t("Every job reads values off OTHER faces. Have the defuser flip around and read them to you.") + "</li>" +
      "<li>" + t("A wrong action, or acting out of order, is a strike. Three strikes — or the clock hitting zero — and it blows.") + "</li>" +
      "</ol>"
    );
  }

  function manualOrder() {
    var rows = Object.keys(FIRING_SIGILS).map(function (s) {
      return "<tr><td class='zz-sig'>" + s + "</td><td>" + t(stageLabel(FIRING_SIGILS[s])) + "</td></tr>";
    }).join("");
    return (
      "<p>" + t("The Core face shows three sigils. Translate each to a job, left to right — that's the order to solve them in.") + "</p>" +
      "<table class='zz-table'><thead><tr><th>" + t("Sigil") + "</th><th>" + t("Job") + "</th></tr></thead><tbody>" + rows + "</tbody></table>" +
      "<p class='zz-warn'>⚠ " + t("If the LAST digit of the serial is EVEN, reverse the order (read the sigils right to left).") + "</p>"
    );
  }

  function manualDials() {
    var cells = "";
    for (var i = 0; i < 26; i++) {
      var L = String.fromCharCode(65 + i);
      cells += "<span class='zz-bankcell'><b>" + L + "</b>" + LETTER_BANK[L] + "</span>";
    }
    return (
      "<p>" + t("Two dials, A and B (0–9 each).") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("<b>Dial A</b> = the two serial digits added together, then keep only the last digit (e.g. 7+8=15 → 5).") + "</li>" +
      "<li>" + t("<b>Dial B</b> = the serial's FIRST letter, looked up in the Letter Bank below.") + "</li>" +
      "<li class='zz-warn'>⚠ " + t("If indicator VNT is lit, SWAP the two targets (A takes B's number, B takes A's).") + "</li>" +
      "</ul>" +
      "<div class='zz-sublabel'>" + t("Letter Bank") + "</div>" +
      "<div class='zz-bank'>" + cells + "</div>"
    );
  }

  function manualWires() {
    return (
      "<p>" + t("Five wires, each with a colour and a printed number.") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("First make sure the Dials are set to their targets. <b>Channel</b> = Dial A + Dial B.") + "</li>" +
      "<li>" + t("If a wire's NUMBER equals the Channel, cut it. (If several match, the leftmost.)") + "</li>" +
      "<li>" + t("Otherwise, cut the wire whose COLOUR is highest on the Decoder's colour-priority list (1 = highest). Ties → leftmost.") + "</li>" +
      "</ul>" +
      "<p class='muted small'>" + t("The cut reads the dials LIVE, so the dials must be right even if Wires comes first in the order.") + "</p>"
    );
  }

  function manualKeypad() {
    var rows = DECODER_LETTERS.map(function (L) {
      return "<tr><td><b>" + L + "</b></td><td class='zz-glyphs'>" + SYMBOL_TABLE[L].map(function (g) { return "<span>" + g + "</span>"; }).join("") + "</td></tr>";
    }).join("");
    return (
      "<p>" + t("Nine glyphs, scrambled. Press a sequence, then Submit.") + "</p>" +
      "<ul class='zz-rules'>" +
      "<li>" + t("Read the Decoder LETTER. Find its row below → press those glyphs in order.") + "</li>" +
      "<li class='zz-warn'>⚠ " + t("If indicator SIG is lit, press them in REVERSE order.") + "</li>" +
      "<li class='zz-warn'>⚠ " + t("If the bomb has 3+ batteries, press the CENTRE glyph once more at the very end.") + "</li>" +
      "</ul>" +
      "<table class='zz-table'><thead><tr><th>" + t("Letter") + "</th><th>" + t("Sequence") + "</th></tr></thead><tbody>" + rows + "</tbody></table>"
    );
  }

  function manualRef() {
    return (
      "<ul class='zz-rules'>" +
      "<li>" + t("<b>Serial</b> (Core): two letters + two digits, e.g. KQ-37.") + "</li>" +
      "<li>" + t("<b>Indicators</b> (Guts): SIG affects the Keypad, VNT affects the Dials.") + " <span class='zz-warn'>" + t("CLR does NOTHING — it's a decoy.") + "</span></li>" +
      "<li>" + t("<b>Batteries</b> (Guts): 0–4. Matters for the Keypad.") + "</li>" +
      "<li>" + t("<b>Decoder</b> (Decoder face): a letter A–H and the colour-priority list.") + "</li>" +
      "</ul>"
    );
  }

  // ========================================================================
  // Audio (Web Audio — no asset files; respects the sound toggle)
  // ========================================================================
  function setupAudio() {
    teardownAudio();
    if (!settings || !settings.sound) return;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return;
    try { audio = { ctx: new AC() }; } catch (e) { audio = null; }
  }
  function teardownAudio() {
    if (audio && audio.ctx) { try { audio.ctx.close(); } catch (e) { /* ignore */ } }
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
  function tick() { beep(1500, 0.04, 0.12, "square"); }
  function blip(f) { beep(f || 800, 0.04, 0.06, "triangle"); }
  function chime() { beep(700, 0.12, 0.12, "sine"); setTimeout(function () { beep(1050, 0.16, 0.12, "sine"); }, 110); }
  function strikeSound() { beep(160, 0.22, 0.18, "sawtooth"); }
  function defuseSound() {
    [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 0.12, "sine"); }, i * 130); });
  }
  function boomSound() {
    if (!audio || !audio.ctx) return;
    var ac = audio.ctx, now = ac.currentTime, seconds = 0.9;
    var buffer = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    var src = ac.createBufferSource(); src.buffer = buffer;
    var lp = ac.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(1800, now); lp.frequency.exponentialRampToValueAtTime(120, now + seconds);
    var g = ac.createGain(); g.gain.setValueAtTime(0.9, now); g.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    src.connect(lp).connect(g).connect(ac.destination); src.start(now); src.stop(now + seconds);
  }
  function buzz(p) {
    try { if (global.navigator && typeof global.navigator.vibrate === "function") global.navigator.vibrate(p); } catch (e) { /* ignore */ }
  }

  // ========================================================================
  // Utils
  // ========================================================================
  function fmt(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function stageLabel(st) { return st === "WIRES" ? "Wires" : st === "KEYPAD" ? "Keypad" : "Dials"; }
  function colorName(key) {
    for (var i = 0; i < COLORS.length; i++) if (COLORS[i].key === key) return COLORS[i].label;
    return key;
  }
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(an) === value);
    });
  }

  // Expose the pure rule engine for the Node solvability audit. Harmless in the
  // browser (no DOM, no side effects).
  module._test = {
    generate: generate, solve: solve, solveWire: solveWire, audit: audit,
    SYMBOLS: SYMBOLS, SYMBOL_TABLE: SYMBOL_TABLE, LETTER_BANK: LETTER_BANK,
    // read-only snapshot of the live host state, for the end-to-end UI test
    peek: function () { return { bomb: bomb, dials: dials, solved: solved, solvedCount: solvedCount, strikes: strikes, timeLeft: timeLeft, activeFace: activeFace }; }
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.zeitzunder = module;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));

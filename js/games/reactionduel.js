/*
 * games/reactionduel.js — Reaction Duel (two-player split-screen reflex)
 *
 * The device lies flat between two players; the screen is split into two tap
 * zones (top half rotated 180° for the player across the table). Each round is
 * one of several types — and crucially not just "tap fast": some rounds bait you
 * with fakes you must NOT react to.
 *
 * Every round reduces to a `live` flag the two race to tap on:
 *   - tap while LIVE  → that side wins the round
 *   - tap while NOT live (too early / took the bait / wrong target) → that side loses
 *
 * First to the target score wins the match. Drinking-capable: loser drinks.
 * No content file (round configs are inline logic). No audio (a sound would
 * leak a reflex cue). All timers cleared on round end and unmount.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var TARGETS = [3, 5, 7];
  var DEFAULTS = { target: 5, drinking: false };

  // colour round palette — only GREEN is "live"
  var GREEN = "#36d399";
  var COLOURS = ["#ff4d5e", "#3aa0ff", "#ffcf33", "#a06bff", "#ff8a3d", GREEN];
  // symbol round — only the target is "live"
  var TARGET_SYM = "💣";
  var DECOYS = ["🎉", "🍺", "🔥", "🎲", "⭐", "🍕", "💀", "🍑", "👻", "🦊"];

  function getRoundRules() {
    return {
      go:     t("Wait for 🟢, then TAP!"),
      bait:   t("TAP 🟢 — ignore the fakes! 🪤"),
      colour: t("TAP only on 🟢"),
      symbol: t("TAP only the 💣"),
    };
  }
  function getLoseReasons() {
    return {
      go:     t("jumped the gun! 🏁"),
      bait:   t("took the bait! 🪤"),
      colour: t("tapped the wrong colour! 🎨"),
      symbol: t("tapped the wrong thing! ❌"),
    };
  }

  var els = null, ctx = null, settings = null;
  var duel = null;            // [{ name }, { name }] left(top) / right(bottom)
  var li = 0, ri = 1;        // roster indices for the two duelists
  var scores = [0, 0];
  var timers = [];
  var phase = "idle";        // ready | armed | resolved
  var live = false;
  var roundType = "go";

  var module = {
    meta: {
      id: "reaction",
      name: "Reaction Duel",
      tagline: "Two players, one screen. Fastest wins — unless it's a trap.",
      icon: "⚡",
      minPlayers: 2,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        target: TARGETS.indexOf(parseInt(context.store.get("target", DEFAULTS.target), 10)) !== -1
          ? parseInt(context.store.get("target", DEFAULTS.target), 10) : DEFAULTS.target,
        drinking: context.store.get("drinking", false) === true,
      };
      li = 0; ri = 1;
      renderSetup();
    },
    unmount: function () {
      clearAll();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; duel = null; phase = "idle";
    },
  };

  // --- timers --------------------------------------------------------------
  function after(ms, fn) { var id = global.setTimeout(fn, ms); timers.push(id); return id; }
  function clearAll() { timers.forEach(function (id) { global.clearTimeout(id); }); timers = []; }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    clearAll();
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var hasRoster = roster.length >= 2;
    if (hasRoster) {
      if (li >= roster.length) li = 0;
      if (ri >= roster.length) ri = 1;
      if (li === ri) ri = (li + 1) % roster.length;
      duel = [{ name: roster[li].name }, { name: roster[ri].name }];
    } else {
      duel = [{ name: "Left" }, { name: "Right" }];
    }

    var pickers = hasRoster
      ? '<div class="rd-duelists">' +
        duelCard(0, "blue") + '<div class="act-vs">VS</div>' + duelCard(1, "red") +
        "</div>" +
        '<button id="rd-shuffle" class="btn btn-block">' + t("🔀 Shuffle players") + "</button>"
      : '<p class="muted small">' + t("Lay the phone flat between two players. Each owns one half of the screen.") + "</p>";

    var targetChips = TARGETS.map(function (n) {
      return '<button class="chip" data-target="' + n + '">' + t("First to {n}").replace("{n}", n) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">⚡ ' + t("Reaction Duel") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <p class="muted small">' + t("Lay the phone flat between two players. Each owns one half of the screen.") + "</p>" +
      pickers +
      '  <h3 class="sub">' + t("Match length") + "</h3>" +
      '  <div class="chip-row" id="rd-targets">' + targetChips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="rd-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode (loser drinks)") + "</span></label>" +
      '  <button id="rd-start" class="btn btn-primary btn-block btn-xl">' + t("Start duel ▶️") + "</button>" +
      "</section>";

    if (hasRoster) {
      els.querySelector("#rd-l").addEventListener("click", function () { li = nextIdx(li, roster.length, ri); renderSetup(); });
      els.querySelector("#rd-r").addEventListener("click", function () { ri = nextIdx(ri, roster.length, li); renderSetup(); });
      els.querySelector("#rd-shuffle").addEventListener("click", function () {
        li = Math.floor(Math.random() * roster.length);
        do { ri = Math.floor(Math.random() * roster.length); } while (ri === li);
        renderSetup();
      });
    }
    highlight("#rd-targets", String(settings.target), "data-target");
    els.querySelectorAll("#rd-targets .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.target = parseInt(c.getAttribute("data-target"), 10);
        ctx.store.set("target", settings.target);
        highlight("#rd-targets", String(settings.target), "data-target");
      });
    });
    els.querySelector("#rd-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#rd-start").addEventListener("click", function () {
      scores = [0, 0]; startRound();
    });
  }

  function duelCard(side, color) {
    return (
      '<div class="act-team act-team--' + color + '">' +
      '  <button id="rd-' + (side === 0 ? "l" : "r") + '" class="rd-pick">' + esc(duel[side].name) + "</button>" +
      '  <div class="act-team__members muted">' + t("tap to change") + "</div>" +
      "</div>"
    );
  }
  function nextIdx(cur, n, other) {
    var i = cur;
    for (var k = 0; k < n; k++) { i = (i + 1) % n; if (i !== other) return i; }
    return cur;
  }

  // --- Round ---------------------------------------------------------------
  function startRound() {
    clearAll();
    phase = "ready"; live = false;
    var types = ["go", "bait", "colour", "symbol"];
    roundType = types[Math.floor(Math.random() * types.length)];

    els.innerHTML =
      '<section class="screen rd-screen">' +
      '  <div class="rd-arena rd-ready">' +
      half(0) + half(1) +
      "  </div>" +
      "</section>";

    var arena = els.querySelector(".rd-arena");
    arena.querySelectorAll(".rd-half").forEach(function (h) {
      h.addEventListener("pointerdown", onTap);
      h.addEventListener("click", onTap); // fallback (e.g. non-pointer envs/tests)
    });

    paint("rd-ready", t("Get ready…") + "\n" + getRoundRules()[roundType]);
    after(1700, armRound);
  }

  function half(side) {
    var cls = side === 0 ? "rd-half rd-top" : "rd-half rd-bottom";
    return (
      '<button class="' + cls + '" data-side="' + side + '">' +
      '  <span class="rd-score">' + esc(duel[side].name) + " · " + scores[side] + "</span>" +
      '  <span class="rd-msg"></span>' +
      "</button>"
    );
  }

  function armRound() {
    if (phase !== "ready") return;
    phase = "armed"; live = false;
    if (roundType === "go") {
      paint("rd-wait", t("Wait…"));
      after(rand(1500, 4200), goLive);
    } else if (roundType === "bait") {
      paint("rd-wait", t("Wait…"));
      scheduleBaits();
    } else if (roundType === "colour") {
      colourTick();
    } else {
      symbolTick();
    }
  }

  function goLive() { if (phase !== "armed") return; live = true; paint("rd-go", "TAP! ⚡"); }

  function scheduleBaits() {
    // 2–3 fakes during the wait, then the real GO
    var n = 2 + Math.floor(Math.random() * 2);
    var delay = 0;
    for (var i = 0; i < n; i++) {
      delay += rand(700, 1300);
      (function (d) {
        after(d, function () {
          if (phase !== "armed" || live) return;
          var fakes = [t("GO? 🤔"), t("✋ STOP"), t("almost…"), t("NOW? 👀")];
          paint("rd-bait", fakes[Math.floor(Math.random() * fakes.length)]);
          after(360, function () { if (phase === "armed" && !live) paint("rd-wait", t("Wait…")); });
        });
      })(delay);
    }
    after(delay + rand(800, 1500), goLive);
  }

  function colourTick() {
    if (phase !== "armed") return;
    var green = Math.random() < 0.3;
    var c = green ? GREEN : COLOURS[Math.floor(Math.random() * (COLOURS.length - 1))];
    live = green;
    paintColour(c);
    after(rand(560, 950), colourTick);
  }

  function symbolTick() {
    if (phase !== "armed") return;
    var hit = Math.random() < 0.3;
    var s = hit ? TARGET_SYM : DECOYS[Math.floor(Math.random() * DECOYS.length)];
    live = hit;
    paint("rd-symbol", s);
    after(rand(620, 1000), symbolTick);
  }

  // --- Tap resolution ------------------------------------------------------
  function onTap(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (phase !== "armed") return;
    var side = parseInt((e.currentTarget || e.target).getAttribute("data-side"), 10);
    if (isNaN(side)) return;
    if (live) {
      resolve(side, 1 - side, t("too slow! 🐢"));
    } else {
      resolve(1 - side, side, getLoseReasons()[roundType]);
    }
  }

  function resolve(winner, loser, loserReason) {
    clearAll();
    phase = "resolved";
    scores[winner]++;
    if (scores[winner] >= settings.target) renderMatchWin(winner);
    else renderRoundResult(winner, loser, loserReason);
  }

  function renderRoundResult(winner, loser, loserReason) {
    els.innerHTML =
      '<section class="screen rd-result">' +
      '  <div class="result-emoji">⚡</div>' +
      '  <h2 class="result-title pop">' + esc(duel[winner].name) + t(" wins the round!") + "</h2>" +
      '  <p class="result-sub">' + esc(duel[loser].name) + " " + loserReason +
      (settings.drinking ? "<br/>🍺 <strong>" + esc(duel[loser].name) + " drinks!</strong>" : "") +
      "</p>" +
      '  <div class="rd-scoreline">' + scoreLine() + "</div>" +
      '  <button id="rd-next" class="btn btn-primary btn-block btn-xl">' + t("Next round ▶️") + "</button>" +
      "</section>";
    els.querySelector("#rd-next").addEventListener("click", startRound);
  }

  function renderMatchWin(winner) {
    els.innerHTML =
      '<section class="screen rd-win">' +
      '  <div class="boom-flash">🏆</div>' +
      '  <h2 class="boom-title">' + esc(duel[winner].name) + t(" wins!") + "</h2>" +
      '  <p class="result-sub">Took the duel ' + scores[winner] + "–" + scores[1 - winner] + "</p>" +
      '  <div class="stack">' +
      '    <button id="rd-again" class="btn btn-primary btn-block btn-xl">' + t("Rematch 🔁") + "</button>" +
      '    <button id="rd-setup" class="btn btn-block">' + t("Change players") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#rd-again").addEventListener("click", function () { scores = [0, 0]; startRound(); });
    els.querySelector("#rd-setup").addEventListener("click", renderSetup);
  }

  function scoreLine() {
    return '<span class="rd-s rd-s--blue">' + esc(duel[0].name) + " " + scores[0] + "</span>" +
      '<span class="rd-dash">–</span>' +
      '<span class="rd-s rd-s--red">' + scores[1] + " " + esc(duel[1].name) + "</span>";
  }

  // --- Painting ------------------------------------------------------------
  function paint(cls, msg) {
    var arena = els && els.querySelector(".rd-arena");
    if (!arena) return;
    arena.className = "rd-arena " + cls;
    arena.style.removeProperty("--rd-bg");
    arena.querySelectorAll(".rd-msg").forEach(function (m) { m.textContent = msg; });
  }
  function paintColour(hex) {
    var arena = els && els.querySelector(".rd-arena");
    if (!arena) return;
    arena.className = "rd-arena rd-colour";
    arena.style.setProperty("--rd-bg", hex);
    arena.querySelectorAll(".rd-msg").forEach(function (m) { m.textContent = ""; });
  }

  // --- Utils ---------------------------------------------------------------
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) { c.classList.toggle("chip--active", c.getAttribute(an) === value); });
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.reaction = module;
})(window);

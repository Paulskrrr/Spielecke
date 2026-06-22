/*
 * games/liars.js — Liar's Numbers
 *
 * A numeric-guess game on one device. A question with a number answer shows;
 * the phone passes round and each player privately locks a guess. Reveal the
 * answer and sort by distance: closest wins, furthest loses (drinking mode:
 * furthest drinks). All-number, so it dodges any language "tell".
 *
 * Uses the shared roster for the pass order + names.
 * Content: content/numbers.js (Spielecke.NumberQuestions). Drinking-capable.
 */
(function (global) {
  "use strict";

  var MIN_PLAYERS = 2;
  var DEFAULTS = { pool: "mixed", drinking: false };

  var els = null, ctx = null, settings = null;
  var players = [], question = null, guesses = [], idx = 0;

  var module = {
    meta: {
      id: "liars",
      name: "Liar's Numbers",
      tagline: "Everyone guesses a number. Closest wins, furthest eats it.",
      icon: "🔢",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pool: context.store.get("pool", DEFAULTS.pool) || DEFAULTS.pool,
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; question = null; guesses = [];
    },
  };

  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var pools = global.Spielecke.NumberQuestions || {};
    var chips = ['<button class="chip" data-pool="mixed">🎯 Mixed</button>']
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">Players (' + roster.length + "): " + esc(roster.map(function (p) { return p.name; }).join(", ")) + "</p>"
      : '<div class="roster-warn" style="display:block">⚠ Needs at least ' + MIN_PLAYERS + " players. Add them from the header (👥).</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🔢 Liar\'s Numbers</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      note +
      '  <h3 class="sub">Question pool</h3>' +
      '  <div class="chip-row" id="ln-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ln-drink"' + (settings.drinking ? " checked" : "") + " /><span>🍻 Drinking mode</span></label>" +
      '  <button id="ln-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">Start round ▶️</button>" +
      "</section>";

    highlight("#ln-pools", settings.pool, "data-pool");
    els.querySelectorAll("#ln-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool"); ctx.store.set("pool", settings.pool);
        highlight("#ln-pools", settings.pool, "data-pool");
      });
    });
    els.querySelector("#ln-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#ln-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    players = roster.map(function (p) { return p.name; });
    question = pickQuestion(settings.pool);
    guesses = [];
    idx = 0;
    renderPassTo();
  }

  function renderPassTo() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen ln-pass">' +
      '  <div class="pass-step">Player ' + (idx + 1) + " of " + players.length + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">Pass to ' + esc(name) + "</h2>" +
      '  <p class="muted">Lock your guess in private — don\'t let the others copy.</p>' +
      '  <button id="ln-go" class="btn btn-primary btn-block btn-xl">I\'m ' + esc(name) + " — guess</button>" +
      "</section>";
    els.querySelector("#ln-go").addEventListener("click", renderEntry);
  }

  function renderEntry() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen ln-entry">' +
      '  <h3 class="sub">' + esc(name) + "'s guess</h3>" +
      '  <div class="ln-question">' + esc(question.q) + "</div>" +
      '  <input id="ln-input" class="text-input ln-input" type="number" inputmode="numeric" placeholder="Your number" />' +
      '  <button id="ln-lock" class="btn btn-primary btn-block btn-xl">Lock it in 🔒</button>' +
      "</section>";
    var input = els.querySelector("#ln-input");
    input.focus();
    els.querySelector("#ln-lock").addEventListener("click", function () {
      var v = parseFloat(input.value);
      if (isNaN(v)) v = 0;
      guesses.push({ name: name, guess: v });
      idx++;
      if (idx >= players.length) renderReveal();
      else renderPassTo();
    });
  }

  function renderReveal() {
    var a = question.a;
    var ranked = guesses.slice().sort(function (x, y) {
      return Math.abs(x.guess - a) - Math.abs(y.guess - a);
    });
    var winner = ranked[0];
    var loser = ranked[ranked.length - 1];

    var rows = ranked.map(function (g, i) {
      var d = Math.abs(g.guess - a);
      var tag = i === 0 ? "👑" : (i === ranked.length - 1 ? (settings.drinking ? "🍺" : "💀") : "");
      return (
        '<li class="ln-row' + (i === 0 ? " ln-row--win" : (i === ranked.length - 1 ? " ln-row--lose" : "")) + '">' +
        '<span class="ln-row__name">' + tag + " " + esc(g.name) + "</span>" +
        '<span class="ln-row__guess">' + fmt(g.guess) + ' <span class="muted">(off ' + fmt(d) + ")</span></span>" +
        "</li>"
      );
    }).join("");

    var loseLine = settings.drinking
      ? "🍺 <strong>" + esc(loser.name) + "</strong> was furthest — drink!"
      : "💀 <strong>" + esc(loser.name) + "</strong> was furthest off.";

    els.innerHTML =
      '<section class="screen ln-reveal">' +
      '  <div class="result-emoji">🔢</div>' +
      '  <h2 class="result-title pop">Answer: ' + fmt(a) + "</h2>" +
      '  <p class="result-sub">🏆 <strong>' + esc(winner.name) + "</strong> nailed it!<br/>" + loseLine + "</p>" +
      '  <ul class="ln-list">' + rows + "</ul>" +
      '  <div class="stack">' +
      '    <button id="ln-next" class="btn btn-primary btn-block btn-xl">Next round 🔁</button>' +
      '    <button id="ln-settings" class="btn btn-block">Change settings</button>' +
      '    <button id="ln-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#ln-next").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#ln-settings").addEventListener("click", renderSetup);
    els.querySelector("#ln-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function pickQuestion(pool) {
    var pools = global.Spielecke.NumberQuestions || {};
    var keys = Object.keys(pools);
    if (!keys.length) return { q: "Pick a number 1–100", a: 50 };
    var list = (pool === "mixed" || !pools[pool])
      ? keys.reduce(function (acc, k) { return acc.concat(pools[k].questions || []); }, [])
      : (pools[pool].questions || []);
    if (!list.length) return { q: "Pick a number 1–100", a: 50 };
    return list[Math.floor(Math.random() * list.length)];
  }

  function fmt(n) {
    return (Math.round(n * 100) / 100).toLocaleString("en-US");
  }
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) { c.classList.toggle("chip--active", c.getAttribute(an) === value); });
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.liars = module;
})(window);

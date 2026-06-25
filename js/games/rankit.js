/*
 * games/rankit.js — Rank It
 *
 * One device, one shared list. A set of items shows with an axis to rank along
 * (best → worst, biggest → smallest, …). The phone passes round and each player
 * privately drags the items into their own order. Reveal builds the group's
 * consensus ranking and measures how far each player drifted from it: closest to
 * the group is the most in sync (wins), furthest off loses (drinking mode: drinks).
 *
 * Uses the shared roster for the pass order + names.
 * Content: content/rankit.js (Spielecke.RankItSets). Drinking-capable.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var MIN_PLAYERS = 2;
  var DEFAULTS = { pool: "mixed", drinking: false };

  var els = null, ctx = null, settings = null;
  var players = [], set = null, rankings = [], idx = 0, current = [];

  var module = {
    meta: {
      id: "rankit",
      name: "Rank It",
      tagline: "Everyone ranks the same five. Drift from the group and you lose.",
      icon: "🥇",
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
      ctx = null; settings = null; players = []; set = null; rankings = []; idx = 0; current = [];
    },
  };

  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var pools = sets();
    var chips = ['<button class="chip" data-pool="mixed">' + t("🎯 Mixed") + "</button>"]
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">' + t("Players ({n}): {names}").replace("{n}", roster.length).replace("{names}", esc(roster.map(function (p) { return p.name; }).join(", "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🥇 ' + t("Rank It") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="ri-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ri-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="ri-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start round ▶️") + "</button>" +
      "</section>";

    highlight("#ri-pools", settings.pool, "data-pool");
    els.querySelectorAll("#ri-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool"); ctx.store.set("pool", settings.pool);
        highlight("#ri-pools", settings.pool, "data-pool");
      });
    });
    els.querySelector("#ri-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#ri-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    players = roster.map(function (p) { return p.name; });
    set = pickSet(settings.pool);
    rankings = [];
    idx = 0;
    current = [];
    renderPassTo();
  }

  function renderPassTo() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen ri-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", idx + 1).replace("{n}", players.length) + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("Build your ranking in private — don\'t let the others copy.") + "</p>" +
      '  <button id="ri-go" class="btn btn-primary btn-block btn-xl">' + t("I\'m {name} — reveal").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#ri-go").addEventListener("click", function () { current = []; renderRank(); });
  }

  function renderRank() {
    var name = players[idx];
    var items = set.items;
    var complete = current.length === items.length;

    // Chosen items in rank order (tap to undo the last one).
    var chosen = current.map(function (itemIdx, pos) {
      return (
        '<li class="ri-rank__item">' +
        '<span class="ri-rank__no">' + (pos + 1) + "</span>" +
        '<span class="ri-rank__label">' + esc(items[itemIdx]) + "</span>" +
        "</li>"
      );
    }).join("");

    // Remaining items as tappable buttons.
    var pool = items.map(function (label, i) {
      if (current.indexOf(i) !== -1) return "";
      return '<button class="btn ri-pick" data-i="' + i + '">' + esc(label) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen ri-rank">' +
      '  <h3 class="sub">' + t("{name}'s ranking").replace("{name}", esc(name)) + "</h3>" +
      '  <div class="ri-title">' + esc(set.title) + "</div>" +
      '  <p class="muted small">' + t("Tap the items in order — top of the list first.") + "</p>" +
      '  <ol class="ri-rank-list">' + (chosen || '<li class="ri-rank__empty muted">' + t("Nothing picked yet.") + "</li>") + "</ol>" +
      '  <div class="ri-pool">' + pool + "</div>" +
      '  <div class="stack">' +
      '    <button id="ri-reset" class="btn btn-block"' + (current.length ? "" : " disabled") + ">" + t("↺ Reset") + "</button>" +
      '    <button id="ri-lock" class="btn btn-primary btn-block btn-xl"' + (complete ? "" : " disabled") + ">" + t("Lock it in 🔒") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelectorAll(".ri-pick").forEach(function (b) {
      b.addEventListener("click", function () {
        current.push(parseInt(b.getAttribute("data-i"), 10));
        renderRank();
      });
    });
    els.querySelector("#ri-reset").addEventListener("click", function () { current = []; renderRank(); });
    var lock = els.querySelector("#ri-lock");
    if (complete) lock.addEventListener("click", function () {
      rankings.push({ name: name, order: current.slice() });
      idx++;
      current = [];
      if (idx >= players.length) renderReveal();
      else renderPassTo();
    });
  }

  function renderReveal() {
    var items = set.items;
    var n = items.length;

    // Average position of each item across all players (0 = ranked first).
    var avg = items.map(function (_, i) {
      var sum = rankings.reduce(function (a, r) { return a + r.order.indexOf(i); }, 0);
      return sum / rankings.length;
    });

    // Consensus order = item indices sorted by average position (stable).
    var consensusOrder = items.map(function (_, i) { return i; }).sort(function (a, b) {
      return avg[a] - avg[b] || a - b;
    });
    var consensusRank = [];
    consensusOrder.forEach(function (itemIdx, pos) { consensusRank[itemIdx] = pos; });

    // Each player's drift = sum of |their position − consensus position| (footrule).
    var scored = rankings.map(function (r) {
      var drift = items.reduce(function (a, _, i) {
        return a + Math.abs(r.order.indexOf(i) - consensusRank[i]);
      }, 0);
      return { name: r.name, drift: drift };
    }).sort(function (x, y) { return x.drift - y.drift; });

    var winner = scored[0];
    var loser = scored[scored.length - 1];
    var split = winner.drift !== loser.drift; // everyone identical → no win/lose

    var consensusList = consensusOrder.map(function (itemIdx, pos) {
      return (
        '<li class="ri-row">' +
        '<span class="ri-row__no">' + (pos + 1) + "</span>" +
        '<span class="ri-row__label">' + esc(items[itemIdx]) + "</span>" +
        "</li>"
      );
    }).join("");

    var playerRows = scored.map(function (s, i) {
      var tag = !split ? "" : (i === 0 ? "👑" : (i === scored.length - 1 ? (settings.drinking ? "🍺" : "💀") : ""));
      var cls = !split ? "" : (i === 0 ? " ri-prow--win" : (i === scored.length - 1 ? " ri-prow--lose" : ""));
      return (
        '<li class="ri-prow' + cls + '">' +
        '<span class="ri-prow__name">' + tag + " " + esc(s.name) + "</span>" +
        '<span class="ri-prow__drift muted">' + t("off by {n}").replace("{n}", s.drift) + "</span>" +
        "</li>"
      );
    }).join("");

    var verdict = !split
      ? '<p class="result-sub">' + t("A perfect match — the whole table agrees! 🤝") + "</p>"
      : '<p class="result-sub">👑 <strong>' + esc(winner.name) + "</strong> " + t("is the most in sync.") + "<br/>" +
        (settings.drinking
          ? "🍺 <strong>" + esc(loser.name) + "</strong> " + t("drifted furthest — drink!")
          : "💀 <strong>" + esc(loser.name) + "</strong> " + t("drifted furthest.")) + "</p>";

    els.innerHTML =
      '<section class="screen ri-reveal">' +
      '  <div class="result-emoji">🥇</div>' +
      '  <h2 class="result-title pop">' + t("The group has spoken") + "</h2>" +
      verdict +
      '  <h3 class="sub">' + esc(set.title) + "</h3>" +
      '  <ol class="ri-consensus">' + consensusList + "</ol>" +
      '  <h3 class="sub">' + t("Who drifted?") + "</h3>" +
      '  <ul class="ri-players">' + playerRows + "</ul>" +
      '  <div class="stack">' +
      '    <button id="ri-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>" +
      '    <button id="ri-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      '    <button id="ri-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#ri-next").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#ri-settings").addEventListener("click", renderSetup);
    els.querySelector("#ri-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function pickSet(pool) {
    var pools = sets();
    var keys = Object.keys(pools);
    if (!keys.length) return { title: "Rank these 1–5", items: ["One", "Two", "Three", "Four", "Five"] };
    var list = (pool === "mixed" || !pools[pool])
      ? keys.reduce(function (acc, k) { return acc.concat(pools[k].sets || []); }, [])
      : (pools[pool].sets || []);
    if (!list.length) return { title: "Rank these 1–5", items: ["One", "Two", "Three", "Four", "Five"] };
    return list[Math.floor(Math.random() * list.length)];
  }

  // Current-language pools from the bilingual { de, en } content bundle.
  function sets() { return global.Spielecke.L(global.Spielecke.RankItSets) || {}; }
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) { c.classList.toggle("chip--active", c.getAttribute(an) === value); });
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.rankit = module;
})(window);

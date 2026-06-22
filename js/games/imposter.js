/*
 * games/imposter.js — Imposter (one device, pass-around hidden roles)
 *
 * Everyone secretly gets the same SECRET WORD — except the IMPOSTERS, who only
 * learn the category. The number of imposters is chosen before dealing (1 up to
 * the whole table). Pass the phone around so each player reveals their own role
 * in private. Then talk it out, vote, and unmask the faker(s).
 *
 * Uses the shared roster for the pass order and player names (this is a game
 * that legitimately needs turns — the per-game choice, not a shell assumption).
 *
 * Plain win/lose: imposter(s) caught => the table wins; fooled => imposters win.
 *
 * Content comes from the SHARED term database (content/terms.js,
 * Spielecke.Terms) so Imposter and Who Am I? stay editable in one place.
 */
(function (global) {
  "use strict";

  var MIN_PLAYERS = 3;
  var DEFAULTS = { pool: "mixed", imposterCount: 1 };

  // Per-mount state
  var els = null;
  var ctx = null;
  var settings = null;

  var players = [];     // names for this round
  var imposterSet = {}; // { playerIndex: true } for imposters this round
  var secretWord = "";
  var secretCategory = "";
  var revealIdx = 0;    // whose turn to reveal during the pass phase
  var roleShown = false;

  var module = {
    meta: {
      id: "imposter",
      name: "Imposter",
      tagline: "Everyone knows the word. One faker doesn't. Sniff them out.",
      icon: "🕵️",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: false,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = {
        pool: context.store.get("pool", DEFAULTS.pool) || DEFAULTS.pool,
        imposterCount: parseInt(context.store.get("imposterCount", DEFAULTS.imposterCount), 10) || 1,
      };
      renderSetup();
    },

    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; imposterSet = {}; secretWord = ""; secretCategory = "";
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var pools = global.Spielecke.Terms || {};

    var chips = ['<button class="chip" data-pool="mixed">🎯 Mixed</button>']
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    var enough = roster.length >= MIN_PLAYERS;
    var rosterNote = enough
      ? '<p class="muted small">Players this round (' + roster.length + "): " +
        esc(roster.map(function (p) { return p.name; }).join(", ")) + "</p>"
      : '<div class="roster-warn" style="display:block">⚠ Imposter needs at least ' +
        MIN_PLAYERS + " players. Add them from the header (👥 above).</div>";

    // Clamp the imposter count to [1, number of players] (max = whole table).
    var countSection = "";
    if (enough) {
      if (settings.imposterCount > roster.length) settings.imposterCount = roster.length;
      if (settings.imposterCount < 1) settings.imposterCount = 1;
      var countChips = [];
      for (var n = 1; n <= roster.length; n++) {
        countChips.push('<button class="chip" data-count="' + n + '">' + n + "</button>");
      }
      countSection =
        '<h3 class="sub">How many imposters?</h3>' +
        '<div class="chip-row" id="im-count">' + countChips.join("") + "</div>";
    }

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🕵️ Imposter</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      rosterNote +
      '  <h3 class="sub">Word pool</h3>' +
      '  <div class="chip-row" id="im-pools">' + chips + "</div>" +
      countSection +
      '  <button id="im-deal" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") +
      ">Deal roles 🎴</button>" +
      "</section>";

    highlight("#im-pools", settings.pool, "data-pool");
    els.querySelectorAll("#im-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool");
        ctx.store.set("pool", settings.pool);
        highlight("#im-pools", settings.pool, "data-pool");
      });
    });
    if (enough) {
      highlight("#im-count", String(settings.imposterCount), "data-count");
      els.querySelectorAll("#im-count .chip").forEach(function (c) {
        c.addEventListener("click", function () {
          settings.imposterCount = parseInt(c.getAttribute("data-count"), 10);
          ctx.store.set("imposterCount", settings.imposterCount);
          highlight("#im-count", String(settings.imposterCount), "data-count");
        });
      });
    }
    var deal = els.querySelector("#im-deal");
    if (enough) deal.addEventListener("click", function () { dealRoles(roster); });
  }

  // --- Deal & reveal phase -------------------------------------------------
  function dealRoles(roster) {
    players = roster.map(function (p) { return p.name; });
    var count = Math.max(1, Math.min(settings.imposterCount, players.length));
    imposterSet = {};
    // pick `count` distinct imposter indices
    var idxs = players.map(function (_, i) { return i; });
    for (var i = idxs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = idxs[i]; idxs[i] = idxs[j]; idxs[j] = t; }
    idxs.slice(0, count).forEach(function (i) { imposterSet[i] = true; });

    var picked = pickWord(settings.pool);
    secretWord = picked.word;
    secretCategory = picked.category;
    revealIdx = 0;
    renderPassTo();
  }

  function imposterNames() {
    return players.filter(function (_, i) { return imposterSet[i]; });
  }
  function imposterTotal() {
    var n = 0; for (var k in imposterSet) if (imposterSet[k]) n++; return n;
  }

  function renderPassTo() {
    roleShown = false;
    var name = players[revealIdx];
    els.innerHTML =
      '<section class="screen imposter-pass">' +
      '  <div class="pass-step">Player ' + (revealIdx + 1) + " of " + players.length + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">Pass to ' + esc(name) + "</h2>" +
      '  <p class="muted">Only ' + esc(name) + " should look. Everyone else: no peeking.</p>" +
      '  <button id="im-reveal" class="btn btn-primary btn-block btn-xl">I’m ' + esc(name) + " — reveal</button>" +
      "</section>";
    els.querySelector("#im-reveal").addEventListener("click", showRole);
  }

  function showRole() {
    roleShown = true;
    var isImposter = !!imposterSet[revealIdx];
    var last = revealIdx === players.length - 1;
    var total = imposterTotal();
    var allyNote = total > 1
      ? "You’re 1 of " + total + " imposters — but who else?"
      : "Blend in. Don’t get caught.";
    var body = isImposter
      ? '<div class="role-card role-card--imposter">' +
        '  <div class="role-label">You are the</div>' +
        '  <div class="role-big">IMPOSTER 🤫</div>' +
        '  <div class="role-hint">Category: <strong>' + esc(secretCategory) + "</strong></div>" +
        '  <div class="role-note">' + allyNote + "</div>" +
        "</div>"
      : '<div class="role-card">' +
        '  <div class="role-label">The secret word is</div>' +
        '  <div class="role-big">' + esc(secretWord) + "</div>" +
        '  <div class="role-hint">Category: ' + esc(secretCategory) + "</div>" +
        '  <div class="role-note">Hint at it — never say it.</div>' +
        "</div>";

    els.innerHTML =
      '<section class="screen imposter-role">' + body +
      '  <button id="im-hide" class="btn btn-block btn-xl">' +
      (last ? "Hide & start talking 🗣️" : "Hide & pass on ➡️") + "</button>" +
      "</section>";
    els.querySelector("#im-hide").addEventListener("click", function () {
      if (last) renderDiscussion();
      else { revealIdx++; renderPassTo(); }
    });
  }

  // --- Discussion & reveal -------------------------------------------------
  function renderDiscussion() {
    els.innerHTML =
      '<section class="screen imposter-talk">' +
      '  <h2 class="screen-title pop">🗣️ Talk it out</h2>' +
      '  <p>Go round the table. Each person says <strong>one word</strong> hinting at the secret. ' +
      "The imposter is faking it. After a round or two, <strong>vote</strong> on who the faker is.</p>" +
      '  <button id="im-reveal2" class="btn btn-primary btn-block btn-xl">Reveal the imposter 🔦</button>' +
      '  <button id="im-home" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "</section>";
    els.querySelector("#im-reveal2").addEventListener("click", renderReveal);
    els.querySelector("#im-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function renderReveal() {
    var names = imposterNames();
    var plural = names.length > 1;
    var joined = names.map(esc).join(" & ");
    var title = plural ? joined + " were the imposters!" : joined + " was the imposter!";

    els.innerHTML =
      '<section class="screen imposter-reveal">' +
      '  <div class="reveal-emoji">🕵️</div>' +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      '  <p class="result-sub">The word was: <strong>' + esc(secretWord) + "</strong></p>" +
      '  <p class="muted">Did the table catch ' + (plural ? "them all" : "them") + "?</p>" +
      '  <div class="stack">' +
      '    <button id="im-caught" class="btn btn-got btn-block btn-xl">We caught ' + (plural ? "them all" : "them") + " 🎯</button>" +
      '    <button id="im-fooled" class="btn btn-skip btn-block btn-xl">They fooled us 🤡</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#im-caught").addEventListener("click", function () {
      renderOutcome("🎯 Caught!", "The table wins — " + joined + (plural ? " got busted!" : " got busted!"));
    });
    els.querySelector("#im-fooled").addEventListener("click", function () {
      renderOutcome("🤡 Fooled!", joined + (plural ? " got away with it — imposters win!" : " got away with it — imposter wins!"));
    });
  }

  function renderOutcome(title, line) {
    els.innerHTML =
      '<section class="screen imposter-outcome">' +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      '  <p class="result-sub">' + line + "</p>" +
      '  <div class="stack">' +
      '    <button id="im-again" class="btn btn-primary btn-block btn-xl">New round 🔁</button>' +
      '    <button id="im-settings" class="btn btn-block">Change pool</button>' +
      '    <button id="im-home2" class="btn btn-ghost btn-block">Back to shelf</button>' +
      "  </div>" +
      "</section>";
    els.querySelector("#im-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) dealRoles(roster); else renderSetup();
    });
    els.querySelector("#im-settings").addEventListener("click", renderSetup);
    els.querySelector("#im-home2").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Word picking --------------------------------------------------------
  function pickWord(pool) {
    var pools = global.Spielecke.Terms || {};
    var keys = Object.keys(pools);
    if (!keys.length) return { word: "Beer", category: "Party" };

    var key;
    if (pool === "mixed" || !pools[pool]) {
      key = keys[Math.floor(Math.random() * keys.length)];
    } else {
      key = pool;
    }
    var words = pools[key].terms || [];
    var word = words.length ? words[Math.floor(Math.random() * words.length)] : "Beer";
    var category = (pools[key].label || key).replace(/^[^\w]+\s*/, ""); // strip leading emoji
    return { word: word, category: category };
  }

  // --- Utils ---------------------------------------------------------------
  function highlight(sel, value, attrName) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(attrName) === value);
    });
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.imposter = module;
})(window);

/*
 * games/geschmacklos.js — Geschmacklos (Cards-Against-Humanity mode)
 *
 * Asymmetric, no sync. On entry you pick a role:
 *   🎙️ Host   — one screen shows the black prompt, the Card Czar and the score,
 *               plus a short TISCHCODE (a seed).
 *   🃏 Spieler — every phone types that code + says a free seat number aloud, and
 *               deals ITSELF a hand of 8 white cards. After 4 cards have been
 *               played the hand resets to a fresh 8. Prompts may have one blank
 *               or two (Pick 2 — a badge flags those, the player plays two cards).
 *
 * The trick that needs no backend: all phones run the SAME deterministic shuffle
 * of the answer deck from the shared code (Spielecke.seededShuffle), and seat s
 * takes the disjoint block [s·CAP, s·CAP+CAP). Same code everywhere → zero dupes
 * across the table; a fresh code each game → seat 3 never gets the same cards.
 * Read prompt+card aloud round the table (you can tell whose phone is whose).
 *
 * Content: js/content/geschmacklos.js (Spielecke.Geschmacklos) — { prompts, answers }.
 * Contract: meta + mount + unmount().
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var seededShuffle = global.Spielecke.seededShuffle;

  // 8 cards dealt at a time; a hand is "spent" and refreshes once ROUND (4) of
  // them have been played. Windows step by HAND across the seat's block (the
  // unplayed 4 are discarded on reset) so a card is never dealt to the same
  // seat twice. capacity() (block size) stays disjoint across seats regardless.
  var HAND = 8, ROUND = 4, MAXSLOTS = 12;
  var CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  var els = null, ctx = null;

  var module = {
    meta: {
      id: "geschmacklos",
      name: "Geschmacklos",
      tagline: "One prompt, everyone's worst card. Read it out. Regret nothing.",
      icon: "🃏",
      minPlayers: 3,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      renderRolePicker();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null;
    },
  };

  function content() { return global.Spielecke.L(global.Spielecke.Geschmacklos) || { prompts: [], answers: [] }; }
  function answers() { return content().answers || []; }
  function prompts() { return content().prompts || []; }
  function roster() { return (ctx.players || []).filter(function (p) { return p && p.name; }); }
  function genCode() { var s = ""; for (var i = 0; i < 4; i++) s += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length)); return s; }

  function capacity() { return Math.max(HAND, Math.floor(answers().length / MAXSLOTS)); }
  function blockFor(code, slot) {
    var order = seededShuffle(answers(), code);
    var start = (slot - 1) * capacity();
    return order.slice(start, start + capacity());
  }

  // --- Role picker ---------------------------------------------------------
  function renderRolePicker() {
    els.innerHTML =
      '<section class="screen gk-roles">' +
      '  <h2 class="screen-title pop">🃏 ' + t("Geschmacklos") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <div class="gk-role-cards">' +
      '    <button id="gk-host" class="gk-role-card"><span class="gk-role-ic">🎙️</span><span class="gk-role-t">' + t("I'm the host") + "</span><span class='muted small'>" + t("Shows prompt, czar & code") + "</span></button>" +
      '    <button id="gk-player" class="gk-role-card"><span class="gk-role-ic">🃏</span><span class="gk-role-t">' + t("I'm a player") + "</span><span class='muted small'>" + t("Deal me a hand") + "</span></button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#gk-host").addEventListener("click", renderHost);
    els.querySelector("#gk-player").addEventListener("click", playerStart);
  }

  // ======================================================================
  // HOST
  // ======================================================================
  function renderHost() {
    var code = ctx.store.get("code", "");
    if (!code) { code = genCode(); ctx.store.set("code", code); ctx.store.set("czar", randSeat()); ctx.store.set("scores", {}); }
    var prompt = ctx.store.get("prompt", "");
    if (!prompt) { prompt = drawPrompt(); ctx.store.set("prompt", prompt); }

    var r = roster();
    var scores = ctx.store.get("scores", {});
    var czarIdx = ctx.store.get("czar", 0);
    var czar = r.length ? r[czarIdx % r.length].name : t("nobody yet");

    var board = r.length
      ? '<div class="gk-scores">' + r.map(function (p) {
          return '<button class="gk-score" data-id="' + attr(p.id) + '"><span>' + esc(p.name) + "</span><span class='gk-score-n'>" + (scores[p.id] || 0) + "</span></button>";
        }).join("") + "</div>" +
        '<p class="muted small">' + t("Tap a name to give them the point.") + "</p>"
      : '<p class="muted small">' + t("Add players from the header to track the score.") + "</p>";

    var pick2 = blanks(prompt) >= 2
      ? '<span class="gk-pick2">' + t("PICK 2") + "</span>"
      : "";

    els.innerHTML =
      '<section class="screen gk-host">' +
      '  <div class="gk-codebar">' + t("Table code") + ' <span class="gk-code">' + esc(code) + "</span></div>" +
      '  <div class="gk-czar">🎙️ ' + t("Card Czar") + ": <strong>" + esc(czar) + "</strong></div>" +
      '  <div class="gk-prompt' + (pick2 ? " gk-prompt--pick2" : "") + '">' + pick2 + esc(prompt) + "</div>" +
      board +
      '  <button id="gk-next" class="btn btn-primary btn-block btn-xl">' + t("Next prompt 🎤") + "</button>" +
      '  <button id="gk-newcode" class="btn btn-block">' + t("New table code 🔁") + "</button>" +
      "</section>";

    els.querySelectorAll(".gk-score").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        var sc = ctx.store.get("scores", {});
        sc[id] = (sc[id] || 0) + 1;
        ctx.store.set("scores", sc);
        var n = b.querySelector(".gk-score-n"); if (n) n.textContent = sc[id];
      });
    });
    els.querySelector("#gk-next").addEventListener("click", function () {
      ctx.store.set("prompt", drawPrompt());
      ctx.store.set("czar", (ctx.store.get("czar", 0) + 1));
      renderHost();
    });
    els.querySelector("#gk-newcode").addEventListener("click", function () {
      // A new code re-deals every player's hand, so the WHOLE table state turns
      // over with it: fresh prompt, scores wiped, random czar seat.
      ctx.store.set("code", genCode());
      ctx.store.set("prompt", drawPrompt());
      ctx.store.set("scores", {});
      ctx.store.set("czar", randSeat());   // fresh game → don't always restart the czar at seat 1
      renderHost();
    });
  }

  function randSeat() { var n = roster().length; return n ? Math.floor(Math.random() * n) : 0; }

  function drawPrompt() {
    var p = prompts();
    return p.length ? p[Math.floor(Math.random() * p.length)] : t("Fill in the blank: ___");
  }
  function blanks(s) { return (String(s).match(/___/g) || []).length; }

  // ======================================================================
  // PLAYER
  // ======================================================================
  function playerStart() {
    var code = ctx.store.get("p_code", "");
    var slot = ctx.store.get("p_slot", 0);
    if (code && slot) renderHand();
    else renderCodeEntry();
  }

  function renderCodeEntry() {
    var slots = [];
    for (var i = 1; i <= MAXSLOTS; i++) slots.push('<button class="chip gk-slot" data-slot="' + i + '">' + i + "</button>");
    els.innerHTML =
      '<section class="screen gk-join">' +
      '  <h2 class="screen-title pop">🃏 ' + t("Join the table") + "</h2>" +
      '  <p class="muted">' + t("Type the host's table code, then claim a free seat number (say it out loud so no two of you clash).") + "</p>" +
      '  <input id="gk-code-in" class="text-input" type="text" maxlength="4" autocapitalize="characters" autocomplete="off" placeholder="' + attr(t("CODE")) + '" />' +
      '  <h3 class="sub">' + t("Your seat") + "</h3>" +
      '  <div class="chip-row" id="gk-slots">' + slots.join("") + "</div>" +
      '  <button id="gk-join" class="btn btn-primary btn-block btn-xl" disabled>' + t("Deal me in 🃏") + "</button>" +
      "</section>";

    var chosen = 0;
    var input = els.querySelector("#gk-code-in");
    var join = els.querySelector("#gk-join");
    function refresh() { join.disabled = !(input.value.trim().length >= 3 && chosen >= 1); }
    input.addEventListener("input", refresh);
    els.querySelectorAll(".gk-slot").forEach(function (c) {
      c.addEventListener("click", function () {
        chosen = parseInt(c.getAttribute("data-slot"), 10);
        els.querySelectorAll(".gk-slot").forEach(function (x) { x.classList.remove("chip--active"); });
        c.classList.add("chip--active");
        refresh();
      });
    });
    join.addEventListener("click", function () {
      var code = input.value.trim().toUpperCase();
      ctx.store.set("p_code", code);
      ctx.store.set("p_slot", chosen);
      ctx.store.set("p_hi", 0);
      ctx.store.set("p_played", []);
      renderHand();
    });
  }

  function renderHand() {
    var code = ctx.store.get("p_code", "");
    var slot = ctx.store.get("p_slot", 1);
    var hi = ctx.store.get("p_hi", 0);
    var played = ctx.store.get("p_played", []);
    var block = blockFor(code, slot);
    var hand = block.slice(hi * HAND, hi * HAND + HAND);

    if (!hand.length) return renderEmpty();

    // A hand is spent once ROUND cards have been played (or, on a short final
    // window, once they're all played). Then it refreshes to the next 8.
    var need = Math.min(ROUND, hand.length);
    var roundDone = played.length >= need;

    var tiles = hand.map(function (card, i) {
      var isPlayed = played.indexOf(i) !== -1;
      // once the round is done the remaining unplayed cards lock too — the whole
      // hand resets, you don't cherry-pick past four.
      var locked = isPlayed || roundDone;
      return '<button class="gk-card' + (isPlayed ? " gk-card--played" : "") + '" data-i="' + i + '"' + (locked ? " disabled" : "") + ">" + esc(card) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen gk-hand">' +
      '  <div class="gk-hand-bar">' + t("Seat {s} · code {c}").replace("{s}", slot).replace("{c}", esc(code)) + "</div>" +
      '  <div class="gk-cards">' + tiles + "</div>" +
      '  <div class="gk-progress">' + t("{n}/{m} played this hand").replace("{n}", played.length).replace("{m}", need) + "</div>" +
      (roundDone
        ? '  <button id="gk-nexthand" class="btn btn-primary btn-block btn-xl">' + t("Fresh hand 🃏") + "</button>"
        : "") +
      '  <button id="gk-leave" class="btn btn-ghost btn-block">' + t("New code / seat") + "</button>" +
      "</section>";

    els.querySelectorAll(".gk-card").forEach(function (b) {
      if (b.disabled) return;
      b.addEventListener("click", function () { renderCard(hand[parseInt(b.getAttribute("data-i"), 10)], parseInt(b.getAttribute("data-i"), 10)); });
    });
    var nh = els.querySelector("#gk-nexthand");
    if (nh) nh.addEventListener("click", function () {
      ctx.store.set("p_hi", hi + 1); ctx.store.set("p_played", []); renderHand();
    });
    els.querySelector("#gk-leave").addEventListener("click", function () {
      ctx.store.set("p_code", ""); ctx.store.set("p_slot", 0); renderCodeEntry();
    });
  }

  function renderCard(text, pos) {
    els.innerHTML =
      '<section class="screen gk-cardview">' +
      '  <div class="gk-bigcard">' + esc(text) + "</div>" +
      '  <div class="stack">' +
      '    <button id="gk-discard" class="btn btn-primary btn-block btn-xl">' + t("Played it ✓") + "</button>" +
      '    <button id="gk-back" class="btn btn-ghost btn-block">' + t("← Back to hand") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#gk-discard").addEventListener("click", function () {
      var played = ctx.store.get("p_played", []);
      if (played.indexOf(pos) === -1) played.push(pos);
      ctx.store.set("p_played", played);
      renderHand();
    });
    els.querySelector("#gk-back").addEventListener("click", renderHand);
  }

  function renderEmpty() {
    els.innerHTML =
      '<section class="screen gk-empty">' +
      '  <div class="reveal-emoji">🃏</div>' +
      '  <h2 class="result-title pop">' + t("Out of cards!") + "</h2>" +
      '  <p class="result-sub">' + t("Grab a fresh table code from the host.") + "</p>" +
      '  <button id="gk-reset" class="btn btn-primary btn-block btn-xl">' + t("New code / seat") + "</button>" +
      "</section>";
    els.querySelector("#gk-reset").addEventListener("click", function () {
      ctx.store.set("p_code", ""); ctx.store.set("p_slot", 0); renderCodeEntry();
    });
  }

  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.geschmacklos = module;
})(window);

// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/hochadel.js — „Hochadel" (royal-court drinking card game; see PARTY-APP-SPEC.md §3)
 *
 * A Klattschen-style game: players draw action cards in turn; cards command who
 * must **dienen** (the in-game word for "drink"). Four card types drive both the
 * colour and the mechanic (spec §2):
 *   sofort    (Karmesin)  execute once, then discard — the common card
 *   regel     (Saphir)    becomes a standing rule, accumulates in „Hofgesetze"
 *   aktiv     (Gold)      stays face-up with the drawer, self-triggered later
 *   minispiel (Purpur)    a mini-game card the table plays themselves; the loser
 *                         dient, then the card is completed like any other
 *
 * Minispiel cards are just cards — no in-app guided menu; the players run the
 * game at the table and the host completes the card (spacebar or the button).
 *
 * Space/Enter always fires the current screen's primary action (draw / complete).
 *
 * The deck lives in content/hochadel.js as data, tagged per edition, so a future
 * edition = a swappable card set behind the same engine. The active edition is
 * „Diener & Könige"; „Rapunzel-Edition" is a locked stub on the start screen.
 *
 * Plugs into the shell via the Game Module Contract: reuses the shared roster
 * (context.players), the namespaced store (context.store), and goHome(). The
 * Sanduhr timer and the space-key listener are cleared/removed on unmount.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  // Pick the current language's subtree from the bilingual content bundle
  // (mirrors the Rank It accessor: every content read goes through Spielecke.L).
  function content() {
    return global.Spielecke.L(global.Spielecke.Hochadel) || { editions: [], groundRules: [], verses: [], deck: [] };
  }

  // Heraldic palette + labels per card type (spec §2). No green (red-green-safe).
  var TYPE_META = {
    sofort:    { tag: "Crimson", label: "Instant Action",  colour: "#9B1B30" },
    regel:     { tag: "Sapphire", label: "Passive / Rule", colour: "#1B3A6B" },
    aktiv:     { tag: "Gold",    label: "Trump",           colour: "#C9A227" },
    minispiel: { tag: "Purple",  label: "Mini-game",       colour: "#5B2A86" },
  };

  var els = null, ctx = null, data = null;
  var cardById = {};      // id -> card (from content)
  var game = null;        // full persisted game state
  var timers = [];        // setTimeout ids (Sanduhr) — survive between renders
  var tickers = [];       // setInterval ids — cleared on nav

  var module = {
    meta: {
      id: "hochadel",
      name: "Hochadel",
      tagline: "Royal court card game — transgressors serve.",
      icon: "👑",
      minPlayers: 2,
      supportsDrinking: true, // it IS a drinking game — show the Trinkspiel marker
    },
    mount: function (container, context) {
      els = container;
      ctx = context;
      data = content();
      cardById = {};
      data.deck.forEach(function (c) { cardById[c.id] = c; });

      var saved = context.store.get("state", null);
      if (saved && saved.edition && saved.order && saved.order.length >= 2
          && rosterMatchesSaved(saved.order)) {
        game = reconcile(saved);
        expireTempRules(); // clear any temp rule whose window already elapsed
        renderGroundRules(renderTable);
      } else {
        // No saved game, or it belongs to a different roster — start fresh so
        // the court is seated with the players currently in the roster.
        context.store.set("state", null);
        renderEdition();
      }
    },
    unmount: function () {
      clearAll();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; data = null; game = null; cardById = {};
    },
  };

  // Spacebar fires the screen's primary action (draw / complete / advance) — now
  // handled globally by the shell, which clicks the on-screen [data-primary].

  // --- timers --------------------------------------------------------------
  function after(ms, fn) { var id = global.setTimeout(fn, ms); timers.push(id); return id; }
  function clearTickers() { tickers.forEach(function (id) { global.clearInterval(id); }); tickers = []; }
  function clearAll() {
    timers.forEach(function (id) { global.clearTimeout(id); });
    clearTickers();
    timers = [];
  }

  // --- state ---------------------------------------------------------------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function buildDeck(edition) {
    var cards = data.deck.filter(function (c) { return c.editions.indexOf(edition) !== -1; });
    var regel = [], rest = [];
    cards.forEach(function (c) {
      // `copies` (default 1) seeds a card more than once — evergreen basics and
      // mini-games are set to 2 so they can come up twice a night.
      var bucket = c.type === "regel" ? regel : rest;
      for (var k = 0; k < (c.copies || 1); k++) bucket.push(c.id);
    });

    // Bias: a „regel" card ("the word ‚yes‘ is banished from now on") only bites
    // if it lands early — one drawn in the last third barely gets to apply. So
    // confine EVERY rule card to the first two-thirds of the deck: fill that
    // front zone with all rule cards plus enough others (shuffled together), and
    // let the back third be purely non-rule cards. Rule cards become Hofgesetze
    // (never re-enter the draw pile), so biasing the initial build is enough.
    var shuffledRest = shuffle(rest);
    var total = regel.length + shuffledRest.length;
    var frontSize = Math.floor((total * 2) / 3);
    if (frontSize < regel.length) frontSize = regel.length; // tiny-deck guard
    var fillCount = frontSize - regel.length;
    var front = shuffle(regel.concat(shuffledRest.slice(0, fillCount)));
    var back = shuffledRest.slice(fillCount);
    return front.concat(back);
  }

  function rosterOrder() {
    return (ctx.players || [])
      .filter(function (p) { return p && p.name; })
      .map(function (p) { return { id: p.id, name: p.name }; });
  }

  // A saved game is only worth resuming if it belongs to the CURRENT roster.
  // Hochadel snapshots the players into `state.order`, so without this check a
  // reload would resurrect an old game (old player names) after the roster
  // changed. Compare by the set of player ids, ignoring order.
  function rosterMatchesSaved(order) {
    var cur = rosterOrder();
    if (!Array.isArray(order) || order.length !== cur.length) return false;
    var ids = {};
    cur.forEach(function (p) { ids[p.id] = true; });
    return order.every(function (p) { return p && ids[p.id]; });
  }

  function newGame(edition) {
    return {
      edition: edition,
      order: rosterOrder(),
      turnIndex: 0,
      dir: 1,           // turn direction (+1 / -1); flipped by „Wechsel der Winde"
      hofgesetze: [],   // [{ id, title, text }]
      active: [],       // [{ uid, cardId, title, text, power, holder }]
      uidSeq: 1,
      turnCount: 0,     // monotonic turn counter; drives the round-based expiry of
                        // temporary rules (one round = order.length turns).
      draw: buildDeck(edition),
      discard: [],
      lastCard: null,   // {title, text} of the last non-Echo card resolved — the
                        // Echo card replays it, and digitally there is no physical
                        // discard pile to look at, so we show it again.
    };
  }

  // Make a loaded state safe against content edits (unknown card ids dropped).
  function reconcile(saved) {
    saved.draw = (saved.draw || []).filter(function (id) { return cardById[id]; });
    saved.discard = (saved.discard || []).filter(function (id) { return cardById[id]; });
    if (typeof saved.turnCount !== "number") saved.turnCount = 0;
    saved.hofgesetze = (saved.hofgesetze || []).map(function (g) {
      // Backfill the `temp` flag on games saved before temporary rules existed.
      if (g && cardById[g.id] && typeof g.temp === "undefined") g.temp = !!cardById[g.id].temp;
      // Backfill an expiry for temp rules from before round-tracking: let them run
      // out at the end of the current round rather than lingering forever.
      if (g && g.temp && typeof g.expiresAt !== "number") {
        g.expiresAt = saved.turnCount + Math.max(1, (saved.order || []).length);
      }
      return g;
    });
    saved.active = saved.active || [];
    if (saved.dir !== 1 && saved.dir !== -1) saved.dir = 1;
    if (!saved.uidSeq) saved.uidSeq = saved.active.length + 1;
    if (typeof saved.turnIndex !== "number" || saved.turnIndex >= saved.order.length) saved.turnIndex = 0;
    if (saved.draw.length === 0 && saved.discard.length === 0) saved.draw = buildDeck(saved.edition);
    if (!saved.lastCard || typeof saved.lastCard !== "object") saved.lastCard = null;
    return saved;
  }

  function saveState() { if (ctx) ctx.store.set("state", game); }

  function currentPlayer() { return game.order[game.turnIndex]; }
  function nextTurn() {
    var n = game.order.length;
    game.turnIndex = (game.turnIndex + game.dir + n) % n;
    game.turnCount = (game.turnCount || 0) + 1;
    expireTempRules();
  }
  // Drop any temporary rule whose round window has elapsed. A temp rule played on
  // turn T lasts one full round — it expires once the turn counter comes back
  // around to its holder (T + number of players). Cleared cards go to the discard
  // so they can come round again later.
  function expireTempRules() {
    if (!game.hofgesetze.length) return;
    var keep = [];
    for (var i = 0; i < game.hofgesetze.length; i++) {
      var g = game.hofgesetze[i];
      if (g.temp && typeof g.expiresAt === "number" && game.turnCount >= g.expiresAt) {
        game.discard.push(g.id);
      } else {
        keep.push(g);
      }
    }
    game.hofgesetze = keep;
  }
  function names() { return game.order.map(function (o) { return o.name; }); }
  // Fill card tokens: {P} -> the drawer's name, {VERS} -> a random opening verse.
  function fillName(text) {
    var c = currentPlayer();
    var out = String(text).replace(/\{P\}/g, c ? c.name : t("the drawer"));
    if (out.indexOf("{VERS}") !== -1) {
      var v = data.verses || [];
      var verse = v.length ? v[Math.floor(Math.random() * v.length)] : "Der König spricht ein weises Wort,";
      out = out.replace(/\{VERS\}/g, verse);
    }
    return out;
  }

  function drawCard() {
    if (game.draw.length === 0) { game.draw = shuffle(game.discard); game.discard = []; }
    if (game.draw.length === 0) return null; // every card is in play
    var id = game.draw.shift();
    return cardById[id] || null;
  }

  // Full card count for an edition (respecting `copies`) — the denominator for
  // the "how thick is the draw pile" cue on the deck.
  function editionDeckSize(edition) {
    var n = 0;
    data.deck.forEach(function (c) {
      if (c.editions.indexOf(edition) !== -1) n += (c.copies || 1);
    });
    return n;
  }

  // Map the remaining draw pile to one of four thickness tiers, so the fanned
  // stack subtly thins out as the deck is used up (full → past ¼, ½, ¾ spent).
  function deckFullnessClass() {
    var total = editionDeckSize(game.edition) || 1;
    var frac = game.draw.length / total;
    var lvl = frac > 0.75 ? 4 : frac > 0.5 ? 3 : frac > 0.25 ? 2 : 1;
    return "ha-deck--f" + lvl;
  }

  // ---------------------------------------------------------------------------
  // Screen: edition select (spec §1, §4.1)
  // ---------------------------------------------------------------------------
  function renderEdition() {
    clearTickers();
    var cards = (data.editions || []).map(function (ed) {
      var locked = ed.locked
        ? '<span class="ha-edition__flag">🔒 ' + esc(ed.subtitle) + "</span>"
        : '<span class="ha-edition__flag ha-edition__flag--go">' + esc(ed.subtitle) + "</span>";
      return (
        '<button class="ha-edition' + (ed.locked ? " ha-edition--locked" : "") + '" data-ed="' + esc(ed.id) + '"' +
        (ed.locked ? " data-locked=\"1\"" : "") + ">" +
        '  <span class="ha-edition__icon">' + esc(ed.icon) + "</span>" +
        '  <span class="ha-edition__name">' + esc(ed.name) + "</span>" +
        locked +
        "</button>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen ha-screen">' +
      '  <h2 class="screen-title pop">👑 ' + t("Hochadel") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Choose Edition") + "</h3>" +
      '  <div class="ha-edition-list">' + cards + "</div>" +
      '  <p class="ha-hint muted small" id="ha-ed-hint"></p>' +
      "</section>";

    els.querySelectorAll(".ha-edition").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-locked")) {
          var hint = els.querySelector("#ha-ed-hint");
          if (hint) hint.textContent = t("The Rapunzel Edition is coming soon. 👸");
          return;
        }
        game = newGame(b.getAttribute("data-ed"));
        renderOrder();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Screen: turn order (spec §4.2)
  // ---------------------------------------------------------------------------
  function renderOrder() {
    clearTickers();
    if (game.order.length < 2) {
      els.innerHTML =
        '<section class="screen ha-screen">' +
        '  <h2 class="screen-title pop">👑 ' + t("Hochadel") + "</h2>" +
        '  <div class="fuse-note">' + t("The court needs at least 2 players. Add them using the roster (top right).") + "</div>" +
        '  <button id="ha-back" class="btn btn-block">' + t("← Choose Edition") + "</button>" +
        "</section>";
      els.querySelector("#ha-back").addEventListener("click", renderEdition);
      return;
    }

    var list = game.order.map(function (o, i) {
      return (
        '<li class="ha-order__item" data-id="' + attr(o.id) + '">' +
        '<span class="ha-order__no">' + (i + 1) + "</span>" +
        '<span class="ha-order__name">' + esc(o.name) + "</span>" +
        '<span class="ha-order__grip" aria-hidden="true">⠿</span>' +
        "</li>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen ha-screen">' +
      '  <h2 class="screen-title pop">' + t("Seating Order") + "</h2>" +
      '  <p class="muted">' + t("Players take turns drawing. Drag the names to reorder, or shuffle.") + "</p>" +
      '  <ol class="ha-order" id="ha-order">' + list + "</ol>" +
      '  <button id="ha-shuffle" class="btn btn-block">' + t("🔀 Shuffle order") + "</button>" +
      '  <button id="ha-start" class="btn btn-primary btn-block btn-xl" data-primary>' + t("Continue ▶️") + "</button>" +
      '  <button id="ha-back" class="btn btn-ghost btn-block">' + t("← Choose Edition") + "</button>" +
      "</section>";

    setupOrderDrag(els.querySelector("#ha-order"));

    els.querySelector("#ha-shuffle").addEventListener("click", function () {
      game.order = shuffle(game.order);
      renderOrder();
    });
    els.querySelector("#ha-start").addEventListener("click", function () {
      game.turnIndex = 0;
      saveState();
      renderGroundRules(renderTable);
    });
    els.querySelector("#ha-back").addEventListener("click", renderEdition);
  }

  // Vertical drag-to-reorder for the seating list (same approach as Rank It):
  // each item is absolutely positioned by its slot; dragging one past another
  // splices `game.order` and slides the rest into place. Pointer events cover
  // touch + mouse. Items are keyed by player id so a re-sort stays correct.
  function setupOrderDrag(list) {
    if (!list) return;
    var GAP = 8;
    var rows = Array.prototype.slice.call(list.querySelectorAll(".ha-order__item"));
    if (rows.length < 2) return;

    var rowH = 0;
    rows.forEach(function (c) { rowH = Math.max(rowH, c.offsetHeight); });
    rowH += GAP;
    list.style.height = rowH * rows.length + "px";

    function slotOf(id) {
      for (var i = 0; i < game.order.length; i++) {
        if (String(game.order[i].id) === id) return i;
      }
      return 0;
    }
    function layout(except) {
      rows.forEach(function (c) {
        if (c === except) return;
        c.style.transition = "transform .18s ease";
        c.style.transform = "translateY(" + slotOf(c.getAttribute("data-id")) * rowH + "px)";
      });
    }
    function renumber() {
      rows.forEach(function (c) {
        c.querySelector(".ha-order__no").textContent = slotOf(c.getAttribute("data-id")) + 1;
      });
    }
    layout();

    rows.forEach(function (card) {
      card.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        try { card.setPointerCapture(e.pointerId); } catch (err) {}
        var id = card.getAttribute("data-id");
        var startY = e.clientY;
        var baseY = slotOf(id) * rowH;
        card.classList.add("ha-order__item--drag");
        card.style.transition = "none";

        function move(ev) {
          var y = baseY + (ev.clientY - startY);
          card.style.transform = "translateY(" + y + "px) scale(1.03)";
          var target = Math.max(0, Math.min(rows.length - 1, Math.round(y / rowH)));
          var cur = slotOf(id);
          if (target !== cur) {
            var moved = game.order.splice(cur, 1)[0];
            game.order.splice(target, 0, moved);
            layout(card);
            renumber();
          }
        }
        function up(ev) {
          try { card.releasePointerCapture(ev.pointerId); } catch (err) {}
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerup", up);
          card.removeEventListener("pointercancel", up);
          card.classList.remove("ha-order__item--drag");
          card.style.transition = "transform .18s ease";
          card.style.transform = "translateY(" + slotOf(id) * rowH + "px)";
        }
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerup", up);
        card.addEventListener("pointercancel", up);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Screen: the standing ground rules (spec §3) — shown on entry / after reset,
  // not during the round itself.
  // ---------------------------------------------------------------------------
  function renderGroundRules(next) {
    clearTickers();
    els.innerHTML =
      '<section class="screen ha-screen ha-intro">' +
      '  <h2 class="screen-title pop">' + t("⚜️ Ground Rules") + "</h2>" +
      '  <p class="muted">' + t("These rules apply for the whole game — independent of the deck.") + "</p>" +
      groundRulesCardsHtml() +
      '  <button id="ha-gr-next" class="btn btn-primary btn-block btn-xl" data-primary>' + t("To the Table ▶️") + "</button>" +
      "</section>";
    els.querySelector("#ha-gr-next").addEventListener("click", next);
  }

  function groundRulesCardsHtml() {
    return '<div class="ha-grules">' + (data.groundRules || []).map(function (r) {
      return (
        '<div class="ha-grule">' +
        '  <div class="ha-grule__crest">⚜️</div>' +
        '  <div class="ha-grule__body">' +
        '    <div class="ha-grule__title">' + esc(r.title) + "</div>" +
        '    <div class="ha-grule__text">' + esc(r.text) + "</div>" +
        "  </div>" +
        "</div>"
      );
    }).join("") + "</div>";
  }

  // ---------------------------------------------------------------------------
  // Screen: the table — central hub (spec §4.3)
  // ---------------------------------------------------------------------------
  function renderTable() {
    clearTickers();
    var cur = currentPlayer();

    els.innerHTML =
      '<section class="screen ha-screen ha-table">' +
      '  <div class="ha-turn">' +
      '    <span class="ha-turn__crown" aria-hidden="true">👑</span>' +
      '    <span class="ha-turn__meta">' +
      '      <span class="ha-turn__label">' + t("Current player") + "</span>" +
      '      <span class="ha-turn__name">' + esc(cur ? cur.name : "—") + "</span>" +
      "    </span>" +
      "  </div>" +
      '  <div class="ha-table-main">' +
      '    <div class="ha-deck-zone">' +
      '      <button id="ha-draw" class="ha-deck ' + deckFullnessClass() + '" aria-label="' + t("Draw card") + '" data-primary>' +
      '        <span class="ha-deck__label">' + t("Draw card") + "</span>" +
      "      </button>" +
      "    </div>" +
      '    <div class="ha-piles">' +
      activeHtml() +
      lawsHtml() +
      "    </div>" +
      "  </div>" +
      '  <div class="ha-foot">' +
      '    <button id="ha-reset" class="btn btn-ghost ha-reset">' + t("↺ Reset game") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#ha-draw").addEventListener("click", onDraw);
    els.querySelector("#ha-reset").addEventListener("click", renderResetConfirm);
    els.querySelectorAll("[data-trigger]").forEach(function (b) {
      b.addEventListener("click", function () { onTrigger(b.getAttribute("data-trigger")); });
    });
  }

  // Saphir laws shown as face-up cards. Permanent rules stand until the game is
  // reset; temporary rules (fixed-duration effects like „In Zeitlupe") carry a
  // round countdown and are cleared automatically by expireTempRules() once the
  // turn comes back around to their holder.
  function lawsHtml() {
    var body;
    if (!game.hofgesetze.length) {
      body = '<p class="ha-empty muted small">' + t("No standing rules yet.") + "</p>";
    } else {
      body = '<div class="ha-hand">' + game.hofgesetze.map(function (r) {
        var inner =
          '  <img class="ha-card-mini__crest" src="assets/ha-crest-regel.png" alt="" />' +
          (r.by ? '  <span class="ha-card-mini__holder">' + esc(r.by) + "</span>" : "") +
          '  <span class="ha-card-mini__title">' + esc(r.title) + "</span>" +
          '  <span class="ha-card-mini__text">' + esc(r.text) + "</span>";
        if (r.temp) {
          return (
            '<div class="ha-card-mini ha-card-mini--regel ha-card-mini--temp">' +
            inner +
            '  <span class="ha-card-mini__hint">' + tempRuleHint(r) + "</span>" +
            "</div>"
          );
        }
        return '<div class="ha-card-mini ha-card-mini--regel">' + inner + "</div>";
      }).join("") + "</div>";
    }
    return '<div class="ha-pile"><h3 class="sub">' + t("📜 Standing Rules") + "</h3>" + body + "</div>";
  }

  // Countdown label for a temporary rule: turns left until it auto-clears.
  function tempRuleHint(r) {
    var left = (typeof r.expiresAt === "number") ? r.expiresAt - game.turnCount : game.order.length;
    if (left <= 1) return "⏳ " + t("ends this turn");
    return "⏳ " + t("{n} turns left").replace("{n}", left);
  }

  // Gold active cards shown face-up; tapping the whole card resolves it.
  function activeHtml() {
    var body;
    if (!game.active.length) {
      body = '<p class="ha-empty muted small">' + t("No Trumps yet. Gold cards stay face-up with their holder.") + "</p>";
    } else {
      body = '<div class="ha-hand">' + game.active.map(function (a) {
        return (
          '<button class="ha-card-mini ha-card-mini--aktiv" data-trigger="' + esc(a.uid) + '">' +
          '  <img class="ha-card-mini__crest" src="assets/ha-crest-aktiv.png" alt="" />' +
          '  <span class="ha-card-mini__holder">' + esc(a.holder) + "</span>" +
          '  <span class="ha-card-mini__title">' + esc(a.title) + "</span>" +
          '  <span class="ha-card-mini__text">' + esc(a.text) + "</span>" +
          '  <span class="ha-card-mini__hint">' + t("Tap to activate ⚡") + "</span>" +
          "</button>"
        );
      }).join("") + "</div>";
    }
    return '<div class="ha-pile"><h3 class="sub">' + t("🪙 Trumps") + "</h3>" + body + "</div>";
  }

  // ---------------------------------------------------------------------------
  // Draw + resolve (spec §4.4)
  // ---------------------------------------------------------------------------
  function onDraw() {
    var card = drawCard();
    if (!card) { renderDeckRest(); return; }
    renderDrawn(card);
  }

  function renderDeckRest() {
    els.innerHTML =
      '<section class="screen ha-screen">' +
      '  <div class="result-emoji">🃏</div>' +
      '  <h2 class="result-title pop">' + t("Deck at Rest") + "</h2>" +
      '  <p class="result-sub">' + t("All cards are in play (Standing Rules & Trumps). Reset for a fresh round.") + "</p>" +
      '  <button id="ha-back" class="btn btn-primary btn-block btn-xl" data-primary>' + t("Back to Table") + "</button>" +
      "</section>";
    els.querySelector("#ha-back").addEventListener("click", renderTable);
  }

  function renderDrawn(card) {
    clearTickers();
    var typeMeta = TYPE_META[card.type];
    var cur = currentPlayer();
    // Resolve {P}/{VERS} tokens ONCE so the text shown on the draw screen is the
    // exact same text stored as a Hofgesetz / active card (a random {VERS} would
    // otherwise differ between display and storage).
    var filledText = fillName(card.text);
    var actLabel;
    if (card.type === "sofort") actLabel = t("Done ✓");
    else if (card.type === "regel") actLabel = t("Add as standing rule ✓");
    else if (card.type === "aktiv") actLabel = t("Assign to {name} 👑").replace("{name}", cur ? cur.name : t("the holder"));
    else actLabel = t("Loser drinks ✓");

    els.innerHTML =
      '<section class="screen ha-screen ha-draw-screen">' +
      '  <div class="ha-draw-kicker"><strong>' + esc(cur ? cur.name : "—") + "</strong>" + t(" draws …") + "</div>" +
      '  <div class="ha-bigcard ha-card--' + card.type + '" style="--ha-c:' + typeMeta.colour + '">' +
      '    <img class="ha-bigcard__crest" src="assets/ha-crest-' + card.type + '.png" alt="" />' +
      '    <div class="ha-bigcard__tag">' + esc(t(typeMeta.label)) + "</div>" +
      '    <div class="ha-bigcard__title">' + esc(card.title) + "</div>" +
      '    <div class="ha-bigcard__text">' + esc(filledText) + "</div>" +
      "  </div>" +
      echoPrevHtml(card) +
      '  <button id="ha-resolve" class="btn btn-primary btn-block btn-xl" data-primary>' + esc(actLabel) + "</button>" +
      "</section>";

    els.querySelector("#ha-resolve").addEventListener("click", function () { resolveCard(card, filledText); });
  }

  // The Echo card replays the previously played card — but there is no physical
  // discard pile on a phone, so surface that card's title + text right here.
  function echoPrevHtml(card) {
    if (card.effect !== "echo") return "";
    var last = game.lastCard;
    if (!last) {
      return '<div class="ha-echo-prev ha-echo-prev--empty">' +
        '<div class="ha-echo-prev__text">' + t("No card has been played yet — the Echo fades.") + "</div></div>";
    }
    return '<div class="ha-echo-prev">' +
      '<div class="ha-echo-prev__label">' + t("Repeat this card:") + "</div>" +
      '<div class="ha-echo-prev__title">' + esc(last.title) + "</div>" +
      '<div class="ha-echo-prev__text">' + esc(last.text) + "</div>" +
      "</div>";
  }

  function resolveCard(card, filledText) {
    if (filledText == null) filledText = fillName(card.text);
    if (card.effect === "reverse") game.dir = -game.dir;
    if (card.type === "sofort" || card.type === "minispiel") {
      game.discard.push(card.id);
    } else if (card.type === "regel") {
      var curL = currentPlayer();
      // Doubled rule cards (copies: 2 — Inquisitor, Spitzname, …) supersede:
      // drawing the second copy hands the role to the new target, so the old
      // Hofgesetz entry of the SAME card is replaced instead of stacking.
      game.hofgesetze = game.hofgesetze.filter(function (g) { return g.id !== card.id; });
      var law = { id: card.id, title: card.title, text: filledText, by: curL ? curL.name : "—", temp: !!card.temp };
      // Temp rules expire after their round window. Played on this turn, one round
      // = order.length turns from now, i.e. it lasts until the turn comes back
      // around to the drawer. (`rounds` allows a longer window; defaults to 1.)
      if (card.temp) law.expiresAt = game.turnCount + game.order.length * (card.rounds || 1);
      game.hofgesetze.push(law);
    } else if (card.type === "aktiv") {
      var cur = currentPlayer();
      game.active.push({
        uid: "u" + (game.uidSeq++),
        cardId: card.id,
        title: card.title,
        text: filledText,
        power: card.power || null,
        holder: cur ? cur.name : "—",
      });
    }
    // Remember this card so a later Echo can replay (and re-show) it. Echo itself
    // does not overwrite the memory, so it always points at a real action.
    if (card.effect !== "echo") {
      game.lastCard = { title: card.title, text: filledText };
    }
    nextTurn();
    saveState();
    renderTable();
  }

  // --- active-card trigger -------------------------------------------------
  function onTrigger(uid) {
    var entry = null;
    for (var i = 0; i < game.active.length; i++) { if (game.active[i].uid === uid) { entry = game.active[i]; break; } }
    if (!entry) { renderTable(); return; }
    if (entry.power === "sanduhr") { renderSanduhr(entry); return; }
    spendActive(uid);
    saveState();
    renderTable();
  }

  function spendActive(uid) {
    var keep = [];
    for (var i = 0; i < game.active.length; i++) {
      if (game.active[i].uid === uid) game.discard.push(game.active[i].cardId);
      else keep.push(game.active[i]);
    }
    game.active = keep;
  }

  // --- Sanduhr (Gold power): secret timer (spec §5.3 #31) ------------------
  function renderSanduhr(entry) {
    clearTickers();
    var chips = [30, 60, 120].map(function (s) {
      return '<button class="chip" data-sec="' + s + '">' + s + "s</button>";
    }).join("");
    els.innerHTML =
      '<section class="screen ha-screen">' +
      '  <h2 class="screen-title pop">' + t("⏳ The Hourglass") + "</h2>" +
      '  <p class="muted">' + t("Secretly set a timer on this phone. When it runs out, whoever is speaking drinks. Don\'t let others watch.") + "</p>" +
      '  <div class="chip-row" id="ha-sec">' + chips + "</div>" +
      '  <label class="ha-custom">' + t("Custom time (sec.):") +
      '    <input id="ha-sec-in" class="text-input" type="number" min="5" max="900" placeholder="' + t("e.g. 90") + '" /></label>' +
      '  <button id="ha-sand-go" class="btn btn-primary btn-block btn-xl">' + t("Start secretly 🤫") + "</button>" +
      '  <button id="ha-sand-cancel" class="btn btn-ghost btn-block">' + t("Cancel") + "</button>" +
      "</section>";

    els.querySelectorAll("#ha-sec .chip").forEach(function (c) {
      c.addEventListener("click", function () { startSanduhr(entry, parseInt(c.getAttribute("data-sec"), 10)); });
    });
    els.querySelector("#ha-sand-go").addEventListener("click", function () {
      var v = parseInt(els.querySelector("#ha-sec-in").value, 10);
      if (!v || v < 5) v = 60;
      startSanduhr(entry, v);
    });
    els.querySelector("#ha-sand-cancel").addEventListener("click", renderTable);
  }

  function startSanduhr(entry, seconds) {
    spendActive(entry.uid);
    saveState();
    after(seconds * 1000, sanduhrExpired);
    renderTable();
  }

  function sanduhrExpired() {
    if (!els) return;
    var ov = global.document.createElement("div");
    ov.className = "ha-overlay";
    ov.innerHTML =
      '<div class="ha-overlay__box">' +
      '  <div class="ha-overlay__emoji">⏳</div>' +
      '  <div class="ha-overlay__title">' + t("Time\'s up!") + "</div>" +
      '  <div class="ha-overlay__sub">' + t("Whoever is speaking drinks!") + "</div>" +
      '  <button class="btn btn-primary btn-block btn-xl" data-primary>' + t("Got it") + "</button>" +
      "</div>";
    els.appendChild(ov);
    ov.querySelector("button").addEventListener("click", function () {
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    });
  }


  // ---------------------------------------------------------------------------
  // Reset (spec §4.6)
  // ---------------------------------------------------------------------------
  function renderResetConfirm() {
    clearTickers();
    els.innerHTML =
      '<section class="screen ha-screen">' +
      '  <h2 class="screen-title pop">' + t("Reset game?") + "</h2>" +
      '  <div class="fuse-note">' + t("Standing rules and Trumps will be lost; the deck gets reshuffled. Edition and seating order stay.") + "</div>" +
      '  <button id="ha-reset-yes" class="btn btn-primary btn-block btn-xl">' + t("Yes, reset") + "</button>" +
      '  <button id="ha-reset-no" class="btn btn-ghost btn-block">' + t("Cancel") + "</button>" +
      "</section>";
    els.querySelector("#ha-reset-yes").addEventListener("click", function () {
      clearAll();
      var keepEdition = game.edition, keepOrder = game.order, keepIdx = game.turnIndex;
      game = newGame(keepEdition);
      game.order = keepOrder;
      game.turnIndex = keepIdx % game.order.length;
      saveState();
      renderGroundRules(renderTable);
    });
    els.querySelector("#ha-reset-no").addEventListener("click", renderTable);
  }

  // --- util ----------------------------------------------------------------
  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.hochadel = module;
})(window);

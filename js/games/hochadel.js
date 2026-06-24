/*
 * games/hochadel.js — „Hochadel" (royal-court drinking card game, spec HOCHADEL-SPEC.md)
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

  // Heraldic palette + labels per card type (spec §2). No green (red-green-safe).
  var TYPE_META = {
    sofort:    { tag: "Karmesin", label: "Sofort-Aktion", colour: "#9B1B30" },
    regel:     { tag: "Saphir",   label: "Passiv / Regel", colour: "#1B3A6B" },
    aktiv:     { tag: "Gold",     label: "Aktive Karte",   colour: "#C9A227" },
    minispiel: { tag: "Purpur",   label: "Minispiel",      colour: "#5B2A86" },
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
      tagline: "Höfisches Kartenspiel — wer sich vergeht, dient.",
      icon: "👑",
      minPlayers: 2,
      supportsDrinking: false, // it IS a drinking game; no separate toggle needed
    },
    mount: function (container, context) {
      els = container;
      ctx = context;
      data = global.Spielecke.Hochadel || { editions: [], groundRules: [], verses: [], deck: [] };
      cardById = {};
      data.deck.forEach(function (c) { cardById[c.id] = c; });

      global.addEventListener("keydown", onKeydown);

      var saved = context.store.get("state", null);
      if (saved && saved.edition && saved.order && saved.order.length >= 2) {
        game = reconcile(saved);
        renderGroundRules(renderTable);
      } else {
        renderEdition();
      }
    },
    unmount: function () {
      clearAll();
      global.removeEventListener("keydown", onKeydown);
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; data = null; game = null; cardById = {};
    },
  };

  // Space (or Enter) always fires the screen's primary action — draw a card on
  // the table, complete the drawn card, advance the intro, etc. The most recently
  // rendered primary wins (e.g. the Sanduhr overlay over the table).
  function onKeydown(e) {
    if (e.code !== "Space" && e.key !== " " && e.key !== "Enter" && e.keyCode !== 32) return;
    if (!els) return;
    var tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return; // don't hijack typing
    var btns = els.querySelectorAll("[data-primary]");
    if (btns.length) { e.preventDefault(); btns[btns.length - 1].click(); }
  }

  // --- timers --------------------------------------------------------------
  function after(ms, fn) { var id = global.setTimeout(fn, ms); timers.push(id); return id; }
  function clearTickers() { tickers.forEach(function (t) { global.clearInterval(t); }); tickers = []; }
  function clearAll() {
    timers.forEach(function (t) { global.clearTimeout(t); });
    clearTickers();
    timers = [];
  }

  // --- state ---------------------------------------------------------------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildDeck(edition) {
    var ids = data.deck
      .filter(function (c) { return c.editions.indexOf(edition) !== -1; })
      .map(function (c) { return c.id; });
    return shuffle(ids);
  }

  function rosterOrder() {
    return (ctx.players || [])
      .filter(function (p) { return p && p.name; })
      .map(function (p) { return { id: p.id, name: p.name }; });
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
      draw: buildDeck(edition),
      discard: [],
    };
  }

  // Make a loaded state safe against content edits (unknown card ids dropped).
  function reconcile(saved) {
    saved.draw = (saved.draw || []).filter(function (id) { return cardById[id]; });
    saved.discard = (saved.discard || []).filter(function (id) { return cardById[id]; });
    saved.hofgesetze = saved.hofgesetze || [];
    saved.active = saved.active || [];
    if (saved.dir !== 1 && saved.dir !== -1) saved.dir = 1;
    if (!saved.uidSeq) saved.uidSeq = saved.active.length + 1;
    if (typeof saved.turnIndex !== "number" || saved.turnIndex >= saved.order.length) saved.turnIndex = 0;
    if (saved.draw.length === 0 && saved.discard.length === 0) saved.draw = buildDeck(saved.edition);
    return saved;
  }

  function saveState() { if (ctx) ctx.store.set("state", game); }

  function currentPlayer() { return game.order[game.turnIndex]; }
  function nextTurn() {
    var n = game.order.length;
    game.turnIndex = (game.turnIndex + game.dir + n) % n;
  }
  function names() { return game.order.map(function (o) { return o.name; }); }
  // Replace the {P} token with the drawer's name (used in card text/rules).
  function fillName(text) {
    var c = currentPlayer();
    return String(text).replace(/\{P\}/g, c ? c.name : "der Zieher");
  }

  function drawCard() {
    if (game.draw.length === 0) { game.draw = shuffle(game.discard); game.discard = []; }
    if (game.draw.length === 0) return null; // every card is in play
    var id = game.draw.shift();
    return cardById[id] || null;
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
      '  <h2 class="screen-title pop">👑 Hochadel</h2>' +
      '  <p class="muted">' + esc(module.meta.tagline) + "</p>" +
      '  <h3 class="sub">Edition wählen</h3>' +
      '  <div class="ha-edition-list">' + cards + "</div>" +
      '  <p class="ha-hint muted small" id="ha-ed-hint"></p>' +
      "</section>";

    els.querySelectorAll(".ha-edition").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-locked")) {
          var hint = els.querySelector("#ha-ed-hint");
          if (hint) hint.textContent = "Die Rapunzel-Edition ist bald verfügbar. 👸";
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
        '  <h2 class="screen-title pop">👑 Hochadel</h2>' +
        '  <div class="fuse-note">Der Hof braucht mindestens <strong>2</strong> Anwesende. ' +
        "Tippe oben rechts auf die Spielerzahl, um den Hofstaat zu ergänzen.</div>" +
        '  <button id="ha-back" class="btn btn-block">← Edition wählen</button>' +
        "</section>";
      els.querySelector("#ha-back").addEventListener("click", renderEdition);
      return;
    }

    var list = game.order.map(function (o, i) {
      return '<li class="ha-order__item"><span class="ha-order__no">' + (i + 1) + "</span>" + esc(o.name) + "</li>";
    }).join("");

    els.innerHTML =
      '<section class="screen ha-screen">' +
      '  <h2 class="screen-title pop">Sitzordnung</h2>' +
      '  <p class="muted">Reihum wird gezogen. Verschiebe per Zufall, wenn du magst.</p>' +
      '  <ol class="ha-order">' + list + "</ol>" +
      '  <button id="ha-shuffle" class="btn btn-block">🔀 Reihenfolge mischen</button>' +
      '  <button id="ha-start" class="btn btn-primary btn-block btn-xl" data-primary>Weiter ▶️</button>' +
      '  <button id="ha-back" class="btn btn-ghost btn-block">← Edition wählen</button>' +
      "</section>";

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

  // ---------------------------------------------------------------------------
  // Screen: the standing ground rules (spec §3) — shown on entry / after reset,
  // not during the round itself.
  // ---------------------------------------------------------------------------
  function renderGroundRules(next) {
    clearTickers();
    els.innerHTML =
      '<section class="screen ha-screen ha-intro">' +
      '  <h2 class="screen-title pop">⚜️ Grundgesetze des Hofes</h2>' +
      '  <p class="muted">Diese zwei Regeln gelten die ganze Runde — unabhängig vom Deck.</p>' +
      groundRulesCardsHtml() +
      '  <button id="ha-gr-next" class="btn btn-primary btn-block btn-xl" data-primary>An die Tafel ▶️</button>' +
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
      '    <span class="ha-turn__label">Am Zug</span>' +
      '    <span class="ha-turn__name">' + esc(cur ? cur.name : "—") + "</span>" +
      "  </div>" +
      '  <div class="ha-table-main">' +
      '    <div class="ha-deck-zone">' +
      '      <button id="ha-draw" class="ha-deck" aria-label="Karte ziehen" data-primary>' +
      '        <span class="ha-deck__crest">👑</span>' +
      '        <span class="ha-deck__label">Karte ziehen</span>' +
      "      </button>" +
      '      <div class="ha-deck-count">' + game.draw.length + " im Stapel</div>" +
      "    </div>" +
      '    <div class="ha-piles">' +
      activeHtml() +
      lawsHtml() +
      "    </div>" +
      "  </div>" +
      '  <div class="ha-foot">' +
      '    <button id="ha-reset" class="btn btn-ghost btn-block">↺ Spiel zurücksetzen</button>' +
      '    <button id="ha-home" class="btn btn-ghost btn-block">← Zurück zur Spielecke</button>' +
      "  </div>" +
      "</section>";

    els.querySelector("#ha-draw").addEventListener("click", onDraw);
    els.querySelector("#ha-reset").addEventListener("click", renderResetConfirm);
    els.querySelector("#ha-home").addEventListener("click", function () { ctx.goHome(); });
    els.querySelectorAll("[data-trigger]").forEach(function (b) {
      b.addEventListener("click", function () { onTrigger(b.getAttribute("data-trigger")); });
    });
  }

  // Saphir laws shown as face-up cards (passive — not clickable).
  function lawsHtml() {
    var body;
    if (!game.hofgesetze.length) {
      body = '<p class="ha-empty muted small">Noch keine Hofgesetze.</p>';
    } else {
      body = '<div class="ha-hand">' + game.hofgesetze.map(function (r) {
        return (
          '<div class="ha-card-mini ha-card-mini--regel">' +
          '  <span class="ha-card-mini__pip">📜</span>' +
          '  <span class="ha-card-mini__title">' + esc(r.title) + "</span>" +
          '  <span class="ha-card-mini__text">' + esc(r.text) + "</span>" +
          "</div>"
        );
      }).join("") + "</div>";
    }
    return '<div class="ha-pile"><h3 class="sub">📜 Hofgesetze</h3>' + body + "</div>";
  }

  // Gold active cards shown face-up; tapping the whole card resolves it.
  function activeHtml() {
    var body;
    if (!game.active.length) {
      body = '<p class="ha-empty muted small">Keine aktiven Karten. Gold-Karten liegen offen vor ihrem Halter.</p>';
    } else {
      body = '<div class="ha-hand">' + game.active.map(function (a) {
        return (
          '<button class="ha-card-mini ha-card-mini--aktiv" data-trigger="' + esc(a.uid) + '">' +
          '  <span class="ha-card-mini__pip">🪙</span>' +
          '  <span class="ha-card-mini__holder">' + esc(a.holder) + "</span>" +
          '  <span class="ha-card-mini__title">' + esc(a.title) + "</span>" +
          '  <span class="ha-card-mini__text">' + esc(a.text) + "</span>" +
          '  <span class="ha-card-mini__hint">Tippen zum Auslösen ⚡</span>' +
          "</button>"
        );
      }).join("") + "</div>";
    }
    return '<div class="ha-pile"><h3 class="sub">🪙 Aktive Karten</h3>' + body + "</div>";
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
      '  <h2 class="result-title pop">Das Deck ruht</h2>' +
      '  <p class="result-sub">Alle Karten sind im Spiel (Hofgesetze & aktive Karten). ' +
      "Setze das Spiel zurück für eine frische Runde.</p>" +
      '  <button id="ha-back" class="btn btn-primary btn-block btn-xl" data-primary>Zur Tafel</button>' +
      "</section>";
    els.querySelector("#ha-back").addEventListener("click", renderTable);
  }

  function renderDrawn(card) {
    clearTickers();
    var t = TYPE_META[card.type];
    var cur = currentPlayer();
    var actLabel;
    if (card.type === "sofort") actLabel = "Erledigt ✓";
    else if (card.type === "regel") actLabel = "Als Hofgesetz eintragen ✓";
    else if (card.type === "aktiv") actLabel = "An " + (cur ? cur.name : "den Halter") + " vergeben 👑";
    else actLabel = "Verlierer dient ✓"; // minispiel: played at the table, then complete the card

    els.innerHTML =
      '<section class="screen ha-screen ha-draw-screen">' +
      '  <div class="ha-draw-kicker"><strong>' + esc(cur ? cur.name : "—") + "</strong> zieht …</div>" +
      '  <div class="ha-bigcard ha-card--' + card.type + '" style="--ha-c:' + t.colour + '">' +
      '    <div class="ha-bigcard__tag">' + esc(t.label) + "</div>" +
      '    <div class="ha-bigcard__title">' + esc(card.title) + "</div>" +
      '    <div class="ha-bigcard__text">' + esc(fillName(card.text)) + "</div>" +
      "  </div>" +
      '  <button id="ha-resolve" class="btn btn-primary btn-block btn-xl" data-primary>' + esc(actLabel) + "</button>" +
      "</section>";

    els.querySelector("#ha-resolve").addEventListener("click", function () { resolveCard(card); });
  }

  function resolveCard(card) {
    if (card.effect === "reverse") game.dir = -game.dir;
    if (card.type === "sofort" || card.type === "minispiel") {
      game.discard.push(card.id);
    } else if (card.type === "regel") {
      game.hofgesetze.push({ id: card.id, title: card.title, text: fillName(card.text) });
    } else if (card.type === "aktiv") {
      var cur = currentPlayer();
      game.active.push({
        uid: "u" + (game.uidSeq++),
        cardId: card.id,
        title: card.title,
        text: fillName(card.text),
        power: card.power || null,
        holder: cur ? cur.name : "—",
      });
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
      '  <h2 class="screen-title pop">⏳ Die Sanduhr</h2>' +
      '  <p class="muted">Setze heimlich eine Frist. Läuft sie ab, dient, wer gerade spricht. ' +
      "Die anderen sollen nicht zusehen.</p>" +
      '  <div class="chip-row" id="ha-sec">' + chips + "</div>" +
      '  <label class="ha-custom">Eigene Frist (Sek.): ' +
      '    <input id="ha-sec-in" class="text-input" type="number" min="5" max="900" placeholder="z. B. 90" /></label>' +
      '  <button id="ha-sand-go" class="btn btn-primary btn-block btn-xl">Heimlich starten 🤫</button>' +
      '  <button id="ha-sand-cancel" class="btn btn-ghost btn-block">Abbrechen</button>' +
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
      '  <div class="ha-overlay__title">Die Sanduhr ist abgelaufen!</div>' +
      '  <div class="ha-overlay__sub">Wer gerade spricht, <strong>dient!</strong></div>' +
      '  <button class="btn btn-primary btn-block btn-xl" data-primary>Verstanden</button>' +
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
      '  <h2 class="screen-title pop">Spiel zurücksetzen?</h2>' +
      '  <div class="fuse-note">Hofgesetze und aktive Karten gehen verloren, das Deck wird neu gemischt. ' +
      "Edition und Sitzordnung bleiben.</div>" +
      '  <button id="ha-reset-yes" class="btn btn-primary btn-block btn-xl">Ja, zurücksetzen</button>' +
      '  <button id="ha-reset-no" class="btn btn-ghost btn-block">Abbrechen</button>' +
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
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.hochadel = module;
})(window);

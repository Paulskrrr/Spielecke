/*
 * games/hochadel.js — „Hochadel" (royal-court drinking card game, spec HOCHADEL-SPEC.md)
 *
 * A Klattschen-style game: players draw action cards in turn; cards command who
 * must **dienen** (the in-game word for "drink"). Four card types drive both the
 * colour and the mechanic (spec §2):
 *   sofort    (Karmesin)  execute once, then discard — the common card
 *   regel     (Saphir)    becomes a standing rule, accumulates in „Hofgesetze"
 *   aktiv     (Gold)      stays face-up with the drawer, self-triggered later
 *   minispiel (Purpur)    runs a guided mini-game to a loser, who dient
 *
 * The deck lives in content/hochadel.js as data, tagged per edition, so a future
 * edition = a swappable card set behind the same engine. The active edition is
 * „Diener & Könige"; „Rapunzel-Edition" is a locked stub on the start screen.
 *
 * Plugs into the shell via the Game Module Contract: reuses the shared roster
 * (context.players), the namespaced store (context.store), and goHome(). All
 * timers (Sanduhr, Reim-Timer) are tracked and cleared on unmount.
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
  var REIM_SECONDS = 5;

  var els = null, ctx = null, data = null;
  var cardById = {};      // id -> card (from content)
  var game = null;        // full persisted game state
  var mini = null;        // transient mini-game state
  var timers = [];        // setTimeout ids (Sanduhr) — survive between renders
  var tickers = [];       // setInterval ids (Reim countdown) — cleared on nav

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
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; data = null; game = null; mini = null; cardById = {};
    },
  };

  // --- timers --------------------------------------------------------------
  function after(ms, fn) { var id = global.setTimeout(fn, ms); timers.push(id); return id; }
  function every(ms, fn) { var id = global.setInterval(fn, ms); tickers.push(id); return id; }
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
    if (!saved.uidSeq) saved.uidSeq = saved.active.length + 1;
    if (typeof saved.turnIndex !== "number" || saved.turnIndex >= saved.order.length) saved.turnIndex = 0;
    if (saved.draw.length === 0 && saved.discard.length === 0) saved.draw = buildDeck(saved.edition);
    return saved;
  }

  function saveState() { if (ctx) ctx.store.set("state", game); }

  function currentPlayer() { return game.order[game.turnIndex]; }
  function nextTurn() { game.turnIndex = (game.turnIndex + 1) % game.order.length; }
  function names() { return game.order.map(function (o) { return o.name; }); }

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
      '  <button id="ha-start" class="btn btn-primary btn-block btn-xl">Weiter ▶️</button>' +
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
      '  <button id="ha-gr-next" class="btn btn-primary btn-block btn-xl">An die Tafel ▶️</button>' +
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
      '      <button id="ha-draw" class="ha-deck" aria-label="Karte ziehen">' +
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
      '  <button id="ha-back" class="btn btn-primary btn-block btn-xl">Zur Tafel</button>' +
      "</section>";
    els.querySelector("#ha-back").addEventListener("click", renderTable);
  }

  function renderDrawn(card) {
    clearTickers();
    var t = TYPE_META[card.type];
    var cur = currentPlayer();
    var actLabel, miniLaunch = false;
    if (card.type === "sofort") actLabel = "Erledigt ✓";
    else if (card.type === "regel") actLabel = "Als Hofgesetz eintragen ✓";
    else if (card.type === "aktiv") actLabel = "An " + (cur ? cur.name : "den Halter") + " vergeben 👑";
    else { actLabel = "Minispiel starten ▶️"; miniLaunch = true; }

    els.innerHTML =
      '<section class="screen ha-screen ha-draw-screen">' +
      '  <div class="ha-draw-kicker"><strong>' + esc(cur ? cur.name : "—") + "</strong> zieht …</div>" +
      '  <div class="ha-bigcard ha-card--' + card.type + '" style="--ha-c:' + t.colour + '">' +
      '    <div class="ha-bigcard__tag">' + esc(t.tag) + " · " + esc(t.label) + "</div>" +
      '    <div class="ha-bigcard__title">' + esc(card.title) + "</div>" +
      '    <div class="ha-bigcard__text">' + esc(card.text) + "</div>" +
      "  </div>" +
      '  <button id="ha-resolve" class="btn btn-primary btn-block btn-xl">' + esc(actLabel) + "</button>" +
      "</section>";

    els.querySelector("#ha-resolve").addEventListener("click", function () {
      if (miniLaunch) { startMini(card); return; }
      resolveCard(card);
    });
  }

  function resolveCard(card) {
    if (card.type === "sofort") {
      game.discard.push(card.id);
    } else if (card.type === "regel") {
      game.hofgesetze.push({ id: card.id, title: card.title, text: card.text });
    } else if (card.type === "aktiv") {
      var cur = currentPlayer();
      game.active.push({
        uid: "u" + (game.uidSeq++),
        cardId: card.id,
        title: card.title,
        text: card.text,
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
      '  <button class="btn btn-primary btn-block btn-xl">Verstanden</button>' +
      "</div>";
    els.appendChild(ov);
    ov.querySelector("button").addEventListener("click", function () {
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    });
  }

  // ---------------------------------------------------------------------------
  // Mini-games (spec §5.4) — each runs to a clear loser, who dient
  // ---------------------------------------------------------------------------
  function startMini(card) {
    game.discard.push(card.id); // the minispiel card is spent once launched
    saveState();
    if (card.mini === "fingerschlacht") startFingerschlacht();
    else if (card.mini === "reim") startReim();
    else if (card.mini === "trommelfeuer") startTrommel();
    else endMini();
  }

  function endMini() {
    clearTickers();
    mini = null;
    nextTurn();
    saveState();
    renderTable();
  }

  function renderMiniResult(losers, emoji, title) {
    clearTickers();
    var accuse = losers.map(function (n) { return esc(n) + ", dienen!!"; }).join(" ");
    els.innerHTML =
      '<section class="screen ha-screen ha-mini-result">' +
      '  <div class="result-emoji">' + (emoji || "🍷") + "</div>" +
      '  <h2 class="result-title pop">' + esc(title || "Es ist entschieden") + "</h2>" +
      '  <p class="result-sub ha-accuse">' + accuse + "</p>" +
      '  <button id="ha-mini-done" class="btn btn-primary btn-block btn-xl">Weiter zur Tafel ▶️</button>' +
      "</section>";
    els.querySelector("#ha-mini-done").addEventListener("click", endMini);
  }

  // --- Die Fingerschlacht --------------------------------------------------
  function startFingerschlacht() {
    mini = { players: names(), callerIdx: 0, called: null, actual: null };
    renderFinger();
  }

  function renderFinger() {
    clearTickers();
    if (mini.players.length <= 2) {
      renderMiniResult(mini.players, "✌️", "Die letzten Zwei");
      return;
    }
    var n = mini.players.length;
    if (mini.callerIdx >= n) mini.callerIdx = 0;
    var caller = mini.players[mini.callerIdx];

    var calledRow = numRow(n, "called", mini.called);
    var actualRow = numRow(n, "actual", mini.actual);
    var ready = mini.called !== null && mini.actual !== null;

    els.innerHTML =
      '<section class="screen ha-screen ha-finger">' +
      '  <div class="ha-bigcard ha-card--minispiel" style="--ha-c:' + TYPE_META.minispiel.colour + '">' +
      '    <div class="ha-bigcard__tag">Purpur · Minispiel</div>' +
      '    <div class="ha-bigcard__title">Die Fingerschlacht</div>' +
      "  </div>" +
      '  <p class="ha-finger__status">Noch <strong>' + n + "</strong> im Spiel.</p>" +
      '  <p class="ha-finger__caller"><strong>' + esc(caller) + "</strong> ruft eine Zahl.</p>" +
      '  <h3 class="sub">Genannte Zahl</h3>' + calledRow +
      '  <h3 class="sub">Tatsächlich gehobene Daumen</h3>' + actualRow +
      '  <button id="ha-finger-go" class="btn btn-primary btn-block btn-xl"' + (ready ? "" : " disabled") + ">Auswerten</button>" +
      '  <p class="muted small">Triff die genannte Zahl die Daumen, scheidet der Rufer aus.</p>' +
      "</section>";

    els.querySelectorAll("[data-num]").forEach(function (b) {
      b.addEventListener("click", function () {
        var kind = b.getAttribute("data-kind");
        mini[kind] = parseInt(b.getAttribute("data-num"), 10);
        renderFinger();
      });
    });
    els.querySelector("#ha-finger-go").addEventListener("click", function () {
      if (mini.called === null || mini.actual === null) return;
      var hit = mini.called === mini.actual;
      if (hit) {
        mini.players.splice(mini.callerIdx, 1); // rufer scheidet aus
        if (mini.callerIdx >= mini.players.length) mini.callerIdx = 0;
      } else {
        mini.callerIdx = (mini.callerIdx + 1) % mini.players.length;
      }
      mini.called = null; mini.actual = null;
      renderFinger();
    });
  }

  function numRow(n, kind, sel) {
    var btns = "";
    for (var i = 0; i <= n; i++) {
      btns += '<button class="ha-num' + (sel === i ? " ha-num--active" : "") + '" data-num="' + i +
        '" data-kind="' + kind + '">' + i + "</button>";
    }
    return '<div class="ha-num-row">' + btns + "</div>";
  }

  // --- Reim oder Schmach ---------------------------------------------------
  function startReim() {
    var verses = data.verses || [];
    var verse = verses.length ? verses[Math.floor(Math.random() * verses.length)] : "Der König spricht ein weises Wort,";
    mini = { players: names(), idx: 0, verse: verse, remaining: REIM_SECONDS };
    renderReim();
  }

  function renderReim() {
    clearTickers();
    var cur = mini.players[mini.idx];
    mini.remaining = REIM_SECONDS;

    els.innerHTML =
      '<section class="screen ha-screen ha-reim">' +
      '  <div class="ha-bigcard ha-card--minispiel" style="--ha-c:' + TYPE_META.minispiel.colour + '">' +
      '    <div class="ha-bigcard__tag">Purpur · Reim oder Schmach</div>' +
      '    <div class="ha-bigcard__text ha-verse">„' + esc(mini.verse) + "“</div>" +
      "  </div>" +
      '  <div class="play-hud"><span class="ha-reim__who">' + esc(cur) + " ist dran</span>" +
      '    <span id="ha-reim-time" class="hud-time">' + mini.remaining + "s</span></div>" +
      '  <p class="muted">Dichte in fünf Sekunden eine reimende Zeile.</p>' +
      '  <div class="whoami-actions">' +
      '    <button id="ha-reim-fail" class="btn btn-skip">Gestockt ❌</button>' +
      '    <button id="ha-reim-ok" class="btn btn-got">Geschafft ✅</button>' +
      "  </div>" +
      '  <button id="ha-reim-quit" class="btn btn-ghost btn-block">Minispiel abbrechen</button>' +
      "</section>";

    els.querySelector("#ha-reim-ok").addEventListener("click", function () {
      mini.idx = (mini.idx + 1) % mini.players.length;
      renderReim();
    });
    els.querySelector("#ha-reim-fail").addEventListener("click", function () {
      renderMiniResult([cur], "🍷", "Gestockt!");
    });
    els.querySelector("#ha-reim-quit").addEventListener("click", endMini);

    every(1000, function () {
      mini.remaining--;
      var t = els && els.querySelector("#ha-reim-time");
      if (t) {
        t.textContent = mini.remaining + "s";
        if (mini.remaining <= 2) t.classList.add("hud-time--danger");
      }
      if (mini.remaining <= 0) { renderMiniResult([cur], "⏱️", "Frist gerissen!"); }
    });
  }

  // --- Trommelfeuer (light turn-policing, no timer per spec) ---------------
  function startTrommel() {
    mini = { players: names(), idx: 0 };
    renderTrommel();
  }

  function renderTrommel() {
    clearTickers();
    var cur = mini.players[mini.idx];
    els.innerHTML =
      '<section class="screen ha-screen ha-trommel">' +
      '  <div class="ha-bigcard ha-card--minispiel" style="--ha-c:' + TYPE_META.minispiel.colour + '">' +
      '    <div class="ha-bigcard__tag">Purpur · Trommelfeuer</div>' +
      '    <div class="ha-bigcard__text">Der Zieher ruft eine Kategorie. Reihum je ein Begriff im Takt — wer patzt oder wiederholt, dient.</div>' +
      "  </div>" +
      '  <div class="ha-turn"><span class="ha-turn__label">Am Wort</span>' +
      '    <span class="ha-turn__name">' + esc(cur) + "</span></div>" +
      '  <div class="whoami-actions">' +
      '    <button id="ha-tr-fail" class="btn btn-skip">Patzer! ❌</button>' +
      '    <button id="ha-tr-ok" class="btn btn-got">Weiter ➡️</button>' +
      "  </div>" +
      '  <button id="ha-tr-quit" class="btn btn-ghost btn-block">Minispiel abbrechen</button>' +
      "</section>";

    els.querySelector("#ha-tr-ok").addEventListener("click", function () {
      mini.idx = (mini.idx + 1) % mini.players.length;
      renderTrommel();
    });
    els.querySelector("#ha-tr-fail").addEventListener("click", function () {
      renderMiniResult([cur], "🥁", "Patzer!");
    });
    els.querySelector("#ha-tr-quit").addEventListener("click", endMini);
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

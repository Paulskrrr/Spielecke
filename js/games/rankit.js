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
  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 2;

  var els = null, ctx = null, settings = null;
  var players = [], set = null, rankings = [], idx = 0, current = [];
  // Reveal-time data kept around so the compare view can replay each player's
  // ranking against the group consensus.
  var consensusRank = [], compare = [];

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
        pools: Pools().load(context.store, sets()),
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; set = null; rankings = []; idx = 0; current = [];
      consensusRank = []; compare = [];
    },
  };

  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var chips = Pools().chipsHtml(sets(), t);

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

    Pools().bind(els.querySelector("#ri-pools"), sets(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    els.querySelector("#ri-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#ri-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    // Reshuffle the pass order each round so it isn't the same sequence every time.
    players = shuffle(roster.slice()).map(function (p) { return p.name; });
    set = pickSet();
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
    els.querySelector("#ri-go").addEventListener("click", function () {
      // Every item is on the axis from the start, in a shuffled order so nobody
      // is anchored to a pre-baked "correct" list. The player drags to reorder.
      current = shuffle(set.items.map(function (_, i) { return i; }));
      renderRank();
    });
  }

  function renderRank() {
    var name = players[idx];
    var items = set.items;

    // The set title encodes the axis as "<top pole> → <bottom pole>". Split it so
    // the rail can label which end is #1 and which is last.
    var poles = set.title.split("→");
    var topPole = poles.length > 1 ? poles[0].trim() : t("Top");
    var botPole = poles.length > 1 ? poles.slice(1).join("→").trim() : t("Bottom");

    var cards = current.map(function (itemIdx, pos) {
      return (
        '<div class="ri-card" data-item="' + itemIdx + '">' +
        '<span class="ri-card__no">' + (pos + 1) + "</span>" +
        '<span class="ri-card__label">' + esc(items[itemIdx]) + "</span>" +
        '<span class="ri-card__grip" aria-hidden="true">⠿</span>' +
        "</div>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen ri-rank">' +
      '  <h3 class="sub">' + t("{name}'s ranking").replace("{name}", esc(name)) + "</h3>" +
      '  <div class="ri-title">' + esc(set.title) + "</div>" +
      '  <p class="muted small">' + t("Drag the items into order — the top is your #1.") + "</p>" +
      '  <div class="ri-axis">' +
      '    <div class="ri-axis__rail">' +
      '      <span class="ri-axis__pole">⬆ ' + esc(topPole) + "</span>" +
      '      <span class="ri-axis__pole ri-axis__pole--bot">⬇ ' + esc(botPole) + "</span>" +
      "    </div>" +
      '    <div class="ri-cards" id="ri-cards">' + cards + "</div>" +
      "  </div>" +
      '  <div class="stack">' +
      '    <button id="ri-shuffle" class="btn btn-block">' + t("🔀 Shuffle") + "</button>" +
      '    <button id="ri-lock" class="btn btn-primary btn-block btn-xl">' + t("Lock it in 🔒") + "</button>" +
      "  </div>" +
      "</section>";

    setupDrag(els.querySelector("#ri-cards"));

    els.querySelector("#ri-shuffle").addEventListener("click", function () {
      current = shuffle(current.slice());
      renderRank();
    });
    els.querySelector("#ri-lock").addEventListener("click", function () {
      rankings.push({ name: name, order: current.slice() });
      idx++;
      current = [];
      if (idx >= players.length) renderReveal();
      else renderPassTo();
    });
  }

  // Vertical-axis drag-and-drop. Cards are absolutely positioned by their slot
  // (slot 0 = top = #1). Dragging a card follows the finger; when it crosses into
  // another slot the underlying `current` order is spliced and the other cards
  // slide to make room. Pointer events cover both touch and mouse.
  function setupDrag(list) {
    var GAP = 10;
    var cards = Array.prototype.slice.call(list.querySelectorAll(".ri-card"));
    if (!cards.length) return;

    var rowH = 0;
    cards.forEach(function (c) { rowH = Math.max(rowH, c.offsetHeight); });
    rowH += GAP;
    list.style.height = rowH * cards.length + "px";

    function slotOf(itemIdx) { return current.indexOf(itemIdx); }

    function layout(except) {
      cards.forEach(function (c) {
        if (c === except) return;
        var item = parseInt(c.getAttribute("data-item"), 10);
        c.style.transition = "transform .18s ease";
        c.style.transform = "translateY(" + slotOf(item) * rowH + "px)";
      });
    }
    function renumber() {
      cards.forEach(function (c) {
        var item = parseInt(c.getAttribute("data-item"), 10);
        c.querySelector(".ri-card__no").textContent = slotOf(item) + 1;
      });
    }
    layout();

    cards.forEach(function (card) {
      card.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        try { card.setPointerCapture(e.pointerId); } catch (err) {}
        var item = parseInt(card.getAttribute("data-item"), 10);
        var startY = e.clientY;
        var baseY = slotOf(item) * rowH;
        card.classList.add("ri-card--drag");
        card.style.transition = "none";

        function move(ev) {
          var y = baseY + (ev.clientY - startY);
          card.style.transform = "translateY(" + y + "px) scale(1.03)";
          var target = Math.max(0, Math.min(cards.length - 1, Math.round(y / rowH)));
          var cur = slotOf(item);
          if (target !== cur) {
            current.splice(cur, 1);
            current.splice(target, 0, item);
            layout(card);
            renumber();
          }
        }
        function up(ev) {
          try { card.releasePointerCapture(ev.pointerId); } catch (err) {}
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerup", up);
          card.removeEventListener("pointercancel", up);
          card.classList.remove("ri-card--drag");
          card.style.transition = "transform .18s ease";
          card.style.transform = "translateY(" + slotOf(item) * rowH + "px)";
        }
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerup", up);
        card.addEventListener("pointercancel", up);
      });
    });
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
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
    consensusRank = [];
    consensusOrder.forEach(function (itemIdx, pos) { consensusRank[itemIdx] = pos; });

    // Each player's drift = sum of |their position − consensus position| (footrule).
    var scored = rankings.map(function (r) {
      var drift = items.reduce(function (a, _, i) {
        return a + Math.abs(r.order.indexOf(i) - consensusRank[i]);
      }, 0);
      return { name: r.name, order: r.order, drift: drift };
    }).sort(function (x, y) { return x.drift - y.drift; });

    // Most-in-sync first, so clicking through compares the closest matches before
    // the wild cards.
    compare = scored.map(function (s) { return { name: s.name, order: s.order, drift: s.drift }; });

    var winner = scored[0];
    var loser = scored[scored.length - 1];
    // "Perfect match" only when every ranking is byte-identical — a tied drift
    // score does NOT mean the orders match (symmetric drifts are common).
    var allSame = rankings.every(function (r) { return r.order.join(",") === rankings[0].order.join(","); });
    var driftTie = !allSame && winner.drift === loser.drift; // everyone equally off, but differently
    var split = !allSame && !driftTie;
    var winners = scored.filter(function (s) { return s.drift === winner.drift; });
    var losers = scored.filter(function (s) { return s.drift === loser.drift; });
    var namesOf = function (list) { return list.map(function (s) { return esc(s.name); }).join(" & "); };

    var consensusList = consensusOrder.map(function (itemIdx, pos) {
      return (
        '<li class="ri-row">' +
        '<span class="ri-row__no">' + (pos + 1) + "</span>" +
        '<span class="ri-row__label">' + esc(items[itemIdx]) + "</span>" +
        "</li>"
      );
    }).join("");

    var playerRows = scored.map(function (s) {
      // Tag by drift value, not index, so every player tied for best/worst is
      // crowned/flagged together instead of only the first or last in sort order.
      var isWin = split && s.drift === winner.drift;
      var isLose = split && s.drift === loser.drift;
      var tag = isWin ? "👑" : (isLose ? (settings.drinking ? "🍺" : "💀") : "");
      var cls = isWin ? " ri-prow--win" : (isLose ? " ri-prow--lose" : "");
      return (
        '<li class="ri-prow' + cls + '">' +
        '<span class="ri-prow__name">' + tag + " " + esc(s.name) + "</span>" +
        '<span class="ri-prow__drift muted">' + t("off by {n}").replace("{n}", s.drift) + "</span>" +
        "</li>"
      );
    }).join("");

    var verdict = allSame
      ? '<p class="result-sub">' + t("A perfect match — the whole table agrees! 🤝") + "</p>"
      : driftTie
      ? '<p class="result-sub">' + t("Dead heat — everyone drifted the same amount, just differently. 🤷") + "</p>"
      : '<p class="result-sub">👑 <strong>' + namesOf(winners) + "</strong> " + t("is the most in sync.") + "<br/>" +
        (settings.drinking
          ? "🍺 <strong>" + namesOf(losers) + "</strong> " + t("drifted furthest — drink!")
          : "💀 <strong>" + namesOf(losers) + "</strong> " + t("drifted furthest.")) + "</p>";

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
      '    <button id="ri-compare" class="btn btn-block">' + t("🔍 Compare rankings") + "</button>" +
      '    <button id="ri-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#ri-compare").addEventListener("click", function () { renderCompare(0); });
    els.querySelector("#ri-next").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#ri-settings").addEventListener("click", renderSetup);
  }

  // Flip through each player's locked-in ranking one at a time and see where they
  // sat each item versus where the group landed. Wraps around so you can keep
  // tapping. `i` indexes `compare` (most-in-sync first).
  function renderCompare(i) {
    var items = set.items;
    var n = compare.length;
    i = ((i % n) + n) % n;
    var p = compare[i];

    var rows = p.order.map(function (itemIdx, pos) {
      var cPos = consensusRank[itemIdx];
      var match = cPos === pos;
      return (
        '<li class="ri-row' + (match ? " ri-row--match" : "") + '">' +
        '<span class="ri-row__no">' + (pos + 1) + "</span>" +
        '<span class="ri-row__label">' + esc(items[itemIdx]) + "</span>" +
        '<span class="ri-cmp__group">' + (match ? "✓ " : "") + t("Group #{n}").replace("{n}", cPos + 1) + "</span>" +
        "</li>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen ri-reveal">' +
      '  <div class="result-emoji">🔍</div>' +
      '  <h2 class="result-title pop">' + t("{name}'s ranking").replace("{name}", esc(p.name)) + "</h2>" +
      '  <p class="result-sub muted">' + t("Player {i} of {n}").replace("{i}", i + 1).replace("{n}", n) +
      "  · " + t("off by {n}").replace("{n}", p.drift) + "</p>" +
      '  <div class="ri-title">' + esc(set.title) + "</div>" +
      '  <ol class="ri-consensus">' + rows + "</ol>" +
      '  <div class="ri-cmp-nav">' +
      '    <button id="ri-cmp-prev" class="btn">◀</button>' +
      '    <button id="ri-cmp-next" class="btn">▶</button>' +
      "  </div>" +
      '  <button id="ri-cmp-back" class="btn btn-primary btn-block btn-xl">' + t("← Back to results") + "</button>" +
      "</section>";

    els.querySelector("#ri-cmp-prev").addEventListener("click", function () { renderCompare(i - 1); });
    els.querySelector("#ri-cmp-next").addEventListener("click", function () { renderCompare(i + 1); });
    els.querySelector("#ri-cmp-back").addEventListener("click", renderReveal);
  }

  function pickSet() {
    var list = Pools().gather(settings.pools, sets(), "sets");
    if (!list.length) return { title: "Rank these 1–5", items: ["One", "Two", "Three", "Four", "Five"] };
    return list[Math.floor(Math.random() * list.length)];
  }

  // Current-language pools from the bilingual { de, en } content bundle.
  function sets() { return global.Spielecke.L(global.Spielecke.RankItSets) || {}; }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.rankit = module;
})(window);

// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/luegen.js — „Lügen" (Cheat / Bullshit / Mogeln) — BETA
 *
 * The bluffing card classic on one passed-around phone. Unlike Mia (one hidden
 * roll under a hat, app tracks nothing), Lügen is a game of PERSISTENT hidden
 * hands: the app deals the whole deck, tracks every hand, and runs a growing
 * face-down pile — things a single shared screen could never do cleanly on the
 * table. The loop is built to feel distinct from the other card games:
 *
 *   - Ascending forced claim: after the leader sets a base rank, EVERY next
 *     player must claim exactly the next rank up (wrapping). You don't choose
 *     the rank — the game dictates it; you only choose how many cards (1–4) and
 *     WHICH to sacrifice. You rarely hold the forced rank, so lies are forced.
 *   - Multi-accuser challenge: any other player may call „Lüge!" — the table
 *     picks WHO calls (they eat the pile if the claim was true). Not a binary
 *     next-player believe/lift like Mia.
 *   - Pickup economy: the loser of a challenge takes the WHOLE pile into hand —
 *     a punishment + comeback swing the app tallies automatically.
 *   - Win by emptying your hand — with the last play being the most dangerous:
 *     get a final bluff believed (or a truthful last play challenged) and you're
 *     out; get the last bluff CALLED and you pick the pile back up.
 *
 * No content file — pure deck mechanics (like Mia / Horse Race). Reuses the
 * shared deck + card-face/flip component (Spielecke.Cards) and the shell
 * contract (roster for the pass order, namespaced store for settings only —
 * mid-game state is NOT persisted; a fresh mount starts at setup).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var Cards = global.Spielecke.Cards;

  var MIN_PLAYERS = 3;
  var MAX_PLAY = 4;                 // cards you may lay in one claim
  var DEFAULTS = { deckSize: 32, drinking: false };

  var els = null, ctx = null, settings = null;

  // Per-game state (reset every deal). `players` is snapshotted at deal time so
  // hands stay keyed by a stable index even if the roster changes mid-game.
  var players = [];                 // [{ id, name }]
  var hands = [];                   // hands[i] = [card, …], sorted for display
  var pile = [];                    // every face-down card since the last clear
  var lastPlay = null;              // { by, claimRank, cards:[…], count }
  var turnIndex = 0, dir = 1;
  var requiredRank = null;          // forced claim rank; null on a fresh pile (leader picks)
  var selection = [];               // indices into the current player's hand (play screen)
  var leaderRank = null;            // leader's chosen base rank (play screen, fresh pile)
  var accuser = null;               // index of who called „Lüge!"
  var revealTimer = null;

  var module = {
    meta: {
      id: "luegen",
      name: "Cheat",
      tagline: "Dump your cards, lie about them. Get caught and eat the pile.",
      icon: "🤥",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: true,
      beta: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        deckSize: parseInt(context.store.get("deckSize", DEFAULTS.deckSize), 10) === 52 ? 52 : 32,
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      clearRevealTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null;
      players = []; hands = []; pile = []; lastPlay = null; selection = []; leaderRank = null; accuser = null;
    },
  };

  function clearRevealTimer() { if (revealTimer !== null) { global.clearTimeout(revealTimer); revealTimer = null; } }

  // ── Deck helpers ──────────────────────────────────────────────────────────
  // 32-deck = 7 8 9 10 J Q K A (index 5+); 52-deck = full 2..A. The ladder wraps
  // so the ascending claim never dead-ends.
  function deckRanks() { return settings.deckSize === 52 ? Cards.RANKS.slice() : Cards.RANKS.slice(5); }
  function ascend(rank) { var d = deckRanks(); return d[(d.indexOf(rank) + 1) % d.length]; }
  function sortHand(h) { return h.slice().sort(function (a, b) { return Cards.value(a) - Cards.value(b) || a.suit.localeCompare(b.suit); }); }
  function roster() { return (ctx.players || []).filter(function (p) { return p && p.name; }); }

  // ── Setup ─────────────────────────────────────────────────────────────────
  function renderSetup() {
    clearRevealTimer();
    var ros = roster();
    var enough = ros.length >= MIN_PLAYERS;
    var note = enough
      ? ""
      : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🤥 ' + t("Cheat") + ' <span class="badge badge-beta">' + t("BETA") + "</span></h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <details class="mx-rules"><summary>' + t("How does it work?") + "</summary>" +
      '    <p class="muted small">' + t("The whole deck is dealt out. On your turn you must claim a set rank (the leader picks it, then it climbs by one each turn) — but you play your cards face down, so you can lie. Anyone can shout „Lüge!\": the cards flip, and whoever was wrong — the liar or the accuser — takes the whole pile. First to empty their hand wins. Your last card is the riskiest.") + "</p>" +
      "  </details>" +
      note +
      '  <h3 class="sub">' + t("Deck") + "</h3>" +
      '  <div class="chip-row" id="lg-deck">' +
      '    <button class="chip" data-d="32">🏃 ' + t("Short (32)") + "</button>" +
      '    <button class="chip" data-d="52">🎴 ' + t("Full (52)") + "</button>" +
      "  </div>" +
      '  <label class="toggle"><input type="checkbox" id="lg-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="lg-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + " data-primary>" + t("Deal 🤥") + "</button>" +
      "</section>";

    highlight("#lg-deck", String(settings.deckSize), "data-d");
    els.querySelectorAll("#lg-deck .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.deckSize = parseInt(c.getAttribute("data-d"), 10) === 52 ? 52 : 32;
        ctx.store.set("deckSize", settings.deckSize);
        highlight("#lg-deck", String(settings.deckSize), "data-d");
      });
    });
    els.querySelector("#lg-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#lg-start");
    if (enough) start.addEventListener("click", function () { deal(ros); });
  }

  // ── Deal ──────────────────────────────────────────────────────────────────
  function deal(ros) {
    // Snapshot + shuffle the seating so the opener varies each game.
    players = global.Spielecke.shuffle(ros).map(function (p) { return { id: p.id, name: p.name }; });
    var n = players.length;
    var deck = global.Spielecke.shuffle(Cards.newDeck().filter(function (c) {
      return deckRanks().indexOf(c.rank) !== -1;
    }));
    hands = players.map(function () { return []; });
    for (var i = 0; deck.length; i++) hands[i % n].push(deck.shift());
    hands = hands.map(sortHand);

    pile = []; lastPlay = null; dir = 1; turnIndex = 0; requiredRank = null;
    selection = []; leaderRank = null; accuser = null;
    renderHandoff();
  }

  function nextIndex(from) { var n = players.length; return (from + dir + n) % n; }

  // ── Private handoff ───────────────────────────────────────────────────────
  function renderHandoff() {
    clearRevealTimer();
    selection = []; leaderRank = null;
    var p = players[turnIndex];
    var lead = pile.length === 0;
    els.innerHTML =
      '<section class="screen imposter-pass">' +
      '  <div class="pass-step">' + (lead
          ? t("New pile — {name} leads").replace("{name}", esc(p.name))
          : t("Claim due: {rank}").replace("{rank}", rankName(requiredRank))) + "</div>" +
      '  <div class="pass-emoji">🤥</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(p.name)) + "</h2>" +
      '  <p class="muted">' + t("Only {name} looks at the hand.").replace("{name}", esc(p.name)) + "</p>" +
      '  <button id="lg-look" class="btn btn-primary btn-block btn-xl" data-primary>' + t("I'm {name} — my hand").replace("{name}", esc(p.name)) + "</button>" +
      "</section>";
    els.querySelector("#lg-look").addEventListener("click", renderPlay);
  }

  // ── Private play screen ───────────────────────────────────────────────────
  function renderPlay() {
    var p = players[turnIndex];
    var hand = hands[turnIndex];
    var lead = pile.length === 0;
    var cap = Math.min(MAX_PLAY, hand.length);

    var leaderPick = lead
      ? '<div class="lg-leadpick">' +
        '  <div class="lg-leadpick__label">' + t("Announce which rank:") + "</div>" +
        '  <div class="chip-row" id="lg-rankpick">' +
        deckRanks().map(function (r) { return '<button class="chip" data-r="' + r + '">' + r + "</button>"; }).join("") +
        "  </div>" +
        "</div>"
      : '<div class="lg-forced">' + t("You must claim:") + ' <b>' + rankName(requiredRank) + "</b></div>";

    var cards = hand.map(function (c, i) {
      return '<button class="lg-card" data-i="' + i + '">' + Cards.faceHtml(c, { small: true }) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen lg-play">' +
      '  <div class="lg-playhead">' +
      '    <span class="lg-who">' + esc(p.name) + "</span>" +
      '    <span class="lg-handcount">' + t("{n} cards").replace("{n}", hand.length) + "</span>" +
      "  </div>" +
      pileNote() +
      leaderPick +
      '  <div class="lg-hand" id="lg-hand">' + cards + "</div>" +
      '  <p class="muted small lg-hint">' + t("Tap up to {k} cards to lay face down — truth or bluff.").replace("{k}", cap) + "</p>" +
      '  <button id="lg-lay" class="btn btn-primary btn-block btn-xl" disabled data-primary>' + t("Lay face down") + "</button>" +
      "</section>";

    if (lead) {
      els.querySelectorAll("#lg-rankpick .chip").forEach(function (c) {
        c.addEventListener("click", function () {
          leaderRank = c.getAttribute("data-r");
          highlight("#lg-rankpick", leaderRank, "data-r");
          updateLayBtn(cap);
        });
      });
    }
    els.querySelectorAll("#lg-hand .lg-card").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-i"), 10);
        var at = selection.indexOf(i);
        if (at !== -1) { selection.splice(at, 1); b.classList.remove("lg-card--sel"); }
        else {
          if (selection.length >= cap) return; // cap reached
          selection.push(i); b.classList.add("lg-card--sel");
        }
        updateLayBtn(cap);
      });
    });
    els.querySelector("#lg-lay").addEventListener("click", commitPlay);
  }

  function updateLayBtn(cap) {
    var lead = pile.length === 0;
    var btn = els && els.querySelector("#lg-lay");
    if (!btn) return;
    var ok = selection.length >= 1 && selection.length <= cap && (!lead || leaderRank);
    btn.disabled = !ok;
    btn.textContent = selection.length
      ? t("Lay {k} face down").replace("{k}", selection.length)
      : t("Lay face down");
  }

  function commitPlay() {
    if (!selection.length) return;
    var lead = pile.length === 0;
    var claim = lead ? leaderRank : requiredRank;
    if (!claim) return;
    var hand = hands[turnIndex];
    // Pull the selected cards out of the hand (descending index so splices don't shift).
    var picked = selection.slice().sort(function (a, b) { return b - a; }).map(function (i) { return hand.splice(i, 1)[0]; });
    picked.reverse();
    picked.forEach(function (c) { pile.push(c); });
    lastPlay = { by: turnIndex, claimRank: claim, cards: picked, count: picked.length };
    renderClaim();
  }

  // ── Public claim screen ───────────────────────────────────────────────────
  function renderClaim() {
    var p = players[lastPlay.by];
    var emptied = hands[lastPlay.by].length === 0;
    els.innerHTML =
      '<section class="screen lg-claim">' +
      '  <div class="lg-claimcard">' +
      '    <div class="lg-claimcard__who">' + esc(p.name) + "</div>" +
      '    <div class="lg-claimcard__says">' + t("lays face down and claims") + "</div>" +
      '    <div class="lg-claimcard__deal">' + lastPlay.count + " × " + rankName(lastPlay.claimRank) + "</div>" +
      (emptied ? '    <div class="lg-lastcard">🔥 ' + t("Their LAST cards!") + "</div>" : "") +
      "  </div>" +
      handHud() +
      '  <div class="lg-pilebar">🂠 ' + t("Pile: {n}").replace("{n}", pile.length) + "</div>" +
      '  <div class="stack">' +
      '    <button id="lg-believe" class="btn btn-got btn-block btn-xl" data-primary>' + t("Believe — next ▶️") + "</button>" +
      '    <button id="lg-doubt" class="btn btn-skip btn-block btn-xl">' + t("Call „Lüge!\" 🔍") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#lg-believe").addEventListener("click", believe);
    els.querySelector("#lg-doubt").addEventListener("click", renderAccuse);
  }

  function believe() {
    // Uncontested. If the player just emptied their hand, they win outright.
    if (hands[lastPlay.by].length === 0) { renderWin(lastPlay.by); return; }
    requiredRank = ascend(lastPlay.claimRank);
    turnIndex = nextIndex(lastPlay.by);
    renderHandoff();
  }

  // ── Accuser pick ──────────────────────────────────────────────────────────
  function renderAccuse() {
    var btns = players.map(function (p, i) {
      if (i === lastPlay.by) return ""; // the player can't accuse themselves
      return '<button class="btn btn-block btn-xl lg-accuser" data-i="' + i + '">' + esc(p.name) + "</button>";
    }).join("");
    els.innerHTML =
      '<section class="screen lg-accuse">' +
      '  <h2 class="screen-title pop">🔍 ' + t("Who calls „Lüge!\"?") + "</h2>" +
      '  <p class="muted">' + t("{name} claimed {n} × {rank}.")
            .replace("{name}", esc(players[lastPlay.by].name))
            .replace("{n}", lastPlay.count).replace("{rank}", rankName(lastPlay.claimRank)) + "</p>" +
      '  <div class="stack">' + btns + "</div>" +
      '  <button id="lg-cancel" class="btn btn-block">' + t("Never mind — believe") + "</button>" +
      "</section>";
    els.querySelectorAll(".lg-accuser").forEach(function (b) {
      b.addEventListener("click", function () {
        accuser = parseInt(b.getAttribute("data-i"), 10);
        renderReveal();
      });
    });
    els.querySelector("#lg-cancel").addEventListener("click", believe);
  }

  // ── Reveal & resolve ──────────────────────────────────────────────────────
  function renderReveal() {
    clearRevealTimer();
    var truth = lastPlay.cards.every(function (c) { return c.rank === lastPlay.claimRank; });
    var flips = lastPlay.cards.map(function (c, i) {
      return '<div class="lg-flip">' + Cards.flipHtml(c, { small: true, id: "lg-flip-" + i }) + "</div>";
    }).join("");

    els.innerHTML =
      '<section class="screen lg-reveal">' +
      '  <h2 class="screen-title pop">' + t("Claim: {n} × {rank}")
            .replace("{n}", lastPlay.count).replace("{rank}", rankName(lastPlay.claimRank)) + "</h2>" +
      '  <div class="lg-flips">' + flips + "</div>" +
      '  <div class="lg-verdict" id="lg-verdict">&nbsp;</div>' +
      "</section>";

    // Flip the cards one by one, then land the verdict.
    var i = 0;
    (function step() {
      if (!els) return;
      if (i < lastPlay.cards.length) {
        Cards.reveal(els.querySelector("#lg-flip-" + i));
        i++;
        revealTimer = global.setTimeout(step, 480);
      } else {
        revealTimer = global.setTimeout(function () { resolve(truth); }, 620);
      }
    })();
  }

  function resolve(truth) {
    clearRevealTimer();
    // Truth → the accuser was wrong and eats the pile. Bluff → the player does.
    var loser = truth ? accuser : lastPlay.by;
    var pileCount = pile.length;
    hands[loser] = sortHand(hands[loser].concat(pile));
    pile = [];

    var sips = settings.drinking ? Math.min(9, Math.max(1, Math.round(pileCount / 3))) : 0;
    var vEl = els.querySelector("#lg-verdict");
    if (vEl) {
      var line = truth
        ? t("No lie! {name} was telling the truth.").replace("{name}", esc(players[lastPlay.by].name))
        : t("Busted — {name} lied!").replace("{name}", esc(players[lastPlay.by].name));
      var pickup = t("{name} takes the pile ({n} cards)")
        .replace("{name}", esc(players[loser].name)).replace("{n}", pileCount) +
        (sips ? " · 🍺 " + t("{n} sips").replace("{n}", sips) : "");
      vEl.innerHTML =
        '<div class="lg-verdict__line lg-verdict__line--' + (truth ? "truth" : "lie") + '">' +
          (truth ? "✅ " : "💥 ") + line + "</div>" +
        '<div class="lg-verdict__pickup">🂠 ' + pickup + "</div>" +
        '<button id="lg-cont" class="btn btn-primary btn-block btn-xl" data-primary>' + t("Play on ▶️") + "</button>";
      els.querySelector("#lg-cont").addEventListener("click", afterChallenge);
    }
  }

  function afterChallenge() {
    // A truthful last play means the player emptied and the accuser ate the pile
    // → the player is out of cards and wins. (A caught bluff on the last cards
    // hands the pile back, so they're no longer empty — play simply continues.)
    if (hands[lastPlay.by].length === 0) { renderWin(lastPlay.by); return; }
    // Fresh pile: the player after the one who just played leads with a free rank.
    requiredRank = null;
    turnIndex = nextIndex(lastPlay.by);
    accuser = null;
    renderHandoff();
  }

  // ── Win ───────────────────────────────────────────────────────────────────
  function renderWin(winIdx) {
    clearRevealTimer();
    var ranking = players.map(function (p, i) { return { name: p.name, n: hands[i] ? hands[i].length : 0, i: i }; });
    ranking.sort(function (a, b) { return a.n - b.n; });
    var rows = ranking.map(function (r, i) {
      var medal = r.i === winIdx ? "🏆" : (i === ranking.length - 1 ? "🐌" : (i + 1) + ".");
      return '<li class="lg-standing' + (r.i === winIdx ? " lg-standing--win" : "") + '">' +
        '<span>' + medal + " " + esc(r.name) + "</span>" +
        '<span class="muted">' + t("{n} cards").replace("{n}", r.n) + "</span></li>";
    }).join("");

    els.innerHTML =
      '<section class="screen lg-win">' +
      '  <div class="result-emoji">🏆</div>' +
      '  <h2 class="result-title pop">' + t("{name} is out — and wins!").replace("{name}", esc(players[winIdx].name)) + "</h2>" +
      '  <ol class="lg-standings">' + rows + "</ol>" +
      '  <div class="stack">' +
      '    <button id="lg-again" class="btn btn-primary btn-block btn-xl" data-primary>' + t("Deal again 🔁") + "</button>" +
      '    <button id="lg-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#lg-again").addEventListener("click", function () {
      var ros = roster();
      if (ros.length >= MIN_PLAYERS) deal(ros); else renderSetup();
    });
    els.querySelector("#lg-settings").addEventListener("click", renderSetup);
  }

  // ── Small render helpers ──────────────────────────────────────────────────
  // A live count of every hand so the table sees who's close to winning.
  function handHud() {
    return '<div class="lg-hud">' + players.map(function (p, i) {
      var n = hands[i].length;
      return '<span class="lg-hud__chip' + (n === 0 ? " lg-hud__chip--empty" : n <= 2 ? " lg-hud__chip--low" : "") +
        (i === lastPlay.by ? " lg-hud__chip--active" : "") + '">' +
        esc(p.name) + " <b>" + n + "</b></span>";
    }).join("") + "</div>";
  }
  function pileNote() {
    if (!pile.length) return '<div class="lg-pilenote">' + t("You open the pile.") + "</div>";
    return '<div class="lg-pilenote">🂠 ' + t("{n} cards face down in the pile.").replace("{n}", pile.length) + "</div>";
  }
  function rankName(r) { return r; }

  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(an) === value);
    });
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.luegen = module;
})(window);

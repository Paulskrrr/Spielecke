/*
 * games/mindmeld.js — Mind Meld (convergence teams)
 *
 * The roster is split into teams of 2 (an odd player makes one team of 3). Each
 * team is handed one seed word per member; on "go" the members simultaneously
 * say a NEW word, again and again, trying to converge on the SAME word. Each
 * failed attempt is a tap (+1). When they meld, the round count is locked. Fewest
 * rounds wins; the team that took the most drinks.
 *
 * Content: js/content/mindmeld.js (Spielecke.MindMeldWords), category pools.
 * Contract: meta + mount + unmount(). No timers/audio to tear down.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function Pools() { return global.Spielecke.Pools; }

  var els = null, ctx = null, settings = null;
  var teams = [];      // [{ members:[name], words:[word], rounds:null }]
  var teamIdx = 0;
  var seedIdx = 0;     // which teammate is privately viewing their seed word
  var count = 1;

  var module = {
    meta: {
      id: "mindmeld",
      name: "Mind Meld",
      tagline: "Two minds, two words. Say the same thing — fewest tries wins.",
      icon: "🔗",
      minPlayers: 4,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pools: Pools().load(context.store, catalogue()),
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; teams = []; teamIdx = 0;
    },
  };

  function catalogue() { return global.Spielecke.L(global.Spielecke.MindMeldWords) || {}; }
  function roster() { return (ctx.players || []).filter(function (p) { return p && p.name; }); }

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var r = roster();
    var enough = r.length >= module.meta.minPlayers;
    if (enough && !teams.length) buildTeams();

    var note = enough ? "" :
      '<div class="roster-warn" style="display:block">' +
      t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", module.meta.minPlayers) + "</div>";

    var teamCards = enough ? teams.map(function (tm, i) {
      return '<div class="mm-team-card"><span class="mm-team-tag">' + t("Team {n}").replace("{n}", i + 1) + "</span>" +
        '<span class="mm-team-members">' + esc(tm.members.join(" & ")) + "</span></div>";
    }).join("") : "";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🔗 ' + t("Mind Meld") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      (enough ? '  <div class="mm-teams">' + teamCards + "</div>" +
        '  <button id="mm-reshuffle" class="btn btn-block">' + t("🔀 Reshuffle teams") + "</button>" : "") +
      '  <h3 class="sub">' + t("Word pool") + "</h3>" +
      '  <div class="chip-row" id="mm-pools">' + Pools().chipsHtml(catalogue(), t) + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="mm-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="mm-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start melding 🔗") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#mm-pools"), catalogue(),
      function () { return settings.pools; },
      // Pool change re-deals only the seed WORDS — re-pairing the teams here
      // would silently desync the team cards already on screen.
      function (v) { settings.pools = v; Pools().save(ctx.store, v); if (teams.length) reseedWords(); });
    els.querySelector("#mm-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var rs = els.querySelector("#mm-reshuffle");
    if (rs) rs.addEventListener("click", function () { buildTeams(); renderSetup(); });
    if (enough) els.querySelector("#mm-start").addEventListener("click", function () { teamIdx = 0; renderHandover(); });
  }

  // Split roster into pairs; an odd leftover joins the last team (→ a trio).
  function buildTeams() {
    var names = global.Spielecke.shuffle(roster().map(function (p) { return p.name; }));
    var grouped = [];
    for (var i = 0; i < names.length; i += 2) grouped.push(names.slice(i, i + 2));
    if (grouped.length > 1 && grouped[grouped.length - 1].length === 1) {
      grouped[grouped.length - 2].push(grouped.pop()[0]);
    }
    teams = grouped.map(function (members) {
      return { members: members, words: [], rounds: null };
    });
    reseedWords();
  }

  // Deal fresh seed words to the existing teams (pairings untouched).
  function reseedWords() {
    var words = global.Spielecke.shuffle(Pools().gather(settings.pools, catalogue(), "words"));
    var w = 0;
    teams.forEach(function (tm) {
      tm.words = tm.members.map(function () { return words.length ? words[w++ % words.length] : "…"; });
    });
  }

  // --- Play ----------------------------------------------------------------
  function renderHandover() {
    var tm = teams[teamIdx];
    els.innerHTML =
      '<section class="screen mm-handover">' +
      '  <div class="pass-emoji">🔗</div>' +
      '  <p class="muted">' + t("Team {n} — pass them the phone").replace("{n}", teamIdx + 1) + "</p>" +
      '  <h2 class="pass-name pop">' + esc(tm.members.join(" & ")) + "</h2>" +
      '  <button id="mm-go" class="btn btn-primary btn-block btn-xl">' + t("Show our words 🔗") + "</button>" +
      "</section>";
    els.querySelector("#mm-go").addEventListener("click", function () { seedIdx = 0; renderSeed(); });
  }

  // Each teammate privately sees ONLY their own seed word first (Imposter-style
  // pass-around) — nobody may know the other's word before the first say.
  function renderSeed() {
    var tm = teams[teamIdx];
    var member = tm.members[seedIdx];
    els.innerHTML =
      '<section class="screen imposter-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", seedIdx + 1).replace("{n}", tm.members.length) + "</div>" +
      '  <div class="pass-emoji">🔗</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(member)) + "</h2>" +
      '  <p class="muted">' + t("Only {name} should look. Everyone else: no peeking.").replace("{name}", esc(member)) + "</p>" +
      '  <button id="mm-reveal" class="btn btn-primary btn-block btn-xl">' + t("I'm {name} — reveal").replace("{name}", esc(member)) + "</button>" +
      "</section>";
    els.querySelector("#mm-reveal").addEventListener("click", showSeed);
  }

  function showSeed() {
    var tm = teams[teamIdx];
    var member = tm.members[seedIdx];
    var word = tm.words[seedIdx];
    var last = seedIdx === tm.members.length - 1;
    els.innerHTML =
      '<section class="screen mm-seed-screen">' +
      '  <p class="muted">' + t("Your word") + " — " + esc(member) + "</p>" +
      '  <div class="mm-word mm-seed"><span class="mm-word-text">' + esc(word) + "</span></div>" +
      '  <button id="mm-hide" class="btn btn-primary btn-block btn-xl">' +
      (last ? t("Everyone's seen theirs — meld! 🔗") : t("Hide & pass on ➡️")) + "</button>" +
      "</section>";
    els.querySelector("#mm-hide").addEventListener("click", function () {
      if (last) { count = 1; renderMeld(); }
      else { seedIdx++; renderSeed(); }
    });
  }

  function renderMeld() {
    els.innerHTML =
      '<section class="screen mm-meld">' +
      '  <p class="muted small">' + t("On 3, say your word at the same time. Then a new word each round until you match.") + "</p>" +
      '  <div class="mm-counter" id="mm-counter" role="button" tabindex="0">' + count + "</div>" +
      '  <div class="tap-hint">' + t("👆 Tap the number when you don\'t match") + "</div>" +
      '  <button id="mm-meld" class="btn btn-primary btn-block btn-xl">' + t("MELD! 🎉") + "</button>" +
      "</section>";
    var counter = els.querySelector("#mm-counter");
    global.Spielecke.tappable(counter, function () {
      count++; counter.textContent = count;
    });
    els.querySelector("#mm-meld").addEventListener("click", function () {
      teams[teamIdx].rounds = count;
      teamIdx++;
      if (teamIdx < teams.length) renderHandover();
      else renderResults();
    });
  }

  // --- Results -------------------------------------------------------------
  function renderResults() {
    var ranked = teams.slice().sort(function (a, b) { return a.rounds - b.rounds; });
    var best = ranked[0].rounds;
    var worst = ranked[ranked.length - 1].rounds;

    var rows = ranked.map(function (tm) {
      var win = tm.rounds === best, lose = tm.rounds === worst && worst !== best;
      var medal = win ? "🥇" : lose ? "🍺" : "•";
      return '<li class="mm-rank' + (win ? " mm-rank--win" : "") + (lose ? " mm-rank--lose" : "") + '">' +
        '<span class="mm-medal">' + medal + "</span>" +
        '<span class="mm-rank-team">' + esc(tm.members.join(" & ")) + "</span>" +
        '<span class="mm-rank-n">' + tm.rounds + " " + t("rounds") + "</span></li>";
    }).join("");

    var loseLine = worst !== best
      ? (settings.drinking
        ? t("🍺 Slowest to meld drinks — bottoms up!")
        : t("🐌 Slowest to meld this round."))
      : t("A perfect tie — nobody drinks.");

    els.innerHTML =
      '<section class="screen mm-results">' +
      '  <h2 class="result-title pop">🔗 ' + t("Melded!") + "</h2>" +
      '  <ol class="mm-ranking">' + rows + "</ol>" +
      '  <p class="result-sub">' + loseLine + "</p>" +
      '  <div class="stack">' +
      '    <button id="mm-again" class="btn btn-primary btn-block btn-xl">' + t("New teams 🔁") + "</button>" +
      '    <button id="mm-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#mm-again").addEventListener("click", function () { buildTeams(); teamIdx = 0; renderHandover(); });
    els.querySelector("#mm-settings").addEventListener("click", renderSetup);
  }

  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.mindmeld = module;
})(window);

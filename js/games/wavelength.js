// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/wavelength.js — Wavelength (one device, pass-around, multiplayer)
 *
 * A spectrum runs between two opposites (e.g. Cold ↔ Hot). At the start of each
 * round one player is picked at random as the clue-giver: they secretly see a
 * hidden target band and write a one-line clue. The phone then passes round and
 * every OTHER player, one at a time, drops their line on the spectrum from the
 * clue alone. At the end the target is revealed and the placed lines animate in
 * one by one — furthest off first, closest last — each tagged with its player.
 *
 * Uses the shared roster (context.players) for the pass order + names.
 * Content lives in content/wavelength.js (Spielecke.WavelengthSpectrums).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function pools() { return global.Spielecke.L(global.Spielecke.WavelengthSpectrums) || {}; }
  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 2; // a clue-giver + at least one guesser

  // Concentric scoring zones, measured as half-width (%) out from the target
  // centre. The closer you land to the middle, the more you score — so a sharp
  // read beats one that just clips the edge. Ordered centre → outermost.
  var ZONES = [
    { half: 4,  pts: 4, cls: "bull" },
    { half: 10, pts: 3, cls: "near" },
    { half: 18, pts: 2, cls: "far" },
  ];
  // How far the target centre stays clear of each rail. We only keep the
  // innermost (top-scoring) ring fully on-track, so the band can sit flush
  // against either end — true extremes are possible. The wider outer rings just
  // clip at the rail (both tracks are overflow:hidden).
  var EDGE_MARGIN = ZONES[0].half;

  var els = null;
  var ctx = null;
  var settings = null;
  var spectrum = null;
  var target = 50;
  var guess = 50;
  var clue = "";

  // Multiplayer round state.
  var giver = "";        // name of the randomly chosen clue-giver
  var guessers = [];     // the other players, in pass order
  var gi = 0;            // index of the guesser currently holding the phone
  var guesses = [];      // [{ name, value }] locked in by each guesser
  var timer = null;      // pending reveal-animation timeout
  var spin = null;       // pending clue-giver spinner rAF handle

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (spin) { global.cancelAnimationFrame(spin); spin = null; }
  }

  var module = {
    meta: {
      id: "wavelength",
      name: "Wavelength",
      tagline: "Read the room. One clue, one dial — how close can they land?",
      icon: "📡",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: false,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = { pools: Pools().load(context.store, pools()) };
      renderSetup();
    },

    unmount: function () {
      clearTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; spectrum = null; clue = "";
      giver = ""; guessers = []; gi = 0; guesses = [];
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    clearTimer();
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var chips = Pools().chipsHtml(pools(), t);

    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? ""
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">📡 ' + t("Wavelength") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <p class="muted small">' + t("One player is picked to set the wavelength and write a clue. Everyone else then places their line one by one. Closest to the hidden target wins the round.") + "</p>" +
      note +
      '  <h3 class="sub">' + t("Spectrum pool") + "</h3>" +
      '  <div class="chip-row" id="wl-pools">' + chips + "</div>" +
      '  <button id="wl-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start round 🎯") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#wl-pools"), pools(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    var start = els.querySelector("#wl-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  // --- Round: pick a random clue-giver, the rest will guess in turn --------
  function startRound(roster) {
    clearTimer();
    // Reshuffle each round so the clue-giver and pass order vary between rounds.
    var names = shuffle(roster).map(function (p) { return p.name; });
    spectrum = pickSpectrum();
    target = Math.round(EDGE_MARGIN + Math.random() * (100 - 2 * EDGE_MARGIN));
    clue = "";
    guess = 50;
    guesses = [];
    gi = 0;

    // Pre-pick a random clue-giver; the spinner animates toward this one, but the
    // players can override it before confirming. Guessers are derived at confirm
    // time (below) since the pick can still change.
    giver = names[Math.floor(Math.random() * names.length)];
    guessers = [];

    renderPickGiver(names);
  }

  // --- Clue-giver spinner: a highlight sweeps the names, decelerates and lands
  // on the pre-picked giver (≤ ~2.4s). You confirm it, or tap any name to pick
  // the clue-giver yourself. Honours reduced-motion by settling instantly.
  function renderPickGiver(names) {
    clearTimer();
    var chosen = names.indexOf(giver);
    if (chosen < 0) chosen = 0;

    els.innerHTML =
      '<section class="screen wl-pick">' +
      '  <h2 class="screen-title pop">📡 ' + t("Who sets the wavelength?") + "</h2>" +
      '  <p class="muted small wl-pick-sub" id="wl-pick-sub">' + t("Spinning for a clue-giver…") + "</p>" +
      '  <div class="wl-pick-list" id="wl-pick-list">' +
      names.map(function (n, i) {
        return '<button class="wl-pick-name" data-i="' + i + '">' + esc(n) + "</button>";
      }).join("") +
      "  </div>" +
      '  <button id="wl-pick-confirm" class="btn btn-primary btn-block btn-xl" disabled>' + t("Picking…") + "</button>" +
      '  <p class="muted small wl-pick-hint">' + t("Tap any name to pick the clue-giver yourself.") + "</p>" +
      "</section>";

    var list = els.querySelector("#wl-pick-list");
    var nodes = Array.prototype.slice.call(list.querySelectorAll(".wl-pick-name"));
    var confirmBtn = els.querySelector("#wl-pick-confirm");
    var sub = els.querySelector("#wl-pick-sub");
    var settled = false;

    function paint(i) {
      for (var k = 0; k < nodes.length; k++) nodes[k].classList.toggle("is-hot", k === i);
    }
    function settle(i) {
      clearTimer();
      settled = true;
      giver = names[i];
      for (var k = 0; k < nodes.length; k++) {
        nodes[k].classList.toggle("is-hot", k === i);
        nodes[k].classList.toggle("is-chosen", k === i);
      }
      if (sub) sub.textContent = t("Tap a name to pick someone else.");
      confirmBtn.disabled = false;
      confirmBtn.textContent = t("{name} sets it — continue 📡").replace("{name}", giver);
    }

    nodes.forEach(function (n, k) {
      n.addEventListener("click", function () { settle(k); });
    });
    confirmBtn.addEventListener("click", function () {
      if (!settled) return;
      clearTimer();
      guessers = names.filter(function (n) { return n !== giver; });
      renderGiverHandover();
    });

    var reduced = false;
    try { reduced = global.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* ignore */ }
    if (reduced || names.length < 2) { settle(chosen); return; }

    // Time-based ease-out so the spin always lasts the same ~2.4s no matter how
    // many players there are. Total travel = a couple of full loops plus the
    // offset to the chosen index, so it lands exactly on the pre-pick.
    var DUR = 2400;
    var len = names.length;
    var loops = len <= 4 ? 3 : 2;
    var dist = loops * len + ((chosen % len) + len) % len;
    var t0 = 0;
    function frame(ts) {
      if (!els || settled) { spin = null; return; }
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      paint(Math.floor(e * dist) % len);
      if (p < 1) spin = global.requestAnimationFrame(frame);
      else { spin = null; settle(chosen); }
    }
    spin = global.requestAnimationFrame(frame);
  }

  function renderGiverHandover() {
    els.innerHTML =
      '<section class="screen wl-handover">' +
      '  <div class="pass-emoji">📡</div>' +
      '  <h2 class="pass-name pop">' + t("{name} sets the wavelength").replace("{name}", esc(giver)) + "</h2>" +
      '  <p class="muted">' + t("Pass the phone to {name}. Everyone else: look away while they peek at the target and write the clue.").replace("{name}", esc(giver)) + "</p>" +
      '  <button id="wl-show" class="btn btn-primary btn-block btn-xl">' + t("I'm {name} — show the target 🎯").replace("{name}", esc(giver)) + "</button>" +
      "</section>";
    els.querySelector("#wl-show").addEventListener("click", renderTarget);
  }

  function renderTarget() {
    els.innerHTML =
      '<section class="screen wl-target">' +
      '  <h2 class="screen-title pop">' + t("Give a clue!") + "</h2>" +
      spectrumView(spectrum, { showTarget: true }) +
      '  <p class="muted small">' + t("Write a clue between the two ends that points right at the band — the others only see your clue, not the target.") + "</p>" +
      '  <input id="wl-clue" class="text-input wl-clue-input" type="text" maxlength="60" placeholder="' + attr(t("Your clue…")) + '" value="' + attr(clue) + '" />' +
      '  <button id="wl-hide" class="btn btn-primary btn-block btn-xl" disabled>' + t("Hide & let them guess 🤐") + "</button>" +
      "</section>";

    var input = els.querySelector("#wl-clue");
    var hide = els.querySelector("#wl-hide");
    function sync() { clue = input.value.trim(); hide.disabled = clue.length === 0; }
    input.addEventListener("input", sync);
    sync();
    hide.addEventListener("click", function () {
      clue = input.value.trim();
      if (clue) { gi = 0; renderGuesserPass(); }
    });
  }

  // --- Guess phase: each guesser places their line in turn -----------------
  function renderGuesserPass() {
    var name = guessers[gi];
    guess = 50; // everyone starts from the middle, blind to the others
    els.innerHTML =
      '<section class="screen wl-handover">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", gi + 1).replace("{n}", guessers.length) + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("Place your line where you'd put the clue on the spectrum.") + "</p>" +
      '  <button id="wl-go" class="btn btn-primary btn-block btn-xl">' + t("I'm {name} — go").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#wl-go").addEventListener("click", renderGuesserGuess);
  }

  function renderGuesserGuess() {
    var name = guessers[gi];
    els.innerHTML =
      '<section class="screen wl-guess">' +
      '  <h2 class="screen-title pop">' + esc(name) + "</h2>" +
      clueBanner() +
      spectrumView(spectrum, { showGuess: true, slider: true }) +
      '  <button id="wl-lock" class="btn btn-primary btn-block btn-xl">' + t("Lock it in 🔒") + "</button>" +
      "</section>";

    var slider = els.querySelector("#wl-slider");
    slider.addEventListener("input", function () {
      guess = parseInt(slider.value, 10);
      var marker = els.querySelector("#wl-guess-marker");
      if (marker) marker.style.setProperty("--pos", guess + "%");
    });
    els.querySelector("#wl-lock").addEventListener("click", function () {
      guesses.push({ name: name, value: guess });
      gi++;
      if (gi >= guessers.length) renderReveal();
      else renderGuesserPass();
    });
  }

  // --- Reveal: target shown, then lines animate furthest → closest ---------
  function renderReveal() {
    clearTimer();

    var results = guesses.map(function (g) {
      var d = Math.abs(g.value - target);
      var zone = zoneFor(d);
      return { name: g.name, value: g.value, d: d, pts: zone ? zone.pts : 0 };
    });
    // Reveal order: furthest off first, closest (the winner) last.
    var order = results.slice().sort(function (a, b) {
      return b.d - a.d || a.name.localeCompare(b.name);
    });
    var winner = order[order.length - 1];

    // Stable index per result so the line, its leader and its name tag can be
    // revealed (and laid out) as a group.
    results.forEach(function (r, i) { r._i = i; });
    var marks = results.map(function (r) {
      var win = r === winner;
      return (
        '<div class="wl-line' + (win ? " wl-line--win" : "") + '" data-i="' + r._i + '" style="--pos:' + r.value + '%"></div>' +
        '<div class="wl-lead" data-i="' + r._i + '"></div>' +
        '<div class="wl-tag' + (win ? " wl-tag--win" : "") + '" data-i="' + r._i + '">' +
        (win ? "👑 " : "") + esc(r.name) +
        '<span class="wl-tag__pts">' + t("{n} pts").replace("{n}", r.pts) + "</span>" +
        "</div>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen wl-reveal">' +
      '  <h2 class="result-title pop wl-reveal-title">🎯 ' + t("On the wavelength") + "</h2>" +
      clueBanner() +
      '  <div class="wl-result">' +
      '    <span class="wl-rpole wl-rpole--top">' + esc(spectrum.left) + "</span>" +
      '    <div class="wl-rdial" id="wl-rdial">' +
      '      <div class="wl-rtrack">' + revealZones() + "</div>" +
            marks +
      "    </div>" +
      '    <span class="wl-rpole wl-rpole--bot">' + esc(spectrum.right) + "</span>" +
      "  </div>" +
      '  <div class="stack wl-reveal-actions" id="wl-actions">' +
      '    <p class="result-sub">👑 <strong>' + esc(winner.name) + "</strong> " + t("landed closest!") + "</p>" +
      '    <button id="wl-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>" +
      '    <button id="wl-settings" class="btn btn-block">' + t("Change pool") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#wl-next").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#wl-settings").addEventListener("click", renderSetup);

    var dial = els.querySelector("#wl-rdial");
    var actions = els.querySelector("#wl-actions");

    // Place the name tags so they never overlap (nudged apart, linked back to
    // their true line by a leader). Run after a frame so sizes are measurable.
    global.requestAnimationFrame(function () {
      if (els && dial) layoutReveal(dial, results);
    });

    function revealGroup(i) {
      if (!dial) return;
      dial.querySelectorAll('[data-i="' + i + '"]').forEach(function (n) { n.classList.add("is-in"); });
    }
    function finish() { if (actions) actions.classList.add("is-in"); }

    // Drip the lines in one at a time, furthest off first, closest last.
    var k = 0;
    function step() {
      if (!els) return;
      if (k < order.length) {
        revealGroup(order[k]._i);
        k++;
        timer = setTimeout(step, 750);
      } else { finish(); timer = null; }
    }
    // Tap the dial to skip the drip and show everything at once.
    if (dial) dial.addEventListener("click", function () {
      clearTimer();
      order.forEach(function (r) { revealGroup(r._i); });
      finish();
    });
    timer = setTimeout(step, 450);
  }

  // Nudge name tags apart vertically and draw a leader from each line to its
  // (possibly displaced) tag, so clustered guesses stay readable.
  function layoutReveal(dial, results) {
    var track = dial.querySelector(".wl-rtrack");
    if (!track) return;
    var dr = dial.getBoundingClientRect();
    var tr = track.getBoundingClientRect();
    var top0 = tr.top - dr.top;
    var trackRight = tr.right - dr.left;
    var tagLeft = trackRight + 14;
    var H = tr.height;
    var GAP = 34;

    var items = results.map(function (r) {
      return { i: r._i, exact: top0 + (r.value / 100) * H, center: 0 };
    });
    // Greedy top-down spacing so no two tags are closer than GAP.
    items.sort(function (a, b) { return a.exact - b.exact; });
    var prev = -1e9;
    items.forEach(function (a) { a.center = Math.max(a.exact, prev + GAP); prev = a.center; });
    // If the stack ran past the bottom, slide the whole thing up to fit.
    var overflow = prev - (top0 + H);
    if (overflow > 0) items.forEach(function (a) { a.center -= overflow; });

    items.forEach(function (a) {
      var tag = dial.querySelector('.wl-tag[data-i="' + a.i + '"]');
      var lead = dial.querySelector('.wl-lead[data-i="' + a.i + '"]');
      if (!tag || !lead) return;
      tag.style.left = tagLeft + "px";
      tag.style.top = (a.center - tag.offsetHeight / 2) + "px";
      var dx = tagLeft - trackRight;
      var dy = a.center - a.exact;
      lead.style.left = trackRight + "px";
      lead.style.top = a.exact + "px";
      lead.style.width = Math.sqrt(dx * dx + dy * dy) + "px";
      lead.style.transform = "rotate(" + (Math.atan2(dy, dx) * 180 / Math.PI) + "deg)";
    });
  }

  // --- View helpers --------------------------------------------------------
  // The whole spectrum: the two end-labels bracket the dial so they read as the
  // poles of the axis — stacked above/below the vertical track on mobile, left/
  // right of the horizontal track on desktop (layout is pure CSS). When
  // `opts.slider` is set the guess slider is dropped in alongside the track.
  function spectrumView(s, opts) {
    opts = opts || {};
    var slider = opts.slider
      ? '<input id="wl-slider" class="wl-slider" type="range" min="0" max="100" value="' + guess + '" />'
      : "";
    return (
      '<div class="wl-spectrum">' +
      '  <span class="wl-pole wl-pole--left">' + esc(s.left) + "</span>" +
      '  <div class="wl-dial">' + track(opts) + slider + "</div>" +
      '  <span class="wl-pole wl-pole--right">' + esc(s.right) + "</span>" +
      "</div>"
    );
  }

  // The clue-giver's written hint, shown to everyone during the guess + reveal.
  function clueBanner() {
    if (!clue) return "";
    var label = giver
      ? t("{name}'s clue").replace("{name}", esc(giver))
      : t("The clue");
    return (
      '<div class="wl-clue">' +
      '  <span class="wl-clue__label">' + label + "</span>" +
      '  <span class="wl-clue__text">" ' + esc(clue) + ' "</span>' +
      "</div>"
    );
  }

  // The target rings + centre line for the vertical reveal dial. Dedicated
  // classes (wl-rzone/wl-rcenter) so the responsive .wl-zone rules don't flip
  // these to horizontal on desktop — the reveal is always vertical.
  function revealZones() {
    var parts = [];
    for (var i = ZONES.length - 1; i >= 0; i--) {
      var z = ZONES[i];
      parts.push(
        '<div class="wl-rzone wl-rzone--' + z.cls + '" style="--start:' +
        (target - z.half) + "%;--size:" + (2 * z.half) + '%"></div>'
      );
    }
    parts.push('<div class="wl-rcenter" style="--pos:' + target + '%"></div>');
    return parts.join("");
  }

  function zoneFor(d) {
    for (var i = 0; i < ZONES.length; i++) {
      if (d <= ZONES[i].half) return ZONES[i];
    }
    return null;
  }

  function track(opts) {
    var parts = ['<div class="wl-track">'];
    if (opts.showTarget) {
      // Render widest zone first so the narrower, higher-scoring rings layer on
      // top of it — giving the nested "target" look.
      for (var i = ZONES.length - 1; i >= 0; i--) {
        var z = ZONES[i];
        parts.push(
          '<div class="wl-zone wl-zone--' + z.cls + '" style="--start:' +
          (target - z.half) + "%;--size:" + (2 * z.half) + '%"></div>'
        );
      }
      parts.push('<div class="wl-center" style="--pos:' + target + '%"></div>');
    }
    if (opts.showGuess) {
      parts.push('<div id="wl-guess-marker" class="wl-marker" style="--pos:' + guess + '%"></div>');
    }
    parts.push("</div>");
    return parts.join("");
  }

  // --- Spectrum picking ----------------------------------------------------
  function pickSpectrum() {
    var list = Pools().gather(settings.pools, pools(), "pairs");
    if (!list.length) return { left: "Cold", right: "Hot" };
    return list[Math.floor(Math.random() * list.length)];
  }

  // --- Utils ---------------------------------------------------------------
  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;
  var shuffle = global.Spielecke.shuffle;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.wavelength = module;
})(window);

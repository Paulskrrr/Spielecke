/*
 * games/geheimauftrag.js — Geheimauftrag (secret missions, all evening)
 *
 * Deal each player a secret, PERSON-BOUND mission (a {target} is a specific other
 * player). Then play whatever else you like — the missions live in the store and
 * survive navigating away (store persists; only DOM is torn down). Re-open the tile
 * to view your mission privately, cash one in, or call someone out. Some missions
 * are CO-OP: two players share one target — either told who their partner is, or
 * left to find each other.
 *
 * Content: js/content/geheimauftrag.js (Spielecke.Geheimauftrag) — { solo, coop }
 * with {target}/{partner} tokens. Contract: meta + mount + unmount().
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var shuffle = global.Spielecke.shuffle;

  var MIN = 4;
  var els = null, ctx = null;

  var module = {
    meta: {
      id: "geheimauftrag",
      name: "Geheimauftrag",
      tagline: "A secret mission, all night long. Pull it off before you're caught.",
      icon: "🕶️",
      minPlayers: MIN,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      var recs = load();
      if (recs && recs.length) renderHub();
      else renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null;
    },
  };

  function content() { return global.Spielecke.L(global.Spielecke.Geheimauftrag) || { solo: [], coop: [] }; }
  function roster() { return (ctx.players || []).filter(function (p) { return p && p.name; }); }
  function load() { return ctx.store.get("assignments", []); }
  function save(recs) { ctx.store.set("assignments", recs); }
  function pick(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ""; }
  function resolve(tmpl, target, partner) {
    return String(tmpl).replace(/\{target\}/g, target).replace(/\{partner\}/g, partner || t("your partner"));
  }
  function randomOther(r, excludeIds) {
    var pool = r.filter(function (p) { return excludeIds.indexOf(p.id) === -1; });
    if (!pool.length) pool = r;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function newSolo(rec, r) {
    var target = randomOther(r, [rec.id]);
    rec.text = resolve(pick(content().solo), target.name, "");
    rec.coop = false; rec.known = false; rec.partnerName = null; rec.partnerId = null; rec.groupId = null;
    return rec;
  }

  // --- Setup / deal --------------------------------------------------------
  function renderSetup() {
    var r = roster();
    var enough = r.length >= MIN;
    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🕶️ ' + t("Geheimauftrag") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      (enough ? "" : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN) + "</div>") +
      '  <p class="muted small">' + t("Everyone gets a secret task tied to one specific person. Keep playing other games — sneak yours in. Come back here to peek, cash in, or accuse.") + "</p>" +
      '  <button id="ga-deal" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Deal secret missions 🕶️") + "</button>" +
      "</section>";
    if (enough) els.querySelector("#ga-deal").addEventListener("click", deal);
  }

  function deal() {
    var r = roster();
    var data = content();
    var order = shuffle(r);
    var records = [];
    var pairCount = r.length >= 8 ? 2 : r.length >= 5 ? 1 : 0;
    var gid = 1, i = 0;

    for (var c = 0; c < pairCount && i + 1 < order.length; c++) {
      var a = order[i++], b = order[i++];
      var tmpl = pick(data.coop);
      var target = randomOther(r, [a.id, b.id]);
      var known = Math.random() < 0.5;
      records.push(coopRecord(a, b, tmpl, target, known, gid));
      records.push(coopRecord(b, a, tmpl, target, known, gid));
      gid++;
    }
    for (; i < order.length; i++) {
      var p = order[i];
      var tg = randomOther(r, [p.id]);
      records.push({ id: p.id, name: p.name, text: resolve(pick(data.solo), tg.name, ""), coop: false, done: false });
    }
    save(records);
    renderHub();
  }

  function coopRecord(self, partner, tmpl, target, known, gid) {
    var partnerName = known ? partner.name : t("your secret partner");
    return {
      id: self.id, name: self.name,
      text: resolve(tmpl, target.name, partnerName),
      coop: true, known: known,
      partnerName: known ? partner.name : null, partnerId: partner.id, groupId: gid, done: false,
    };
  }

  // --- Hub -----------------------------------------------------------------
  function renderHub() {
    var recs = load();
    els.innerHTML =
      '<section class="screen ga-hub">' +
      '  <h2 class="screen-title pop">🕶️ ' + t("Geheimauftrag") + "</h2>" +
      '  <p class="muted">' + t("{n} secret missions in play.").replace("{n}", recs.length) + "</p>" +
      '  <div class="stack">' +
      '    <button id="ga-view" class="btn btn-primary btn-block btn-xl">' + t("See my mission 🔍") + "</button>" +
      '    <button id="ga-done" class="btn btn-got btn-block btn-xl">' + t("I pulled it off ✅") + "</button>" +
      '    <button id="ga-accuse" class="btn btn-skip btn-block btn-xl">' + t("Someone got caught ☝️") + "</button>" +
      '    <button id="ga-redeal" class="btn btn-block">' + t("Deal again 🔁") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#ga-view").addEventListener("click", function () { pickPlayer("view"); });
    els.querySelector("#ga-done").addEventListener("click", function () { pickPlayer("done"); });
    els.querySelector("#ga-accuse").addEventListener("click", function () { pickPlayer("accuse"); });
    els.querySelector("#ga-redeal").addEventListener("click", function () { save([]); renderSetup(); });
  }

  // --- Pick a player, then run the chosen action ---------------------------
  function pickPlayer(action) {
    var recs = load();
    var title = action === "view" ? t("Who's peeking?") : action === "done" ? t("Who pulled it off?") : t("Who got caught?");
    var buttons = recs.map(function (rec) {
      return '<button class="btn btn-block ga-pick" data-id="' + attr(rec.id) + '">' + esc(rec.name) + "</button>";
    }).join("");
    els.innerHTML =
      '<section class="screen ga-pick-screen">' +
      '  <h2 class="screen-title pop">' + title + "</h2>" +
      '  <div class="stack">' + buttons + "</div>" +
      '  <button id="ga-back" class="btn btn-ghost btn-block">' + t("← Back") + "</button>" +
      "</section>";
    els.querySelectorAll(".ga-pick").forEach(function (b) {
      b.addEventListener("click", function () {
        var rec = byId(load(), b.getAttribute("data-id"));
        if (!rec) return renderHub();
        if (action === "view") renderReveal(rec);
        else if (action === "done") completeMission(rec);
        else accuse(rec);
      });
    });
    els.querySelector("#ga-back").addEventListener("click", renderHub);
  }

  function byId(recs, id) { return recs.filter(function (r) { return r.id === id; })[0]; }

  // Private reveal (pass-around: only that player looks).
  function renderReveal(rec) {
    var coopBanner = rec.coop
      ? (rec.known
        ? '<div class="ga-coop">🤝 ' + t("Co-op with {name}.").replace("{name}", esc(rec.partnerName)) + "</div>"
        : '<div class="ga-coop">🤝 ' + t("Someone at the table shares this exact mission — find them.") + "</div>")
      : "";
    els.innerHTML =
      '<section class="screen ga-reveal">' +
      '  <p class="muted">' + t("For {name}'s eyes only").replace("{name}", esc(rec.name)) + "</p>" +
      '  <div class="ga-mission">' + esc(rec.text) + "</div>" +
      coopBanner +
      '  <button id="ga-hide" class="btn btn-primary btn-block btn-xl">' + t("Hide 🙈") + "</button>" +
      "</section>";
    els.querySelector("#ga-hide").addEventListener("click", renderHub);
  }

  // Cash in: mark done, give a fresh mission; co-op completes both partners.
  function completeMission(rec) {
    var recs = load(), r = roster();
    var affected = [rec.name];
    newSolo(rec, r);
    if (rec.coop && rec.groupId) {
      var partner = recs.filter(function (x) { return x.groupId === rec.groupId && x.id !== rec.id; })[0];
      if (partner) { affected.push(partner.name); newSolo(partner, r); }
    }
    save(recs);
    renderOutcome("✅ " + t("Mission complete!"),
      t("{names} hand out 2 sips — and draw a fresh mission.").replace("{names}", esc(affected.join(" & "))));
  }

  // Caught: they drink; co-op burns the partner too; both draw fresh missions.
  function accuse(rec) {
    els.innerHTML =
      '<section class="screen ga-accuse-screen">' +
      '  <h2 class="screen-title pop">☝️ ' + esc(rec.name) + "?</h2>" +
      '  <p class="muted">' + t("Was {name} really caught in the act?").replace("{name}", esc(rec.name)) + "</p>" +
      '  <div class="stack">' +
      '    <button id="ga-caught" class="btn btn-skip btn-block btn-xl">' + t("Caught! They drink 🍺") + "</button>" +
      '    <button id="ga-false" class="btn btn-block btn-xl">' + t("False alarm — accuser drinks") + "</button>" +
      '    <button id="ga-back2" class="btn btn-ghost btn-block">' + t("← Back") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#ga-caught").addEventListener("click", function () {
      var recs = load(), r = roster();
      var live = byId(recs, rec.id) || rec;
      var affected = [live.name];
      newSolo(live, r);
      if (live.coop && live.groupId) {
        var partner = recs.filter(function (x) { return x.groupId === live.groupId && x.id !== live.id; })[0];
        if (partner) { affected.push(partner.name); newSolo(partner, r); }
      }
      save(recs);
      renderOutcome("🍺 " + t("Busted!"),
        (affected.length > 1
          ? t("{names} are burned — both drink and draw fresh missions.")
          : t("{names} drinks and draws a fresh mission.")).replace("{names}", esc(affected.join(" & "))));
    });
    els.querySelector("#ga-false").addEventListener("click", function () {
      renderOutcome("❌ " + t("False alarm"), t("The accuser drinks. Missions stay secret."));
    });
    els.querySelector("#ga-back2").addEventListener("click", renderHub);
  }

  function renderOutcome(title, line) {
    els.innerHTML =
      '<section class="screen ga-outcome">' +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      '  <p class="result-sub">' + line + "</p>" +
      '  <button id="ga-ok" class="btn btn-primary btn-block btn-xl">' + t("Back to missions 🕶️") + "</button>" +
      "</section>";
    els.querySelector("#ga-ok").addEventListener("click", renderHub);
  }

  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.geheimauftrag = module;
})(window);

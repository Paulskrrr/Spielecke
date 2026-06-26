/*
 * roster.js — Players / Roster screen (spec §1.1)
 *
 * The single most important shared piece: enter players once, every game reuses
 * them. Supports add / remove / reorder (up-down buttons — the most reliable
 * touch-friendly reorder), persists on every change. It never nags about player
 * count — short-handed play is a deliberate choice; games guard their own floor.
 *
 * Language toggle lives here (DE / EN), stored globally via Spielecke.setLang.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  function render(container, ctx) {
    var players = ctx.getRoster();
    var lang = global.Spielecke.getLang();

    container.innerHTML =
      '<section class="screen roster-screen">' +
      '  <h2 class="screen-title neon">' + t("Players") + "</h2>" +
      '  <p class="muted">' + t("Entered once, used by every game.") + "</p>" +
      '  <form id="roster-add" class="roster-add" autocomplete="off">' +
      '    <input id="roster-input" class="text-input" type="text" ' +
      '           inputmode="text" placeholder="' + t("Add a player…") + '" ' +
      '           maxlength="24" aria-label="' + t("Add a player…") + '" />' +
      '    <button type="submit" class="btn btn-primary">' + t("Add") + "</button>" +
      "  </form>" +
      '  <div id="roster-warn" class="roster-warn"></div>' +
      '  <ul id="roster-list" class="roster-list"></ul>' +
      '  <button id="roster-done" class="btn btn-block">' + t("Done") + "</button>" +
      '  <div class="roster-lang">' +
      '    <h3 class="sub">' + t("Language") + "</h3>" +
      '    <div class="chip-row" id="lang-chips">' +
      '      <button class="chip' + (lang === "de" ? " chip--active" : "") + '" data-lang="de">🇩🇪 Deutsch</button>' +
      '      <button class="chip' + (lang === "en" ? " chip--active" : "") + '" data-lang="en">🇬🇧 English</button>' +
      "    </div>" +
      "  </div>" +
      "</section>";

    var listEl = container.querySelector("#roster-list");
    var warnEl = container.querySelector("#roster-warn");
    var inputEl = container.querySelector("#roster-input");

    function persist() {
      ctx.setRoster(players);
    }

    function renderList() {
      if (!players.length) {
        listEl.innerHTML = '<li class="roster-empty muted">' + t("No players yet.") + "</li>";
      } else {
        listEl.innerHTML = players
          .map(function (p, i) {
            return (
              '<li class="roster-item" data-i="' + i + '">' +
              '  <span class="roster-item__name">' + escapeHtml(p.name) + "</span>" +
              '  <span class="roster-item__actions">' +
              '    <button class="icon-btn" data-act="up" ' +
              (i === 0 ? "disabled " : "") + 'aria-label="' + t("Move up") + '">↑</button>' +
              '    <button class="icon-btn" data-act="down" ' +
              (i === players.length - 1 ? "disabled " : "") +
              'aria-label="' + t("Move down") + '">↓</button>' +
              '    <button class="icon-btn icon-btn--danger" data-act="del" ' +
              'aria-label="' + t("Remove") + '">✕</button>' +
              "  </span>" +
              "</li>"
            );
          })
          .join("");
      }

      // No player-count nagging — you can deliberately play short-handed; the
      // app shouldn't second-guess that. Games still guard their own hard floor.
      warnEl.textContent = "";
      warnEl.style.display = "none";
      ctx.refreshHeader();
    }

    function addPlayer(name) {
      var trimmed = (name || "").trim();
      if (!trimmed) return;
      players.push({ id: makeId(), name: trimmed });
      persist();
      renderList();
    }

    container.querySelector("#roster-add").addEventListener("submit", function (e) {
      e.preventDefault();
      addPlayer(inputEl.value);
      inputEl.value = "";
      inputEl.focus();
    });

    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var li = e.target.closest(".roster-item");
      var i = parseInt(li.getAttribute("data-i"), 10);
      var act = btn.getAttribute("data-act");

      if (act === "del") {
        players.splice(i, 1);
      } else if (act === "up" && i > 0) {
        swap(players, i, i - 1);
      } else if (act === "down" && i < players.length - 1) {
        swap(players, i, i + 1);
      }
      persist();
      renderList();
    });

    container.querySelector("#roster-done").addEventListener("click", function () {
      ctx.goHome();
    });

    container.querySelectorAll("#lang-chips .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        global.Spielecke.setLang(c.getAttribute("data-lang"));
        render(container, ctx); // re-render roster in new language
      });
    });

    renderList();
  }

  function swap(arr, a, b) {
    var t = arr[a];
    arr[a] = arr[b];
    arr[b] = t;
  }

  function makeId() {
    return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  var escapeHtml = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Roster = { render: render };
})(window);

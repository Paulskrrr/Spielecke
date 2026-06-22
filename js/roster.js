/*
 * roster.js — Players / Roster screen (spec §1.1)
 *
 * The single most important shared piece: enter players once, every game reuses
 * them. Supports add / remove / reorder (up-down buttons — the most reliable
 * touch-friendly reorder), persists on every change, and softly warns (does not
 * block) when there are too few players.
 */
(function (global) {
  "use strict";

  var SOFT_MIN = 3; // warn below this; never block

  function render(container, ctx) {
    var players = ctx.getRoster();

    container.innerHTML =
      '<section class="screen roster-screen">' +
      '  <h2 class="screen-title neon">Players</h2>' +
      '  <p class="muted">Entered once, used by every game.</p>' +
      '  <form id="roster-add" class="roster-add" autocomplete="off">' +
      '    <input id="roster-input" class="text-input" type="text" ' +
      '           inputmode="text" placeholder="Add a player…" ' +
      '           maxlength="24" aria-label="New player name" />' +
      '    <button type="submit" class="btn btn-primary">Add</button>' +
      "  </form>" +
      '  <div id="roster-warn" class="roster-warn"></div>' +
      '  <ul id="roster-list" class="roster-list"></ul>' +
      '  <button id="roster-done" class="btn btn-block">Done</button>' +
      "</section>";

    var listEl = container.querySelector("#roster-list");
    var warnEl = container.querySelector("#roster-warn");
    var inputEl = container.querySelector("#roster-input");

    function persist() {
      ctx.setRoster(players);
    }

    function renderList() {
      if (!players.length) {
        listEl.innerHTML = '<li class="roster-empty muted">No players yet.</li>';
      } else {
        listEl.innerHTML = players
          .map(function (p, i) {
            return (
              '<li class="roster-item" data-i="' + i + '">' +
              '  <span class="roster-item__name">' + escapeHtml(p.name) + "</span>" +
              '  <span class="roster-item__actions">' +
              '    <button class="icon-btn" data-act="up" ' +
              (i === 0 ? "disabled " : "") + 'aria-label="Move up">↑</button>' +
              '    <button class="icon-btn" data-act="down" ' +
              (i === players.length - 1 ? "disabled " : "") +
              'aria-label="Move down">↓</button>' +
              '    <button class="icon-btn icon-btn--danger" data-act="del" ' +
              'aria-label="Remove">✕</button>' +
              "  </span>" +
              "</li>"
            );
          })
          .join("");
      }

      if (players.length && players.length < SOFT_MIN) {
        warnEl.textContent =
          "⚠ Most games are better with " + SOFT_MIN + "+ players.";
        warnEl.style.display = "block";
      } else {
        warnEl.textContent = "";
        warnEl.style.display = "none";
      }
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Roster = { render: render };
})(window);

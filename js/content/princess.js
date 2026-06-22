/*
 * content/princess.js — content for Princess Treatment (NSFW-ish, adults)
 *
 * EDIT ME. Pure content. Each round shows a thing a partner does; the table
 * debates: is it Princess Treatment 👑 (going above and beyond) or just the
 * Bare Minimum 😐? The target alternates every round between Princess (aimed at
 * the women) and King (aimed at the men), so prompts are split by gender and
 * grouped by category.
 *
 * Structure: category -> { princess: [...], king: [...] }.
 *   - `princess` entries describe what's done FOR a woman.
 *   - `king` entries describe what's done FOR a man.
 */
(function (global) {
  "use strict";

  var PRINCESS = {
    romance: {
      label: "💘 Romance",
      princess: [
        "He plans the whole date and pays",
        "He sends good-morning texts every day",
        "He remembers your half-birthday",
        "He writes you a handwritten note",
        "He gives you his jacket when you're cold",
      ],
      king: [
        "She plans a surprise date night",
        "She compliments him in front of his friends",
        "She remembers his best mate's name",
        "She makes him a playlist",
        "She says yes to watching the game",
      ],
    },
    dailyLife: {
      label: "🏠 Daily Life",
      princess: [
        "He warms up the car for you",
        "He texts back within an hour",
        "He does the dishes without being asked",
        "He carries the heavy bags",
        "He lets you pick the restaurant",
      ],
      king: [
        "She cooks dinner on a weeknight",
        "She lets him have a guys' night, no questions",
        "She fills up his car with petrol",
        "She brings him a coffee in bed",
        "She doesn't text 20 times when he's out",
      ],
    },
    nsfw: {
      label: "🔞 Spicy",
      princess: [
        "He always makes sure you finish first",
        "[Paul fills in: princess, spicy]",
        "[Princess spicy #2]",
      ],
      king: [
        "She sends him a cheeky pic during the day",
        "[Paul fills in: king, spicy]",
        "[King spicy #2]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Princess = PRINCESS;
})(window);

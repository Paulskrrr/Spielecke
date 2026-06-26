/*
 * content/princess.js — content for Princess Treatment (NSFW-ish, adults)
 *
 * EDIT ME. Pure content. Each round shows a thing a partner does; the table
 * debates: is it Princess Treatment 👑 (going above and beyond) or just the
 * Bare Minimum 😐? The target alternates every round between Princess (aimed at
 * the women) and King (aimed at the men), so prompts are split by gender and
 * grouped by category.
 *
 * Bilingual: Spielecke.Princess = { de:{...}, en:{...} }. Both languages share
 * the SAME category keys and the same princess/king field names; the game reads
 * the current language's subtree via Spielecke.L(...).
 *
 * Structure: category -> { label, princess: [...], king: [...] }.
 *   - `princess` entries describe what's done FOR a woman.
 *   - `king` entries describe what's done FOR a man.
 */
(function (global) {
  "use strict";

  var PRINCESS = {
    de: {
      romance: {
        label: "💘 Romantik",
        princess: [
          "Er plant das ganze Date und zahlt",
          "Er schickt dir jeden Morgen eine Guten-Morgen-Nachricht",
          "Er merkt sich deinen halben Geburtstag",
          "Er schreibt dir einen handgeschriebenen Zettel",
          "Er gibt dir seine Jacke, wenn dir kalt ist",
        ],
        king: [
          "Sie plant ein Überraschungs-Date am Abend",
          "Sie macht ihm vor seinen Freunden Komplimente",
          "Sie merkt sich den Namen seines besten Kumpels",
          "Sie stellt ihm eine Playlist zusammen",
          "Sie sagt Ja zum gemeinsamen Spiele-Schauen",
        ],
      },
      dailyLife: {
        label: "🏠 Alltag",
        princess: [
          "Er heizt dir das Auto vor",
          "Er schreibt innerhalb einer Stunde zurück",
          "Er spült ab, ohne dass du fragen musst",
          "Er trägt die schweren Tüten",
          "Er lässt dich das Restaurant aussuchen",
        ],
        king: [
          "Sie kocht unter der Woche Abendessen",
          "Sie lässt ihn einen Männerabend machen, ohne Fragen",
          "Sie tankt ihm das Auto voll",
          "Sie bringt ihm Kaffee ans Bett",
          "Sie schreibt nicht 20 Mal, wenn er unterwegs ist",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        princess: [
          "Er sorgt immer dafür, dass du zuerst kommst",
          "Er schickt mitten im Arbeitstag eine versaute Nachricht",
          "Er weckt dich mit Morgensex",
          "Er lässt dir ein Bad ein und steigt mit rein",
          "Er geht gern runter, ohne etwas zurückzuerwarten",
        ],
        king: [
          "Sie schickt ihm tagsüber ein freches Foto",
          "Sie ergreift mehr als die Hälfte der Zeit die Initiative",
          "Sie überrascht ihn mit einem Striptease",
          "Sie lässt ihn im Bett alles aussuchen",
          "Sie schreibt ihm zuerst was Versautes, während er unterwegs ist",
        ],
      },
    },
    en: {
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
        label: "🔞 18+",
        princess: [
          "He always makes sure you finish first",
          "He sends a filthy text in the middle of your work day",
          "He wakes you up with morning sex",
          "He runs you a bath and gets in too",
          "He's happy to go down with nothing in return",
        ],
        king: [
          "She sends him a cheeky pic during the day",
          "She initiates more than half the time",
          "She surprises him with a striptease",
          "She lets him pick anything in the bedroom",
          "She sexts him first while he's out",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Princess = PRINCESS;
})(window);

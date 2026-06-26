/*
 * content/nhie.js — content for Never Have I Ever (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each entry completes "Never have I ever ___" — write
 * just the predicate (lowercase verb phrase), the game adds the prefix. Keep
 * them confession-worthy. The 🔞 pool is where it bites.
 */
(function (global) {
  "use strict";

  var NHIE = {
    de: {
      general: {
        label: "🎲 Allgemein",
        prompts: [
          "auf einer Party eingeschlafen",
          "jemanden geghostet",
          "über mein Alter gelogen",
          "mir einen Knochen gebrochen",
          "nüchtern Karaoke gesungen",
          "im Kino bei einem Film geweint",
        ],
      },
      party: {
        label: "🎉 Party",
        prompts: [
          "vom Trinken gekotzt",
          "einen Filmriss gehabt und eine Nacht vergessen",
          "betrunken einer/einem Ex geschrieben",
          "auf einer Partynacht mein Handy verloren",
          "einen Walk of Shame hingelegt",
          "aus einer Bar geflogen",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        prompts: [
          "einen One-Night-Stand gehabt",
          "ein Nacktfoto verschickt",
          "mit jemandem in diesem Raum was gehabt",
          "es vorgetäuscht",
          "es dem Mile-High-Club gleichgetan",
          "einen Dreier gehabt",
          "mit einer Kollegin/einem Kollegen was gehabt",
          "heute Porno geschaut",
          "an einem öffentlichen Ort Sex gehabt",
          "Handschellen im Bett benutzt",
          "ein Nacktfoto an die falsche Person geschickt",
          "eine Freundschaft Plus gehabt",
          "in flagranti erwischt worden",
          "einen One-Night-Stand gehabt, von dem ich nie jemandem erzählt habe",
          "für einen Lapdance bezahlt",
          "jemanden vom gleichen Geschlecht geküsst",
          "schon beim ersten Date was gehabt",
          "irgendwo in diesem Gebäude Sex gehabt",
        ],
      },
    },
    en: {
      general: {
        label: "🎲 General",
        prompts: [
          "fallen asleep at a party",
          "ghosted someone",
          "lied about my age",
          "broken a bone",
          "sung karaoke sober",
          "cried at a film in the cinema",
        ],
      },
      party: {
        label: "🎉 Party",
        prompts: [
          "thrown up from drinking",
          "blacked out and forgotten a night",
          "texted an ex while drunk",
          "lost my phone on a night out",
          "done a walk of shame",
          "been kicked out of a bar",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        prompts: [
          "had a one-night stand",
          "sent a nude",
          "hooked up with someone in this room",
          "faked it",
          "joined the mile-high club",
          "had a threesome",
          "hooked up with a coworker",
          "watched porn today",
          "had sex in a public place",
          "used handcuffs in bed",
          "sent a nude to the wrong person",
          "had a friend with benefits",
          "been caught in the act",
          "had a one-night stand I never told anyone about",
          "paid for a lap dance",
          "kissed someone of the same sex",
          "hooked up on a first date",
          "had sex somewhere in this building",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.NHIE = NHIE;
})(window);

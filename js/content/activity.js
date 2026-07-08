// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/activity.js — content for Activity (NSFW, adults only)
 *
 * EDIT ME. Pure content. Bilingual: the export is a { de, en } bundle and the
 * game reads the current language's subtree via Spielecke.L(...). Words are
 * grouped by POINT VALUE (difficulty), not by type — the field you land on
 * decides HOW you perform it (explain / draw / act), the points decide how hard
 * the word is and how far you move.
 *   2 = easy, 3 = medium, 4 = hard.
 * Pick words that can be drawn, explained AND mimed. Spice them up.
 *
 * Keep the DE and EN tier keys (2/3/4) and field names (label/words) in sync.
 */
(function (global) {
  "use strict";

  var ACTIVITY = {
    de: {
      2: {
        label: "Leicht",
        words: [
          "Bier", "Hund", "Pizza", "Selfie", "Kuss", "Klo", "Kondom", "Handy",
          "Dusche", "Zahnbürste", "Gitarre", "Regenschirm", "Pinguin", "Roboter",
          "Skateboard", "Einhorn", "Burger", "Sonnenbrille", "Achterbahn", "Vampir",
          "Beer Pong", "Shisha", "Jägermeister", "Flunkyball", "Dartscheibe",
          "Katerfrühstück",
        ],
      },
      3: {
        label: "Mittel",
        words: [
          "Kater", "Tinder-Date", "Walk of Shame", "Nacktbaden",
          "Netflix and Chill", "Fresskoma", "Poledance", "One-Night-Stand",
          "Sonnenbrand", "Vorstellungsgespräch", "Erstes Date", "Karaoke",
          "Stau", "Influencer", "Festival", "Bungee-Jumping",
          "Zombie", "Astronaut", "Ghosting", "Roadtrip",
          "Vorglühen", "Blackout", "Spring Break", "Bierdusche",
          "Flitterwochen", "Absturz",
        ],
      },
      4: {
        label: "Schwer",
        words: [
          "Sinnkrise", "Mile-High-Club", "Freundschaft Plus",
          "Midlife-Crisis", "Stockholm-Syndrom", "Hochstapler-Syndrom",
          "Kamasutra", "Dirty Talk", "Rollenspiel", "Safeword",
          "Quarterlife-Crisis", "Fernbeziehung", "Schwarzes Loch",
          "Künstliche Intelligenz", "Verschwörungstheorie", "Inflation",
          "Burnout", "Déjà-vu", "Schadenfreude", "FOMO",
          "Helikopter-Eltern", "Mansplaining",
          "Keuschheitsgürtel", "Liebesschaukel", "Zwangsjacke",
          "Dudelsack", "Lügendetektor", "Wünschelrute",
        ],
      },
    },
    en: {
      2: {
        label: "Easy",
        words: [
          "Beer", "Dog", "Pizza", "Selfie", "Kiss", "Toilet", "Condom", "Phone",
          "Shower", "Toothbrush", "Guitar", "Umbrella", "Penguin", "Robot",
          "Skateboard", "Unicorn", "Burger", "Sunglasses", "Roller coaster", "Vampire",
          "Beer pong", "Hookah", "Jägermeister", "Flunkyball", "Dartboard",
          "Hangover breakfast",
        ],
      },
      3: {
        label: "Medium",
        words: [
          "Hangover", "Tinder date", "Walk of shame", "Skinny dipping",
          "Netflix and chill", "Food coma", "Pole dancing", "One-night stand",
          "Sunburn", "Job interview", "First date", "Karaoke",
          "Traffic jam", "Influencer", "Festival", "Bungee jumping",
          "Zombie", "Astronaut", "Ghosting", "Road trip",
          "Pre-gaming", "Blackout", "Spring break", "Beer shower",
          "Honeymoon", "Bender",
        ],
      },
      4: {
        label: "Hard",
        words: [
          "Existential crisis", "Mile-high club", "Friends with benefits",
          "Midlife crisis", "Stockholm syndrome", "Imposter syndrome",
          "Kama Sutra", "Dirty talk", "Roleplay", "Safe word",
          "Quarter-life crisis", "Long-distance relationship", "Black hole",
          "Artificial intelligence", "Conspiracy theory", "Inflation",
          "Burnout", "Déjà vu", "Schadenfreude", "FOMO",
          "Helicopter parents", "Mansplaining",
          "Chastity belt", "Sex swing", "Straitjacket",
          "Bagpipes", "Lie detector", "Divining rod",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ActivityWords = ACTIVITY;
})(window);

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
          "Lagerfeuer", "Zelt", "Kaugummi", "Flamingo", "Discokugel",
          "Cocktail", "Luftballon", "Karneval", "Grillwurst", "Faultier",
          "Pinata", "Yoga", "Kaktus", "Schneemann", "Trampolin",
          "Wasserpistole", "Konfetti", "Papagei", "Toaster", "Boxsack",
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
          "Wegbier", "Silvesterparty", "Betriebsfeier", "Fremdschämen",
          "Schwarzfahren", "Sommerloch", "Hangxiety", "Kettenraucher",
          "Umzugsstress", "Fernweh", "Lebenslauf-Lücke", "Streaming-Marathon",
          "Selbstfindung", "Alkoholverbot", "Fun Fact", "Hochzeitsrede",
          "Beziehungspause", "Spontanreise", "Feierabendbier", "Kopfkino",
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
          "Generationenkonflikt", "Existenzangst", "Vorurteil", "Ghostwriter",
          "Kryptowährung", "Gaslighting", "Vetternwirtschaft", "Sabbatical",
          "Nahtoderfahrung", "Zeitzone", "Prokrastination", "Schwerelosigkeit",
          "Bindungsangst", "Verschwörung", "Nostalgie", "Selbstsabotage",
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
          "Campfire", "Tent", "Chewing gum", "Flamingo", "Disco ball",
          "Cocktail", "Balloon", "Carnival", "Bratwurst", "Sloth",
          "Piñata", "Yoga", "Cactus", "Snowman", "Trampoline",
          "Water gun", "Confetti", "Parrot", "Toaster", "Punching bag",
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
          "Parting drink", "New Year's party", "Office party", "Secondhand embarrassment",
          "Fare dodging", "Summer slump", "Hangxiety", "Chain smoker",
          "Moving stress", "Wanderlust", "Resume gap", "Streaming binge",
          "Self-discovery", "Dry January", "Fun fact", "Wedding speech",
          "Relationship break", "Spontaneous trip", "After-work drink", "Overthinking",
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
          "Generation gap", "Existential dread", "Prejudice", "Ghostwriter",
          "Cryptocurrency", "Gaslighting", "Nepotism", "Sabbatical",
          "Near-death experience", "Time zone", "Procrastination", "Zero gravity",
          "Fear of commitment", "Conspiracy", "Nostalgia", "Self-sabotage",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ActivityWords = ACTIVITY;
})(window);

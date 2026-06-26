/*
 * content/bomb-prompts.js — content for The Bomb (spec §2.3)
 *
 * EDIT ME. Pure content, no game logic. These are CATEGORY PROMPTS (a different
 * shape from the shared single-term database in terms.js) — each is a topic the
 * table riffs on out loud ("name a footballer who's played for Barça"). Keep
 * them snappy.
 *
 * Pools let theme stay editable and become language-switchable later. Add a key
 * and it shows up as a selectable chip automatically. `label` is what players
 * see; the key is the internal id.
 */
(function (global) {
  "use strict";

  var BOMB_CATEGORIES = {
    de: {
      football: {
        label: "⚽ Fußball",
        prompts: [
          "Fußballer, die für Barça gespielt haben",
          "Länder, die Weltmeister wurden",
          "Bundesliga-Vereine",
          "Ballon-d'Or-Gewinner",
          "Premier-League-Teams",
          "Berühmte Zehner",
          "Spieler von Real Madrid",
          "Klubs, die die Champions League gewonnen haben",
          "Deutsche Nationalspieler",
          "Vereine in der Serie A",
          "Berühmte Torhüter",
          "Trainer-Legenden",
        ],
      },
      mma: {
        label: "🥊 MMA",
        prompts: [
          "Arten, einen Kampf vorzeitig zu gewinnen",
          "UFC-Gewichtsklassen",
          "Gegner von McGregor",
          "Aufgabegriffe, bei denen du abklopfst",
          "UFC-Champions (egal welche Division)",
          "Berühmte UFC-Kämpfer",
          "Schläge oder Kicks im Stand",
          "Kampfsport-Disziplinen",
          "Spitznamen von Kämpfern",
          "Gründe, disqualifiziert zu werden",
          "Berühmte Boxer",
          "Länder mit MMA-Stars",
        ],
      },
      general: {
        label: "🎲 Allgemein",
        prompts: [
          "Pizzabeläge",
          "Sachen in diesem Raum",
          "Länder in Europa",
          "Automarken",
          "Dinge, die man auf einer Party findet",
          "Filme, die jeder gesehen hat",
          "Eissorten",
          "Dinge im Kühlschrank",
          "Berufe",
          "Ausreden, um zu spät zu kommen",
          "Dinge für eine einsame Insel",
          "Superhelden",
        ],
      },
      music: {
        label: "🎵 Musik & Rap",
        prompts: [
          "Deutsche Rapper",
          "US-Rapper",
          "Songs, die jeder mitsingen kann",
          "Musik-Genres",
          "Boybands oder Girlgroups",
          "Instrumente in einer Band",
          "Künstler mit einem Nummer-1-Hit",
          "Musikfestivals",
        ],
      },
      film: {
        label: "🎬 Film & Serien",
        prompts: [
          "Netflix-Serien",
          "Marvel-Helden",
          "Disney-Filme",
          "Filme mit mehreren Teilen",
          "Hollywood-Stars",
          "Animationsfilme",
          "Gruselfilme",
          "Serien zum Bingen",
        ],
      },
      geography: {
        label: "🌍 Geografie",
        prompts: [
          "Hauptstädte in Europa",
          "Länder in Asien",
          "Flüsse oder Meere",
          "Urlaubsinseln",
          "Wüsten oder Gebirge",
          "Länder, in denen man Deutsch spricht",
          "Millionenstädte",
          "Länder mit Königshaus",
        ],
      },
    },
    en: {
      football: {
        label: "⚽ Football",
        prompts: [
          "Footballers who've played for Barça",
          "World Cup winning nations",
          "Bundesliga clubs",
          "Ballon d'Or winners",
          "Premier League teams",
          "Famous number 10s",
          "Players who've played for Real Madrid",
          "Clubs that have won the Champions League",
          "Germany national-team players",
          "Serie A clubs",
          "Famous goalkeepers",
          "Legendary managers",
        ],
      },
      mma: {
        label: "🥊 MMA",
        prompts: [
          "Ways to win a fight by stoppage",
          "UFC weight classes",
          "McGregor opponents",
          "Submissions you can tap to",
          "UFC champions (any division)",
          "Famous UFC fighters",
          "Strikes or kicks while standing",
          "Martial-arts disciplines",
          "Fighter nicknames",
          "Reasons to get disqualified",
          "Famous boxers",
          "Countries with MMA stars",
        ],
      },
      general: {
        label: "🎲 General",
        prompts: [
          "Pizza toppings",
          "Things in this room",
          "Countries in Europe",
          "Car brands",
          "Things you find at a party",
          "Movies everyone has seen",
          "Ice cream flavours",
          "Things in the fridge",
          "Jobs and professions",
          "Excuses for being late",
          "Things to take to a desert island",
          "Superheroes",
        ],
      },
      music: {
        label: "🎵 Music & Rap",
        prompts: [
          "German rappers",
          "US rappers",
          "Songs everyone can sing along to",
          "Music genres",
          "Boy bands or girl groups",
          "Instruments in a band",
          "Artists with a number-1 hit",
          "Music festivals",
        ],
      },
      film: {
        label: "🎬 Film & TV",
        prompts: [
          "Netflix series",
          "Marvel heroes",
          "Disney films",
          "Films with sequels",
          "Hollywood stars",
          "Animated films",
          "Horror films",
          "Shows to binge",
        ],
      },
      geography: {
        label: "🌍 Geography",
        prompts: [
          "Capital cities in Europe",
          "Countries in Asia",
          "Rivers or seas",
          "Holiday islands",
          "Deserts or mountain ranges",
          "Countries where German is spoken",
          "Cities with over a million people",
          "Countries with a royal family",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.BombCategories = BOMB_CATEGORIES;
})(window);

// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/hotpotato-prompts.js — content for Hot Potato (spec §2.3)
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

  var HOT_POTATO_CATEGORIES = {
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
    es: {
      football: {
        label: "⚽ Fútbol",
        prompts: [
          "Futbolistas que han jugado en el Barça",
          "Selecciones campeonas del Mundial",
          "Equipos de LaLiga",
          "Ganadores del Balón de Oro",
          "Equipos de la Premier League",
          "Dieces míticos",
          "Jugadores que han jugado en el Real Madrid",
          "Clubes que han ganado la Champions",
          "Jugadores de la selección española",
          "Equipos de la Serie A",
          "Porteros famosos",
          "Entrenadores legendarios",
        ],
      },
      mma: {
        label: "🥊 MMA",
        prompts: [
          "Formas de ganar un combate antes del límite",
          "Categorías de peso de la UFC",
          "Rivales de McGregor",
          "Sumisiones con las que te rindes",
          "Campeones de la UFC (cualquier categoría)",
          "Luchadores famosos de la UFC",
          "Golpes o patadas de pie",
          "Disciplinas de artes marciales",
          "Apodos de luchadores",
          "Motivos de descalificación",
          "Boxeadores famosos",
          "Países con estrellas de MMA",
        ],
      },
      general: {
        label: "🎲 General",
        prompts: [
          "Ingredientes de pizza",
          "Cosas que hay en esta sala",
          "Países de Europa",
          "Marcas de coches",
          "Cosas que encuentras en una fiesta",
          "Películas que ha visto todo el mundo",
          "Sabores de helado",
          "Cosas que hay en la nevera",
          "Trabajos y profesiones",
          "Excusas para llegar tarde",
          "Cosas que llevarte a una isla desierta",
          "Superhéroes",
        ],
      },
      music: {
        label: "🎵 Música y rap",
        prompts: [
          "Raperos españoles",
          "Raperos estadounidenses",
          "Canciones que todo el mundo sabe cantar",
          "Géneros musicales",
          "Boy bands o girl bands",
          "Instrumentos de una banda",
          "Artistas con un número 1",
          "Festivales de música",
        ],
      },
      film: {
        label: "🎬 Cine y series",
        prompts: [
          "Series de Netflix",
          "Héroes de Marvel",
          "Películas de Disney",
          "Películas con secuelas",
          "Estrellas de Hollywood",
          "Películas de animación",
          "Películas de terror",
          "Series para maratonear",
        ],
      },
      geography: {
        label: "🌍 Geografía",
        prompts: [
          "Capitales de Europa",
          "Países de Asia",
          "Ríos o mares",
          "Islas para ir de vacaciones",
          "Desiertos o cordilleras",
          "Países donde se habla español",
          "Ciudades de más de un millón de habitantes",
          "Países con familia real",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.HotPotatoCategories = HOT_POTATO_CATEGORIES;
})(window);

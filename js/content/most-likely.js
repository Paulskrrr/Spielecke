/*
 * content/most-likely.js — content for Most Likely To (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each entry completes "Most likely to ___" — write just
 * the predicate, the game adds the prefix. Aim them at the group.
 *
 * Bilingual: global.Spielecke.MostLikely = { de:{...}, en:{...} }.
 * German predicates read after "Am wahrscheinlichsten…"; English after
 * "Most likely to". Same structure/keys in both languages.
 */
(function (global) {
  "use strict";

  var MOST_LIKELY = {
    de: {
      general: {
        label: "🎲 Allgemein",
        prompts: [
          "wird berühmt",
          "wird wegen etwas Dummem verhaftet",
          "heult bei einer Hochzeitsrede",
          "kommt zu spät zur eigenen Party",
          "gewinnt im Lotto und verzockt alles",
          "fängt grundlos einen Streit an",
        ],
      },
      party: {
        label: "🎉 Party",
        prompts: [
          "wird aus dem Club geworfen",
          "kotzt heute Abend als Erstes",
          "steht um 6 Uhr morgens noch",
          "verliert heute Abend das Handy",
          "fängt eine Tanz-Battle an",
          "schreibt heute Abend dem Ex",
        ],
      },
      leisure: {
        label: "🏖️ Freizeit & Urlaub",
        prompts: [
          "verpasst den Flug, weil noch ein Selfie sein musste",
          "verläuft sich in jeder fremden Stadt",
          "bucht den Urlaub eine Stunde vor Abflug",
          "packt für ein Wochenende wie für drei Wochen",
          "verbringt den ganzen Urlaub am Pool",
          "will jede Sehenswürdigkeit an einem Tag abklappern",
          "bekommt am ersten Tag den schlimmsten Sonnenbrand",
          "redet die ganze Busfahrt mit Fremden",
        ],
      },
      history: {
        label: "🏛️ Politik & Geschichte",
        prompts: [
          "führt aus Versehen eine kleine Revolution an",
          "gewinnt jedes Geschichtsquiz",
          "diskutiert auf jeder Feier über Politik",
          "würde sich am liebsten zum König krönen lassen",
          "kennt jede Jahreszahl auswendig",
          "geht später in die Politik",
          "hält eine Rede, die keiner hören will",
          "würde eine Zeitmaschine sofort missbrauchen",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        prompts: [
          "reißt heute Abend einen Fremden auf",
          "hat den wildesten Suchverlauf",
          "verschickt gerade jetzt eine heiße Nachricht",
          "hat heimlich ein OnlyFans",
          "küsst jemanden in diesem Raum",
          "hat einen geheimen Kink",
          "schläft im Urlaub mit jemandem",
          "wird beim Sex in der Öffentlichkeit erwischt",
          "hat irgendwo ein Sextape",
          "datet zwei Leute gleichzeitig",
          "schickt aus Versehen Nudes in den Gruppenchat",
          "täuscht es vor, um es hinter sich zu bringen",
          "hat hier die höchste Bodycount",
          "geht heute Abend mit jemandem nach Hause",
          "hat einen One-Night-Stand und fängt Gefühle",
        ],
      },
    },
    en: {
      general: {
        label: "🎲 General",
        prompts: [
          "become famous",
          "get arrested for something stupid",
          "cry during a wedding speech",
          "show up late to their own party",
          "win the lottery and lose it all",
          "start an argument over nothing",
        ],
      },
      party: {
        label: "🎉 Party",
        prompts: [
          "get kicked out of the club",
          "throw up first tonight",
          "still be standing at 6am",
          "lose their phone tonight",
          "start a dance-off",
          "text their ex tonight",
        ],
      },
      leisure: {
        label: "🏖️ Leisure & Travel",
        prompts: [
          "miss the flight for one more selfie",
          "get lost in every new city",
          "book the holiday an hour before takeoff",
          "pack for three weeks for a weekend trip",
          "spend the whole holiday by the pool",
          "try to see every sight in one day",
          "get the worst sunburn on day one",
          "talk to strangers the whole bus ride",
        ],
      },
      history: {
        label: "🏛️ Politics & History",
        prompts: [
          "accidentally start a small revolution",
          "win every history quiz",
          "argue about politics at every party",
          "have themselves crowned king",
          "know every date by heart",
          "go into politics one day",
          "give a speech nobody asked for",
          "instantly misuse a time machine",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        prompts: [
          "hook up with a stranger tonight",
          "have the wildest search history",
          "send a risky text right now",
          "have a secret OnlyFans",
          "kiss someone in this room",
          "have a secret kink",
          "sleep with someone on holiday",
          "get caught having sex in public",
          "have a sex tape out there",
          "date two people at once",
          "send nudes to the group chat by accident",
          "fake it to get it over with",
          "have the highest body count here",
          "go home with someone tonight",
          "have a one-night stand and catch feelings",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.MostLikely = MOST_LIKELY;
})(window);

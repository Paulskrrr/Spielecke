/*
 * content/truth.js — content for Truth or Drink (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each entry is a TRUTH question put to one player. In
 * drinking mode they can dodge it by drinking; in plain mode they just answer.
 * The 🔞 pool is where it gets spicy.
 */
(function (global) {
  "use strict";

  var TRUTH = {
    de: {
      general: {
        label: "🎲 Allgemein",
        prompts: [
          "Was ist das Peinlichste in deinem Suchverlauf?",
          "Welche Lüge erzählst du ständig?",
          "Mit wem in diesem Raum würdest du für eine Woche das Leben tauschen?",
          "Aus welchem nichtigsten Grund hast du mal eine Freundschaft beendet?",
          "Was war das schlechteste Geschenk, das du je bekommen hast?",
          "Was tust du nur so, als würdest du es mögen, hasst es aber heimlich?",
        ],
      },
      party: {
        label: "🎉 Party",
        prompts: [
          "Wie betrunken warst du jemals höchstens?",
          "Was ist das Schlimmste, das du auf einer durchzechten Nacht angestellt hast?",
          "Wem hier würdest du dein entsperrtes Handy am wenigsten anvertrauen?",
          "An welche durchzechte Nacht erinnerst du dich ehrlich gar nicht mehr?",
          "Was war deine peinlichste betrunkene Nachricht?",
          "Über wen in diesem Raum hast du hinter dem Rücken geredet?",
        ],
      },
      leisure: {
        label: "🏖️ Freizeit & Urlaub",
        prompts: [
          "Was war dein peinlichstes Urlaubserlebnis?",
          "Welches Reiseziel ist völlig überbewertet?",
          "Was hast du im Urlaub schon mal mitgehen lassen (Hotel-Handtuch zählt)?",
          "Wohin würdest du sofort auswandern?",
          "Was war dein größtes Reise-Desaster?",
          "Mit wem in diesem Raum würdest du am liebsten verreisen – und mit wem niemals?",
        ],
      },
      history: {
        label: "🏛️ Politik & Geschichte",
        prompts: [
          "Welche historische Person würdest du gern treffen?",
          "In welcher Epoche hättest du lieber gelebt?",
          "Welche Verschwörungstheorie findest du heimlich ein bisschen plausibel?",
          "Wenn du einen Tag lang die absolute Macht hättest – was würdest du tun?",
          "Welches Schulfach war für dich am nutzlosesten?",
          "Über welches politische Thema regst du dich am meisten auf?",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        prompts: [
          "Wie hoch ist dein Body Count? (sei ehrlich)",
          "Was war der verrückteste Ort, an dem du es getrieben hast?",
          "Bei wem in diesem Raum würdest du nach rechts wischen?",
          "Was ist dein größter Turn-on?",
          "Welche Fantasie hast du noch niemandem erzählt?",
          "Was ist das Versauteste, das du je gemacht hast?",
          "An wen in diesem Raum hast du schon mal nackt gedacht?",
          "Was ist dein seltsamster Turn-on?",
          "Beschreib deinen letzten One-Night-Stand in drei Worten.",
          "Was war der öffentlichste Ort, an dem du es gemacht hast?",
          "Hast du es jemals vorgetäuscht? Bei wem?",
          "Was ist das Schlimmste, das du je im Bett gemacht hast?",
          "Wer war dein bester Sex aller Zeiten und warum?",
          "Welchen Kink würdest du wirklich gern mal ausprobieren?",
          "Wonach hast du zuletzt gesucht, das dir peinlich wäre?",
          "Hattest du je was mit dem Ex von jemandem in diesem Raum?",
        ],
      },
    },
    en: {
      general: {
        label: "🎲 General",
        prompts: [
          "What's the most embarrassing thing in your search history?",
          "What's a lie you tell all the time?",
          "Who in this room would you swap lives with for a week?",
          "What's the pettiest reason you've ended a friendship?",
          "What's the worst gift you've ever received?",
          "What's something you pretend to like but secretly hate?",
        ],
      },
      party: {
        label: "🎉 Party",
        prompts: [
          "What's the drunkest you've ever been?",
          "What's the worst thing you've done on a night out?",
          "Who here would you trust least with your phone unlocked?",
          "What's a night out you genuinely don't remember?",
          "What's your most cringe drunk text?",
          "Who in this room have you talked about behind their back?",
        ],
      },
      leisure: {
        label: "🏖️ Leisure & Travel",
        prompts: [
          "What's your most embarrassing holiday story?",
          "Which travel destination is totally overrated?",
          "What have you swiped on holiday (hotel towels count)?",
          "Where would you emigrate to right now?",
          "What was your biggest travel disaster?",
          "Who in this room would you most — and never — travel with?",
        ],
      },
      history: {
        label: "🏛️ Politics & History",
        prompts: [
          "Which historical figure would you love to meet?",
          "Which era would you rather have lived in?",
          "Which conspiracy theory do you secretly find a bit plausible?",
          "If you had absolute power for one day, what would you do?",
          "Which school subject was the most useless to you?",
          "Which political topic winds you up the most?",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        prompts: [
          "What's your body count? (be honest)",
          "What's the wildest place you've hooked up?",
          "Who in this room would you swipe right on?",
          "What's your biggest turn-on?",
          "What's a fantasy you've never told anyone?",
          "What's the kinkiest thing you've ever done?",
          "Who in this room have you thought about naked?",
          "What's your weirdest turn-on?",
          "Describe your last hookup in three words.",
          "What's the most public place you've done it?",
          "Have you ever faked it? With who?",
          "What's the worst thing you've done in bed?",
          "Who was your best ever, and why?",
          "What's a kink you'd actually want to try?",
          "Last thing you searched that you'd be embarrassed by?",
          "Ever hooked up with someone's ex in this room?",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.TruthQuestions = TRUTH;
})(window);

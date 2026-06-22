/*
 * content/truth.js — content for Truth or Drink (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each entry is a TRUTH question put to one player. In
 * drinking mode they can dodge it by drinking; in plain mode they just answer.
 * The 🔞 and inside-joke pools are where it gets spicy — fill the placeholders.
 */
(function (global) {
  "use strict";

  var TRUTH = {
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
    nsfw: {
      label: "🔞 Filth",
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
    insideJokes: {
      label: "😎 Inside Jokes",
      prompts: [
        "[Inside-joke truth #1]",
        "[The question only this group would ask]",
        "[Come clean about the incident]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.TruthQuestions = TRUTH;
})(window);

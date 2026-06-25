/*
 * content/rankit.js — content for Rank It (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each SET is one round: a `title` stating the axis you
 * rank along (best → worst, biggest → smallest, …) and an `items` list (aim for
 * 5) that everyone privately puts in order. Drift from the group's consensus and
 * you lose. Item count is flexible — the game adapts to however many you give.
 */
(function (global) {
  "use strict";

  var RANKIT = {
    general: {
      label: "🎲 General",
      sets: [
        { title: "Best → worst superpower", items: ["Invisibility", "Flying", "Time travel", "Reading minds", "Teleportation"] },
        { title: "Best → worst pizza topping", items: ["Pineapple", "Pepperoni", "Mushroom", "Extra cheese", "Anchovies"] },
        { title: "Most → least essential app", items: ["WhatsApp", "Instagram", "TikTok", "Google Maps", "Spotify"] },
        { title: "Dream → nightmare holiday", items: ["Beach resort", "City trip", "Camping", "Cruise", "Skiing"] },
        { title: "Best → worst way to spend a Sunday", items: ["Hungover in bed", "Big brunch", "A long hike", "Gaming all day", "Family visit"] },
        { title: "Most → least useful school subject", items: ["Maths", "PE", "History", "Art", "Religion"] },
      ],
    },
    party: {
      label: "🎉 Party",
      sets: [
        { title: "Most → least acceptable drunk behaviour", items: ["Crying in the toilets", "Texting your ex", "Picking a fight", "Falling asleep", "Oversharing"] },
        { title: "Most → least classy drink", items: ["Champagne", "Craft beer", "Tequila shots", "Boxed wine", "Jägerbombs"] },
        { title: "Biggest → smallest party foul", items: ["Throwing up indoors", "Breaking something", "Spilling a drink", "Ghosting early", "Hogging the aux"] },
        { title: "Best → worst hangover cure", items: ["Greasy food", "Hair of the dog", "Sleeping till noon", "Water & painkillers", "The gym"] },
        { title: "Most → least likely to get you kicked out", items: ["Starting a fight", "Skinny dipping", "Insulting the host", "Crowd surfing", "Falling asleep"] },
        { title: "Best → worst person to be stuck next to at a party", items: ["The drunk", "The talker", "The DJ", "The ex", "The boss"] },
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      sets: [
        { title: "Biggest → most forgivable ick", items: ["Bad kisser", "Texts way too much", "Still lives with parents", "Zero ambition", "Talks during the film"] },
        { title: "Best → worst place to hook up", items: ["A real bed (boring)", "The back seat", "A festival tent", "Parents' house", "The office"] },
        { title: "Biggest → smallest red flag", items: ["Still texts their ex", "Has no friends", "Hates animals", "Terrible tipper", "Loves Comic Sans"] },
        { title: "Most → least attractive trait", items: ["Confidence", "Money", "A filthy sense of humour", "Abs", "Actually replies to texts"] },
        { title: "Biggest → smallest dealbreaker in bed", items: ["Selfish", "No effort", "Won't stop talking", "Keeps socks on", "Falls asleep after"] },
        { title: "Most → least overrated", items: ["Sending nudes", "Shower sex", "Hickeys", "Sexting", "Morning after cuddles"] },
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      sets: [
        { title: "[Rank these by who'd do it first]", items: ["[Name A]", "[Name B]", "[Name C]", "[Name D]", "[Name E]"] },
        { title: "[The group's worst habits, best → worst]", items: ["[Habit 1]", "[Habit 2]", "[Habit 3]", "[Habit 4]", "[Habit 5]"] },
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.RankItSets = RANKIT;
})(window);

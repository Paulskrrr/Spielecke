/*
 * content/meme.js — content for Meme Maker (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each PROMPT is one round: an `image` (a big emoji that
 * stands in for the meme picture) and a `setup` (the caption challenge). Every
 * player privately writes a caption; the table votes for the funniest. Fill the
 * inside-joke placeholders with real group references.
 */
(function (global) {
  "use strict";

  var MEME = {
    general: {
      label: "🎲 General",
      prompts: [
        { image: "😳", setup: "Caption: the moment you realised…" },
        { image: "🤡", setup: "Caption: me pretending…" },
        { image: "🔥", setup: "Caption this dumpster fire" },
        { image: "🧠", setup: "A thought that keeps me up at night:" },
        { image: "📱", setup: "The notification I dread the most:" },
        { image: "🙃", setup: "My toxic trait is…" },
        { image: "💸", setup: "Where all my money actually goes:" },
        { image: "🦝", setup: "Caption this little menace" },
      ],
    },
    party: {
      label: "🎉 Party",
      prompts: [
        { image: "🍻", setup: "Famous last words before the night went wrong:" },
        { image: "🤮", setup: "Caption: 3am, outside the kebab shop" },
        { image: "🕺", setup: "The dance move that cleared the floor:" },
        { image: "😵", setup: "Caption: how I look in every group photo" },
        { image: "📸", setup: "The photo that should never have been posted:" },
        { image: "🚕", setup: "What I told the taxi driver at 4am:" },
        { image: "🥴", setup: "Translate this drunk text:" },
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      prompts: [
        { image: "🍑", setup: "A caption that gets this banned:" },
        { image: "😏", setup: "The text I send at 2am:" },
        { image: "💦", setup: "Caption this. Keep it classy (don't):" },
        { image: "🛏️", setup: "What I say to instantly ruin the mood:" },
        { image: "🍆", setup: "The worst thing to whisper in bed:" },
        { image: "👀", setup: "Caption: when the eye contact lasts too long" },
        { image: "🔞", setup: "My dating profile bio, but honest:" },
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      prompts: [
        { image: "😎", setup: "[The meme only this group would get]" },
        { image: "📞", setup: "[Caption the incident]" },
        { image: "🤦", setup: "[What {someone} actually said that night]" },
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.MemePrompts = MEME;
})(window);

// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/simon.js — content for "Simon sagt" (Simon Says, voice-driven)
 *
 * EDIT ME. Pure content, no game logic. These are BARE imperative commands
 * WITHOUT the "Simon sagt:" prefix — the game reads a command aloud and randomly
 * decides whether to slap "Simon sagt:" in front of it. Players only obey when
 * the prefix is there. Keep commands short, doable instantly while seated in a
 * group, and smooth for text-to-speech to read.
 *
 * Pools keep theme editable and language-switchable. Add a key and it shows up
 * as a selectable chip automatically. `label` is what players see; the key is
 * the internal id. Keep de/en mirrored.
 */
(function (global) {
  "use strict";

  var SIMON = {
    de: {
      koerper: {
        label: "🤸 Körper & Gesten",
        commands: [
          "fass dein linkes Ohr an",
          "heb beide Hände",
          "berühr deine Nase",
          "zwinker deinem Nachbarn zu",
          "dreh dich einmal im Kreis",
          "klatsch dreimal in die Hände",
          "streck die Zunge raus",
          "leg beide Hände auf den Kopf",
          "mach ein Herz mit den Händen",
          "lächle so breit du kannst",
          "zeig deine Muskeln",
          "kratz dich am Kopf",
          "verschränk die Arme vor der Brust",
          "deute zur Decke",
          "nick dreimal mit dem Kopf",
          "berühr deinen linken Ellenbogen",
          "mach ein Peace-Zeichen",
          "schließ die Augen und zähl bis drei",
        ],
      },
      party: {
        label: "🎉 Party",
        commands: [
          "nimm einen Schluck",
          "prost mit deinem Nachbarn",
          "trink auf ex",
          "verteile zwei Schlücke",
          "nimm einen großen Schluck",
          "stoß mit allen an",
          "trink mit der linken Hand",
          "sing eine Zeile deines Lieblingslieds",
          "mach eine Welle wie im Stadion",
          "ruf laut Prost",
          "verteile einen Schluck an wen du willst",
          "trink, wenn du heute schon gelacht hast",
          "tausch dein Getränk mit dem Nachbarn",
          "mach den lautesten Jubel, den du kannst",
          "erfinde einen Trinkspruch",
          "trink so viele Schlücke wie du Geschwister hast",
          "balanciere dein Glas auf dem Handrücken",
          "gib deinem Nachbarn ein High-Five",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        commands: [
          "flüster deinem Nachbarn etwas Verruchtes ins Ohr",
          "mach deinen sexiesten Blick",
          "beiß dir verführerisch auf die Lippe",
          "schick einer Person am Tisch einen Luftkuss",
          "sag deinem Nachbarn ein anzügliches Kompliment",
          "streich dir langsam durch die Haare",
          "zwinker der attraktivsten Person am Tisch zu",
          "flüster ganz leise dein heißestes Reizwort",
          "roll verführerisch mit der Schulter",
          "leck dir genüsslich über die Lippen",
          "mach einen langen Kussmund in die Runde",
          "stöhne einmal möglichst überzeugend",
          "mach deinem Nachbarn fünf Sekunden schöne Augen",
          "flirte eine Runde lang mit deinem Getränk",
          "sag mit tiefer Stimme komm näher",
          "pust deinem Nachbarn sanft ins Gesicht",
          "beschreib deinen Idealtyp in einem Wort",
          "tanz zwei Sekunden lang sexy auf deinem Stuhl",
        ],
      },
    },
    en: {
      koerper: {
        label: "🤸 Body & Gestures",
        commands: [
          "touch your left ear",
          "raise both hands",
          "touch your nose",
          "wink at your neighbour",
          "spin around once",
          "clap three times",
          "stick out your tongue",
          "put both hands on your head",
          "make a heart with your hands",
          "smile as wide as you can",
          "show off your muscles",
          "scratch your head",
          "cross your arms over your chest",
          "point at the ceiling",
          "nod your head three times",
          "touch your left elbow",
          "make a peace sign",
          "close your eyes and count to three",
        ],
      },
      party: {
        label: "🎉 Party",
        commands: [
          "take a sip",
          "cheers with your neighbour",
          "down your drink",
          "hand out two sips",
          "take a big gulp",
          "clink glasses with everyone",
          "drink with your left hand",
          "sing one line of your favourite song",
          "do a stadium wave",
          "shout Cheers out loud",
          "hand out a sip to whoever you want",
          "drink if you've laughed today",
          "swap drinks with your neighbour",
          "do the loudest cheer you can",
          "make up a toast",
          "take one sip for each sibling you have",
          "balance your glass on the back of your hand",
          "give your neighbour a high five",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        commands: [
          "whisper something naughty in your neighbour's ear",
          "give your sexiest look",
          "bite your lip seductively",
          "blow a kiss to someone at the table",
          "give your neighbour a suggestive compliment",
          "slowly run your fingers through your hair",
          "wink at the most attractive person at the table",
          "whisper your hottest word very quietly",
          "roll your shoulder seductively",
          "lick your lips with delight",
          "make a long pouty kiss face to the room",
          "moan once as convincingly as you can",
          "make eyes at your neighbour for five seconds",
          "flirt with your drink for one round",
          "say come closer in a deep voice",
          "gently blow air at your neighbour's face",
          "describe your ideal type in one word",
          "dance sexy on your chair for two seconds",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.SimonCommands = SIMON;
})(window);

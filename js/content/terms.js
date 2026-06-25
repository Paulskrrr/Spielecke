/*
 * content/terms.js — SHARED term database (NSFW, adults only)
 *
 * EDIT ME. One place for single-term content so it's easy to manage. Games that
 * need a "name / word / thing" pull from here:
 *   - Who Am I?  (the identity on your forehead)
 *   - Imposter   (the secret word everyone but the faker knows)
 *
 * Each entry must work BOTH as something you can describe to others AND as a
 * word you can hint at without saying. Keep them short and shoutable. Pools are
 * themed; "mixed" in-game draws across all of them. Add a pool here and it
 * shows up in both games automatically.
 *
 * (The Bomb and Wavelength use different content shapes — prompts and opposite
 * pairs — so they keep their own files.)
 */
(function (global) {
  "use strict";

  var TERMS = {
    football: {
      label: "⚽ Fußball",
      terms: [
        // Spieler
        "Messi", "Ronaldo", "Neymar", "Mbappé", "Haaland",
        "Lewandowski", "Salah", "De Bruyne", "Kimmich", "Müller",
        "Neuer", "Kroos",
        // Vereine
        "FC Bayern", "Real Madrid", "FC Barcelona", "Manchester City",
        "Liverpool", "Paris Saint-Germain", "Borussia Dortmund",
        "Arsenal", "Juventus", "Chelsea",
        // Begriffe & Konzepte
        "Hat-trick", "Penalty", "Abseits", "Freistoß", "Ecke",
        "Kopfball", "Fallrückzieher", "Rote Karte", "VAR",
        "Champions League", "Weltmeisterschaft", "Transferfenster", "Abstieg",
      ],
    },

    videogames: {
      label: "🎮 Video Games",
      terms: [
        // Allgemein
        "Respawn", "Boss Fight", "Easter Egg", "Noob", "Speedrun",
        "Loot Box", "Cheat Code", "LAN Party",
        // Minecraft
        "Creeper", "Steve", "Enderman", "Diamond Pickaxe",
        "Nether Portal", "Ender Dragon", "Herobrine", "Redstone", "Dirt House",
        // Counter-Strike
        "AWP", "Headshot", "Rush B", "Flashbang",
        "Knife Round", "Smoke Grenade", "Bomb Defusal",
        // Overwatch
        "Bastion", "Tracer", "Reinhardt", "Mercy",
        "D.Va", "Genji", "Widowmaker", "Payload",
        // League of Legends
        "Yasuo", "Teemo", "Jungle", "Baron Nashor", "Dragon", "Nexus", "Gank",
        // Hitman
        "Agent 47",
        // Clash of Clans
        "Electro Dragon", "Town Hall",
      ],
    },

    general: {
      label: "🌍 General",
      terms: [
        // Everyday objects
        "Toothbrush", "Alarm clock", "Umbrella", "Sunglasses", "Remote control",
        "Scissors", "Microwave", "Washing machine", "Stapler", "Lighter",
        // Food & drink
        "Pizza", "Sushi", "Ice cream", "Burger", "Popcorn",
        "Coffee", "Beer", "Nutella", "Avocado", "Bacon",
        // Animals
        "Penguin", "Dolphin", "Flamingo", "Sloth", "Octopus",
        "Panda", "Kangaroo", "Hamster", "Giraffe", "Crow",
        // Places & situations
        "Sauna", "Dentist", "Airport", "Casino", "Gym",
        "Roller coaster", "Flea market", "Traffic jam", "Power outage", "Hospital",
        // Experiences
        "First date", "Job interview", "Hangover", "Moving apartment",
        "Surprise party", "Road trip", "All-nighter", "Sunburn",
      ],
    },

    party: {
      label: "🎉 Party",
      terms: [
        "Beer pong", "Hangover", "Tequila shot", "Nightclub", "Karaoke",
        "Designated driver", "Kebab at 4am", "Pre-game", "Shots", "Group chat",
      ],
    },
    famous: {
      label: "🌟 Famous",
      terms: [
        "Beyoncé", "The Rock", "Shrek", "Harry Potter", "Donald Trump",
        "Lady Gaga", "Conor McGregor", "Darth Vader", "Taylor Swift", "James Bond",
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      terms: [
        "One-night stand", "Strip club", "Sexting", "Walk of shame",
        "Booty call", "Friends with benefits", "Skinny dipping",
        "Your ex's new partner", "A drunk text you regret",
        "Threesome", "Lap dance", "Handcuffs", "Morning wood", "Quickie",
        "Sugar daddy", "Safe word", "Wet dream", "Dirty talk", "Roleplay",
        "Friend zone", "Netflix and chill", "Hickey", "Blue balls",
        "Whipped cream", "Massage parlour", "Period sex", "Dad bod",
      ],
    },
    doodle_hard: {
      label: "🎨 Doodle – Hard",
      terms: [
        // Absurd animal combos
        "Frog in a car", "Penguin on a skateboard", "Shark in a bathtub",
        "Bear in a business suit", "Dinosaur on a bicycle", "Elephant in an elevator",
        "Octopus driving a bus", "Giraffe in a submarine", "Panda in a sauna",
        "Horse at a wedding", "Crocodile doing yoga", "Turtle on a treadmill",
        "Snake in a library", "Wolf playing violin", "Hippo at a desk",
        "Cat giving a TED Talk", "Dog judging a cooking show", "Fish playing guitar",
        "Monkey on a rollercoaster", "Chicken in space",
        // Tricky abstract concepts
        "Loneliness", "Jealousy", "Procrastination", "Déjà vu", "Awkward silence",
        "Monday morning", "Fear of missing out", "Democracy", "The internet",
        // Visual paradoxes & impossible things
        "Fire underwater", "Man falling upwards", "Invisible man eating soup",
        "The end of a rainbow", "The last cookie", "A dream inside a dream",
        "Someone being watched without knowing it",
      ],
    },

    starwars_easy: {
      label: "⭐ Star Wars – Easy",
      terms: [
        // Films
        "Darth Vader", "Luke Skywalker", "Yoda", "Princess Leia", "Han Solo",
        "Obi-Wan Kenobi", "Chewbacca", "R2-D2", "C-3PO", "Emperor Palpatine",
        "Boba Fett", "Jango Fett", "Anakin Skywalker", "Padmé Amidala",
        "Qui-Gon Jinn", "Mace Windu", "Count Dooku", "General Grievous",
        "Jar Jar Binks", "Rey", "Kylo Ren", "Finn", "Poe Dameron", "BB-8",
        "Snoke", "Lando Calrissian", "Jabba the Hutt", "Admiral Ackbar",
        "Darth Maul", "The Mandalorian", "Grogu",
        // Clone Wars (well-known)
        "Ahsoka Tano", "Captain Rex", "Commander Cody", "Asajj Ventress",
        "Cad Bane", "Hondo Ohnaka", "Plo Koon", "Aayla Secura", "Kit Fisto",
      ],
    },

    starwars_hard: {
      label: "⭐ Star Wars – Hard",
      terms: [
        // Clone Wars & Rebels characters
        "Savage Opress", "Bo-Katan Kryze", "Barriss Offee",
        "Kanan Jarrus", "Ezra Bridger", "Sabine Wren", "Hera Syndulla",
        "Admiral Thrawn", "Grand Inquisitor",
        // Mandalorian & newer shows
        "Din Djarin", "Fennec Shand", "Greef Karga", "The Armorer",
        "Omega",
        // Rogue One
        "Cassian Andor", "Jyn Erso", "K-2SO", "Saw Gerrera",
        // Classic deeper cuts
        "Grand Moff Tarkin", "Cal Kestis",
        // Planets
        "Coruscant", "Mandalore", "Dathomir", "Kamino", "Geonosis",
        "Mustafar", "Kashyyyk", "Ryloth", "Lothal", "Scarif", "Nevarro",
        // Ships & Weapons
        "Darksaber", "Holocron", "Kyber Crystal", "Slave I",
        "Star Destroyer", "AT-AT", "Razor Crest", "Thermal Detonator",
        // Concepts
        "Order 66", "Midi-Chlorians", "Youngling", "Rule of Two",
        "Force Ghost", "The Clone Wars",
      ],
    },

    marvel: {
      label: "🦸 Marvel",
      terms: [
        // Avengers core
        "Iron Man", "Captain America", "Thor", "Black Widow", "Hulk",
        "Hawkeye", "Nick Fury",
        // Phase 1–3 heroes
        "Spider-Man", "Doctor Strange", "Black Panther", "Ant-Man",
        "Captain Marvel", "War Machine", "Falcon", "Winter Soldier",
        "Scarlet Witch", "Vision", "Quicksilver", "Valkyrie",
        // Guardians
        "Star-Lord", "Gamora", "Drax", "Groot", "Rocket Raccoon",
        "Nebula", "Mantis", "Yondu",
        // Villains
        "Thanos", "Loki", "Ultron", "Hela", "Killmonger", "Ego",
        "Mysterio", "Vulture", "Red Skull", "Ronan", "Aldrich Killian",
        "Agatha Harkness",
        // Supporting
        "Shuri", "Okoye", "Wong", "Happy Hogan", "Pepper Potts",
        "Nick Fury", "Phil Coulson", "Agent Hill",
        // Netflix / TV
        "Daredevil", "Jessica Jones", "Luke Cage", "Punisher",
        "Kingpin", "Elektra",
      ],
    },

    onepiece: {
      label: "🏴‍☠️ One Piece",
      terms: [
        // Straw Hat crew
        "Monkey D. Luffy", "Roronoa Zoro", "Nami", "Usopp", "Sanji",
        "Tony Tony Chopper", "Nico Robin", "Franky", "Brook", "Jinbe",
        // Red-Hair & Whitebeard crews
        "Shanks", "Whitebeard", "Portgas D. Ace", "Sabo", "Marco",
        // Warlords & Allies
        "Trafalgar Law", "Boa Hancock", "Crocodile",
        "Donquixote Doflamingo", "Bartholomew Kuma", "Gecko Moria",
        "Buggy", "Mihawk",
        // Marine & Navy
        "Monkey D. Garp", "Akainu", "Aokiji", "Kizaru", "Sengoku",
        "Smoker", "Tashigi", "Coby",
        // Villains & Antagonists
        "Arlong", "Enel", "Rob Lucci", "Katakuri", "Big Mom", "Kaido",
        "Blackbeard", "King", "Queen", "Jack",
        // Others
        "Yamato", "Nefertari Vivi", "Bon Clay", "Perona", "Ivankov",
        "Silvers Rayleigh", "Gol D. Roger",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Terms = TERMS;
})(window);

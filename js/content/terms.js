// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
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
 * shows up in every game that uses this DB automatically.
 *
 * A pool may carry an optional `games: [...]` allow-list of game ids it belongs
 * to (e.g. drawing-only prompts that don't work as a forehead guess). A pool
 * with no `games` field shows up everywhere. Use `Spielecke.termPoolsFor(id)`
 * to read the pools a given game should offer (it also filters "mixed").
 *
 * BILINGUAL: TERMS is a { de, en } bundle. Both subtrees have identical pool
 * keys. Proper-noun pools (football, videogames, famous, starwars_*, marvel,
 * onepiece) keep identical `terms` arrays across languages — only labels with
 * English words are translated. Common-word pools (general, party, nsfw,
 * doodle_hard) have their terms translated to natural German.
 *
 * (Hot Potato and Wavelength use different content shapes — prompts and opposite
 * pairs — so they keep their own files.)
 */
(function (global) {
  "use strict";

  var TERMS = {
    en: {
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
          "Hat-trick", "Penalty", "Offside", "Free kick", "Corner",
          "Header", "Bicycle kick", "Red card", "VAR",
          "Champions League", "World Cup", "Transfer window", "Relegation",
          // FC Barcelona
          "Remontada", "Camp Nou", "La Masia", "Tiki-Taka",
          "Xavi", "Iniesta", "Puyol", "Guardiola",
          "Pedri", "Lamine Yamal",
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

      minecraft: {
        label: "⛏️ Minecraft",
        // Proper nouns — identical to de. Mobs, items, blocks & places, all of
        // them describable, drawable AND hint-able, so it fits every game.
        terms: [
          // Mobs
          "Creeper", "Enderman", "Zombie", "Skeleton", "Spider", "Ghast", "Blaze",
          "Wither", "Ender Dragon", "Warden", "Piglin", "Villager", "Iron Golem", "Slime",
          // Items & tools
          "Diamond Pickaxe", "Netherite", "Redstone", "TNT", "Obsidian", "Elytra",
          "Totem of Undying", "Enchanting Table", "Beacon", "Shulker Box", "Ender Pearl",
          "Golden Apple", "Trident",
          // Blocks
          "Grass Block", "Cobblestone", "Bedrock", "Crafting Table",
          // Places & concepts
          "Nether Portal", "The Nether", "The End", "Village", "Ancient City",
          "Woodland Mansion", "Creative Mode", "Speedrun",
          // Faces
          "Steve", "Alex", "Herobrine", "Notch",
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
      science: {
        // Concrete, shoutable sci/tech nouns — work as a Who Am I? identity, an
        // Imposter word AND a Doodle subject, so offered to all three.
        label: "🔬 Science & Tech",
        terms: [
          "Robot", "Rocket", "Dinosaur", "Volcano", "Telescope", "Magnet",
          "Light bulb", "Battery", "Astronaut", "Alien", "Black hole", "Submarine",
          "Drone", "Microscope", "Skeleton", "Brain", "Tornado", "Solar panel",
          "Self-driving car", "Artificial intelligence", "Vaccine", "Atom",
          "Satellite", "3D printer",
        ],
      },
      history: {
        // Recognisable figures, events and symbols — great for Who Am I? and
        // Imposter, but too abstract to draw, so not offered to Doodle.
        label: "🏛️ Politics & History",
        games: ["imposter", "whoami"],
        terms: [
          "Napoleon", "Cleopatra", "Julius Caesar", "Albert Einstein",
          "Abraham Lincoln", "Gandhi", "Queen Elizabeth II", "The Berlin Wall",
          "The Pyramids", "The Titanic", "The French Revolution", "The Cold War",
          "The Moon landing", "A Viking", "A Knight", "A Pharaoh",
          "The Roman Empire", "A Dictator", "The Stone Age", "The Statue of Liberty",
          "The Eiffel Tower", "World War II", "The Wild West", "A Crown",
        ],
      },
      leisure: {
        // Holiday/leisure objects — fun to draw and to hint at as an Imposter
        // word, but odd as a "who am I", so Doodle + Imposter only.
        label: "🏖️ Leisure & Travel",
        games: ["imposter", "doodle"],
        terms: [
          "Beach", "Suitcase", "Sunscreen", "Deck chair", "Passport", "Tent",
          "Cruise ship", "Aeroplane", "Snorkel", "Pool cocktail", "Souvenir",
          "Hiking boots", "Sunburn", "Hotel buffet", "Festival", "Road trip",
          "Hammock", "Beach ball", "Flip-flops", "Camper van", "Ski lift", "Map",
          "Selfie stick", "All-inclusive resort",
        ],
      },
      power: {
        // Money/power concepts — the secret-word guessing of Imposter fits these
        // best; offered to Imposter only.
        label: "💰 Money & Power",
        games: ["imposter"],
        terms: [
          "Billionaire", "Crown", "Gold bar", "Briefcase of cash", "Throne",
          "Diamond", "Stock market", "President", "Bank vault", "Dictator",
          "Bribe", "Lobbyist", "Inheritance", "Private jet", "Yacht",
          "Tax haven", "Casino", "Crypto", "CEO", "Red carpet", "Bodyguard",
          "Penthouse",
        ],
      },
      famous: {
        label: "🌟 Famous",
        // Proper nouns — identical to de.
        terms: [
          // Pop & screen icons
          "The Rock", "Shrek", "Harry Potter", "Donald Trump",
          "Conor McGregor", "Darth Vader", "James Bond",
          "Justin Bieber", "Ariana Grande",
          "Leonardo DiCaprio", "Keanu Reeves", "Margot Robbie", "Zendaya", "Homer Simpson",
          // Sport
          "Cristiano Ronaldo", "Lionel Messi", "LeBron James",
          "Usain Bolt", "Mike Tyson",
          // Hip-Hop & Rap
          "Drake", "Eminem", "Kanye West", "Snoop Dogg",
          
          // Business & tech moguls
          "Elon Musk", "Jeff Bezos", "Mark Zuckerberg", "Steve Jobs", "Bill Gates",
          // Internet & world stage
          "MrBeast", "Kim Kardashian", "Barack Obama",
        ],
      },
      kampfsport: {
        label: "🥊 Combat Sports",
        // Fighters, promoters & pundits (proper nouns, identical to de).
        // Weighted ~UFC / boxing / around-the-sport figures. Works as a forehead
        // guess, an Imposter word or a drawing, so it's offered everywhere.
        terms: [
          // UFC
          "Conor McGregor", "Khabib Nurmagomedov", "Jon Jones", "Israel Adesanya",
          "Alex Pereira", "Islam Makhachev", "Charles Oliveira", "Dustin Poirier",
          "Justin Gaethje", "Max Holloway", "Sean O'Malley", "Ilia Topuria",
          "Kamaru Usman", "Leon Edwards", "Nate Diaz", "Jorge Masvidal",
          "Amanda Nunes", "Valentina Shevchenko", "Zhang Weili", "Francis Ngannou",
          "Stipe Miocic", "Georges St-Pierre", "Anderson Silva", "Tom Aspinall",
          "Merab Dvalishvili", "Paddy Pimblett",
          // Boxen
          "Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Manny Pacquiao",
          "Canelo Álvarez", "Tyson Fury", "Anthony Joshua", "Deontay Wilder",
          "Oleksandr Usyk", "Ryan Garcia", "Conor Benn",
          "Wladimir Klitschko", "Evander Holyfield",
          // Rund um den Sport
          "Dana White", "Joe Rogan", "Ariel Helwani", "Bruce Buffer",
          "Michael Buffer", "Don King", "Eddie Hearn",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        terms: [
          "One-night stand", "Strip club", "Sexting", "Walk of shame",
          "Booty call", "Friends with benefits", "Skinny dipping",
          "Your ex's new partner", "A drunk text you regret",
          "Threesome", "Lap dance", "Handcuffs", "Morning wood", "Quickie",
          "Sugar daddy", "Safe word", "Wet dream", "Dirty talk", "Roleplay",
          "Friend zone", "Netflix and chill", "Hickey", 
          "Whipped cream", "Massage parlour", "Period sex", "Dad bod",
        ],
      },
      doodle_hard: {
        label: "🎨 Doodle – Hard",
        // Drawing-only: multi-word scenes ("Frog in a car") and abstract concepts
        // ("Loneliness") are great to DRAW but make no sense as a Who Am I? identity
        // or an Imposter secret word — so this pool is offered to Doodle Drama only.
        games: ["doodle"],
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
        label: "Easy",
        group: "⭐ Star Wars",
        terms: [
          // Films
          "Darth Vader", "Luke Skywalker", "Yoda", "Princess Leia", "Han Solo",
          "Obi-Wan Kenobi", "Chewbacca", "R2-D2", "C-3PO", "Emperor Palpatine",
          "Boba Fett", "Jango Fett", "Anakin Skywalker", "Padmé Amidala",
          "Qui-Gon Jinn", "Mace Windu", "Count Dooku", "General Grievous",
          "Jar Jar Binks", "Rey", "Kylo Ren", "Finn", "BB-8",
          "Snoke", "Lando Calrissian", "Jabba the Hutt", "Admiral Ackbar",
          "Darth Maul", "The Mandalorian", 
          // Clone Wars (well-known)
          "Ahsoka Tano", "Captain Rex", "Commander Cody", "Asajj Ventress",
          "Cad Bane", "Hondo Ohnaka", "Plo Koon", "Aayla Secura", "Kit Fisto",
        ],
      },

      starwars_hard: {
        // Scoped to the films + The Clone Wars (animated): hard but iconic. No
        // Rebels / newer live-action / game-only deep cuts — those are a different
        // angle and easy to miss if you haven't watched those shows.
        label: "Hard",
        group: "⭐ Star Wars",
        terms: [
          // Prequel & Original trilogy characters (deep cuts)
          "Greedo", 
          "Bossk", "IG-88", "Grand Moff Tarkin",
          // The Clone Wars (animated)
          "Savage Opress", "Barriss Offee", "Embo",
          // Rogue One
          
          // Planets
          "Coruscant", "Mandalore", "Dathomir", "Kamino", "Geonosis",
          "Mustafar", "Kashyyyk", "Jedha",
          // Ships & Weapons
          "Darksaber", "Holocron", "Slave I",
          "Star Destroyer", "AT-AT", 
          // Concepts & lore
          "Order 66", "Midi-Chlorians", "Youngling", "Rule of Two",
          "Force Ghost", "The Clone Wars", "Carbonite", "Sarlacc", "Kessel Run",
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
          "Mysterio", "Ronan", "Aldrich Killian",
          
          // Supporting
          "Pepper Potts",
          
          // Netflix / TV
          "Daredevil", 
          
        ],
      },

      onepiece: {
        label: "🏴‍☠️ One Piece",
        terms: [
          // Straw Hat crew
          "Monkey D. Luffy", "Roronoa Zoro", "Nami", "Usopp", "Sanji",
          "Tony Tony Chopper", "Nico Robin", "Franky", "Brook", "Jinbe",
          // Red-Hair & Whitebeard crews
          "Whitebeard", "Portgas D. Ace", "Sabo", "Marco",
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
    },

    de: {
      football: {
        label: "⚽ Fußball",
        // Proper nouns — identical to en.
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
          "Hattrick", "Elfmeter", "Abseits", "Freistoß", "Ecke",
          "Kopfball", "Fallrückzieher", "Rote Karte", "VAR",
          "Champions League", "Weltmeisterschaft", "Transferfenster", "Abstieg",
          // FC Barcelona
          "Remontada", "Camp Nou", "La Masia", "Tiki-Taka",
          "Xavi", "Iniesta", "Puyol", "Guardiola",
          "Pedri", "Lamine Yamal",
        ],
      },

      videogames: {
        label: "🎮 Videospiele",
        // Proper nouns — identical to en.
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

      minecraft: {
        label: "⛏️ Minecraft",
        // Proper nouns — identical to en.
        terms: [
          // Mobs
          "Creeper", "Enderman", "Zombie", "Skeleton", "Spider", "Ghast", "Blaze",
          "Wither", "Ender Dragon", "Warden", "Piglin", "Villager", "Iron Golem", "Slime",
          // Items & tools
          "Diamond Pickaxe", "Netherite", "Redstone", "TNT", "Obsidian", "Elytra",
          "Totem of Undying", "Enchanting Table", "Beacon", "Shulker Box", "Ender Pearl",
          "Golden Apple", "Trident",
          // Blocks
          "Grass Block", "Cobblestone", "Bedrock", "Crafting Table",
          // Places & concepts
          "Nether Portal", "The Nether", "The End", "Village", "Ancient City",
          "Woodland Mansion", "Creative Mode", "Speedrun",
          // Faces
          "Steve", "Alex", "Herobrine", "Notch",
        ],
      },

      general: {
        label: "🌍 Allgemein",
        terms: [
          // Alltagsgegenstände
          "Zahnbürste", "Wecker", "Regenschirm", "Sonnenbrille", "Fernbedienung",
          "Schere", "Mikrowelle", "Waschmaschine", "Tacker", "Feuerzeug",
          // Essen & Trinken
          "Pizza", "Sushi", "Eis", "Burger", "Popcorn",
          "Kaffee", "Bier", "Nutella", "Avocado", "Speck",
          // Tiere
          "Pinguin", "Delfin", "Flamingo", "Faultier", "Tintenfisch",
          "Panda", "Känguru", "Hamster", "Giraffe", "Krähe",
          // Orte & Situationen
          "Sauna", "Zahnarzt", "Flughafen", "Casino", "Fitnessstudio",
          "Achterbahn", "Flohmarkt", "Stau", "Stromausfall", "Krankenhaus",
          // Erlebnisse
          "Erstes Date", "Vorstellungsgespräch", "Kater", "Umzug",
          "Überraschungsparty", "Roadtrip", "Durchmachen", "Sonnenbrand",
        ],
      },

      party: {
        label: "🎉 Party",
        terms: [
          "Bier-Pong", "Kater", "Tequila-Shot", "Nachtclub", "Karaoke",
          "Döner um 4 Uhr", "Vorglühen", "Shots", "Gruppenchat",
        ],
      },
      science: {
        label: "🔬 Wissenschaft & Technik",
        terms: [
          "Roboter", "Rakete", "Dinosaurier", "Vulkan", "Teleskop", "Magnet",
          "Glühbirne", "Batterie", "Astronaut", "Außerirdischer", "Schwarzes Loch",
          "U-Boot", "Drohne", "Mikroskop", "Skelett", "Gehirn", "Tornado",
          "Solarpanel", "Selbstfahrendes Auto", "Künstliche Intelligenz", "Impfung",
          "Atom", "Satellit", "3D-Drucker",
        ],
      },
      history: {
        label: "🏛️ Politik & Geschichte",
        games: ["imposter", "whoami"],
        terms: [
          "Napoleon", "Kleopatra", "Julius Cäsar", "Albert Einstein",
          "Abraham Lincoln", "Gandhi", "Königin Elisabeth II.", "Berliner Mauer",
          "Pyramiden", "Titanic", "Französische Revolution", "Kalter Krieg",
          "Mondlandung", "Wikinger", "Ritter", "Pharao",
          "Römisches Reich", "Diktator", "Steinzeit", "Freiheitsstatue",
          "Eiffelturm", "Zweiter Weltkrieg", "Wilder Westen", "Krone",
        ],
      },
      leisure: {
        label: "🏖️ Freizeit & Urlaub",
        games: ["imposter", "doodle"],
        terms: [
          "Strand", "Koffer", "Sonnencreme", "Liegestuhl", "Reisepass", "Zelt",
          "Kreuzfahrtschiff", "Flugzeug", "Schnorchel", "Cocktail am Pool", "Souvenir",
          "Wanderschuhe", "Sonnenbrand", "Hotelbuffet", "Festival", "Roadtrip",
          "Hängematte", "Wasserball", "Flip-Flops", "Wohnmobil", "Skilift", "Landkarte",
          "Selfie-Stick", "All-inclusive-Resort",
        ],
      },
      power: {
        label: "💰 Geld & Macht",
        games: ["imposter"],
        terms: [
          "Milliardär", "Krone", "Goldbarren", "Geldkoffer", "Thron",
          "Diamant", "Aktienmarkt", "Präsident", "Banktresor", "Diktator",
          "Bestechung", "Lobbyist", "Erbschaft", "Privatjet", "Yacht",
          "Steuerparadies", "Casino", "Krypto", "CEO", "Roter Teppich", "Leibwächter",
          "Penthouse",
        ],
      },
      famous: {
        label: "🌟 Berühmt",
        // Proper nouns — identical to en.
        terms: [
          // Pop & screen icons
          "The Rock", "Shrek", "Harry Potter", "Donald Trump",
          "Conor McGregor", "Darth Vader", "James Bond",
          "Justin Bieber", "Ariana Grande",
          "Leonardo DiCaprio", "Keanu Reeves", "Margot Robbie", "Zendaya", "Homer Simpson",
          // Sport
          "Cristiano Ronaldo", "Lionel Messi", "LeBron James",
          "Usain Bolt", "Mike Tyson",
          // Hip-Hop & Rap
          "Drake", "Eminem", "Kanye West", "Snoop Dogg",
          
          // Business & tech moguls
          "Elon Musk", "Jeff Bezos", "Mark Zuckerberg", "Steve Jobs", "Bill Gates",
          // Internet & world stage
          "MrBeast", "Kim Kardashian", "Barack Obama",
        ],
      },
      kampfsport: {
        label: "🥊 Kampfsport",
        // Kämpfer, Promoter & Kommentatoren (Eigennamen, identisch zu en).
        // Gewichtet ~UFC / Boxen / Figuren rund um den Sport. Taugt als Stirn-
        // Rateperson, Imposter-Wort oder Zeichnung — daher überall verfügbar.
        terms: [
          // UFC
          "Conor McGregor", "Khabib Nurmagomedov", "Jon Jones", "Israel Adesanya",
          "Alex Pereira", "Islam Makhachev", "Charles Oliveira", "Dustin Poirier",
          "Justin Gaethje", "Max Holloway", "Sean O'Malley", "Ilia Topuria",
          "Kamaru Usman", "Leon Edwards", "Nate Diaz", "Jorge Masvidal",
          "Amanda Nunes", "Valentina Shevchenko", "Zhang Weili", "Francis Ngannou",
          "Stipe Miocic", "Georges St-Pierre", "Anderson Silva", "Tom Aspinall",
          "Merab Dvalishvili", "Paddy Pimblett",
          // Boxen
          "Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Manny Pacquiao",
          "Canelo Álvarez", "Tyson Fury", "Anthony Joshua", "Deontay Wilder",
          "Oleksandr Usyk", "Ryan Garcia", "Conor Benn",
          "Wladimir Klitschko", "Evander Holyfield",
          // Rund um den Sport
          "Dana White", "Joe Rogan", "Ariel Helwani", "Bruce Buffer",
          "Michael Buffer", "Don King", "Eddie Hearn",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        terms: [
          "One-Night-Stand", "Stripclub", "Sexting", "Walk of Shame",
          "Booty Call", "Freundschaft Plus", "Nacktbaden",
          "Neuer Partner deines Ex", "Betrunkene Nachricht, die du bereust",
          "Dreier", "Lapdance", "Handschellen", "Morgenlatte", "Quickie",
          "Sugar Daddy", "Safeword", "Feuchter Traum", "Dirty Talk", "Rollenspiel",
          "Friendzone", "Netflix and Chill", "Knutschfleck", 
          "Schlagsahne", "Massagesalon", "Sex während der Periode", "Dad Bod",
        ],
      },
      doodle_hard: {
        label: "🎨 Doodle – Schwer",
        // Drawing-only: multi-word scenes and abstract concepts are great to DRAW
        // but make no sense as a Who Am I? identity or Imposter secret word — so
        // this pool is offered to Doodle Drama only.
        games: ["doodle"],
        terms: [
          // Absurde Tier-Kombis
          "Frosch im Auto", "Pinguin auf einem Skateboard", "Hai in der Badewanne",
          "Bär im Anzug", "Dinosaurier auf einem Fahrrad", "Elefant im Aufzug",
          "Tintenfisch fährt Bus", "Giraffe in einem U-Boot", "Panda in der Sauna",
          "Pferd auf einer Hochzeit", "Krokodil macht Yoga", "Schildkröte auf dem Laufband",
          "Schlange in einer Bibliothek", "Wolf spielt Geige", "Nilpferd am Schreibtisch",
          "Katze hält einen TED-Talk", "Hund bewertet eine Kochshow", "Fisch spielt Gitarre",
          "Affe auf einer Achterbahn", "Huhn im Weltall",
          // Knifflige abstrakte Konzepte
          "Einsamkeit", "Eifersucht", "Aufschieberitis", "Déjà-vu", "Peinliche Stille",
          "Montagmorgen", "Angst, etwas zu verpassen", "Demokratie", "Das Internet",
          // Visuelle Paradoxa & Unmögliches
          "Feuer unter Wasser", "Mann fällt nach oben", "Unsichtbarer Mann isst Suppe",
          "Das Ende eines Regenbogens", "Der letzte Keks", "Ein Traum in einem Traum",
          "Jemand wird beobachtet, ohne es zu wissen",
        ],
      },

      starwars_easy: {
        label: "Leicht",
        group: "⭐ Star Wars",
        // Proper nouns — identical to en.
        terms: [
          // Films
          "Darth Vader", "Luke Skywalker", "Yoda", "Princess Leia", "Han Solo",
          "Obi-Wan Kenobi", "Chewbacca", "R2-D2", "C-3PO", "Emperor Palpatine",
          "Boba Fett", "Jango Fett", "Anakin Skywalker", "Padmé Amidala",
          "Qui-Gon Jinn", "Mace Windu", "Count Dooku", "General Grievous",
          "Jar Jar Binks", "Rey", "Kylo Ren", "Finn", "BB-8",
          "Snoke", "Lando Calrissian", "Jabba the Hutt", "Admiral Ackbar",
          "Darth Maul", "The Mandalorian", 
          // Clone Wars (well-known)
          "Ahsoka Tano", "Captain Rex", "Commander Cody", "Asajj Ventress",
          "Cad Bane", "Hondo Ohnaka", "Plo Koon", "Aayla Secura", "Kit Fisto",
        ],
      },

      starwars_hard: {
        label: "Schwer",
        group: "⭐ Star Wars",
        // Proper nouns — identical to en.
        terms: [
          // Prequel & Original trilogy characters (deep cuts)
          "Greedo", 
          "Bossk", "IG-88", "Grand Moff Tarkin",
          // The Clone Wars (animated)
          "Savage Opress", "Barriss Offee", "Embo",
          // Rogue One
          
          // Planets
          "Coruscant", "Mandalore", "Dathomir", "Kamino", "Geonosis",
          "Mustafar", "Kashyyyk", "Jedha",
          // Ships & Weapons
          "Darksaber", "Holocron", "Slave I",
          "Star Destroyer", "AT-AT", 
          // Concepts & lore
          "Order 66", "Midi-Chlorians", "Youngling", "Rule of Two",
          "Force Ghost", "The Clone Wars", "Carbonite", "Sarlacc", "Kessel Run",
        ],
      },

      marvel: {
        label: "🦸 Marvel",
        // Proper nouns — identical to en.
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
          "Mysterio", "Ronan", "Aldrich Killian",
          
          // Supporting
          "Pepper Potts",
          
          // Netflix / TV
          "Daredevil", 
          
        ],
      },

      onepiece: {
        label: "🏴‍☠️ One Piece",
        // Proper nouns — identical to en.
        terms: [
          // Straw Hat crew
          "Monkey D. Luffy", "Roronoa Zoro", "Nami", "Usopp", "Sanji",
          "Tony Tony Chopper", "Nico Robin", "Franky", "Brook", "Jinbe",
          // Red-Hair & Whitebeard crews
          "Whitebeard", "Portgas D. Ace", "Sabo", "Marco",
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
    },
  };

  // Pools a given game should offer (current language), minus pools whose
  // `games` allow-list excludes this game. Filters both chips and "Mixed".
  function termPoolsFor(gameId) {
    var byLang = global.Spielecke.L(TERMS) || {};
    var out = {};
    Object.keys(byLang).forEach(function (k) {
      var allow = byLang[k].games;
      if (!allow || allow.indexOf(gameId) !== -1) out[k] = byLang[k];
    });
    return out;
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Terms = TERMS;
  global.Spielecke.termPoolsFor = termPoolsFor;
})(window);

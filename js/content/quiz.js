// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/quiz.js — content for Quiz Out
 *
 * EDIT ME. Pure content. Bilingual { de, en }. Each language is a set of
 * CATEGORIES (general, science, history, …). A category has a `label` (the chip)
 * and `levels`: an array of difficulty LEVELS, index 0 = easiest. The game lets
 * you pick categories before the start; each round it climbs a level and pulls
 * questions from the chosen categories at that level (clamped to each category's
 * hardest level). Keep each level harder than the last.
 *
 * Each question: { q, options: [4 strings], answer: <index of the correct one> }.
 * The game shuffles the option order on screen, so `answer` just points at the
 * right string here (kept at 0 throughout for readability). Keep the same
 * category keys and identical `answer` indices across de/en.
 */
(function (global) {
  "use strict";

  var EN = {
    general: {
      label: "🎲 General",
      levels: [
        // Warm-up
        [
          { q: "What colour is a banana?", options: ["Yellow", "Blue", "Red", "Green"], answer: 0 },
          { q: "How many legs does a spider have?", options: ["8", "6", "4", "10"], answer: 0 },
          { q: "H₂O is commonly known as?", options: ["Water", "Salt", "Gold", "Air"], answer: 0 },
          { q: "Which animal barks?", options: ["Dog", "Cat", "Cow", "Fish"], answer: 0 },
          { q: "What planet do we live on?", options: ["Earth", "Mars", "Venus", "Jupiter"], answer: 0 },
        ],
        // Easy
        [
          { q: "Capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: 0 },
          { q: "How many continents are there?", options: ["7", "5", "6", "8"], answer: 0 },
          { q: "How many sides does a hexagon have?", options: ["6", "5", "7", "8"], answer: 0 },
          { q: "Which ocean is the largest?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], answer: 0 },
          { q: "What gas do plants take in?", options: ["CO₂", "Oxygen", "Helium", "Nitrogen"], answer: 0 },
        ],
        // Medium
        [
          { q: "Who painted the Mona Lisa?", options: ["Da Vinci", "Picasso", "Van Gogh", "Monet"], answer: 0 },
          { q: "Chemical symbol for gold?", options: ["Au", "Ag", "Gd", "Go"], answer: 0 },
          { q: "How many bones in the adult human body?", options: ["206", "201", "210", "196"], answer: 0 },
          { q: "Capital of Australia?", options: ["Canberra", "Sydney", "Melbourne", "Perth"], answer: 0 },
          { q: "Most populous country (2024)?", options: ["India", "China", "USA", "Indonesia"], answer: 0 },
        ],
        // Hard
        [
          { q: "What year did WW2 end?", options: ["1945", "1944", "1939", "1948"], answer: 0 },
          { q: "Element with atomic number 1?", options: ["Hydrogen", "Helium", "Oxygen", "Carbon"], answer: 0 },
          { q: "Who wrote 'Romeo and Juliet'?", options: ["Shakespeare", "Dickens", "Tolstoy", "Austen"], answer: 0 },
          { q: "The smallest prime number?", options: ["2", "1", "3", "0"], answer: 0 },
          { q: "Hottest planet in the solar system?", options: ["Venus", "Mercury", "Mars", "Jupiter"], answer: 0 },
        ],
        // Brutal
        [
          { q: "Year the Berlin Wall fell?", options: ["1989", "1991", "1987", "1990"], answer: 0 },
          { q: "Square root of 144?", options: ["12", "14", "11", "13"], answer: 0 },
          { q: "Rarest of the main blood types?", options: ["AB−", "O−", "B−", "A−"], answer: 0 },
          { q: "Who developed general relativity?", options: ["Einstein", "Newton", "Bohr", "Hawking"], answer: 0 },
          { q: "Hardest natural material?", options: ["Diamond", "Quartz", "Steel", "Titanium"], answer: 0 },
        ],
      ],
    },

    science: {
      label: "🔬 Science & Tech",
      levels: [
        [
          { q: "What gas do humans need to breathe?", options: ["Oxygen", "Carbon dioxide", "Helium", "Hydrogen"], answer: 0 },
          { q: "How many planets are in our solar system?", options: ["8", "9", "7", "10"], answer: 0 },
          { q: "What organ pumps blood around your body?", options: ["Heart", "Lungs", "Liver", "Brain"], answer: 0 },
          { q: "What is the closest star to Earth?", options: ["The Sun", "Polaris", "Alpha Centauri", "The Moon"], answer: 0 },
        ],
        [
          { q: "What force pulls objects toward Earth?", options: ["Gravity", "Magnetism", "Friction", "Pressure"], answer: 0 },
          { q: "What is the 'powerhouse' of the cell?", options: ["Mitochondria", "Nucleus", "Ribosome", "Membrane"], answer: 0 },
          { q: "Which planet is the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: 0 },
          { q: "What gas makes up most of Earth's atmosphere?", options: ["Nitrogen", "Oxygen", "CO₂", "Hydrogen"], answer: 0 },
        ],
        [
          { q: "Chemical symbol for sodium?", options: ["Na", "So", "Sd", "Nm"], answer: 0 },
          { q: "Which particle has a negative charge?", options: ["Electron", "Proton", "Neutron", "Photon"], answer: 0 },
          { q: "Roughly how fast does light travel?", options: ["300,000 km/s", "30,000 km/s", "3,000 km/s", "3 million km/s"], answer: 0 },
          { q: "Who proposed evolution by natural selection?", options: ["Darwin", "Newton", "Mendel", "Pasteur"], answer: 0 },
        ],
      ],
    },

    history: {
      label: "🏛️ Politics & History",
      levels: [
        [
          { q: "Which civilisation built the pyramids of Giza?", options: ["Egyptians", "Romans", "Greeks", "Aztecs"], answer: 0 },
          { q: "Who was the first President of the USA?", options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"], answer: 0 },
          { q: "The Great Wall is in which country?", options: ["China", "Japan", "India", "Mongolia"], answer: 0 },
          { q: "Which ship famously sank in 1912?", options: ["Titanic", "Lusitania", "Bismarck", "Mayflower"], answer: 0 },
        ],
        [
          { q: "In which year did WW2 end?", options: ["1945", "1918", "1939", "1950"], answer: 0 },
          { q: "Who painted the Sistine Chapel ceiling?", options: ["Michelangelo", "Da Vinci", "Raphael", "Donatello"], answer: 0 },
          { q: "The French Revolution began in which year?", options: ["1789", "1689", "1815", "1848"], answer: 0 },
          { q: "Which wall fell in 1989?", options: ["Berlin Wall", "Great Wall", "Hadrian's Wall", "Wall Street"], answer: 0 },
        ],
        [
          { q: "Who was UK PM for most of WW2?", options: ["Winston Churchill", "Neville Chamberlain", "Clement Attlee", "Margaret Thatcher"], answer: 0 },
          { q: "Who was the last Tsar of Russia?", options: ["Nicholas II", "Alexander III", "Peter the Great", "Ivan IV"], answer: 0 },
          { q: "In which year did the USSR collapse?", options: ["1991", "1989", "1985", "1993"], answer: 0 },
          { q: "Cleopatra ruled which kingdom?", options: ["Egypt", "Rome", "Greece", "Persia"], answer: 0 },
        ],
      ],
    },

    leisure: {
      label: "🏖️ Leisure & Travel",
      levels: [
        [
          { q: "The Eiffel Tower is in which city?", options: ["Paris", "London", "Rome", "Madrid"], answer: 0 },
          { q: "Which country is famous for pizza and pasta?", options: ["Italy", "Spain", "Greece", "France"], answer: 0 },
          { q: "What do you call a holiday on a big ship?", options: ["Cruise", "Safari", "Road trip", "Trek"], answer: 0 },
          { q: "Which ocean do you cross flying London to New York?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], answer: 0 },
        ],
        [
          { q: "The Colosseum is in which city?", options: ["Rome", "Athens", "Cairo", "Istanbul"], answer: 0 },
          { q: "In which country is the Taj Mahal?", options: ["India", "Pakistan", "Iran", "Nepal"], answer: 0 },
          { q: "Which city is famous for canals and gondolas?", options: ["Venice", "Amsterdam", "Hamburg", "Bruges"], answer: 0 },
          { q: "Mount Everest borders Nepal and which country?", options: ["China", "India", "Bhutan", "Pakistan"], answer: 0 },
        ],
        [
          { q: "Which country has the most UNESCO World Heritage Sites?", options: ["Italy", "France", "Spain", "China"], answer: 0 },
          { q: "The currency of Japan is the?", options: ["Yen", "Won", "Yuan", "Ringgit"], answer: 0 },
          { q: "Which is the tallest mountain in Africa?", options: ["Kilimanjaro", "Mount Kenya", "Atlas", "Table Mountain"], answer: 0 },
          { q: "Machu Picchu is in which country?", options: ["Peru", "Mexico", "Bolivia", "Chile"], answer: 0 },
        ],
      ],
    },

    videogames: {
      label: "🎮 Video Games",
      levels: [
        [
          { q: "What does the red mushroom do in Super Mario?", options: ["Makes him grow", "Kills him", "Makes him fly", "Nothing"], answer: 0 },
          { q: "Which company makes the PlayStation?", options: ["Sony", "Microsoft", "Nintendo", "Sega"], answer: 0 },
          { q: "Which Minecraft mob explodes?", options: ["Creeper", "Zombie", "Skeleton", "Cow"], answer: 0 },
          { q: "What colour is Sonic the Hedgehog?", options: ["Blue", "Red", "Green", "Yellow"], answer: 0 },
        ],
        [
          { q: "Which company makes the Xbox?", options: ["Microsoft", "Sony", "Nintendo", "Valve"], answer: 0 },
          { q: "What type is Pikachu in Pokémon?", options: ["Electric", "Fire", "Water", "Grass"], answer: 0 },
          { q: "Best-selling video game of all time?", options: ["Minecraft", "Tetris", "GTA V", "Wii Sports"], answer: 0 },
          { q: "In Counter-Strike, the 'AWP' is a?", options: ["Sniper rifle", "Pistol", "Grenade", "Knife"], answer: 0 },
        ],
        [
          { q: "Which studio created The Legend of Zelda?", options: ["Nintendo", "Capcom", "Square Enix", "Sega"], answer: 0 },
          { q: "In League of Legends, what do you destroy last?", options: ["Nexus", "Inhibitor", "Baron", "Turret"], answer: 0 },
          { q: "What year was the first Super Mario Bros released?", options: ["1985", "1990", "1981", "1995"], answer: 0 },
          { q: "Which game is set on 'Pandora' with 'Vault Hunters'?", options: ["Borderlands", "Fallout", "Destiny", "Halo"], answer: 0 },
        ],
      ],
    },

    football: {
      label: "⚽ Football",
      levels: [
        [
          { q: "How many players per team are on the pitch?", options: ["11", "9", "10", "12"], answer: 0 },
          { q: "How many points is a goal worth?", options: ["1", "2", "3", "0"], answer: 0 },
          { q: "Which player is nicknamed 'CR7'?", options: ["Cristiano Ronaldo", "Lionel Messi", "Neymar", "Mbappé"], answer: 0 },
          { q: "What colour card means a player is sent off?", options: ["Red", "Yellow", "Green", "Blue"], answer: 0 },
        ],
        [
          { q: "Which country won the 2022 World Cup?", options: ["Argentina", "France", "Brazil", "Germany"], answer: 0 },
          { q: "Which club defined Messi's famous era?", options: ["FC Barcelona", "Real Madrid", "Juventus", "Chelsea"], answer: 0 },
          { q: "How long is a match (excluding stoppage)?", options: ["90 minutes", "60 minutes", "120 minutes", "100 minutes"], answer: 0 },
          { q: "Which country has won the most World Cups?", options: ["Brazil", "Germany", "Italy", "Argentina"], answer: 0 },
        ],
        [
          { q: "Which country won the first World Cup in 1930?", options: ["Uruguay", "Brazil", "Argentina", "Italy"], answer: 0 },
          { q: "Who has won the most Ballon d'Or awards?", options: ["Lionel Messi", "Cristiano Ronaldo", "Michel Platini", "Johan Cruyff"], answer: 0 },
          { q: "Which club has the most Champions League titles?", options: ["Real Madrid", "AC Milan", "Bayern Munich", "Liverpool"], answer: 0 },
          { q: "When did Germany last win the World Cup?", options: ["2014", "2010", "2006", "2018"], answer: 0 },
        ],
      ],
    },

    starwars: {
      label: "⭐ Star Wars",
      levels: [
        // Warm-up
        [
          { q: "What weapon do Jedi use?", options: ["Lightsaber", "Blaster", "Bow", "Spear"], answer: 0 },
          { q: "Who is Luke Skywalker's father?", options: ["Darth Vader", "Obi-Wan", "Yoda", "Han Solo"], answer: 0 },
          { q: "What kind of creature is Chewbacca?", options: ["Wookiee", "Ewok", "Hutt", "Droid"], answer: 0 },
          { q: "Complete: 'May the ___ be with you.'", options: ["Force", "Power", "Light", "Way"], answer: 0 },
          { q: "What colour are Sith lightsabers?", options: ["Red", "Blue", "Green", "Purple"], answer: 0 },
          { q: "What are the Empire's white-armoured soldiers called?", options: ["Stormtroopers", "Droidekas", "Sith guards", "Bounty hunters"], answer: 0 },
          { q: "Which little green Jedi Master trained Luke?", options: ["Yoda", "Obi-Wan", "Mace Windu", "Qui-Gon"], answer: 0 },
          { q: "On which desert planet does Luke grow up?", options: ["Tatooine", "Naboo", "Endor", "Hoth"], answer: 0 },
        ],
        // Easy
        [
          { q: "What colour is Yoda's lightsaber?", options: ["Green", "Blue", "Red", "Purple"], answer: 0 },
          { q: "Who is frozen in carbonite in Episode V?", options: ["Han Solo", "Luke", "Lando", "Boba Fett"], answer: 0 },
          { q: "What is the name of Han Solo's ship?", options: ["Millennium Falcon", "X-Wing", "Slave I", "Star Destroyer"], answer: 0 },
          { q: "Mace Windu's lightsaber is which colour?", options: ["Purple", "Green", "Blue", "Red"], answer: 0 },
          { q: "Which princess does Luke rescue in Episode IV?", options: ["Leia", "Padmé", "Rey", "Mon Mothma"], answer: 0 },
          { q: "What is the Empire's giant planet-destroying station?", options: ["Death Star", "Starkiller Base", "Star Destroyer", "The Citadel"], answer: 0 },
          { q: "Which furry creatures help beat the Empire on Endor?", options: ["Ewoks", "Wookiees", "Jawas", "Gungans"], answer: 0 },
          { q: "What is R2-D2?", options: ["An astromech droid", "A protocol droid", "A bounty hunter", "A starfighter"], answer: 0 },
          { q: "Whose Padawan is Anakin Skywalker?", options: ["Obi-Wan Kenobi", "Yoda", "Mace Windu", "Qui-Gon Jinn"], answer: 0 },
        ],
        // Medium
        [
          { q: "What is the Emperor's Sith name?", options: ["Darth Sidious", "Darth Plagueis", "Darth Maul", "Darth Tyranus"], answer: 0 },
          { q: "Which planet does Yoda hide on?", options: ["Dagobah", "Tatooine", "Endor", "Hoth"], answer: 0 },
          { q: "What is Order 66?", options: ["The order to kill the Jedi", "A clone battalion", "A Senate law", "A space station"], answer: 0 },
          { q: "Anakin's Padawan in The Clone Wars is?", options: ["Ahsoka Tano", "Rey", "Barriss Offee", "Padmé"], answer: 0 },
          { q: "What species is Jabba?", options: ["Hutt", "Wookiee", "Twi'lek", "Toydarian"], answer: 0 },
          { q: "Which bounty hunter captures Han Solo for Jabba?", options: ["Boba Fett", "Jango Fett", "Greedo", "Bossk"], answer: 0 },
          { q: "What is the forest moon in Return of the Jedi?", options: ["Endor", "Yavin 4", "Kashyyyk", "Takodana"], answer: 0 },
          { q: "Which planet does the Death Star destroy in Episode IV?", options: ["Alderaan", "Naboo", "Corellia", "Jakku"], answer: 0 },
          { q: "What is the ice planet in The Empire Strikes Back?", options: ["Hoth", "Dagobah", "Mustafar", "Ilum"], answer: 0 },
        ],
        // Hard
        [
          { q: "What crystal powers a lightsaber?", options: ["Kyber crystal", "Dilithium", "Beskar", "Aurodium"], answer: 0 },
          { q: "What is the Wookiee homeworld?", options: ["Kashyyyk", "Kamino", "Geonosis", "Felucia"], answer: 0 },
          { q: "How many lightsabers does General Grievous wield at once?", options: ["Four", "Two", "Three", "Six"], answer: 0 },
          { q: "What is the Mandalorian's real name?", options: ["Din Djarin", "Boba Fett", "Cobb Vanth", "Paz Vizsla"], answer: 0 },
          { q: "What is Boba Fett's ship called?", options: ["Slave I", "Ghost", "Razor Crest", "Outrider"], answer: 0 },
          { q: "On which volcanic planet does Anakin become Vader?", options: ["Mustafar", "Mygeeto", "Utapau", "Sullust"], answer: 0 },
          { q: "On which capital planet does the Jedi Temple stand?", options: ["Coruscant", "Naboo", "Corellia", "Chandrila"], answer: 0 },
          { q: "What metal is Mandalorian armour made of?", options: ["Beskar", "Cortosis", "Phrik", "Durasteel"], answer: 0 },
          { q: "Which Jedi defeats Darth Maul in The Phantom Menace?", options: ["Obi-Wan Kenobi", "Qui-Gon Jinn", "Yoda", "Mace Windu"], answer: 0 },
          { q: "Who is Rey's grandfather in the sequel trilogy?", options: ["Palpatine", "Obi-Wan", "Luke", "Snoke"], answer: 0 },
        ],
        // Deep cuts
        [
          { q: "Who was Palpatine's own Sith master?", options: ["Darth Plagueis", "Darth Bane", "Darth Maul", "Darth Tyranus"], answer: 0 },
          { q: "What is Count Dooku's Sith title?", options: ["Darth Tyranus", "Darth Sidious", "Darth Nihilus", "Darth Revan"], answer: 0 },
          { q: "What is the name of Anakin's mother?", options: ["Shmi Skywalker", "Padmé Amidala", "Beru Lars", "Mon Mothma"], answer: 0 },
          { q: "Which Jedi trains Grogu at the end of The Mandalorian Season 2?", options: ["Luke Skywalker", "Ahsoka Tano", "Ezra Bridger", "Obi-Wan Kenobi"], answer: 0 },
          { q: "What is the First Order's planet turned superweapon?", options: ["Starkiller Base", "Death Star III", "The Eclipse", "Malevolence"], answer: 0 },
          { q: "Who directed the original 1977 Star Wars film?", options: ["George Lucas", "Irvin Kershner", "Richard Marquand", "J.J. Abrams"], answer: 0 },
          { q: "What is clone Captain Rex's designation?", options: ["CT-7567", "CC-2224", "CT-5555", "CC-1010"], answer: 0 },
          { q: "Who was Qui-Gon Jinn's own Jedi master?", options: ["Count Dooku", "Yoda", "Mace Windu", "Ki-Adi-Mundi"], answer: 0 },
          { q: "What species is Darth Maul?", options: ["Zabrak", "Twi'lek", "Chiss", "Nautolan"], answer: 0 },
          { q: "Which admiral does Vader promote after Force-choking Ozzel?", options: ["Piett", "Tarkin", "Thrawn", "Krennic"], answer: 0 },
          { q: "What is the cantina spaceport city on Tatooine?", options: ["Mos Eisley", "Mos Espa", "Anchorhead", "Bestine"], answer: 0 },
          { q: "Which Sith rule limits their number to two?", options: ["The Rule of Two", "The Sith Code", "The Rule of One", "The Bane Law"], answer: 0 },
        ],
      ],
    },

    marvel: {
      label: "🦸 Marvel",
      levels: [
        [
          { q: "What is Iron Man's alter ego?", options: ["Tony Stark", "Steve Rogers", "Bruce Banner", "Peter Parker"], answer: 0 },
          { q: "What colour is the Hulk?", options: ["Green", "Blue", "Red", "Grey"], answer: 0 },
          { q: "Who wields the hammer Mjolnir?", options: ["Thor", "Loki", "Odin", "Hela"], answer: 0 },
          { q: "Spider-Man's alter ego is?", options: ["Peter Parker", "Tony Stark", "Clark Kent", "Bruce Wayne"], answer: 0 },
        ],
        [
          { q: "Main villain of Avengers: Infinity War?", options: ["Thanos", "Ultron", "Loki", "Kang"], answer: 0 },
          { q: "What is Captain America's shield made of?", options: ["Vibranium", "Adamantium", "Titanium", "Steel"], answer: 0 },
          { q: "Black Panther is king of which nation?", options: ["Wakanda", "Sokovia", "Latveria", "Genosha"], answer: 0 },
          { q: "How many Infinity Stones are there?", options: ["6", "5", "7", "4"], answer: 0 },
        ],
        [
          { q: "In which city is Doctor Strange's Sanctum?", options: ["New York", "London", "Hong Kong", "Kamar-Taj"], answer: 0 },
          { q: "Who is Star-Lord?", options: ["Peter Quill", "Peter Parker", "Scott Lang", "Stephen Strange"], answer: 0 },
          { q: "What is the name of Thor's home world?", options: ["Asgard", "Vanaheim", "Jotunheim", "Midgard"], answer: 0 },
          { q: "Which stone is hidden on Vormir?", options: ["Soul Stone", "Power Stone", "Mind Stone", "Time Stone"], answer: 0 },
        ],
      ],
    },

    // Special game-night category — gold-highlighted chip (see .chip[data-pool="mcgregor"]).
    mcgregor: {
      label: "🥊 McGregor",
      levels: [
        // Tier 1 — Basic (casual fan)
        [
          { q: "What is Conor McGregor's nickname?", options: ["The Notorious", "The Eagle", "Iron", "The Spider"], answer: 0 },
          { q: "Which city is McGregor from?", options: ["Dublin", "Cork", "Belfast", "Limerick"], answer: 0 },
          { q: "In which organisation does McGregor primarily fight?", options: ["UFC", "Bellator", "ONE Championship", "PFL"], answer: 0 },
          { q: "How many UFC titles did McGregor hold at once — a first in UFC history?", options: ["Two", "Three", "One", "Four"], answer: 0 },
          { q: "McGregor's two UFC belts were at featherweight and which division?", options: ["Lightweight", "Welterweight", "Bantamweight", "Middleweight"], answer: 0 },
          { q: "McGregor knocked out José Aldo in how many seconds?", options: ["13", "6", "20", "40"], answer: 0 },
          { q: "Which boxing legend did McGregor face in a 2017 boxing match?", options: ["Floyd Mayweather", "Manny Pacquiao", "Canelo Álvarez", "Anthony Joshua"], answer: 0 },
          { q: "What kind of drink is McGregor's 'Proper No. Twelve'?", options: ["Irish whiskey", "Vodka", "Beer", "Energy drink"], answer: 0 },
          { q: "Which hand is McGregor's signature weapon?", options: ["Left", "Right", "Both equally", "His elbows"], answer: 0 },
          { q: "McGregor is famous for what pre-fight behaviour?", options: ["Trash talk and predictions", "Silence and meditation", "Refusing all interviews", "Reading poetry"], answer: 0 },
          { q: "Which country does McGregor proudly represent, often draped in its flag?", options: ["Ireland", "Scotland", "England", "Wales"], answer: 0 },
          { q: "Which featherweight champion did McGregor famously knock out in seconds?", options: ["José Aldo", "Max Holloway", "Chad Mendes", "Frankie Edgar"], answer: 0 },
          { q: "McGregor made his acting debut in which 2024 movie?", options: ["Road House", "The Beekeeper", "Warrior", "Rumble"], answer: 0 },
          { q: "Who starred alongside McGregor in Road House (2024)?", options: ["Jake Gyllenhaal", "Tom Hardy", "Chris Hemsworth", "Matt Damon"], answer: 0 },
          { q: "In 2021 Forbes named McGregor the world's highest-paid what?", options: ["Athlete", "Actor", "Musician", "CEO"], answer: 0 },
          { q: "In which month is McGregor's birthday?", options: ["July", "January", "March", "October"], answer: 0 },
          { q: "At which gym does McGregor train?", options: ["SBG Ireland", "Team Alpha Male", "American Top Team", "Jackson-Wink"], answer: 0 },
          { q: "Who is McGregor's long-time head coach?", options: ["John Kavanagh", "Javier Mendez", "Firas Zahabi", "Dana White"], answer: 0 },
          { q: "The bulk of McGregor's pro wins came by what method?", options: ["Knockout", "Submission", "Decision", "Disqualification"], answer: 0 },
          { q: "In 2026 McGregor returned at UFC 329 to fight whom after ~5 years away?", options: ["Max Holloway", "Dustin Poirier", "Michael Chandler", "Nate Diaz"], answer: 0 },
        ],
        // Tier 2 — Normal (engaged fan)
        [
          { q: "McGregor's 2013 UFC debut was a first-round TKO of whom?", options: ["Marcus Brimage", "Diego Brandão", "Dennis Siver", "Max Holloway"], answer: 0 },
          { q: "During his 2013 win over Max Holloway, McGregor suffered what injury?", options: ["Torn ACL", "Broken hand", "Broken leg", "Torn bicep"], answer: 0 },
          { q: "At UFC 189, McGregor won the interim featherweight title over which late replacement?", options: ["Chad Mendes", "José Aldo", "Frankie Edgar", "Dennis Siver"], answer: 0 },
          { q: "McGregor's 13-second KO of José Aldo came at which event?", options: ["UFC 194", "UFC 189", "UFC 205", "UFC 196"], answer: 0 },
          { q: "Which rival beat McGregor at UFC 196 before McGregor evened the score in the rematch?", options: ["Nate Diaz", "Dustin Poirier", "Eddie Alvarez", "Chad Mendes"], answer: 0 },
          { q: "At UFC 202, how did McGregor beat Nate Diaz in the rematch?", options: ["Majority decision", "Knockout", "Submission", "Split draw"], answer: 0 },
          { q: "McGregor won the UFC lightweight title by KO of whom at UFC 205?", options: ["Eddie Alvarez", "Rafael dos Anjos", "Justin Gaethje", "Dustin Poirier"], answer: 0 },
          { q: "McGregor's 2017 boxing megafight with Floyd Mayweather was one of the biggest what in history?", options: ["Pay-per-view events", "Amateur bouts", "Title defences", "Exhibition draws"], answer: 0 },
          { q: "About what share of McGregor's pro wins come by knockout?", options: ["About 90%", "About 50%", "About 30%", "About 70%"], answer: 0 },
          { q: "McGregor beat Donald 'Cowboy' Cerrone at UFC 246 in how long?", options: ["40 seconds", "13 seconds", "2 minutes", "4 minutes"], answer: 0 },
          { q: "The Cerrone win made McGregor the first UFC fighter with KO finishes in how many weight classes?", options: ["Three", "Two", "Four", "Five"], answer: 0 },
          { q: "McGregor has already beaten Max Holloway once — in which year was their first fight?", options: ["2013", "2016", "2011", "2019"], answer: 0 },
          { q: "How many times did McGregor lose in the UFC featherweight division?", options: ["Never", "Once", "Twice", "Three times"], answer: 0 },
          { q: "As the first UFC fighter to hold two titles at once, McGregor earned which nickname?", options: ["Champ-champ", "Double-K", "Twin king", "Grand-slam champ"], answer: 0 },
          { q: "McGregor sold Proper No. Twelve in a deal valued up to how much?", options: ["$600 million", "$100 million", "$1 billion", "$250 million"], answer: 0 },
          { q: "McGregor played which villain in Road House (2024)?", options: ["Knox", "Dalton", "Brandt", "Wesley"], answer: 0 },
          { q: "Roughly how many significant strikes does McGregor land per minute?", options: ["5+", "About 1", "About 3", "About 10"], answer: 0 },
          { q: "Which of these has been a McGregor endorsement partner?", options: ["Monster Energy", "Red Bull", "Coca-Cola", "Gatorade"], answer: 0 },
          { q: "McGregor's pro MMA debut win came in which year?", options: ["2008", "2006", "2010", "2013"], answer: 0 },
          { q: "Who is McGregor's agent at Paradigm Sports?", options: ["Audie Attar", "Ari Emanuel", "Dana White", "Scott Coker"], answer: 0 },
        ],
        // Tier 3 — Hard (deep cuts)
        [
          { q: "McGregor finished UFC debut opponent Marcus Brimage at what time of round 1?", options: ["1:07", "0:40", "2:32", "4:05"], answer: 0 },
          { q: "McGregor's post-ACL comeback (July 2014, Dublin) was a round-1 TKO of whom?", options: ["Diego Brandão", "Dennis Siver", "Marcus Brimage", "Chad Mendes"], answer: 0 },
          { q: "What bonus did McGregor earn on his July 2014 Dublin return?", options: ["Performance of the Night", "Fight of the Night", "Submission of the Night", "KO of the Year"], answer: 0 },
          { q: "McGregor first fought Dustin Poirier at which 2014 event?", options: ["UFC 178", "UFC 189", "UFC 194", "UFC 196"], answer: 0 },
          { q: "Whom did McGregor stop in January 2015 to earn his Aldo title shot?", options: ["Dennis Siver", "Diego Brandão", "Chad Mendes", "Marcus Brimage"], answer: 0 },
          { q: "The Chad Mendes interim-title win came at which event?", options: ["UFC 189", "UFC 194", "UFC 178", "UFC 205"], answer: 0 },
          { q: "The José Aldo KO was officially timed at how long into round 1?", options: ["13 seconds", "6 seconds", "40 seconds", "20 seconds"], answer: 0 },
          { q: "In which year did McGregor first become UFC featherweight champion?", options: ["2015", "2013", "2016", "2014"], answer: 0 },
          { q: "McGregor's KO of Eddie Alvarez came in which round?", options: ["Round 2", "Round 1", "Round 3", "Round 4"], answer: 0 },
          { q: "McGregor's UFC 205 title win took place in which iconic arena?", options: ["Madison Square Garden", "T-Mobile Arena", "The O2", "Staples Center"], answer: 0 },
          { q: "The Cerrone finish (UFC 246) partly came via what strikes in the clinch?", options: ["Shoulder strikes", "Elbows", "Knees", "Hammerfists"], answer: 0 },
          { q: "McGregor's 13-second KO of José Aldo was the fastest finish ever in what kind of UFC fight?", options: ["A title fight", "A main event", "A debut", "A rematch"], answer: 0 },
          { q: "McGregor's pro record features how many knockouts (KO/TKO)?", options: ["19", "12", "22", "8"], answer: 0 },
          { q: "McGregor's planned June 2024 UFC 303 fight with Michael Chandler was cancelled due to what?", options: ["A broken toe", "A broken hand", "Illness", "A contract dispute"], answer: 0 },
          { q: "How many straight wins did McGregor score at UFC featherweight?", options: ["7", "5", "6", "10"], answer: 0 },
          { q: "McGregor's first Nate Diaz fight (UFC 196) drew roughly how many PPV buys?", options: ["1.3 million", "500,000", "800,000", "2 million"], answer: 0 },
          { q: "McGregor received a then-record disclosed purse of how much for the first Diaz fight?", options: ["$1 million", "$500,000", "$3 million", "$75 million"], answer: 0 },
          { q: "McGregor's disclosed UFC career earnings are often cited around what figure?", options: ["$41.8 million", "$600 million", "$75 million", "$250 million"], answer: 0 },
          { q: "Max Holloway, McGregor's 2013 and 2026 opponent, is from where?", options: ["Hawaii", "California", "Ireland", "Brazil"], answer: 0 },
          { q: "The UFC 329 rematch with Holloway is contested at which weight?", options: ["Welterweight (170 lb)", "Featherweight (145 lb)", "Lightweight (155 lb)", "Middleweight (185 lb)"], answer: 0 },
          { q: "Proper No. Twelve whiskey launched in which month and year?", options: ["September 2018", "March 2017", "September 2016", "December 2018"], answer: 0 },
          { q: "The name 'Proper No. Twelve' references which Dublin area?", options: ["Crumlin / 'the 12'", "Temple Bar", "The Liberties", "Ballymun"], answer: 0 },
          { q: "Which spirits company (owner of Jose Cuervo and Bushmills) bought most of Proper No. Twelve?", options: ["Proximo Spirits", "Diageo", "Pernod Ricard", "Brown-Forman"], answer: 0 },
          { q: "The $600M Proper 12 sale reportedly included how much already earned in the first two years?", options: ["$250 million", "$100 million", "$400 million", "$50 million"], answer: 0 },
          { q: "McGregor topped the Forbes highest-paid athletes list in which year?", options: ["2021", "2017", "2019", "2023"], answer: 0 },
          { q: "For the Mayweather fight, McGregor reportedly earned about how much?", options: ["$75 million", "$30 million", "$100 million", "$41.8 million"], answer: 0 },
          { q: "McGregor's 'Lamborghini yacht' (Tecnomar for Lamborghini 63) reportedly cost about how much?", options: ["$3.6 million", "$600,000", "$10 million", "$250,000"], answer: 0 },
          { q: "Before the UFC, McGregor was the first European to hold two titles at once in which promotion?", options: ["Cage Warriors", "Bellator", "KSW", "BAMMA"], answer: 0 },
          { q: "McGregor signed with the UFC in which month and year?", options: ["February 2013", "April 2013", "February 2012", "June 2013"], answer: 0 },
          { q: "McGregor's Cage Warriors titles were at featherweight and which other weight?", options: ["Lightweight", "Bantamweight", "Welterweight", "Middleweight"], answer: 0 },
          { q: "McGregor holds a black belt in which grappling art?", options: ["Brazilian jiu-jitsu", "Judo", "Wrestling", "Karate"], answer: 0 },
          { q: "Where does McGregor's self-nickname 'Mystic Mac' come from?", options: ["Predicting fight outcomes", "His tattoos", "His whiskey", "His yacht"], answer: 0 },
          { q: "Road House (2024) was directed by whom?", options: ["Doug Liman", "Guy Ritchie", "Zack Snyder", "Michael Bay"], answer: 0 },
          { q: "Road House (2024) was released via which service?", options: ["Amazon (Prime Video)", "Netflix", "Disney+", "Apple TV+"], answer: 0 },
          { q: "McGregor appeared as a collab character (later removed) in which video game series?", options: ["Hitman", "Call of Duty", "EA Sports UFC", "Fortnite"], answer: 0 },
          { q: "Who is McGregor's striking coach at SBG Ireland?", options: ["Owen Roddy", "Ido Portal", "Trevor Wittman", "Mike Winkeljohn"], answer: 0 },
          { q: "In which round did McGregor stop Chad Mendes to win the interim title?", options: ["Round 2", "Round 1", "Round 3", "Round 4"], answer: 0 },
          { q: "How many of McGregor's pro MMA wins have come by submission?", options: ["One", "None", "Five", "Ten"], answer: 0 },
          { q: "At the UFC 223 media day (April 2018), McGregor threw what through a bus window?", options: ["A dolly (hand-truck)", "A chair", "A bottle", "A dumbbell"], answer: 0 },
          { q: "McGregor was the first fighter in UFC history to do what?", options: ["Hold two titles simultaneously", "Win by submission", "Headline in Europe", "Fight at three weights"], answer: 0 },
          { q: "'Who the fook is that guy?' — McGregor aimed this at which fighter who called him out in 2015?", options: ["Jeremy Stephens", "Chad Mendes", "Nate Diaz", "Dennis Siver"], answer: 0 },
          { q: "'The double champ does what the fook he wants!' — said after champ-champ night at which event?", options: ["UFC 205", "UFC 194", "UFC 229", "UFC 202"], answer: 0 },
          { q: "'Surprise, surprise… the king is back.' — after beating whom at UFC 202?", options: ["Nate Diaz", "José Aldo", "Eddie Alvarez", "Dustin Poirier"], answer: 0 },
          { q: "'We're not here to take part, we're here to take over.' — after beating whom in Dublin (2014)?", options: ["Diego Brandão", "Dennis Siver", "Marcus Brimage", "Chad Mendes"], answer: 0 },
          { q: "'You can call me Mystic Mac…' — McGregor told Joe Rogan this after first beating whom at UFC 178?", options: ["Dustin Poirier", "Nate Diaz", "José Aldo", "Eddie Alvarez"], answer: 0 },
          { q: "McGregor's 'red panty night' line (2015) was aimed at which fighter?", options: ["Rafael dos Anjos", "Eddie Alvarez", "José Aldo", "Nate Diaz"], answer: 0 },
          { q: "'I'm cool with all the gods. Gods recognise gods.' — this bravado came before which 2016 event?", options: ["UFC 196", "UFC 194", "UFC 205", "UFC 202"], answer: 0 },
          { q: "McGregor called which opponent a 'quiet little hillbilly from the back arse of nowhere'?", options: ["Dustin Poirier", "Nate Diaz", "Chad Mendes", "Eddie Alvarez"], answer: 0 },
          { q: "'Two things I like to do: whoop ass and look good…' — from the build-up to his first fight with whom (2013)?", options: ["Max Holloway", "Marcus Brimage", "Diego Brandão", "Dustin Poirier"], answer: 0 },
          { q: "McGregor's boast to 'take over' applied first to which division he entered in the UFC?", options: ["Featherweight", "Lightweight", "Welterweight", "Bantamweight"], answer: 0 },
        ],
      ],
    },

    geography: {
      label: "🌍 Geography",
      levels: [
        [
          { q: "What is the capital of France?", options: ["Paris", "London", "Rome", "Madrid"], answer: 0 },
          { q: "Which continent is Egypt in?", options: ["Africa", "Asia", "Europe", "South America"], answer: 0 },
          { q: "Which is the largest ocean?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], answer: 0 },
          { q: "Which country is shaped like a boot?", options: ["Italy", "Spain", "Greece", "Portugal"], answer: 0 },
        ],
        [
          { q: "What is the capital of Japan?", options: ["Tokyo", "Beijing", "Seoul", "Bangkok"], answer: 0 },
          { q: "How many continents are there?", options: ["7", "5", "6", "8"], answer: 0 },
          { q: "The Sahara is the world's largest hot what?", options: ["Desert", "Jungle", "Canyon", "Plain"], answer: 0 },
          { q: "Which country has the most people? (2024)", options: ["India", "China", "USA", "Indonesia"], answer: 0 },
        ],
        [
          { q: "What is the capital of Australia?", options: ["Canberra", "Sydney", "Melbourne", "Perth"], answer: 0 },
          { q: "Mount Kilimanjaro is in which country?", options: ["Tanzania", "Kenya", "Uganda", "Ethiopia"], answer: 0 },
          { q: "Which river is usually called the longest?", options: ["Nile", "Amazon", "Yangtze", "Mississippi"], answer: 0 },
          { q: "The Danube empties into which sea?", options: ["Black Sea", "Baltic Sea", "North Sea", "Mediterranean"], answer: 0 },
        ],
        [
          { q: "What is the capital of Canada?", options: ["Ottawa", "Toronto", "Vancouver", "Montreal"], answer: 0 },
          { q: "Which strait separates Europe from Africa?", options: ["Gibraltar", "Bosphorus", "Hormuz", "Bering"], answer: 0 },
          { q: "Which African country has the most people?", options: ["Nigeria", "Egypt", "Ethiopia", "DR Congo"], answer: 0 },
          { q: "Lake Baikal lies in which country?", options: ["Russia", "Mongolia", "Kazakhstan", "China"], answer: 0 },
        ],
        [
          { q: "What is the capital of Kazakhstan?", options: ["Astana", "Almaty", "Tashkent", "Bishkek"], answer: 0 },
          { q: "Which country has the longest coastline?", options: ["Canada", "Russia", "Indonesia", "Australia"], answer: 0 },
          { q: "The Atacama Desert is mostly in which country?", options: ["Chile", "Peru", "Bolivia", "Argentina"], answer: 0 },
          { q: "Which is the smallest country in the world?", options: ["Vatican City", "Monaco", "San Marino", "Malta"], answer: 0 },
        ],
      ],
    },
  };

  var DE = {
    general: {
      label: "🎲 Allgemein",
      levels: [
        [
          { q: "Welche Farbe hat eine Banane?", options: ["Gelb", "Blau", "Rot", "Grün"], answer: 0 },
          { q: "Wie viele Beine hat eine Spinne?", options: ["8", "6", "4", "10"], answer: 0 },
          { q: "H₂O kennt man besser als?", options: ["Wasser", "Salz", "Gold", "Luft"], answer: 0 },
          { q: "Welches Tier bellt?", options: ["Hund", "Katze", "Kuh", "Fisch"], answer: 0 },
          { q: "Auf welchem Planeten leben wir?", options: ["Erde", "Mars", "Venus", "Jupiter"], answer: 0 },
        ],
        [
          { q: "Hauptstadt von Frankreich?", options: ["Paris", "London", "Rom", "Berlin"], answer: 0 },
          { q: "Wie viele Kontinente gibt es?", options: ["7", "5", "6", "8"], answer: 0 },
          { q: "Wie viele Seiten hat ein Sechseck?", options: ["6", "5", "7", "8"], answer: 0 },
          { q: "Welcher Ozean ist der größte?", options: ["Pazifik", "Atlantik", "Indischer", "Arktischer"], answer: 0 },
          { q: "Welches Gas nehmen Pflanzen auf?", options: ["CO₂", "Sauerstoff", "Helium", "Stickstoff"], answer: 0 },
        ],
        [
          { q: "Wer hat die Mona Lisa gemalt?", options: ["Da Vinci", "Picasso", "Van Gogh", "Monet"], answer: 0 },
          { q: "Chemisches Symbol für Gold?", options: ["Au", "Ag", "Gd", "Go"], answer: 0 },
          { q: "Wie viele Knochen hat ein erwachsener Mensch?", options: ["206", "201", "210", "196"], answer: 0 },
          { q: "Hauptstadt von Australien?", options: ["Canberra", "Sydney", "Melbourne", "Perth"], answer: 0 },
          { q: "Bevölkerungsreichstes Land (2024)?", options: ["Indien", "China", "USA", "Indonesien"], answer: 0 },
        ],
        [
          { q: "In welchem Jahr endete der Zweite Weltkrieg?", options: ["1945", "1944", "1939", "1948"], answer: 0 },
          { q: "Element mit der Ordnungszahl 1?", options: ["Wasserstoff", "Helium", "Sauerstoff", "Kohlenstoff"], answer: 0 },
          { q: "Wer schrieb 'Romeo und Julia'?", options: ["Shakespeare", "Dickens", "Tolstoi", "Austen"], answer: 0 },
          { q: "Die kleinste Primzahl?", options: ["2", "1", "3", "0"], answer: 0 },
          { q: "Heißester Planet im Sonnensystem?", options: ["Venus", "Merkur", "Mars", "Jupiter"], answer: 0 },
        ],
        [
          { q: "In welchem Jahr fiel die Berliner Mauer?", options: ["1989", "1991", "1987", "1990"], answer: 0 },
          { q: "Quadratwurzel aus 144?", options: ["12", "14", "11", "13"], answer: 0 },
          { q: "Seltenste der gängigen Blutgruppen?", options: ["AB−", "O−", "B−", "A−"], answer: 0 },
          { q: "Wer entwickelte die allgemeine Relativitätstheorie?", options: ["Einstein", "Newton", "Bohr", "Hawking"], answer: 0 },
          { q: "Härtestes natürliches Material?", options: ["Diamant", "Quarz", "Stahl", "Titan"], answer: 0 },
        ],
      ],
    },

    science: {
      label: "🔬 Wissenschaft & Technik",
      levels: [
        [
          { q: "Welches Gas brauchen Menschen zum Atmen?", options: ["Sauerstoff", "Kohlendioxid", "Helium", "Wasserstoff"], answer: 0 },
          { q: "Wie viele Planeten hat unser Sonnensystem?", options: ["8", "9", "7", "10"], answer: 0 },
          { q: "Welches Organ pumpt das Blut durch den Körper?", options: ["Herz", "Lunge", "Leber", "Gehirn"], answer: 0 },
          { q: "Welcher Stern ist der Erde am nächsten?", options: ["Die Sonne", "Polarstern", "Alpha Centauri", "Der Mond"], answer: 0 },
        ],
        [
          { q: "Welche Kraft zieht Dinge zur Erde?", options: ["Schwerkraft", "Magnetismus", "Reibung", "Druck"], answer: 0 },
          { q: "Was ist das 'Kraftwerk' der Zelle?", options: ["Mitochondrien", "Zellkern", "Ribosom", "Membran"], answer: 0 },
          { q: "Welcher Planet ist der Rote Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], answer: 0 },
          { q: "Welches Gas macht den Großteil der Erdatmosphäre aus?", options: ["Stickstoff", "Sauerstoff", "CO₂", "Wasserstoff"], answer: 0 },
        ],
        [
          { q: "Chemisches Symbol für Natrium?", options: ["Na", "So", "Sd", "Nm"], answer: 0 },
          { q: "Welches Teilchen ist negativ geladen?", options: ["Elektron", "Proton", "Neutron", "Photon"], answer: 0 },
          { q: "Wie schnell ist das Licht ungefähr?", options: ["300.000 km/s", "30.000 km/s", "3.000 km/s", "3 Mio. km/s"], answer: 0 },
          { q: "Wer begründete die Evolution durch natürliche Selektion?", options: ["Darwin", "Newton", "Mendel", "Pasteur"], answer: 0 },
        ],
      ],
    },

    history: {
      label: "🏛️ Politik & Geschichte",
      levels: [
        [
          { q: "Welche Hochkultur baute die Pyramiden von Gizeh?", options: ["Ägypter", "Römer", "Griechen", "Azteken"], answer: 0 },
          { q: "Wer war der erste US-Präsident?", options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"], answer: 0 },
          { q: "Die Große Mauer steht in welchem Land?", options: ["China", "Japan", "Indien", "Mongolei"], answer: 0 },
          { q: "Welches Schiff sank berühmt 1912?", options: ["Titanic", "Lusitania", "Bismarck", "Mayflower"], answer: 0 },
        ],
        [
          { q: "In welchem Jahr endete der Zweite Weltkrieg?", options: ["1945", "1918", "1939", "1950"], answer: 0 },
          { q: "Wer bemalte die Decke der Sixtinischen Kapelle?", options: ["Michelangelo", "Da Vinci", "Raffael", "Donatello"], answer: 0 },
          { q: "Die Französische Revolution begann in welchem Jahr?", options: ["1789", "1689", "1815", "1848"], answer: 0 },
          { q: "Welche Mauer fiel 1989?", options: ["Berliner Mauer", "Chinesische Mauer", "Hadrianswall", "Wall Street"], answer: 0 },
        ],
        [
          { q: "Wer war im Großteil des 2. Weltkriegs britischer Premier?", options: ["Winston Churchill", "Neville Chamberlain", "Clement Attlee", "Margaret Thatcher"], answer: 0 },
          { q: "Wer war der letzte Zar von Russland?", options: ["Nikolaus II.", "Alexander III.", "Peter der Große", "Iwan IV."], answer: 0 },
          { q: "In welchem Jahr zerfiel die Sowjetunion?", options: ["1991", "1989", "1985", "1993"], answer: 0 },
          { q: "Kleopatra herrschte über welches Reich?", options: ["Ägypten", "Rom", "Griechenland", "Persien"], answer: 0 },
        ],
      ],
    },

    leisure: {
      label: "🏖️ Freizeit & Urlaub",
      levels: [
        [
          { q: "Der Eiffelturm steht in welcher Stadt?", options: ["Paris", "London", "Rom", "Madrid"], answer: 0 },
          { q: "Welches Land ist berühmt für Pizza und Pasta?", options: ["Italien", "Spanien", "Griechenland", "Frankreich"], answer: 0 },
          { q: "Wie nennt man einen Urlaub auf einem großen Schiff?", options: ["Kreuzfahrt", "Safari", "Roadtrip", "Trekking"], answer: 0 },
          { q: "Welchen Ozean überquerst du von London nach New York?", options: ["Atlantik", "Pazifik", "Indischer", "Arktischer"], answer: 0 },
        ],
        [
          { q: "Das Kolosseum steht in welcher Stadt?", options: ["Rom", "Athen", "Kairo", "Istanbul"], answer: 0 },
          { q: "In welchem Land steht das Taj Mahal?", options: ["Indien", "Pakistan", "Iran", "Nepal"], answer: 0 },
          { q: "Welche Stadt ist berühmt für Kanäle und Gondeln?", options: ["Venedig", "Amsterdam", "Hamburg", "Brügge"], answer: 0 },
          { q: "Der Mount Everest grenzt an Nepal und welches Land?", options: ["China", "Indien", "Bhutan", "Pakistan"], answer: 0 },
        ],
        [
          { q: "Welches Land hat die meisten UNESCO-Welterbestätten?", options: ["Italien", "Frankreich", "Spanien", "China"], answer: 0 },
          { q: "Die Währung Japans ist der?", options: ["Yen", "Won", "Yuan", "Ringgit"], answer: 0 },
          { q: "Welcher Berg ist der höchste Afrikas?", options: ["Kilimandscharo", "Mount Kenya", "Atlas", "Tafelberg"], answer: 0 },
          { q: "Machu Picchu liegt in welchem Land?", options: ["Peru", "Mexiko", "Bolivien", "Chile"], answer: 0 },
        ],
      ],
    },

    videogames: {
      label: "🎮 Videospiele",
      levels: [
        [
          { q: "Was macht der rote Pilz in Super Mario?", options: ["Macht ihn größer", "Tötet ihn", "Lässt ihn fliegen", "Nichts"], answer: 0 },
          { q: "Welche Firma stellt die PlayStation her?", options: ["Sony", "Microsoft", "Nintendo", "Sega"], answer: 0 },
          { q: "Welcher Mob explodiert in Minecraft?", options: ["Creeper", "Zombie", "Skelett", "Kuh"], answer: 0 },
          { q: "Welche Farbe hat Sonic the Hedgehog?", options: ["Blau", "Rot", "Grün", "Gelb"], answer: 0 },
        ],
        [
          { q: "Welche Firma stellt die Xbox her?", options: ["Microsoft", "Sony", "Nintendo", "Valve"], answer: 0 },
          { q: "Welchen Typ hat Pikachu in Pokémon?", options: ["Elektro", "Feuer", "Wasser", "Pflanze"], answer: 0 },
          { q: "Meistverkauftes Videospiel aller Zeiten?", options: ["Minecraft", "Tetris", "GTA V", "Wii Sports"], answer: 0 },
          { q: "In Counter-Strike ist die 'AWP' ein/e?", options: ["Scharfschützengewehr", "Pistole", "Granate", "Messer"], answer: 0 },
        ],
        [
          { q: "Welches Studio erschuf The Legend of Zelda?", options: ["Nintendo", "Capcom", "Square Enix", "Sega"], answer: 0 },
          { q: "Was zerstörst du in League of Legends zuletzt?", options: ["Nexus", "Inhibitor", "Baron", "Turm"], answer: 0 },
          { q: "Wann erschien das erste Super Mario Bros.?", options: ["1985", "1990", "1981", "1995"], answer: 0 },
          { q: "Welches Spiel spielt auf 'Pandora' mit 'Vault Huntern'?", options: ["Borderlands", "Fallout", "Destiny", "Halo"], answer: 0 },
        ],
      ],
    },

    football: {
      label: "⚽ Fußball",
      levels: [
        [
          { q: "Wie viele Spieler pro Team stehen auf dem Feld?", options: ["11", "9", "10", "12"], answer: 0 },
          { q: "Wie viele Punkte zählt ein Tor?", options: ["1", "2", "3", "0"], answer: 0 },
          { q: "Welcher Spieler hat den Spitznamen 'CR7'?", options: ["Cristiano Ronaldo", "Lionel Messi", "Neymar", "Mbappé"], answer: 0 },
          { q: "Welche Kartenfarbe bedeutet Platzverweis?", options: ["Rot", "Gelb", "Grün", "Blau"], answer: 0 },
        ],
        [
          { q: "Welches Land gewann die WM 2022?", options: ["Argentinien", "Frankreich", "Brasilien", "Deutschland"], answer: 0 },
          { q: "Welcher Klub prägte Messis berühmte Ära?", options: ["FC Barcelona", "Real Madrid", "Juventus", "Chelsea"], answer: 0 },
          { q: "Wie lange dauert ein Spiel (ohne Nachspielzeit)?", options: ["90 Minuten", "60 Minuten", "120 Minuten", "100 Minuten"], answer: 0 },
          { q: "Welches Land hat die meisten WM-Titel?", options: ["Brasilien", "Deutschland", "Italien", "Argentinien"], answer: 0 },
        ],
        [
          { q: "Welches Land gewann die erste WM 1930?", options: ["Uruguay", "Brasilien", "Argentinien", "Italien"], answer: 0 },
          { q: "Wer hat die meisten Ballon-d'Or-Titel?", options: ["Lionel Messi", "Cristiano Ronaldo", "Michel Platini", "Johan Cruyff"], answer: 0 },
          { q: "Welcher Klub hat die meisten Champions-League-Titel?", options: ["Real Madrid", "AC Mailand", "Bayern München", "Liverpool"], answer: 0 },
          { q: "Wann wurde Deutschland zuletzt Weltmeister?", options: ["2014", "2010", "2006", "2018"], answer: 0 },
        ],
      ],
    },

    starwars: {
      label: "⭐ Star Wars",
      levels: [
        // Aufwärmen
        [
          { q: "Welche Waffe benutzen Jedi?", options: ["Lichtschwert", "Blaster", "Bogen", "Speer"], answer: 0 },
          { q: "Wer ist Luke Skywalkers Vater?", options: ["Darth Vader", "Obi-Wan", "Yoda", "Han Solo"], answer: 0 },
          { q: "Was für ein Wesen ist Chewbacca?", options: ["Wookiee", "Ewok", "Hutte", "Droide"], answer: 0 },
          { q: "Vervollständige: 'Möge die ___ mit dir sein.'", options: ["Macht", "Kraft", "Stärke", "Energie"], answer: 0 },
          { q: "Welche Farbe haben Sith-Lichtschwerter?", options: ["Rot", "Blau", "Grün", "Lila"], answer: 0 },
          { q: "Wie heißen die weiß gepanzerten Soldaten des Imperiums?", options: ["Sturmtruppen", "Droidekas", "Sith-Wachen", "Kopfgeldjäger"], answer: 0 },
          { q: "Welcher kleine grüne Jedi-Meister bildete Luke aus?", options: ["Yoda", "Obi-Wan", "Mace Windu", "Qui-Gon"], answer: 0 },
          { q: "Auf welchem Wüstenplaneten wächst Luke auf?", options: ["Tatooine", "Naboo", "Endor", "Hoth"], answer: 0 },
        ],
        // Leicht
        [
          { q: "Welche Farbe hat Yodas Lichtschwert?", options: ["Grün", "Blau", "Rot", "Lila"], answer: 0 },
          { q: "Wer wird in Episode V in Karbonit eingefroren?", options: ["Han Solo", "Luke", "Lando", "Boba Fett"], answer: 0 },
          { q: "Wie heißt Han Solos Schiff?", options: ["Millennium Falke", "X-Wing", "Slave I", "Sternzerstörer"], answer: 0 },
          { q: "Welche Farbe hat Mace Windus Lichtschwert?", options: ["Lila", "Grün", "Blau", "Rot"], answer: 0 },
          { q: "Welche Prinzessin rettet Luke in Episode IV?", options: ["Leia", "Padmé", "Rey", "Mon Mothma"], answer: 0 },
          { q: "Wie heißt die riesige planetenzerstörende Station des Imperiums?", options: ["Todesstern", "Starkiller-Basis", "Sternzerstörer", "Die Zitadelle"], answer: 0 },
          { q: "Welche pelzigen Wesen helfen, das Imperium auf Endor zu besiegen?", options: ["Ewoks", "Wookiees", "Jawas", "Gungans"], answer: 0 },
          { q: "Was ist R2-D2?", options: ["Ein Astromech-Droide", "Ein Protokoll-Droide", "Ein Kopfgeldjäger", "Ein Sternjäger"], answer: 0 },
          { q: "Wessen Padawan ist Anakin Skywalker?", options: ["Obi-Wan Kenobi", "Yoda", "Mace Windu", "Qui-Gon Jinn"], answer: 0 },
        ],
        // Mittel
        [
          { q: "Wie lautet der Sith-Name des Imperators?", options: ["Darth Sidious", "Darth Plagueis", "Darth Maul", "Darth Tyranus"], answer: 0 },
          { q: "Auf welchem Planeten versteckt sich Yoda?", options: ["Dagobah", "Tatooine", "Endor", "Hoth"], answer: 0 },
          { q: "Was ist die Order 66?", options: ["Befehl, die Jedi zu töten", "Eine Klon-Einheit", "Ein Senatsgesetz", "Eine Raumstation"], answer: 0 },
          { q: "Wer ist Anakins Padawan in The Clone Wars?", options: ["Ahsoka Tano", "Rey", "Barriss Offee", "Padmé"], answer: 0 },
          { q: "Was für eine Spezies ist Jabba?", options: ["Hutte", "Wookiee", "Twi'lek", "Toydarianer"], answer: 0 },
          { q: "Welcher Kopfgeldjäger fängt Han Solo für Jabba?", options: ["Boba Fett", "Jango Fett", "Greedo", "Bossk"], answer: 0 },
          { q: "Wie heißt der Waldmond in Die Rückkehr der Jedi-Ritter?", options: ["Endor", "Yavin 4", "Kashyyyk", "Takodana"], answer: 0 },
          { q: "Welchen Planeten zerstört der Todesstern in Episode IV?", options: ["Alderaan", "Naboo", "Corellia", "Jakku"], answer: 0 },
          { q: "Wie heißt der Eisplanet in Das Imperium schlägt zurück?", options: ["Hoth", "Dagobah", "Mustafar", "Ilum"], answer: 0 },
        ],
        // Schwer
        [
          { q: "Welcher Kristall treibt ein Lichtschwert an?", options: ["Kyberkristall", "Dilithium", "Beskar", "Aurodium"], answer: 0 },
          { q: "Wie heißt die Heimatwelt der Wookiees?", options: ["Kashyyyk", "Kamino", "Geonosis", "Felucia"], answer: 0 },
          { q: "Wie viele Lichtschwerter führt General Grievous gleichzeitig?", options: ["Vier", "Zwei", "Drei", "Sechs"], answer: 0 },
          { q: "Wie lautet der echte Name des Mandalorianers?", options: ["Din Djarin", "Boba Fett", "Cobb Vanth", "Paz Vizsla"], answer: 0 },
          { q: "Wie heißt Boba Fetts Schiff?", options: ["Slave I", "Ghost", "Razor Crest", "Outrider"], answer: 0 },
          { q: "Auf welchem Vulkanplaneten wird Anakin zu Vader?", options: ["Mustafar", "Mygeeto", "Utapau", "Sullust"], answer: 0 },
          { q: "Auf welchem Hauptstadtplaneten steht der Jedi-Tempel?", options: ["Coruscant", "Naboo", "Corellia", "Chandrila"], answer: 0 },
          { q: "Aus welchem Metall besteht die Rüstung der Mandalorianer?", options: ["Beskar", "Cortosis", "Phrik", "Durastahl"], answer: 0 },
          { q: "Welcher Jedi besiegt Darth Maul in Episode I?", options: ["Obi-Wan Kenobi", "Qui-Gon Jinn", "Yoda", "Mace Windu"], answer: 0 },
          { q: "Wer ist Reys Großvater in der Sequel-Trilogie?", options: ["Palpatine", "Obi-Wan", "Luke", "Snoke"], answer: 0 },
        ],
        // Für Kenner
        [
          { q: "Wer war Palpatines eigener Sith-Meister?", options: ["Darth Plagueis", "Darth Bane", "Darth Maul", "Darth Tyranus"], answer: 0 },
          { q: "Wie lautet Count Dookus Sith-Titel?", options: ["Darth Tyranus", "Darth Sidious", "Darth Nihilus", "Darth Revan"], answer: 0 },
          { q: "Wie heißt Anakins Mutter?", options: ["Shmi Skywalker", "Padmé Amidala", "Beru Lars", "Mon Mothma"], answer: 0 },
          { q: "Welcher Jedi bildet Grogu am Ende von The Mandalorian Staffel 2 aus?", options: ["Luke Skywalker", "Ahsoka Tano", "Ezra Bridger", "Obi-Wan Kenobi"], answer: 0 },
          { q: "Wie heißt die zur Superwaffe umgebaute Basis der Ersten Ordnung?", options: ["Starkiller-Basis", "Todesstern III", "Die Eclipse", "Malevolence"], answer: 0 },
          { q: "Wer führte 1977 bei Krieg der Sterne Regie?", options: ["George Lucas", "Irvin Kershner", "Richard Marquand", "J.J. Abrams"], answer: 0 },
          { q: "Wie lautet die Kennung von Klon-Captain Rex?", options: ["CT-7567", "CC-2224", "CT-5555", "CC-1010"], answer: 0 },
          { q: "Wer war Qui-Gon Jinns eigener Jedi-Meister?", options: ["Count Dooku", "Yoda", "Mace Windu", "Ki-Adi-Mundi"], answer: 0 },
          { q: "Welche Spezies ist Darth Maul?", options: ["Zabrak", "Twi'lek", "Chiss", "Nautolaner"], answer: 0 },
          { q: "Welchen Admiral befördert Vader, nachdem er Ozzel mit der Macht erwürgt?", options: ["Piett", "Tarkin", "Thrawn", "Krennic"], answer: 0 },
          { q: "Wie heißt die Raumhafenstadt mit der Cantina auf Tatooine?", options: ["Mos Eisley", "Mos Espa", "Anchorhead", "Bestine"], answer: 0 },
          { q: "Welche Sith-Regel begrenzt ihre Zahl auf zwei?", options: ["Die Regel der Zwei", "Der Sith-Kodex", "Die Regel des Einen", "Das Bane-Gesetz"], answer: 0 },
        ],
      ],
    },

    marvel: {
      label: "🦸 Marvel",
      levels: [
        [
          { q: "Wie heißt Iron Mans Alter Ego?", options: ["Tony Stark", "Steve Rogers", "Bruce Banner", "Peter Parker"], answer: 0 },
          { q: "Welche Farbe hat der Hulk?", options: ["Grün", "Blau", "Rot", "Grau"], answer: 0 },
          { q: "Wer schwingt den Hammer Mjölnir?", options: ["Thor", "Loki", "Odin", "Hela"], answer: 0 },
          { q: "Spider-Mans Alter Ego ist?", options: ["Peter Parker", "Tony Stark", "Clark Kent", "Bruce Wayne"], answer: 0 },
        ],
        [
          { q: "Hauptbösewicht in Avengers: Infinity War?", options: ["Thanos", "Ultron", "Loki", "Kang"], answer: 0 },
          { q: "Woraus besteht Captain Americas Schild?", options: ["Vibranium", "Adamantium", "Titan", "Stahl"], answer: 0 },
          { q: "Black Panther ist König welchen Landes?", options: ["Wakanda", "Sokovia", "Latveria", "Genosha"], answer: 0 },
          { q: "Wie viele Infinity-Steine gibt es?", options: ["6", "5", "7", "4"], answer: 0 },
        ],
        [
          { q: "In welcher Stadt steht Doctor Stranges Sanctum?", options: ["New York", "London", "Hongkong", "Kamar-Taj"], answer: 0 },
          { q: "Wer ist Star-Lord?", options: ["Peter Quill", "Peter Parker", "Scott Lang", "Stephen Strange"], answer: 0 },
          { q: "Wie heißt Thors Heimatwelt?", options: ["Asgard", "Vanaheim", "Jotunheim", "Midgard"], answer: 0 },
          { q: "Welcher Stein ist auf Vormir versteckt?", options: ["Seelenstein", "Machtstein", "Gedankenstein", "Zeitstein"], answer: 0 },
        ],
      ],
    },

    // Spezielle Spieleabend-Kategorie — goldener Chip (siehe .chip[data-pool="mcgregor"]).
    mcgregor: {
      label: "🥊 McGregor",
      levels: [
        // Stufe 1 — Basis (Gelegenheitsfan)
        [
          { q: "Wie lautet Conor McGregors Spitzname?", options: ["The Notorious", "The Eagle", "Iron", "The Spider"], answer: 0 },
          { q: "Aus welcher Stadt stammt McGregor?", options: ["Dublin", "Cork", "Belfast", "Limerick"], answer: 0 },
          { q: "In welcher Organisation kämpft McGregor hauptsächlich?", options: ["UFC", "Bellator", "ONE Championship", "PFL"], answer: 0 },
          { q: "Wie viele UFC-Titel hielt McGregor gleichzeitig — ein Novum in der UFC?", options: ["Zwei", "Drei", "Einen", "Vier"], answer: 0 },
          { q: "McGregors zwei UFC-Gürtel waren im Federgewicht und in welcher Klasse?", options: ["Leichtgewicht", "Weltergewicht", "Bantamgewicht", "Mittelgewicht"], answer: 0 },
          { q: "In wie vielen Sekunden schlug McGregor José Aldo k.o.?", options: ["13", "6", "20", "40"], answer: 0 },
          { q: "Gegen welche Box-Legende trat McGregor 2017 im Boxkampf an?", options: ["Floyd Mayweather", "Manny Pacquiao", "Canelo Álvarez", "Anthony Joshua"], answer: 0 },
          { q: "Was für ein Getränk ist McGregors 'Proper No. Twelve'?", options: ["Irischer Whiskey", "Wodka", "Bier", "Energydrink"], answer: 0 },
          { q: "Welche Hand ist McGregors Markenzeichen-Waffe?", options: ["Die linke", "Die rechte", "Beide gleich", "Seine Ellbogen"], answer: 0 },
          { q: "Wofür ist McGregor vor Kämpfen berühmt?", options: ["Trash Talk und Vorhersagen", "Stille und Meditation", "Alle Interviews absagen", "Gedichte vorlesen"], answer: 0 },
          { q: "Welches Land vertritt McGregor mit Stolz — oft in dessen Flagge gehüllt?", options: ["Irland", "Schottland", "England", "Wales"], answer: 0 },
          { q: "Welchen Federgewichts-Champion schlug McGregor berühmt in Sekunden k.o.?", options: ["José Aldo", "Max Holloway", "Chad Mendes", "Frankie Edgar"], answer: 0 },
          { q: "In welchem Film von 2024 gab McGregor sein Schauspiel-Debüt?", options: ["Road House", "The Beekeeper", "Warrior", "Rumble"], answer: 0 },
          { q: "Wer spielte an McGregors Seite in Road House (2024)?", options: ["Jake Gyllenhaal", "Tom Hardy", "Chris Hemsworth", "Matt Damon"], answer: 0 },
          { q: "2021 kürte Forbes McGregor zum weltweit bestbezahlten was?", options: ["Sportler", "Schauspieler", "Musiker", "CEO"], answer: 0 },
          { q: "In welchem Monat hat McGregor Geburtstag?", options: ["Juli", "Januar", "März", "Oktober"], answer: 0 },
          { q: "In welchem Gym trainiert McGregor?", options: ["SBG Ireland", "Team Alpha Male", "American Top Team", "Jackson-Wink"], answer: 0 },
          { q: "Wer ist McGregors langjähriger Cheftrainer?", options: ["John Kavanagh", "Javier Mendez", "Firas Zahabi", "Dana White"], answer: 0 },
          { q: "Der Großteil von McGregors Profisiegen kam auf welche Weise zustande?", options: ["Knockout", "Submission", "Punktentscheid", "Disqualifikation"], answer: 0 },
          { q: "2026 kehrte McGregor bei UFC 329 gegen wen zurück — nach rund 5 Jahren Pause?", options: ["Max Holloway", "Dustin Poirier", "Michael Chandler", "Nate Diaz"], answer: 0 },
        ],
        // Stufe 2 — Normal (interessierter Fan)
        [
          { q: "McGregors UFC-Debüt 2013 war ein TKO in Runde 1 gegen wen?", options: ["Marcus Brimage", "Diego Brandão", "Dennis Siver", "Max Holloway"], answer: 0 },
          { q: "Bei seinem Sieg über Max Holloway 2013 zog sich McGregor welche Verletzung zu?", options: ["Kreuzbandriss", "Handbruch", "Beinbruch", "Bizepsriss"], answer: 0 },
          { q: "Bei UFC 189 gewann McGregor den Interims-Federgewichtstitel gegen welchen Kurzfrist-Ersatz?", options: ["Chad Mendes", "José Aldo", "Frankie Edgar", "Dennis Siver"], answer: 0 },
          { q: "McGregors 13-Sekunden-K.o. gegen José Aldo fiel bei welchem Event?", options: ["UFC 194", "UFC 189", "UFC 205", "UFC 196"], answer: 0 },
          { q: "Welcher Rivale schlug McGregor bei UFC 196, bevor McGregor im Rückkampf ausglich?", options: ["Nate Diaz", "Dustin Poirier", "Eddie Alvarez", "Chad Mendes"], answer: 0 },
          { q: "Wie besiegte McGregor bei UFC 202 Nate Diaz im Rückkampf?", options: ["Mehrheitsentscheidung", "Knockout", "Submission", "Unentschieden"], answer: 0 },
          { q: "McGregor gewann den UFC-Leichtgewichtstitel per K.o. gegen wen bei UFC 205?", options: ["Eddie Alvarez", "Rafael dos Anjos", "Justin Gaethje", "Dustin Poirier"], answer: 0 },
          { q: "McGregors Box-Megafight gegen Floyd Mayweather 2017 war eines der größten was der Geschichte?", options: ["Pay-per-View-Events", "Amateurkämpfe", "Titelverteidigungen", "Schaukämpfe mit Remis"], answer: 0 },
          { q: "Etwa welcher Anteil von McGregors Profisiegen kommt durch Knockout zustande?", options: ["Etwa 90 %", "Etwa 50 %", "Etwa 30 %", "Etwa 70 %"], answer: 0 },
          { q: "McGregor besiegte Donald 'Cowboy' Cerrone bei UFC 246 in welcher Zeit?", options: ["40 Sekunden", "13 Sekunden", "2 Minuten", "4 Minuten"], answer: 0 },
          { q: "Der Cerrone-Sieg machte McGregor zum ersten UFC-Kämpfer mit K.o.-Siegen in wie vielen Gewichtsklassen?", options: ["Drei", "Zwei", "Vier", "Fünf"], answer: 0 },
          { q: "McGregor hat Max Holloway schon einmal besiegt — in welchem Jahr war ihr erster Kampf?", options: ["2013", "2016", "2011", "2019"], answer: 0 },
          { q: "Wie oft verlor McGregor im UFC-Federgewicht?", options: ["Nie", "Einmal", "Zweimal", "Dreimal"], answer: 0 },
          { q: "Als erster UFC-Kämpfer mit zwei Titeln gleichzeitig bekam McGregor welchen Beinamen?", options: ["Champ-Champ", "Double-K", "Twin King", "Grand-Slam-Champ"], answer: 0 },
          { q: "McGregor verkaufte Proper No. Twelve in einem Deal mit welchem Höchstwert?", options: ["600 Mio. $", "100 Mio. $", "1 Mrd. $", "250 Mio. $"], answer: 0 },
          { q: "Welchen Bösewicht spielte McGregor in Road House (2024)?", options: ["Knox", "Dalton", "Brandt", "Wesley"], answer: 0 },
          { q: "Wie viele signifikante Treffer landet McGregor etwa pro Minute?", options: ["5+", "Etwa 1", "Etwa 3", "Etwa 10"], answer: 0 },
          { q: "Welche Marke war ein Werbepartner von McGregor?", options: ["Monster Energy", "Red Bull", "Coca-Cola", "Gatorade"], answer: 0 },
          { q: "In welchem Jahr gelang McGregor sein MMA-Profidebütsieg?", options: ["2008", "2006", "2010", "2013"], answer: 0 },
          { q: "Wer ist McGregors Agent bei Paradigm Sports?", options: ["Audie Attar", "Ari Emanuel", "Dana White", "Scott Coker"], answer: 0 },
        ],
        // Stufe 3 — Schwer (für Kenner)
        [
          { q: "McGregor beendete sein Debüt gegen Marcus Brimage zu welcher Zeit in Runde 1?", options: ["1:07", "0:40", "2:32", "4:05"], answer: 0 },
          { q: "McGregors Comeback nach dem Kreuzbandriss (Juli 2014, Dublin) war ein Runde-1-TKO gegen wen?", options: ["Diego Brandão", "Dennis Siver", "Marcus Brimage", "Chad Mendes"], answer: 0 },
          { q: "Welchen Bonus erhielt McGregor bei seiner Dublin-Rückkehr im Juli 2014?", options: ["Performance of the Night", "Fight of the Night", "Submission of the Night", "K.o. des Jahres"], answer: 0 },
          { q: "McGregor traf zum ersten Mal bei welchem Event 2014 auf Dustin Poirier?", options: ["UFC 178", "UFC 189", "UFC 194", "UFC 196"], answer: 0 },
          { q: "Wen stoppte McGregor im Januar 2015, um den Aldo-Titelkampf zu erhalten?", options: ["Dennis Siver", "Diego Brandão", "Chad Mendes", "Marcus Brimage"], answer: 0 },
          { q: "Der Interims-Titelsieg gegen Chad Mendes kam bei welchem Event?", options: ["UFC 189", "UFC 194", "UFC 178", "UFC 205"], answer: 0 },
          { q: "Der José-Aldo-K.o. wurde offiziell mit welcher Zeit in Runde 1 notiert?", options: ["13 Sekunden", "6 Sekunden", "40 Sekunden", "20 Sekunden"], answer: 0 },
          { q: "In welchem Jahr wurde McGregor erstmals UFC-Federgewichts-Champion?", options: ["2015", "2013", "2016", "2014"], answer: 0 },
          { q: "McGregors K.o. gegen Eddie Alvarez fiel in welcher Runde?", options: ["Runde 2", "Runde 1", "Runde 3", "Runde 4"], answer: 0 },
          { q: "McGregors UFC-205-Titelsieg fand in welcher legendären Arena statt?", options: ["Madison Square Garden", "T-Mobile Arena", "The O2", "Staples Center"], answer: 0 },
          { q: "Der Cerrone-Finish (UFC 246) kam teils durch welche Schläge im Clinch?", options: ["Schulterschläge", "Ellbogen", "Knie", "Hammerfäuste"], answer: 0 },
          { q: "McGregors 13-Sekunden-K.o. gegen José Aldo war der schnellste Abschluss aller Zeiten in welcher Art UFC-Kampf?", options: ["Ein Titelkampf", "Ein Main Event", "Ein Debüt", "Ein Rückkampf"], answer: 0 },
          { q: "Wie viele Knockouts (K.o./TKO) weist McGregors Profibilanz auf?", options: ["19", "12", "22", "8"], answer: 0 },
          { q: "McGregors geplanter Kampf gegen Michael Chandler bei UFC 303 (Juni 2024) platzte weshalb?", options: ["Gebrochener Zeh", "Handbruch", "Krankheit", "Vertragsstreit"], answer: 0 },
          { q: "Wie viele Siege in Folge holte McGregor im UFC-Federgewicht?", options: ["7", "5", "6", "10"], answer: 0 },
          { q: "McGregors erster Nate-Diaz-Kampf (UFC 196) brachte etwa wie viele PPV-Käufe?", options: ["1,3 Millionen", "500.000", "800.000", "2 Millionen"], answer: 0 },
          { q: "McGregor erhielt für den ersten Diaz-Kampf eine damalige Rekord-Gage von wie viel?", options: ["1 Mio. $", "500.000 $", "3 Mio. $", "75 Mio. $"], answer: 0 },
          { q: "McGregors offengelegte UFC-Karriere-Einnahmen werden oft mit welcher Summe angegeben?", options: ["41,8 Mio. $", "600 Mio. $", "75 Mio. $", "250 Mio. $"], answer: 0 },
          { q: "Max Holloway, McGregors Gegner 2013 und 2026, stammt woher?", options: ["Hawaii", "Kalifornien", "Irland", "Brasilien"], answer: 0 },
          { q: "Der UFC-329-Rückkampf gegen Holloway wird in welcher Gewichtsklasse ausgetragen?", options: ["Weltergewicht (170 lb)", "Federgewicht (145 lb)", "Leichtgewicht (155 lb)", "Mittelgewicht (185 lb)"], answer: 0 },
          { q: "Der Whiskey Proper No. Twelve startete in welchem Monat und Jahr?", options: ["September 2018", "März 2017", "September 2016", "Dezember 2018"], answer: 0 },
          { q: "Der Name 'Proper No. Twelve' verweist auf welches Dubliner Viertel?", options: ["Crumlin / 'die 12'", "Temple Bar", "The Liberties", "Ballymun"], answer: 0 },
          { q: "Welche Spirituosenfirma (Eigentümer von Jose Cuervo und Bushmills) kaufte den Großteil von Proper No. Twelve?", options: ["Proximo Spirits", "Diageo", "Pernod Ricard", "Brown-Forman"], answer: 0 },
          { q: "Der 600-Mio.-$-Verkauf enthielt Berichten zufolge wie viel bereits in den ersten zwei Jahren verdient?", options: ["250 Mio. $", "100 Mio. $", "400 Mio. $", "50 Mio. $"], answer: 0 },
          { q: "In welchem Jahr führte McGregor die Forbes-Liste der bestbezahlten Sportler an?", options: ["2021", "2017", "2019", "2023"], answer: 0 },
          { q: "Für den Mayweather-Kampf verdiente McGregor Berichten zufolge etwa wie viel?", options: ["75 Mio. $", "30 Mio. $", "100 Mio. $", "41,8 Mio. $"], answer: 0 },
          { q: "McGregors 'Lamborghini-Yacht' (Tecnomar for Lamborghini 63) kostete Berichten zufolge etwa wie viel?", options: ["3,6 Mio. $", "600.000 $", "10 Mio. $", "250.000 $"], answer: 0 },
          { q: "Vor der UFC war McGregor der erste Europäer mit zwei gleichzeitigen Titeln in welcher Promotion?", options: ["Cage Warriors", "Bellator", "KSW", "BAMMA"], answer: 0 },
          { q: "McGregor unterschrieb bei der UFC in welchem Monat und Jahr?", options: ["Februar 2013", "April 2013", "Februar 2012", "Juni 2013"], answer: 0 },
          { q: "McGregors Cage-Warriors-Titel waren im Federgewicht und in welcher weiteren Klasse?", options: ["Leichtgewicht", "Bantamgewicht", "Weltergewicht", "Mittelgewicht"], answer: 0 },
          { q: "In welcher Grappling-Kunst hält McGregor einen schwarzen Gürtel?", options: ["Brazilian Jiu-Jitsu", "Judo", "Ringen", "Karate"], answer: 0 },
          { q: "Woher kommt McGregors Eigen-Spitzname 'Mystic Mac'?", options: ["Vorhersage von Kampfausgängen", "Seine Tattoos", "Sein Whiskey", "Seine Yacht"], answer: 0 },
          { q: "Wer führte bei Road House (2024) Regie?", options: ["Doug Liman", "Guy Ritchie", "Zack Snyder", "Michael Bay"], answer: 0 },
          { q: "Road House (2024) erschien über welchen Dienst?", options: ["Amazon (Prime Video)", "Netflix", "Disney+", "Apple TV+"], answer: 0 },
          { q: "McGregor tauchte als (später entfernte) Collab-Figur in welcher Videospielreihe auf?", options: ["Hitman", "Call of Duty", "EA Sports UFC", "Fortnite"], answer: 0 },
          { q: "Neben welchem UFC-Präsidenten wurde McGregor berühmt (und legte sich mit ihm an)?", options: ["Dana White", "Scott Coker", "Bob Arum", "Oscar De La Hoya"], answer: 0 },
          { q: "In welcher Runde stoppte McGregor Chad Mendes, um den Interimstitel zu holen?", options: ["Runde 2", "Runde 1", "Runde 3", "Runde 4"], answer: 0 },
          { q: "Wie viele von McGregors Profi-MMA-Siegen kamen durch Submission?", options: ["Einer", "Keiner", "Fünf", "Zehn"], answer: 0 },
          { q: "Am UFC-223-Media-Day (April 2018) warf McGregor was durch ein Busfenster?", options: ["Eine Sackkarre", "Einen Stuhl", "Eine Flasche", "Eine Hantel"], answer: 0 },
          { q: "McGregor war der erste Kämpfer der UFC-Geschichte, der was schaffte?", options: ["Zwei Titel gleichzeitig halten", "Durch Submission gewinnen", "In Europa headlinen", "In drei Klassen kämpfen"], answer: 0 },
          { q: "'Who the fook is that guy?' — an welchen Kämpfer war das 2015 gerichtet?", options: ["Jeremy Stephens", "Chad Mendes", "Nate Diaz", "Dennis Siver"], answer: 0 },
          { q: "'The double champ does what the fook he wants!' — gesagt nach der Champ-Champ-Nacht bei welchem Event?", options: ["UFC 205", "UFC 194", "UFC 229", "UFC 202"], answer: 0 },
          { q: "'Surprise, surprise… the king is back.' — nach dem Sieg über wen bei UFC 202?", options: ["Nate Diaz", "José Aldo", "Eddie Alvarez", "Dustin Poirier"], answer: 0 },
          { q: "'We're not here to take part, we're here to take over.' — nach dem Sieg über wen in Dublin (2014)?", options: ["Diego Brandão", "Dennis Siver", "Marcus Brimage", "Chad Mendes"], answer: 0 },
          { q: "'You can call me Mystic Mac…' — sagte McGregor zu Joe Rogan nach dem ersten Sieg über wen bei UFC 178?", options: ["Dustin Poirier", "Nate Diaz", "José Aldo", "Eddie Alvarez"], answer: 0 },
          { q: "McGregors 'red panty night'-Spruch (2015) war an welchen Kämpfer gerichtet?", options: ["Rafael dos Anjos", "Eddie Alvarez", "José Aldo", "Nate Diaz"], answer: 0 },
          { q: "'I'm cool with all the gods. Gods recognise gods.' — diese Sprüche kamen vor welchem Event 2016?", options: ["UFC 196", "UFC 194", "UFC 205", "UFC 202"], answer: 0 },
          { q: "Welchen Gegner nannte McGregor einen 'quiet little hillbilly from the back arse of nowhere'?", options: ["Dustin Poirier", "Nate Diaz", "Chad Mendes", "Eddie Alvarez"], answer: 0 },
          { q: "'Two things I like to do: whoop ass and look good…' — aus dem Aufbau zu seinem ersten Kampf gegen wen (2013)?", options: ["Max Holloway", "Marcus Brimage", "Diego Brandão", "Dustin Poirier"], answer: 0 },
          { q: "McGregors Prahlerei, zu 'übernehmen', galt zuerst welcher Klasse, in die er in der UFC einstieg?", options: ["Federgewicht", "Leichtgewicht", "Weltergewicht", "Bantamgewicht"], answer: 0 },
        ],
      ],
    },

    geography: {
      label: "🌍 Geografie",
      levels: [
        [
          { q: "Was ist die Hauptstadt von Frankreich?", options: ["Paris", "London", "Rom", "Madrid"], answer: 0 },
          { q: "Auf welchem Kontinent liegt Ägypten?", options: ["Afrika", "Asien", "Europa", "Südamerika"], answer: 0 },
          { q: "Welcher Ozean ist der größte?", options: ["Pazifik", "Atlantik", "Indischer", "Arktischer"], answer: 0 },
          { q: "Welches Land hat die Form eines Stiefels?", options: ["Italien", "Spanien", "Griechenland", "Portugal"], answer: 0 },
        ],
        [
          { q: "Was ist die Hauptstadt von Japan?", options: ["Tokio", "Peking", "Seoul", "Bangkok"], answer: 0 },
          { q: "Wie viele Kontinente gibt es?", options: ["7", "5", "6", "8"], answer: 0 },
          { q: "Die Sahara ist die größte heiße was der Welt?", options: ["Wüste", "Dschungel", "Schlucht", "Ebene"], answer: 0 },
          { q: "Welches Land hat die meisten Menschen? (2024)", options: ["Indien", "China", "USA", "Indonesien"], answer: 0 },
        ],
        [
          { q: "Was ist die Hauptstadt von Australien?", options: ["Canberra", "Sydney", "Melbourne", "Perth"], answer: 0 },
          { q: "In welchem Land steht der Kilimandscharo?", options: ["Tansania", "Kenia", "Uganda", "Äthiopien"], answer: 0 },
          { q: "Welcher Fluss gilt meist als der längste?", options: ["Nil", "Amazonas", "Jangtse", "Mississippi"], answer: 0 },
          { q: "In welches Meer mündet die Donau?", options: ["Schwarzes Meer", "Ostsee", "Nordsee", "Mittelmeer"], answer: 0 },
        ],
        [
          { q: "Was ist die Hauptstadt von Kanada?", options: ["Ottawa", "Toronto", "Vancouver", "Montreal"], answer: 0 },
          { q: "Welche Meerenge trennt Europa von Afrika?", options: ["Gibraltar", "Bosporus", "Hormus", "Bering"], answer: 0 },
          { q: "Welches afrikanische Land hat die meisten Menschen?", options: ["Nigeria", "Ägypten", "Äthiopien", "DR Kongo"], answer: 0 },
          { q: "In welchem Land liegt der Baikalsee?", options: ["Russland", "Mongolei", "Kasachstan", "China"], answer: 0 },
        ],
        [
          { q: "Was ist die Hauptstadt von Kasachstan?", options: ["Astana", "Almaty", "Taschkent", "Bischkek"], answer: 0 },
          { q: "Welches Land hat die längste Küstenlinie?", options: ["Kanada", "Russland", "Indonesien", "Australien"], answer: 0 },
          { q: "In welchem Land liegt die Atacama-Wüste größtenteils?", options: ["Chile", "Peru", "Bolivien", "Argentinien"], answer: 0 },
          { q: "Welches ist das kleinste Land der Welt?", options: ["Vatikanstadt", "Monaco", "San Marino", "Malta"], answer: 0 },
        ],
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.QuizQuestions = { de: DE, en: EN };
})(window);

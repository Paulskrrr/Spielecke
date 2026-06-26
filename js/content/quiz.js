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
        [
          { q: "What weapon do Jedi use?", options: ["Lightsaber", "Blaster", "Bow", "Spear"], answer: 0 },
          { q: "Who is Luke Skywalker's father?", options: ["Darth Vader", "Obi-Wan", "Yoda", "Han Solo"], answer: 0 },
          { q: "What kind of creature is Chewbacca?", options: ["Wookiee", "Ewok", "Hutt", "Droid"], answer: 0 },
          { q: "Complete: 'May the ___ be with you.'", options: ["Force", "Power", "Light", "Way"], answer: 0 },
        ],
        [
          { q: "What colour is Yoda's lightsaber?", options: ["Green", "Blue", "Red", "Purple"], answer: 0 },
          { q: "Who is frozen in carbonite in Episode V?", options: ["Han Solo", "Luke", "Lando", "Boba Fett"], answer: 0 },
          { q: "What is the name of Han Solo's ship?", options: ["Millennium Falcon", "X-Wing", "Slave I", "Star Destroyer"], answer: 0 },
          { q: "Mace Windu's lightsaber is which colour?", options: ["Purple", "Green", "Blue", "Red"], answer: 0 },
        ],
        [
          { q: "What is the Emperor's Sith name?", options: ["Darth Sidious", "Darth Plagueis", "Darth Maul", "Darth Tyranus"], answer: 0 },
          { q: "Which planet does Yoda hide on?", options: ["Dagobah", "Tatooine", "Endor", "Hoth"], answer: 0 },
          { q: "What is Order 66?", options: ["Order to kill the Jedi", "A clone battalion", "A Senate law", "A space station"], answer: 0 },
          { q: "Anakin's Padawan in The Clone Wars is?", options: ["Ahsoka Tano", "Rey", "Barriss Offee", "Padmé"], answer: 0 },
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
        [
          { q: "Welche Waffe benutzen Jedi?", options: ["Lichtschwert", "Blaster", "Bogen", "Speer"], answer: 0 },
          { q: "Wer ist Luke Skywalkers Vater?", options: ["Darth Vader", "Obi-Wan", "Yoda", "Han Solo"], answer: 0 },
          { q: "Was für ein Wesen ist Chewbacca?", options: ["Wookiee", "Ewok", "Hutte", "Droide"], answer: 0 },
          { q: "Vervollständige: 'Möge die ___ mit dir sein.'", options: ["Macht", "Kraft", "Stärke", "Energie"], answer: 0 },
        ],
        [
          { q: "Welche Farbe hat Yodas Lichtschwert?", options: ["Grün", "Blau", "Rot", "Lila"], answer: 0 },
          { q: "Wer wird in Episode V in Karbonit eingefroren?", options: ["Han Solo", "Luke", "Lando", "Boba Fett"], answer: 0 },
          { q: "Wie heißt Han Solos Schiff?", options: ["Millennium Falke", "X-Wing", "Slave I", "Sternzerstörer"], answer: 0 },
          { q: "Welche Farbe hat Mace Windus Lichtschwert?", options: ["Lila", "Grün", "Blau", "Rot"], answer: 0 },
        ],
        [
          { q: "Wie lautet der Sith-Name des Imperators?", options: ["Darth Sidious", "Darth Plagueis", "Darth Maul", "Darth Tyranus"], answer: 0 },
          { q: "Auf welchem Planeten versteckt sich Yoda?", options: ["Dagobah", "Tatooine", "Endor", "Hoth"], answer: 0 },
          { q: "Was ist die Order 66?", options: ["Befehl, die Jedi zu töten", "Eine Klon-Einheit", "Ein Senatsgesetz", "Eine Raumstation"], answer: 0 },
          { q: "Wer ist Anakins Padawan in The Clone Wars?", options: ["Ahsoka Tano", "Rey", "Barriss Offee", "Padmé"], answer: 0 },
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
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.QuizQuestions = { de: DE, en: EN };
})(window);

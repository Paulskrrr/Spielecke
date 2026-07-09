// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/imposter-hints.js — distant "decoy" hints for Imposter (optional mode)
 *
 * When the host turns on "Give imposters a hint" in the Imposter setup, each
 * imposter privately receives a HINT word instead of nothing. The hint is
 * deliberately DISTANT from the secret word:
 *   - You CANNOT guess the secret from the hint alone (forward test).
 *   - Once you know both, the link clicks and feels clever (hindsight test).
 * The gold standard: secret "Penalty" → hint "Nerves". You'd never derive
 * "Penalty" from "Nerves", but knowing both, it's obviously the nerve-wracking
 * spot-kick. It gives the faker just enough to bluff a sensible clue.
 *
 * Shape MIRRORS content/terms.js: { <lang>: { <poolKey>: { <term>: <hint> } } }.
 * Keys (terms) match the TERMS database EXACTLY for the pools Imposter offers
 * (everything except the drawing-only doodle_hard pool). Lookup in the game is
 * Spielecke.ImposterHints[lang][poolKey][secretWord]; a missing entry just means
 * no hint is shown for that word, so the game never breaks if one is absent.
 *
 * EDIT ME freely — tuning the "distance" of a hint is pure content work.
 */
(function (global) {
  "use strict";

  var HINTS = {
    en: {
      football: {
        "Messi": "Flea", "Ronaldo": "Vanity", "Neymar": "Drama", "Mbappé": "Acceleration",
        "Haaland": "Machinery", "Lewandowski": "Patience", "Salah": "Devotion", "De Bruyne": "Precision",
        "Kimmich": "Diligence", "Müller": "Intuition", "Neuer": "Sweeper", "Kroos": "Metronome",
        "FC Bayern": "Dominance", "Real Madrid": "Royalty", "FC Barcelona": "Philosophy",
        "Manchester City": "Wealth", "Liverpool": "Anthem", "Paris Saint-Germain": "Glamour",
        "Borussia Dortmund": "Youth", "Arsenal": "Cannon", "Juventus": "Stripes", "Chelsea": "Boardroom",
        "Hat-trick": "Triple", "Penalty": "Nerves", "Abseits": "Margin", "Freistoß": "Wall",
        "Ecke": "Swarm", "Kopfball": "Altitude", "Fallrückzieher": "Acrobat", "Rote Karte": "Banishment",
        "VAR": "Hesitation", "Champions League": "Prestige", "Weltmeisterschaft": "Patriotism",
        "Transferfenster": "Deadline", "Abstieg": "Despair", "Remontada": "Comeback", "Camp Nou": "Cathedral",
        "La Masia": "Nursery", "Tiki-Taka": "Hypnosis", "Xavi": "Conductor", "Iniesta": "Whisper",
        "Puyol": "Mane", "Guardiola": "Obsession", "Pedri": "Maturity", "Lamine Yamal": "Prodigy"
      },
      videogames: {
        "Respawn": "Mercy", "Boss Fight": "Dread", "Easter Egg": "Whisper", "Noob": "Mockery",
        "Speedrun": "Obsession", "Loot Box": "Temptation", "Cheat Code": "Guilt", "LAN Party": "Sleepover",
        "Creeper": "Startle", "Steve": "Ordinary", "Enderman": "Avoidance", "Diamond Pickaxe": "Grind",
        "Nether Portal": "Threshold", "Ender Dragon": "Finale", "Herobrine": "Paranoia", "Redstone": "Tinkering",
        "Dirt House": "Shame", "AWP": "Patience", "Headshot": "Precision", "Rush B": "Recklessness",
        "Flashbang": "Disorientation", "Knife Round": "Warmup", "Smoke Grenade": "Concealment",
        "Bomb Defusal": "Suspense", "Bastion": "Loneliness", "Tracer": "Cheer", "Reinhardt": "Chivalry",
        "Mercy": "Devotion", "D.Va": "Bravado", "Genji": "Discipline", "Widowmaker": "Coldness",
        "Payload": "Burden", "Yasuo": "Wandering", "Teemo": "Annoyance", "Jungle": "Solitude",
        "Baron Nashor": "Greed", "Dragon": "Hoard", "Nexus": "Collapse", "Gank": "Ambush",
        "Agent 47": "Detachment", "Electro Dragon": "Surge", "Town Hall": "Hierarchy"
      },
      general: {
        "Toothbrush": "Routine", "Alarm clock": "Dread", "Umbrella": "Forecast", "Sunglasses": "Anonymity",
        "Remote control": "Laziness", "Scissors": "Trust", "Microwave": "Impatience", "Washing machine": "Hum",
        "Stapler": "Bureaucracy", "Lighter": "Rebellion", "Pizza": "Sharing", "Sushi": "Precision",
        "Ice cream": "Childhood", "Burger": "Indulgence", "Popcorn": "Anticipation", "Coffee": "Survival",
        "Beer": "Belonging", "Nutella": "Temptation", "Avocado": "Status", "Bacon": "Sizzle",
        "Penguin": "Formality", "Dolphin": "Cleverness", "Flamingo": "Balance", "Sloth": "Patience",
        "Octopus": "Mystery", "Panda": "Diplomacy", "Kangaroo": "Bounce", "Hamster": "Futility",
        "Giraffe": "Awkwardness", "Crow": "Omen", "Sauna": "Endurance", "Dentist": "Confession",
        "Airport": "Limbo", "Casino": "Delusion", "Gym": "Resolution", "Roller coaster": "Surrender",
        "Flea market": "Nostalgia", "Traffic jam": "Helplessness", "Power outage": "Stillness",
        "Hospital": "Fragility", "First date": "Performance", "Job interview": "Pretense", "Hangover": "Remorse",
        "Moving apartment": "Upheaval", "Surprise party": "Conspiracy", "Road trip": "Freedom",
        "All-nighter": "Deadline", "Sunburn": "Negligence"
      },
      party: {
        "Beer pong": "Aim", "Hangover": "Regret", "Tequila shot": "Courage", "Nightclub": "Anonymity",
        "Karaoke": "Embarrassment", "Designated driver": "Sacrifice", "Kebab at 4am": "Forgiveness",
        "Pre-game": "Anticipation", "Shots": "Recklessness", "Group chat": "Belonging"
      },
      science: {
        "Robot": "Obedience", "Rocket": "Goodbye", "Dinosaur": "Obsolete", "Volcano": "Pressure",
        "Telescope": "Patience", "Magnet": "Loyalty", "Light bulb": "Moth", "Battery": "Stamina",
        "Astronaut": "Solitude", "Alien": "Belonging", "Black hole": "Surrender", "Submarine": "Secrecy",
        "Drone": "Surveillance", "Microscope": "Detail", "Skeleton": "Mortality", "Brain": "Wrinkles",
        "Tornado": "Chaos", "Solar panel": "Idealism", "Self-driving car": "Trust",
        "Artificial intelligence": "Replacement", "Vaccine": "Mercy", "Atom": "Indivisible",
        "Satellite": "Eavesdrop", "3D printer": "Layers"
      },
      history: {
        "Napoleon": "Ambition", "Cleopatra": "Allure", "Julius Caesar": "Betrayal", "Albert Einstein": "Curiosity",
        "Abraham Lincoln": "Honesty", "Gandhi": "Patience", "Queen Elizabeth II": "Duty",
        "The Berlin Wall": "Separation", "The Pyramids": "Permanence", "The Titanic": "Hubris",
        "The French Revolution": "Hunger", "The Cold War": "Suspicion", "The Moon landing": "Wonder",
        "A Viking": "Wanderlust", "A Knight": "Loyalty", "A Pharaoh": "Eternity", "The Roman Empire": "Order",
        "A Dictator": "Fear", "The Stone Age": "Survival", "The Statue of Liberty": "Welcome",
        "The Eiffel Tower": "Romance", "World War II": "Rationing", "The Wild West": "Lawlessness",
        "A Crown": "Burden"
      },
      leisure: {
        "Beach": "Horizon", "Suitcase": "Indecision", "Sunscreen": "Foresight", "Deck chair": "Idleness",
        "Passport": "Identity", "Tent": "Improvisation", "Cruise ship": "Confinement", "Aeroplane": "Patience",
        "Snorkel": "Silence", "Pool cocktail": "Indulgence", "Souvenir": "Nostalgia", "Hiking boots": "Persistence",
        "Sunburn": "Carelessness", "Hotel buffet": "Gluttony", "Festival": "Chaos", "Road trip": "Spontaneity",
        "Hammock": "Surrender", "Beach ball": "Buoyancy", "Flip-flops": "Casualness", "Camper van": "Freedom",
        "Ski lift": "Suspense", "Map": "Doubt", "Selfie stick": "Vanity", "All-inclusive resort": "Excess"
      },
      power: {
        "Billionaire": "Zeros", "Crown": "Weight", "Gold bar": "Heft", "Briefcase of cash": "Anonymity",
        "Throne": "Solitude", "Diamond": "Coldness", "Stock market": "Anxiety", "President": "Loneliness",
        "Bank vault": "Silence", "Dictator": "Paranoia", "Bribe": "Whisper", "Lobbyist": "Persuasion",
        "Inheritance": "Resentment", "Private jet": "Escape", "Yacht": "Boredom", "Tax haven": "Secrecy",
        "Casino": "Desperation", "Crypto": "Volatility", "CEO": "Insomnia", "Red carpet": "Scrutiny",
        "Bodyguard": "Vigilance", "Penthouse": "Detachment"
      },
      famous: {
        "Beyoncé": "Hive", "The Rock": "Hustle", "Shrek": "Solitude", "Harry Potter": "Orphan",
        "Donald Trump": "Boardroom", "Lady Gaga": "Reinvention", "Conor McGregor": "Swagger",
        "Darth Vader": "Redemption", "Taylor Swift": "Diaries", "James Bond": "Composure", "Rihanna": "Cosmetics",
        "Billie Eilish": "Whisper", "Justin Bieber": "Prodigy", "Ariana Grande": "Ponytail",
        "Leonardo DiCaprio": "Climate", "Keanu Reeves": "Humble", "Margot Robbie": "Plastic", "Zendaya": "Poise",
        "Homer Simpson": "Donut", "Cristiano Ronaldo": "Vanity", "Lionel Messi": "Quiet", "LeBron James": "Longevity",
        "Lewis Hamilton": "Fashion", "Usain Bolt": "Relaxed", "Mike Tyson": "Doves", "Drake": "Sensitive",
        "Eminem": "Resentment", "Kanye West": "Ego", "Snoop Dogg": "Mellow", "Kendrick Lamar": "Pulitzer",
        "Nicki Minaj": "Alter", "Apache 207": "Sunglasses", "Elon Musk": "Memes", "Jeff Bezos": "Warehouse",
        "Mark Zuckerberg": "Privacy", "Steve Jobs": "Minimalism", "Bill Gates": "Philanthropy",
        "MrBeast": "Generosity", "Kim Kardashian": "Contour", "Barack Obama": "Hope"
      },
      nsfw: {
        "One-night stand": "Regret", "Strip club": "Temptation", "Sexting": "Distraction", "Walk of shame": "Daylight",
        "Booty call": "Convenience", "Friends with benefits": "Confusion", "Skinny dipping": "Liberation",
        "Your ex's new partner": "Comparison", "A drunk text you regret": "Cringe", "Threesome": "Jealousy",
        "Lap dance": "Tension", "Handcuffs": "Surrender", "Morning wood": "Inconvenience", "Quickie": "Efficiency",
        "Sugar daddy": "Dependency", "Safe word": "Trust", "Wet dream": "Subconscious", "Dirty talk": "Imagination",
        "Roleplay": "Pretence", "Friend zone": "Rejection", "Netflix and chill": "Pretext", "Hickey": "Evidence",
        "Blue balls": "Frustration", "Whipped cream": "Mess", "Massage parlour": "Discretion",
        "Period sex": "Squeamishness", "Dad bod": "Comfort"
      },
      starwars_easy: {
        "Darth Vader": "Asthma", "Luke Skywalker": "Whining", "Yoda": "Swamp", "Princess Leia": "Cinnamon",
        "Han Solo": "Debt", "Obi-Wan Kenobi": "Hermit", "Chewbacca": "Loyalty", "R2-D2": "Plucky",
        "C-3PO": "Fussy", "Emperor Palpatine": "Patience", "Boba Fett": "Inheritance", "Jango Fett": "Template",
        "Anakin Skywalker": "Sand", "Padmé Amidala": "Heartbreak", "Qui-Gon Jinn": "Maverick", "Mace Windu": "Composure",
        "Count Dooku": "Defection", "General Grievous": "Cough", "Jar Jar Binks": "Clumsiness", "Rey": "Scavenging",
        "Kylo Ren": "Tantrum", "Finn": "Conscience", "Poe Dameron": "Recklessness", "BB-8": "Roll",
        "Snoke": "Puppet", "Lando Calrissian": "Charm", "Jabba the Hutt": "Gluttony", "Admiral Ackbar": "Warning",
        "Darth Maul": "Vengeance", "The Mandalorian": "Creed", "Grogu": "Adoption", "Ahsoka Tano": "Departure",
        "Captain Rex": "Brotherhood", "Commander Cody": "Obedience", "Asajj Ventress": "Bounty", "Cad Bane": "Hat",
        "Hondo Ohnaka": "Opportunism", "Plo Koon": "Mask", "Aayla Secura": "Ambush", "Kit Fisto": "Grin"
      },
      starwars_hard: {
        "Nute Gunray": "Greed", "Greedo": "Misfire", "Bib Fortuna": "Sycophant", "Wedge Antilles": "Survivor",
        "Mon Mothma": "Resolve", "Bossk": "Regeneration", "IG-88": "Solitude", "Grand Moff Tarkin": "Arrogance",
        "Savage Opress": "Transformation", "Barriss Offee": "Disillusion", "Embo": "Acrobat", "Cassian Andor": "Sacrifice",
        "Jyn Erso": "Defiance", "K-2SO": "Bluntness", "Saw Gerrera": "Extremism", "Coruscant": "Sprawl",
        "Mandalore": "Tradition", "Dathomir": "Witchcraft", "Kamino": "Rain", "Geonosis": "Hive",
        "Mustafar": "Regret", "Kashyyyk": "Canopy", "Ryloth": "Spice", "Scarif": "Sacrifice", "Jedha": "Pilgrimage",
        "Darksaber": "Heirloom", "Holocron": "Knowledge", "Kyber Crystal": "Attunement", "Slave I": "Hand-me-down",
        "Star Destroyer": "Wedge", "AT-AT": "Stumble", "Thermal Detonator": "Bluff", "Order 66": "Betrayal",
        "Midi-Chlorians": "Bloodstream", "Youngling": "Innocence", "Rule of Two": "Scarcity", "Force Ghost": "Lingering",
        "The Clone Wars": "Attrition", "Carbonite": "Frozen", "Sarlacc": "Digestion", "Kessel Run": "Bragging"
      },
      marvel: {
        "Iron Man": "Sacrifice", "Captain America": "Loyalty", "Thor": "Unworthy", "Black Widow": "Atonement",
        "Hulk": "Restraint", "Hawkeye": "Family", "Nick Fury": "Secrets", "Spider-Man": "Guilt",
        "Doctor Strange": "Humbled", "Black Panther": "Tradition", "Ant-Man": "Parole", "Captain Marvel": "Erased",
        "War Machine": "Duty", "Falcon": "Inheritance", "Winter Soldier": "Brainwashed", "Scarlet Witch": "Grief",
        "Vision": "Mortality", "Quicksilver": "Brief", "Valkyrie": "Survivor", "Star-Lord": "Abducted",
        "Gamora": "Adopted", "Drax": "Literal", "Groot": "Selfless", "Rocket Raccoon": "Experiment",
        "Nebula": "Resentment", "Mantis": "Empathy", "Yondu": "Redemption", "Thanos": "Balance", "Loki": "Belonging",
        "Ultron": "Misguided", "Hela": "Firstborn", "Killmonger": "Abandoned", "Ego": "Vanity", "Mysterio": "Overlooked",
        "Vulture": "Provider", "Red Skull": "Punished", "Ronan": "Zealotry", "Aldrich Killian": "Slighted",
        "Agatha Harkness": "Envy", "Shuri": "Prodigy", "Okoye": "Conflicted", "Wong": "Patience",
        "Happy Hogan": "Devoted", "Pepper Potts": "Steadfast", "Phil Coulson": "Earnest", "Agent Hill": "Composed",
        "Daredevil": "Penance", "Jessica Jones": "Cynical", "Luke Cage": "Reluctant", "Punisher": "Bereaved",
        "Kingpin": "Refined", "Elektra": "Reborn"
      },
      onepiece: {
        "Monkey D. Luffy": "Tantrum", "Roronoa Zoro": "Lost", "Nami": "Forecast", "Usopp": "Stagefright",
        "Sanji": "Chivalry", "Tony Tony Chopper": "Outcast", "Nico Robin": "Survivor", "Franky": "Tinkering",
        "Brook": "Loneliness", "Jinbe": "Atonement", "Shanks": "Bartender", "Whitebeard": "Orphanage",
        "Portgas D. Ace": "Worth", "Sabo": "Amnesia", "Marco": "Loyalty", "Trafalgar Law": "Vendetta",
        "Boa Hancock": "Bashful", "Crocodile": "Drought", "Donquixote Doflamingo": "Strings",
        "Bartholomew Kuma": "Selflessness", "Gecko Moria": "Insomnia", "Buggy": "Misunderstood", "Mihawk": "Boredom",
        "Monkey D. Garp": "Duty", "Akainu": "Absolute", "Aokiji": "Lazy", "Kizaru": "Whimsy", "Sengoku": "Resignation",
        "Smoker": "Stubborn", "Tashigi": "Clumsy", "Coby": "Earnest", "Arlong": "Resentment", "Enel": "Megalomania",
        "Rob Lucci": "Coldness", "Katakuri": "Foresight", "Big Mom": "Hunger", "Kaido": "Despair",
        "Blackbeard": "Patience", "King": "Extinction", "Queen": "Showman", "Jack": "Devotion", "Yamato": "Inheritance",
        "Nefertari Vivi": "Birthright", "Bon Clay": "Sacrifice", "Perona": "Negativity", "Ivankov": "Transformation",
        "Silvers Rayleigh": "Retirement", "Gol D. Roger": "Acceptance"
      }
    },

    de: {
      football: {
        "Messi": "Floh", "Ronaldo": "Eitelkeit", "Neymar": "Theater", "Mbappé": "Beschleunigung",
        "Haaland": "Maschine", "Lewandowski": "Geduld", "Salah": "Hingabe", "De Bruyne": "Präzision",
        "Kimmich": "Fleiß", "Müller": "Instinkt", "Neuer": "Vorstopper", "Kroos": "Taktgeber",
        "FC Bayern": "Dominanz", "Real Madrid": "Königlich", "FC Barcelona": "Philosophie",
        "Manchester City": "Reichtum", "Liverpool": "Hymne", "Paris Saint-Germain": "Glamour",
        "Borussia Dortmund": "Jugend", "Arsenal": "Kanone", "Juventus": "Streifen", "Chelsea": "Vorstand",
        "Hat-trick": "Dreifach", "Penalty": "Nerven", "Abseits": "Hauchdünn", "Freistoß": "Mauer",
        "Ecke": "Gewühl", "Kopfball": "Höhe", "Fallrückzieher": "Akrobat", "Rote Karte": "Verbannung",
        "VAR": "Zögern", "Champions League": "Prestige", "Weltmeisterschaft": "Patriotismus",
        "Transferfenster": "Frist", "Abstieg": "Verzweiflung", "Remontada": "Aufholjagd", "Camp Nou": "Kathedrale",
        "La Masia": "Kinderstube", "Tiki-Taka": "Hypnose", "Xavi": "Dirigent", "Iniesta": "Flüstern",
        "Puyol": "Mähne", "Guardiola": "Besessenheit", "Pedri": "Reife", "Lamine Yamal": "Wunderkind"
      },
      videogames: {
        "Respawn": "Gnade", "Boss Fight": "Grauen", "Easter Egg": "Flüstern", "Noob": "Spott",
        "Speedrun": "Besessenheit", "Loot Box": "Versuchung", "Cheat Code": "Schuldgefühl", "LAN Party": "Übernachtung",
        "Creeper": "Schreck", "Steve": "Gewöhnlich", "Enderman": "Ausweichen", "Diamond Pickaxe": "Schuften",
        "Nether Portal": "Schwelle", "Ender Dragon": "Finale", "Herobrine": "Paranoia", "Redstone": "Tüfteln",
        "Dirt House": "Scham", "AWP": "Lauern", "Headshot": "Präzision", "Rush B": "Leichtsinn",
        "Flashbang": "Orientierungslosigkeit", "Knife Round": "Aufwärmen", "Smoke Grenade": "Verschleierung",
        "Bomb Defusal": "Nervenkitzel", "Bastion": "Einsamkeit", "Tracer": "Fröhlichkeit", "Reinhardt": "Ritterlichkeit",
        "Mercy": "Hingabe", "D.Va": "Draufgängertum", "Genji": "Disziplin", "Widowmaker": "Kälte",
        "Payload": "Bürde", "Yasuo": "Wandern", "Teemo": "Gereiztheit", "Jungle": "Einsamkeit",
        "Baron Nashor": "Gier", "Dragon": "Hort", "Nexus": "Zusammenbruch", "Gank": "Hinterhalt",
        "Agent 47": "Abgeklärtheit", "Electro Dragon": "Stromstoß", "Town Hall": "Hierarchie"
      },
      general: {
        "Zahnbürste": "Routine", "Wecker": "Grauen", "Regenschirm": "Vorhersage", "Sonnenbrille": "Anonymität",
        "Fernbedienung": "Faulheit", "Schere": "Vertrauen", "Mikrowelle": "Ungeduld", "Waschmaschine": "Summen",
        "Tacker": "Bürokratie", "Feuerzeug": "Rebellion", "Pizza": "Teilen", "Sushi": "Präzision",
        "Eis": "Kindheit", "Burger": "Völlerei", "Popcorn": "Vorfreude", "Kaffee": "Überleben",
        "Bier": "Zugehörigkeit", "Nutella": "Versuchung", "Avocado": "Status", "Speck": "Brutzeln",
        "Pinguin": "Förmlichkeit", "Delfin": "Schläue", "Flamingo": "Gleichgewicht", "Faultier": "Geduld",
        "Tintenfisch": "Rätsel", "Panda": "Diplomatie", "Känguru": "Sprungkraft", "Hamster": "Vergeblichkeit",
        "Giraffe": "Unbeholfenheit", "Krähe": "Vorzeichen", "Sauna": "Ausdauer", "Zahnarzt": "Geständnis",
        "Flughafen": "Schwebezustand", "Casino": "Täuschung", "Fitnessstudio": "Vorsatz", "Achterbahn": "Hingabe",
        "Flohmarkt": "Nostalgie", "Stau": "Ohnmacht", "Stromausfall": "Stille", "Krankenhaus": "Zerbrechlichkeit",
        "Erstes Date": "Aufführung", "Vorstellungsgespräch": "Verstellung", "Kater": "Reue", "Umzug": "Umbruch",
        "Überraschungsparty": "Verschwörung", "Roadtrip": "Freiheit", "Durchmachen": "Deadline",
        "Sonnenbrand": "Nachlässigkeit"
      },
      party: {
        "Bier-Pong": "Zielen", "Kater": "Reue", "Tequila-Shot": "Mut", "Nachtclub": "Anonymität",
        "Karaoke": "Peinlichkeit", "Döner um 4 Uhr": "Vergebung",
        "Vorglühen": "Vorfreude", "Shots": "Leichtsinn", "Gruppenchat": "Zugehörigkeit"
      },
      science: {
        "Roboter": "Gehorsam", "Rakete": "Abschied", "Dinosaurier": "Überholt", "Vulkan": "Druck",
        "Teleskop": "Geduld", "Magnet": "Treue", "Glühbirne": "Motte", "Batterie": "Ausdauer",
        "Astronaut": "Einsamkeit", "Außerirdischer": "Zugehörigkeit", "Schwarzes Loch": "Hingabe",
        "U-Boot": "Verschwiegenheit", "Drohne": "Überwachung", "Mikroskop": "Detail", "Skelett": "Vergänglichkeit",
        "Gehirn": "Falten", "Tornado": "Wirbel", "Solarpanel": "Idealismus", "Selbstfahrendes Auto": "Vertrauen",
        "Künstliche Intelligenz": "Ersatz", "Impfung": "Gnade", "Atom": "Unteilbar", "Satellit": "Lauschen",
        "3D-Drucker": "Schichten"
      },
      history: {
        "Napoleon": "Ehrgeiz", "Kleopatra": "Verführung", "Julius Cäsar": "Verrat", "Albert Einstein": "Neugier",
        "Abraham Lincoln": "Ehrlichkeit", "Gandhi": "Geduld", "Königin Elisabeth II.": "Pflicht",
        "Berliner Mauer": "Trennung", "Pyramiden": "Beständigkeit", "Titanic": "Hochmut",
        "Französische Revolution": "Hunger", "Kalter Krieg": "Misstrauen", "Mondlandung": "Staunen",
        "Wikinger": "Fernweh", "Ritter": "Treue", "Pharao": "Ewigkeit", "Römisches Reich": "Ordnung",
        "Diktator": "Angst", "Steinzeit": "Überleben", "Freiheitsstatue": "Willkommen", "Eiffelturm": "Romantik",
        "Zweiter Weltkrieg": "Rationierung", "Wilder Westen": "Gesetzlosigkeit", "Krone": "Last"
      },
      leisure: {
        "Strand": "Horizont", "Koffer": "Unentschlossenheit", "Sonnencreme": "Weitsicht", "Liegestuhl": "Trägheit",
        "Reisepass": "Identität", "Zelt": "Improvisation", "Kreuzfahrtschiff": "Enge", "Flugzeug": "Geduld",
        "Schnorchel": "Stille", "Cocktail am Pool": "Genuss", "Souvenir": "Nostalgie", "Wanderschuhe": "Ausdauer",
        "Sonnenbrand": "Leichtsinn", "Hotelbuffet": "Völlerei", "Festival": "Chaos", "Roadtrip": "Spontaneität",
        "Hängematte": "Hingabe", "Wasserball": "Leichtigkeit", "Flip-Flops": "Lässigkeit", "Wohnmobil": "Freiheit",
        "Skilift": "Schwebe", "Landkarte": "Zweifel", "Selfie-Stick": "Eitelkeit", "All-inclusive-Resort": "Maßlosigkeit"
      },
      power: {
        "Milliardär": "Nullen", "Krone": "Gewicht", "Goldbarren": "Schwere", "Geldkoffer": "Anonymität",
        "Thron": "Einsamkeit", "Diamant": "Kälte", "Aktienmarkt": "Nervosität", "Präsident": "Isolation",
        "Banktresor": "Stille", "Diktator": "Paranoia", "Bestechung": "Flüstern", "Lobbyist": "Überredung",
        "Erbschaft": "Groll", "Privatjet": "Flucht", "Yacht": "Langeweile", "Steuerparadies": "Verschwiegenheit",
        "Casino": "Verzweiflung", "Krypto": "Schwankung", "CEO": "Schlaflosigkeit", "Roter Teppich": "Beobachtung",
        "Leibwächter": "Wachsamkeit", "Penthouse": "Distanz"
      },
      famous: {
        "Beyoncé": "Bienenstock", "The Rock": "Ehrgeiz", "Shrek": "Einsamkeit", "Harry Potter": "Waise",
        "Donald Trump": "Chefetage", "Lady Gaga": "Wandlung", "Conor McGregor": "Prahlerei",
        "Darth Vader": "Erlösung", "Taylor Swift": "Tagebuch", "James Bond": "Gelassenheit", "Rihanna": "Schminke",
        "Billie Eilish": "Flüstern", "Justin Bieber": "Wunderkind", "Ariana Grande": "Zopf",
        "Leonardo DiCaprio": "Klima", "Keanu Reeves": "Bescheiden", "Margot Robbie": "Plastik", "Zendaya": "Haltung",
        "Homer Simpson": "Donut", "Cristiano Ronaldo": "Eitelkeit", "Lionel Messi": "Schüchtern",
        "LeBron James": "Langlebigkeit", "Lewis Hamilton": "Mode", "Usain Bolt": "Entspannt", "Mike Tyson": "Tauben",
        "Drake": "Empfindsam", "Eminem": "Groll", "Kanye West": "Ego", "Snoop Dogg": "Gemütlich",
        "Kendrick Lamar": "Pulitzer", "Nicki Minaj": "Zweitname", "Apache 207": "Sonnenbrille", "Elon Musk": "Memes",
        "Jeff Bezos": "Lagerhalle", "Mark Zuckerberg": "Privatsphäre", "Steve Jobs": "Schlichtheit",
        "Bill Gates": "Wohltätigkeit", "MrBeast": "Großzügigkeit", "Kim Kardashian": "Kontur", "Barack Obama": "Hoffnung"
      },
      nsfw: {
        "One-Night-Stand": "Reue", "Stripclub": "Versuchung", "Sexting": "Ablenkung", "Walk of Shame": "Tageslicht",
        "Booty Call": "Bequemlichkeit", "Freundschaft Plus": "Verwirrung", "Nacktbaden": "Befreiung",
        "Neuer Partner deines Ex": "Vergleich", "Betrunkene Nachricht, die du bereust": "Fremdscham",
        "Dreier": "Eifersucht", "Lapdance": "Anspannung", "Handschellen": "Hingabe", "Morgenlatte": "Ungelegenheit",
        "Quickie": "Effizienz", "Sugar Daddy": "Abhängigkeit", "Safeword": "Vertrauen", "Feuchter Traum": "Unterbewusstsein",
        "Dirty Talk": "Fantasie", "Rollenspiel": "Verstellung", "Friendzone": "Zurückweisung",
        "Netflix and Chill": "Vorwand", "Knutschfleck": "Beweis", "Blaue Eier": "Frustration", "Schlagsahne": "Schweinerei",
        "Massagesalon": "Diskretion", "Sex während der Periode": "Zimperlichkeit", "Dad Bod": "Gemütlichkeit"
      },
      starwars_easy: {
        "Darth Vader": "Asthma", "Luke Skywalker": "Gejammer", "Yoda": "Sumpf", "Princess Leia": "Zimt",
        "Han Solo": "Schulden", "Obi-Wan Kenobi": "Einsiedler", "Chewbacca": "Treue", "R2-D2": "Mutig",
        "C-3PO": "Pingelig", "Emperor Palpatine": "Geduld", "Boba Fett": "Erbe", "Jango Fett": "Vorlage",
        "Anakin Skywalker": "Sand", "Padmé Amidala": "Herzschmerz", "Qui-Gon Jinn": "Eigenbrötler", "Mace Windu": "Fassung",
        "Count Dooku": "Abkehr", "General Grievous": "Husten", "Jar Jar Binks": "Tollpatsch", "Rey": "Sammeln",
        "Kylo Ren": "Wutanfall", "Finn": "Gewissen", "Poe Dameron": "Leichtsinn", "BB-8": "Rollen",
        "Snoke": "Marionette", "Lando Calrissian": "Charme", "Jabba the Hutt": "Völlerei", "Admiral Ackbar": "Warnung",
        "Darth Maul": "Rache", "The Mandalorian": "Kodex", "Grogu": "Adoption", "Ahsoka Tano": "Abschied",
        "Captain Rex": "Bruderschaft", "Commander Cody": "Gehorsam", "Asajj Ventress": "Kopfgeld", "Cad Bane": "Hut",
        "Hondo Ohnaka": "Opportunismus", "Plo Koon": "Maske", "Aayla Secura": "Hinterhalt", "Kit Fisto": "Grinsen"
      },
      starwars_hard: {
        "Nute Gunray": "Gier", "Greedo": "Fehlschuss", "Bib Fortuna": "Speichellecker", "Wedge Antilles": "Überlebender",
        "Mon Mothma": "Entschlossenheit", "Bossk": "Regeneration", "IG-88": "Einsamkeit", "Grand Moff Tarkin": "Arroganz",
        "Savage Opress": "Verwandlung", "Barriss Offee": "Ernüchterung", "Embo": "Akrobat", "Cassian Andor": "Opfer",
        "Jyn Erso": "Trotz", "K-2SO": "Direktheit", "Saw Gerrera": "Extremismus", "Coruscant": "Wucherung",
        "Mandalore": "Tradition", "Dathomir": "Hexerei", "Kamino": "Regen", "Geonosis": "Schwarm", "Mustafar": "Reue",
        "Kashyyyk": "Baumkronen", "Ryloth": "Gewürz", "Scarif": "Aufopferung", "Jedha": "Pilgerfahrt",
        "Darksaber": "Erbstück", "Holocron": "Wissen", "Kyber Crystal": "Einklang", "Slave I": "Abgelegt",
        "Star Destroyer": "Keil", "AT-AT": "Stolpern", "Thermal Detonator": "Bluff", "Order 66": "Verrat",
        "Midi-Chlorians": "Blutbahn", "Youngling": "Unschuld", "Rule of Two": "Knappheit", "Force Ghost": "Verweilen",
        "The Clone Wars": "Zermürbung", "Carbonite": "Gefroren", "Sarlacc": "Verdauung", "Kessel Run": "Prahlerei"
      },
      marvel: {
        "Iron Man": "Opfer", "Captain America": "Treue", "Thor": "Unwürdig", "Black Widow": "Sühne",
        "Hulk": "Zurückhaltung", "Hawkeye": "Familie", "Nick Fury": "Geheimnisse", "Spider-Man": "Schuld",
        "Doctor Strange": "Demut", "Black Panther": "Tradition", "Ant-Man": "Bewährung", "Captain Marvel": "Ausgelöscht",
        "War Machine": "Pflicht", "Falcon": "Erbe", "Winter Soldier": "Gehirnwäsche", "Scarlet Witch": "Trauer",
        "Vision": "Sterblichkeit", "Quicksilver": "Flüchtig", "Valkyrie": "Überlebende", "Star-Lord": "Entführt",
        "Gamora": "Adoptiert", "Drax": "Wörtlich", "Groot": "Selbstlos", "Rocket Raccoon": "Experiment",
        "Nebula": "Groll", "Mantis": "Empathie", "Yondu": "Erlösung", "Thanos": "Gleichgewicht", "Loki": "Zugehörigkeit",
        "Ultron": "Verblendet", "Hela": "Erstgeborene", "Killmonger": "Verlassen", "Ego": "Eitelkeit", "Mysterio": "Übergangen",
        "Vulture": "Versorger", "Red Skull": "Bestraft", "Ronan": "Fanatismus", "Aldrich Killian": "Gekränkt",
        "Agatha Harkness": "Neid", "Shuri": "Wunderkind", "Okoye": "Zwiespalt", "Wong": "Geduld",
        "Happy Hogan": "Ergeben", "Pepper Potts": "Standhaft", "Phil Coulson": "Aufrichtig", "Agent Hill": "Gefasst",
        "Daredevil": "Buße", "Jessica Jones": "Zynisch", "Luke Cage": "Widerwillig", "Punisher": "Hinterblieben",
        "Kingpin": "Kultiviert", "Elektra": "Wiedergeboren"
      },
      onepiece: {
        "Monkey D. Luffy": "Wutanfall", "Roronoa Zoro": "Verirrt", "Nami": "Wettervorhersage", "Usopp": "Lampenfieber",
        "Sanji": "Ritterlichkeit", "Tony Tony Chopper": "Außenseiter", "Nico Robin": "Überlebende", "Franky": "Basteln",
        "Brook": "Einsamkeit", "Jinbe": "Sühne", "Shanks": "Barkeeper", "Whitebeard": "Waisenhaus",
        "Portgas D. Ace": "Wert", "Sabo": "Gedächtnisverlust", "Marco": "Treue", "Trafalgar Law": "Rachefeldzug",
        "Boa Hancock": "Schüchtern", "Crocodile": "Dürre", "Donquixote Doflamingo": "Fäden",
        "Bartholomew Kuma": "Selbstlosigkeit", "Gecko Moria": "Schlaflosigkeit", "Buggy": "Missverstanden",
        "Mihawk": "Langeweile", "Monkey D. Garp": "Pflicht", "Akainu": "Absolut", "Aokiji": "Faul", "Kizaru": "Launenhaft",
        "Sengoku": "Resignation", "Smoker": "Sturkopf", "Tashigi": "Tollpatschig", "Coby": "Aufrichtig",
        "Arlong": "Groll", "Enel": "Größenwahn", "Rob Lucci": "Kälte", "Katakuri": "Weitsicht", "Big Mom": "Hunger",
        "Kaido": "Verzweiflung", "Blackbeard": "Geduld", "King": "Aussterben", "Queen": "Showman", "Jack": "Hingabe",
        "Yamato": "Erbe", "Nefertari Vivi": "Geburtsrecht", "Bon Clay": "Aufopferung", "Perona": "Negativität",
        "Ivankov": "Verwandlung", "Silvers Rayleigh": "Ruhestand", "Gol D. Roger": "Akzeptanz"
      }
    }
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ImposterHints = HINTS;
})(window);

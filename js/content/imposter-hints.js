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
        "FC Bayern": "Dominance", "Real Madrid": "Royalty", "FC Barcelona": "Philosophy", "Manchester City": "Wealth",
        "Liverpool": "Anthem", "Paris Saint-Germain": "Glamour", "Borussia Dortmund": "Youth", "Arsenal": "Cannon",
        "Juventus": "Stripes", "Chelsea": "Boardroom", "Hat-trick": "Triple", "Penalty": "Nerves",
        "VAR": "Hesitation", "Champions League": "Prestige", "Remontada": "Comeback", "Camp Nou": "Cathedral",
        "La Masia": "Nursery", "Tiki-Taka": "Hypnosis", "Xavi": "Conductor", "Iniesta": "Whisper",
        "Puyol": "Mane", "Guardiola": "Obsession", "Pedri": "Maturity", "Lamine Yamal": "Prodigy",
        "Offside": "Margin", "Free kick": "Wall", "Corner": "Swarm", "Header": "Altitude",
        "Bicycle kick": "Acrobat", "Red card": "Banishment", "World Cup": "Patriotism", "Transfer window": "Deadline",
        "Relegation": "Despair"
      },
      videogames: {
        "Respawn": "Mercy", "Boss Fight": "Dread", "Easter Egg": "Whisper", "Noob": "Mockery",
        "Speedrun": "Obsession", "Loot Box": "Temptation", "Cheat Code": "Guilt", "LAN Party": "Sleepover",
        "Creeper": "Startle", "Steve": "Ordinary", "Enderman": "Avoidance", "Diamond Pickaxe": "Grind",
        "Nether Portal": "Threshold", "Ender Dragon": "Finale", "Herobrine": "Paranoia", "Redstone": "Tinkering",
        "Dirt House": "Shame", "AWP": "Patience", "Headshot": "Precision", "Rush B": "Recklessness",
        "Flashbang": "Disorientation", "Knife Round": "Warmup", "Smoke Grenade": "Concealment", "Bomb Defusal": "Suspense",
        "Bastion": "Loneliness", "Tracer": "Cheer", "Reinhardt": "Chivalry", "Mercy": "Devotion",
        "D.Va": "Bravado", "Genji": "Discipline", "Widowmaker": "Coldness", "Payload": "Burden",
        "Yasuo": "Wandering", "Teemo": "Annoyance", "Jungle": "Solitude", "Baron Nashor": "Greed",
        "Dragon": "Hoard", "Nexus": "Collapse", "Gank": "Ambush", "Agent 47": "Detachment",
        "Electro Dragon": "Surge", "Town Hall": "Hierarchy"
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
        "Flea market": "Nostalgia", "Traffic jam": "Helplessness", "Power outage": "Stillness", "Hospital": "Fragility",
        "First date": "Performance", "Job interview": "Pretense", "Hangover": "Remorse", "Moving apartment": "Upheaval",
        "Surprise party": "Conspiracy", "Road trip": "Freedom", "All-nighter": "Deadline", "Sunburn": "Negligence"
      },
      party: {
        "Beer pong": "Aim", "Hangover": "Regret", "Tequila shot": "Courage", "Nightclub": "Anonymity",
        "Karaoke": "Embarrassment", "Designated driver": "Sacrifice", "Kebab at 4am": "Forgiveness", "Pre-game": "Anticipation",
        "Shots": "Recklessness", "Group chat": "Belonging"
      },
      science: {
        "Robot": "Obedience", "Rocket": "Goodbye", "Dinosaur": "Obsolete", "Volcano": "Pressure",
        "Telescope": "Patience", "Magnet": "Loyalty", "Light bulb": "Moth", "Battery": "Stamina",
        "Astronaut": "Solitude", "Alien": "Belonging", "Black hole": "Surrender", "Submarine": "Secrecy",
        "Drone": "Surveillance", "Microscope": "Detail", "Skeleton": "Mortality", "Brain": "Wrinkles",
        "Tornado": "Chaos", "Solar panel": "Idealism", "Self-driving car": "Trust", "Artificial intelligence": "Replacement",
        "Vaccine": "Mercy", "Atom": "Indivisible", "Satellite": "Eavesdrop", "3D printer": "Layers"
      },
      history: {
        "Napoleon": "Ambition", "Cleopatra": "Allure", "Julius Caesar": "Betrayal", "Albert Einstein": "Curiosity",
        "Abraham Lincoln": "Honesty", "Gandhi": "Patience", "Queen Elizabeth II": "Duty", "The Berlin Wall": "Separation",
        "The Pyramids": "Permanence", "The Titanic": "Hubris", "The French Revolution": "Hunger", "The Cold War": "Suspicion",
        "The Moon landing": "Wonder", "A Viking": "Wanderlust", "A Knight": "Loyalty", "A Pharaoh": "Eternity",
        "The Roman Empire": "Order", "A Dictator": "Fear", "The Stone Age": "Survival", "The Statue of Liberty": "Welcome",
        "The Eiffel Tower": "Romance", "World War II": "Rationing", "The Wild West": "Lawlessness", "A Crown": "Burden"
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
        "The Rock": "Hustle", "Shrek": "Solitude", "Harry Potter": "Orphan", "Donald Trump": "Boardroom",
        "Conor McGregor": "Swagger", "Darth Vader": "Redemption", "James Bond": "Composure", "Justin Bieber": "Prodigy",
        "Ariana Grande": "Ponytail", "Leonardo DiCaprio": "Climate", "Keanu Reeves": "Humble", "Margot Robbie": "Plastic",
        "Zendaya": "Poise", "Homer Simpson": "Donut", "Cristiano Ronaldo": "Vanity", "Lionel Messi": "Quiet",
        "LeBron James": "Longevity", "Usain Bolt": "Relaxed", "Mike Tyson": "Doves", "Drake": "Sensitive",
        "Eminem": "Resentment", "Kanye West": "Ego", "Snoop Dogg": "Mellow", "Elon Musk": "Memes",
        "Jeff Bezos": "Warehouse", "Mark Zuckerberg": "Privacy", "Steve Jobs": "Minimalism", "Bill Gates": "Philanthropy",
        "MrBeast": "Generosity", "Kim Kardashian": "Contour", "Barack Obama": "Hope"
      },
      nsfw: {
        "One-night stand": "Regret", "Strip club": "Temptation", "Sexting": "Distraction", "Walk of shame": "Daylight",
        "Booty call": "Convenience", "Friends with benefits": "Confusion", "Skinny dipping": "Liberation", "Your ex's new partner": "Comparison",
        "A drunk text you regret": "Cringe", "Threesome": "Jealousy", "Lap dance": "Tension", "Handcuffs": "Surrender",
        "Morning wood": "Inconvenience", "Quickie": "Efficiency", "Sugar daddy": "Dependency", "Safe word": "Trust",
        "Wet dream": "Subconscious", "Dirty talk": "Imagination", "Roleplay": "Pretence", "Friend zone": "Rejection",
        "Netflix and chill": "Pretext", "Hickey": "Evidence", "Whipped cream": "Mess", "Massage parlour": "Discretion",
        "Period sex": "Squeamishness", "Dad bod": "Comfort"
      },
      starwars_easy: {
        "Darth Vader": "Asthma", "Luke Skywalker": "Whining", "Yoda": "Swamp", "Princess Leia": "Cinnamon",
        "Han Solo": "Debt", "Obi-Wan Kenobi": "Hermit", "Chewbacca": "Loyalty", "R2-D2": "Plucky",
        "C-3PO": "Fussy", "Emperor Palpatine": "Patience", "Boba Fett": "Inheritance", "Jango Fett": "Template",
        "Anakin Skywalker": "Sand", "Padmé Amidala": "Heartbreak", "Qui-Gon Jinn": "Maverick", "Mace Windu": "Composure",
        "Count Dooku": "Defection", "General Grievous": "Cough", "Jar Jar Binks": "Clumsiness", "Rey": "Scavenging",
        "Kylo Ren": "Tantrum", "Finn": "Conscience", "BB-8": "Roll", "Snoke": "Puppet",
        "Lando Calrissian": "Charm", "Jabba the Hutt": "Gluttony", "Admiral Ackbar": "Warning", "Darth Maul": "Vengeance",
        "The Mandalorian": "Creed", "Ahsoka Tano": "Departure", "Captain Rex": "Brotherhood", "Commander Cody": "Obedience",
        "Asajj Ventress": "Bounty", "Cad Bane": "Hat", "Hondo Ohnaka": "Opportunism", "Plo Koon": "Mask",
        "Aayla Secura": "Ambush", "Kit Fisto": "Grin"
      },
      starwars_hard: {
        "Greedo": "Misfire", "Bossk": "Regeneration", "IG-88": "Solitude", "Grand Moff Tarkin": "Arrogance",
        "Savage Opress": "Transformation", "Barriss Offee": "Disillusion", "Embo": "Acrobat", "Coruscant": "Sprawl",
        "Mandalore": "Tradition", "Dathomir": "Witchcraft", "Kamino": "Rain", "Geonosis": "Hive",
        "Mustafar": "Regret", "Kashyyyk": "Canopy", "Jedha": "Pilgrimage", "Darksaber": "Heirloom",
        "Holocron": "Knowledge", "Slave I": "Hand-me-down", "Star Destroyer": "Wedge", "AT-AT": "Stumble",
        "Order 66": "Betrayal", "Midi-Chlorians": "Bloodstream", "Youngling": "Innocence", "Rule of Two": "Scarcity",
        "Force Ghost": "Lingering", "The Clone Wars": "Attrition", "Carbonite": "Frozen", "Sarlacc": "Digestion",
        "Kessel Run": "Bragging"
      },
      marvel: {
        "Iron Man": "Sacrifice", "Captain America": "Loyalty", "Thor": "Unworthy", "Black Widow": "Atonement",
        "Hulk": "Restraint", "Hawkeye": "Family", "Nick Fury": "Secrets", "Spider-Man": "Guilt",
        "Doctor Strange": "Humbled", "Black Panther": "Tradition", "Ant-Man": "Parole", "Captain Marvel": "Erased",
        "War Machine": "Duty", "Falcon": "Inheritance", "Winter Soldier": "Brainwashed", "Scarlet Witch": "Grief",
        "Vision": "Mortality", "Quicksilver": "Brief", "Valkyrie": "Survivor", "Star-Lord": "Abducted",
        "Gamora": "Adopted", "Drax": "Literal", "Groot": "Selfless", "Rocket Raccoon": "Experiment",
        "Nebula": "Resentment", "Mantis": "Empathy", "Yondu": "Redemption", "Thanos": "Balance",
        "Loki": "Belonging", "Ultron": "Misguided", "Hela": "Firstborn", "Killmonger": "Abandoned",
        "Ego": "Vanity", "Mysterio": "Overlooked", "Ronan": "Zealotry", "Aldrich Killian": "Slighted",
        "Pepper Potts": "Steadfast", "Daredevil": "Penance"
      },
      onepiece: {
        "Monkey D. Luffy": "Tantrum", "Roronoa Zoro": "Lost", "Nami": "Forecast", "Usopp": "Stagefright",
        "Sanji": "Chivalry", "Tony Tony Chopper": "Outcast", "Nico Robin": "Survivor", "Franky": "Tinkering",
        "Brook": "Loneliness", "Jinbe": "Atonement", "Whitebeard": "Orphanage", "Portgas D. Ace": "Worth",
        "Sabo": "Amnesia", "Marco": "Loyalty", "Trafalgar Law": "Vendetta", "Boa Hancock": "Bashful",
        "Crocodile": "Drought", "Donquixote Doflamingo": "Strings", "Bartholomew Kuma": "Selflessness", "Gecko Moria": "Insomnia",
        "Buggy": "Misunderstood", "Mihawk": "Boredom", "Monkey D. Garp": "Duty", "Akainu": "Absolute",
        "Aokiji": "Lazy", "Kizaru": "Whimsy", "Sengoku": "Resignation", "Smoker": "Stubborn",
        "Tashigi": "Clumsy", "Coby": "Earnest", "Arlong": "Resentment", "Enel": "Megalomania",
        "Rob Lucci": "Coldness", "Katakuri": "Foresight", "Big Mom": "Hunger", "Kaido": "Despair",
        "Blackbeard": "Patience", "King": "Extinction", "Queen": "Showman", "Jack": "Devotion",
        "Yamato": "Inheritance", "Nefertari Vivi": "Birthright", "Bon Clay": "Sacrifice", "Perona": "Negativity",
        "Ivankov": "Transformation", "Silvers Rayleigh": "Retirement", "Gol D. Roger": "Acceptance"
      },
      minecraft: {
        "Creeper": "Landmine", "Enderman": "Eye contact", "Zombie": "Monday morning", "Skeleton": "X-ray",
        "Spider": "Bathtub", "Ghast": "Jellyfish", "Blaze": "Firestarter", "Wither": "Grim Reaper",
        "Ender Dragon": "Finale", "Warden": "Eavesdropping", "Piglin": "Bling", "Villager": "Bazaar",
        "Iron Golem": "Bouncer", "Slime": "Jelly", "Diamond Pickaxe": "Jackhammer", "Netherite": "Fireproof",
        "Redstone": "Electrician", "TNT": "Wrecking ball", "Obsidian": "Vault door", "Elytra": "Icarus",
        "Totem of Undying": "Defibrillator", "Enchanting Table": "Gibberish", "Beacon": "Status symbol", "Shulker Box": "Moving box",
        "Ender Pearl": "Teleport", "Golden Apple": "Energy drink", "Trident": "Poseidon", "Grass Block": "Turf",
        "Cobblestone": "Old town", "Bedrock": "Bulletproof glass", "Crafting Table": "IKEA", "Nether Portal": "Travel agency",
        "The Nether": "Red-light district", "The End": "Credits", "Village": "Backwater", "Ancient City": "Catacombs",
        "Woodland Mansion": "Haunted house", "Creative Mode": "Lego box", "Speedrun": "Stopwatch", "Steve": "Everyman",
        "Alex": "Plan B", "Herobrine": "Bigfoot", "Notch": "Lottery win"
      },
      kampfsport: {
        "Conor McGregor": "Whiskey", "Khabib Nurmagomedov": "Eagle", "Jon Jones": "Drug test", "Israel Adesanya": "Anime",
        "Alex Pereira": "Poker face", "Islam Makhachev": "Heir", "Charles Oliveira": "Favela", "Dustin Poirier": "Hot sauce",
        "Justin Gaethje": "Floor it", "Max Holloway": "Hawaii", "Sean O'Malley": "Crayon", "Ilia Topuria": "Matador",
        "Kamaru Usman": "Nightmare", "Leon Edwards": "London", "Nate Diaz": "Joint", "Jorge Masvidal": "Backyard",
        "Amanda Nunes": "Lioness", "Valentina Shevchenko": "Tango", "Zhang Weili": "Beijing", "Francis Ngannou": "Sandpit",
        "Stipe Miocic": "Firefighter", "Georges St-Pierre": "Gentleman", "Anderson Silva": "Matrix", "Tom Aspinall": "Express",
        "Merab Dvalishvili": "Duracell", "Paddy Pimblett": "Yo-yo", "Muhammad Ali": "Butterfly", "Mike Tyson": "Face tattoo",
        "Floyd Mayweather": "Bank balance", "Manny Pacquiao": "Senator", "Canelo Álvarez": "Cinnamon", "Tyson Fury": "Comeback",
        "Anthony Joshua": "Olympics", "Deontay Wilder": "Dynamite", "Oleksandr Usyk": "Chess", "Ryan Garcia": "Instagram",
        "Conor Benn": "Bloodline", "Wladimir Klitschko": "Doctorate", "Evander Holyfield": "Ear", "Dana White": "Blackjack",
        "Joe Rogan": "Podcast", "Ariel Helwani": "Microphone", "Bruce Buffer": "Announcement", "Michael Buffer": "Trademark",
        "Don King": "Hairdo", "Eddie Hearn": "Suit"
      }
    },
    de: {
      football: {
        "Messi": "Floh", "Ronaldo": "Bauchmuskeln", "Neymar": "Theater", "Mbappé": "Schildkröte",
        "Haaland": "Fjord", "Lewandowski": "Uhrwerk", "Salah": "Ägypten", "De Bruyne": "Zirkel",
        "Kimmich": "Klassensprecher", "Müller": "Instinkt", "Neuer": "Mauer", "Kroos": "Taktgeber",
        "FC Bayern": "Abonnement", "Real Madrid": "Galaktisch", "FC Barcelona": "Philosophie", "Manchester City": "Reichtum",
        "Liverpool": "Hymne", "Paris Saint-Germain": "Glamour", "Borussia Dortmund": "Jugend", "Arsenal": "Kanone",
        "Juventus": "Streifen", "Chelsea": "Vorstand", "Abseits": "Hauchdünn", "Freistoß": "Spraydose",
        "Ecke": "Gewühl", "Kopfball": "Höhe", "Fallrückzieher": "Akrobat", "Rote Karte": "Verbannung",
        "VAR": "Zögern", "Champions League": "Dienstagabend", "Weltmeisterschaft": "Patriotismus", "Transferfenster": "Frist",
        "Abstieg": "Fahrstuhl", "Remontada": "Aufholjagd", "Camp Nou": "Kathedrale", "La Masia": "Kinderstube",
        "Tiki-Taka": "Hypnose", "Xavi": "Dirigent", "Iniesta": "Zauberer", "Puyol": "Mähne",
        "Guardiola": "Besessenheit", "Pedri": "Reife", "Lamine Yamal": "Hausaufgaben", "Elfmeter": "Nerven",
        "Hattrick": "Dreifach"
      },
      videogames: {
        "Respawn": "Katze", "Boss Fight": "Grauen", "Easter Egg": "Schnitzeljagd", "Noob": "Stützräder",
        "Speedrun": "Abkürzung", "Loot Box": "Überraschungsei", "Cheat Code": "Steroide", "LAN Party": "Übernachtung",
        "Creeper": "Schreck", "Steve": "Gewöhnlich", "Enderman": "Blickkontakt", "Diamond Pickaxe": "Schuften",
        "Nether Portal": "Schwelle", "Ender Dragon": "Finale", "Herobrine": "Paranoia", "Redstone": "Tüfteln",
        "Dirt House": "Scham", "AWP": "Lauern", "Headshot": "Zielwasser", "Rush B": "Kamikaze",
        "Flashbang": "Blitzdings", "Knife Round": "Aufwärmen", "Smoke Grenade": "Verschleierung", "Bomb Defusal": "Nervenkitzel",
        "Bastion": "Vogelhäuschen", "Tracer": "Fröhlichkeit", "Reinhardt": "Ritterlichkeit", "Mercy": "Notruf",
        "D.Va": "Draufgängertum", "Genji": "Familienstreit", "Widowmaker": "Ballett", "Payload": "Einkaufswagen",
        "Yasuo": "Wandern", "Teemo": "Gereiztheit", "Jungle": "Pfadfinder", "Baron Nashor": "Gier",
        "Dragon": "Hort", "Nexus": "Schachmatt", "Gank": "Hinterhalt", "Agent 47": "Abgeklärtheit",
        "Electro Dragon": "Stromstoß", "Town Hall": "Bürgermeister"
      },
      general: {
        "Zahnbürste": "Übernachtungsgast", "Wecker": "Grauen", "Regenschirm": "Vorhersage", "Sonnenbrille": "Poser",
        "Fernbedienung": "Faulheit", "Schere": "Pony", "Mikrowelle": "Ping", "Waschmaschine": "Summen",
        "Tacker": "Bürokratie", "Feuerzeug": "Rebellion", "Pizza": "Ananas", "Sushi": "Skalpell",
        "Eis": "Kindheit", "Burger": "Serviette", "Popcorn": "Vorfreude", "Kaffee": "Überleben",
        "Bier": "Feierabend", "Nutella": "Löffel", "Avocado": "Status", "Speck": "Brutzeln",
        "Pinguin": "Förmlichkeit", "Delfin": "Sonar", "Flamingo": "Yoga", "Faultier": "Zeitlupe",
        "Tintenfisch": "Orakel", "Panda": "Diplomatie", "Känguru": "Sprungkraft", "Hamster": "Vergeblichkeit",
        "Giraffe": "Unbeholfenheit", "Krähe": "Vorzeichen", "Sauna": "Finnland", "Zahnarzt": "Geständnis",
        "Flughafen": "Schwebezustand", "Casino": "Selbsttäuschung", "Fitnessstudio": "Vorsatz", "Achterbahn": "Magen",
        "Flohmarkt": "Nostalgie", "Stau": "Ohnmacht", "Stromausfall": "Kerze", "Krankenhaus": "Zerbrechlichkeit",
        "Erstes Date": "Schauspiel", "Vorstellungsgespräch": "Verstellung", "Kater": "Aspirin", "Umzug": "Umbruch",
        "Überraschungsparty": "Verschwörung", "Roadtrip": "Freiheit", "Durchmachen": "Deadline", "Sonnenbrand": "Grillhähnchen"
      },
      party: {
        "Bier-Pong": "Zielen", "Kater": "Aspirin", "Tequila-Shot": "Mut", "Nachtclub": "Warteschlange",
        "Karaoke": "Peinlichkeit", "Döner um 4 Uhr": "Grundlage", "Vorglühen": "Vorfreude", "Shots": "Schüsse",
        "Gruppenchat": "Stummschalten"
      },
      science: {
        "Roboter": "Gehorsam", "Rakete": "Abschied", "Dinosaurier": "Meteorit", "Vulkan": "Druck",
        "Teleskop": "Nachtschicht", "Magnet": "Kühlschrank", "Glühbirne": "Motte", "Batterie": "Hase",
        "Astronaut": "Funkstille", "Außerirdischer": "Area 51", "Schwarzes Loch": "Sog", "U-Boot": "Verschwiegenheit",
        "Drohne": "Überwachung", "Mikroskop": "Pantoffeltierchen", "Skelett": "Vergänglichkeit", "Gehirn": "Falten",
        "Tornado": "Dachziegel", "Solarpanel": "Idealismus", "Selbstfahrendes Auto": "Beifahrer", "Künstliche Intelligenz": "Ersatz",
        "Impfung": "Herde", "Atom": "Unteilbar", "Satellit": "Lauschen", "3D-Drucker": "Schichten"
      },
      history: {
        "Napoleon": "Hand", "Kleopatra": "Verführung", "Julius Cäsar": "Verrat", "Albert Einstein": "Neugier",
        "Abraham Lincoln": "Zylinder", "Gandhi": "Salz", "Königin Elisabeth II.": "Corgi", "Berliner Mauer": "Trennung",
        "Pyramiden": "Überstunden", "Titanic": "Hochmut", "Französische Revolution": "Hunger", "Kalter Krieg": "Misstrauen",
        "Mondlandung": "Staunen", "Wikinger": "Fernweh", "Ritter": "Rostschutz", "Pharao": "Ewigkeit",
        "Römisches Reich": "Wasserleitung", "Diktator": "Angst", "Steinzeit": "Keule", "Freiheitsstatue": "Willkommen",
        "Eiffelturm": "Romantik", "Zweiter Weltkrieg": "Rationierung", "Wilder Westen": "Gesetzlosigkeit", "Krone": "Last"
      },
      leisure: {
        "Strand": "Horizont", "Koffer": "Unentschlossenheit", "Sonnencreme": "Weitsicht", "Liegestuhl": "Trägheit",
        "Reisepass": "Grimasse", "Zelt": "Improvisation", "Kreuzfahrtschiff": "Enge", "Flugzeug": "Ohrendruck",
        "Schnorchel": "Salzwasser", "Cocktail am Pool": "Genuss", "Souvenir": "Nostalgie", "Wanderschuhe": "Blasen",
        "Sonnenbrand": "Grillhähnchen", "Hotelbuffet": "Frühaufsteher", "Festival": "Chaos", "Roadtrip": "Spontaneität",
        "Hängematte": "Sonntag", "Wasserball": "Leichtigkeit", "Flip-Flops": "Lässigkeit", "Wohnmobil": "Freiheit",
        "Skilift": "Schwebe", "Landkarte": "Zweifel", "Selfie-Stick": "Duckface", "All-inclusive-Resort": "Maßlosigkeit"
      },
      power: {
        "Milliardär": "Nullen", "Krone": "Gewicht", "Goldbarren": "Dagobert", "Geldkoffer": "Parkhaus",
        "Thron": "Sitzfleisch", "Diamant": "Kohle", "Aktienmarkt": "Kaffeesatz", "Präsident": "Isolation",
        "Banktresor": "Schweiz", "Diktator": "Paranoia", "Bestechung": "Briefumschlag", "Lobbyist": "Hinterzimmer",
        "Erbschaft": "Familientreffen", "Privatjet": "Flucht", "Yacht": "Langeweile", "Steuerparadies": "Verschwiegenheit",
        "Casino": "Selbsttäuschung", "Krypto": "Schwankung", "CEO": "Schlaflosigkeit", "Roter Teppich": "Beobachtung",
        "Leibwächter": "Wachsamkeit", "Penthouse": "Distanz"
      },
      famous: {
        "The Rock": "Malocher", "Shrek": "Zwiebel", "Harry Potter": "Waise", "Donald Trump": "Chefetage",
        "Conor McGregor": "Prahlerei", "Darth Vader": "Erlösung", "James Bond": "Gelassenheit", "Justin Bieber": "YouTube",
        "Ariana Grande": "Zopf", "Leonardo DiCaprio": "Klima", "Keanu Reeves": "Hund", "Margot Robbie": "Plastik",
        "Zendaya": "Tennis", "Homer Simpson": "Donut", "Cristiano Ronaldo": "Spiegel", "Lionel Messi": "Schüchtern",
        "LeBron James": "Langlebigkeit", "Usain Bolt": "Blitz", "Mike Tyson": "Tauben", "Drake": "Plan",
        "Eminem": "Spaghetti", "Kanye West": "Turnschuhe", "Snoop Dogg": "Gemütlich", "Elon Musk": "Memes",
        "Jeff Bezos": "Lagerhalle", "Mark Zuckerberg": "Privatsphäre", "Steve Jobs": "Schlichtheit", "Bill Gates": "Fenster",
        "MrBeast": "Großzügigkeit", "Kim Kardashian": "Kontur", "Barack Obama": "Hoffnung"
      },
      nsfw: {
        "One-Night-Stand": "Taxi", "Stripclub": "Scheine", "Sexting": "Tippfehler", "Walk of Shame": "Tageslicht",
        "Booty Call": "Bequemlichkeit", "Freundschaft Plus": "Verwirrung", "Nacktbaden": "Befreiung", "Neuer Partner deines Ex": "Vergleich",
        "Betrunkene Nachricht, die du bereust": "Fremdscham", "Dreier": "Eifersucht", "Lapdance": "Anspannung", "Handschellen": "Schlüsselbund",
        "Morgenlatte": "Timing", "Quickie": "Effizienz", "Sugar Daddy": "Abhängigkeit", "Safeword": "Notbremse",
        "Feuchter Traum": "Unterbewusstsein", "Dirty Talk": "Fantasie", "Rollenspiel": "Verstellung", "Friendzone": "Kumpel",
        "Netflix and Chill": "Vorwand", "Knutschfleck": "Beweis", "Schlagsahne": "Schweinerei", "Massagesalon": "Diskretion",
        "Sex während der Periode": "Zimperlichkeit", "Dad Bod": "Gemütlichkeit"
      },
      starwars_easy: {
        "Darth Vader": "Asthma", "Luke Skywalker": "Gejammer", "Yoda": "Sumpf", "Princess Leia": "Hologramm",
        "Han Solo": "Schulden", "Obi-Wan Kenobi": "Einsiedler", "Chewbacca": "Teppich", "R2-D2": "Taschenmesser",
        "C-3PO": "Pingelig", "Emperor Palpatine": "Doppelleben", "Boba Fett": "Klon", "Jango Fett": "Vorlage",
        "Anakin Skywalker": "Sand", "Padmé Amidala": "Herzschmerz", "Qui-Gon Jinn": "Eigenbrötler", "Mace Windu": "Fassung",
        "Count Dooku": "Abkehr", "General Grievous": "Husten", "Jar Jar Binks": "Tollpatsch", "Rey": "Schrott",
        "Kylo Ren": "Wutanfall", "Finn": "Gewissen", "BB-8": "Rollen", "Snoke": "Marionette",
        "Lando Calrissian": "Charme", "Jabba the Hutt": "Kröte", "Admiral Ackbar": "Warnung", "Darth Maul": "Rache",
        "The Mandalorian": "Kodex", "Ahsoka Tano": "Abschied", "Captain Rex": "Bruderschaft", "Commander Cody": "Gehorsam",
        "Asajj Ventress": "Kopfgeld", "Cad Bane": "Hut", "Hondo Ohnaka": "Opportunismus", "Plo Koon": "Maske",
        "Aayla Secura": "Hinterhalt", "Kit Fisto": "Grinsen"
      },
      starwars_hard: {
        "Greedo": "Fehlschuss", "Bossk": "Regeneration", "IG-88": "Blechdose", "Grand Moff Tarkin": "Arroganz",
        "Savage Opress": "Verwandlung", "Barriss Offee": "Ernüchterung", "Embo": "Akrobat", "Coruscant": "Verkehr",
        "Mandalore": "Tradition", "Dathomir": "Hexerei", "Kamino": "Regen", "Geonosis": "Schwarm",
        "Mustafar": "Oberhand", "Kashyyyk": "Baumkronen", "Jedha": "Pilgerfahrt", "Darksaber": "Erbstück",
        "Holocron": "Wissen", "Slave I": "Gebrauchtwagen", "Star Destroyer": "Keil", "AT-AT": "Stolpern",
        "Order 66": "Verrat", "Midi-Chlorians": "Blutbahn", "Youngling": "Unschuld", "Rule of Two": "Knappheit",
        "Force Ghost": "Verweilen", "The Clone Wars": "Zermürbung", "Carbonite": "Gefroren", "Sarlacc": "Verdauung",
        "Kessel Run": "Prahlerei"
      },
      marvel: {
        "Iron Man": "Herzschrittmacher", "Captain America": "Frühsport", "Thor": "Unwürdig", "Black Widow": "Sühne",
        "Hulk": "Zurückhaltung", "Hawkeye": "Familie", "Nick Fury": "Geheimnisse", "Spider-Man": "Schuld",
        "Doctor Strange": "Demut", "Black Panther": "Tradition", "Ant-Man": "Bewährung", "Captain Marvel": "Ausgelöscht",
        "War Machine": "Uniform", "Falcon": "Stabwechsel", "Winter Soldier": "Gehirnwäsche", "Scarlet Witch": "Trauer",
        "Vision": "Sterblichkeit", "Quicksilver": "Flüchtig", "Valkyrie": "Überlebende", "Star-Lord": "Entführt",
        "Gamora": "Adoptiert", "Drax": "Wörtlich", "Groot": "Selbstlos", "Rocket Raccoon": "Experiment",
        "Nebula": "Ersatzteile", "Mantis": "Empathie", "Yondu": "Erlösung", "Thanos": "Gleichgewicht",
        "Loki": "Streich", "Ultron": "Verblendet", "Hela": "Erstgeborene", "Killmonger": "Verlassen",
        "Ego": "Rabenvater", "Mysterio": "Übergangen", "Ronan": "Fanatismus", "Aldrich Killian": "Silvester",
        "Pepper Potts": "Standhaft", "Daredevil": "Buße"
      },
      onepiece: {
        "Monkey D. Luffy": "Bauchgefühl", "Roronoa Zoro": "Verirrt", "Nami": "Wettervorhersage", "Usopp": "Lampenfieber",
        "Sanji": "Ritterlichkeit", "Tony Tony Chopper": "Außenseiter", "Nico Robin": "Überlebende", "Franky": "Basteln",
        "Brook": "Konzert", "Jinbe": "Sühne", "Whitebeard": "Waisenhaus", "Portgas D. Ace": "Wert",
        "Sabo": "Gedächtnisverlust", "Marco": "Hausarzt", "Trafalgar Law": "Rachefeldzug", "Boa Hancock": "Schüchtern",
        "Crocodile": "Dürre", "Donquixote Doflamingo": "Fäden", "Bartholomew Kuma": "Selbstlosigkeit", "Gecko Moria": "Schlaflosigkeit",
        "Buggy": "Missverstanden", "Mihawk": "Langeweile", "Monkey D. Garp": "Großvater", "Akainu": "Absolut",
        "Aokiji": "Faul", "Kizaru": "Launenhaft", "Sengoku": "Resignation", "Smoker": "Sturkopf",
        "Tashigi": "Tollpatschig", "Coby": "Aufrichtig", "Arlong": "Hypothek", "Enel": "Größenwahn",
        "Rob Lucci": "Undercover", "Katakuri": "Weitsicht", "Big Mom": "Hunger", "Kaido": "Schnapsidee",
        "Blackbeard": "Schläfer", "King": "Aussterben", "Queen": "Showman", "Jack": "Stehaufmännchen",
        "Yamato": "Idol", "Nefertari Vivi": "Geburtsrecht", "Bon Clay": "Aufopferung", "Perona": "Negativität",
        "Ivankov": "Verwandlung", "Silvers Rayleigh": "Ruhestand", "Gol D. Roger": "Akzeptanz"
      },
      minecraft: {
        "Creeper": "Landmine", "Enderman": "Blickkontakt", "Zombie": "Montagmorgen", "Skeleton": "Röntgenbild",
        "Spider": "Badewanne", "Ghast": "Qualle", "Blaze": "Grillanzünder", "Wither": "Sensenmann",
        "Ender Dragon": "Finale", "Warden": "Lauschangriff", "Piglin": "Goldkette", "Villager": "Basar",
        "Iron Golem": "Türsteher", "Slime": "Wackelpudding", "Diamond Pickaxe": "Presslufthammer", "Netherite": "Feuerfest",
        "Redstone": "Elektriker", "TNT": "Abrissbirne", "Obsidian": "Tresortür", "Elytra": "Ikarus",
        "Totem of Undying": "Defibrillator", "Enchanting Table": "Fremdsprache", "Beacon": "Statussymbol", "Shulker Box": "Umzugskarton",
        "Ender Pearl": "Beamen", "Golden Apple": "Energydrink", "Trident": "Poseidon", "Grass Block": "Rollrasen",
        "Cobblestone": "Altstadt", "Bedrock": "Panzerglas", "Crafting Table": "IKEA", "Nether Portal": "Reisebüro",
        "The Nether": "Rotlicht", "The End": "Abspann", "Village": "Kaff", "Ancient City": "Katakomben",
        "Woodland Mansion": "Spukhaus", "Creative Mode": "Legokiste", "Speedrun": "Stoppuhr", "Steve": "Jedermann",
        "Alex": "Plan B", "Herobrine": "Paranoia", "Notch": "Lottogewinn"
      },
      kampfsport: {
        "Conor McGregor": "Whiskey", "Khabib Nurmagomedov": "Adler", "Jon Jones": "Dopingtest", "Israel Adesanya": "Anime",
        "Alex Pereira": "Pokerface", "Islam Makhachev": "Kronprinz", "Charles Oliveira": "Favela", "Dustin Poirier": "Soße",
        "Justin Gaethje": "Vollgas", "Max Holloway": "Hawaii", "Sean O'Malley": "Buntstift", "Ilia Topuria": "Matador",
        "Kamaru Usman": "Albtraum", "Leon Edwards": "London", "Nate Diaz": "Joint", "Jorge Masvidal": "Hinterhof",
        "Amanda Nunes": "Löwin", "Valentina Shevchenko": "Tango", "Zhang Weili": "Peking", "Francis Ngannou": "Sandgrube",
        "Stipe Miocic": "Feuerwehrmann", "Georges St-Pierre": "Gentleman", "Anderson Silva": "Matrix", "Tom Aspinall": "Express",
        "Merab Dvalishvili": "Duracell", "Paddy Pimblett": "Jojo-Effekt", "Muhammad Ali": "Schmetterling", "Mike Tyson": "Gesichtstattoo",
        "Floyd Mayweather": "Kontostand", "Manny Pacquiao": "Senator", "Canelo Álvarez": "Zimt", "Tyson Fury": "Comeback",
        "Anthony Joshua": "Olympia", "Deontay Wilder": "Dynamit", "Oleksandr Usyk": "Schach", "Ryan Garcia": "Instagram",
        "Conor Benn": "Stammbaum", "Wladimir Klitschko": "Doktortitel", "Evander Holyfield": "Ohr", "Dana White": "Blackjack",
        "Joe Rogan": "Podcast", "Ariel Helwani": "Mikrofon", "Bruce Buffer": "Ansage", "Michael Buffer": "Patent",
        "Don King": "Frisur", "Eddie Hearn": "Anzug"
      }
    }
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ImposterHints = HINTS;
})(window);

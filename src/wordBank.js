/* =========================================================================
   SYNTAXHANG — WORD BANK
   All playable words, hints, categories and difficulty levels live here.
   Add a new category by adding a new top-level key with beginner/medium/hard
   arrays — the app picks it up automatically (category buttons are generated
   from Object.keys(wordBank), labels come from CATEGORY_LABELS below).
   ========================================================================= */

export const wordBank = {
  english: {
    beginner: [
      { word: "APPLE", hint: "A round fruit with red, green, or yellow skin and crisp white flesh." },
      { word: "HOUSE", hint: "A building for human habitation, especially one lived in by a family." },
      { word: "WATER", hint: "A colorless, transparent, odorless liquid that forms seas, lakes, and rain." },
      { word: "CHAIR", hint: "A separate seat for one person, typically with four legs and a back." },
      { word: "COFFEE", hint: "A hot drink made from the roasted and ground seeds of a tropical shrub." }
    ],
    medium: [
      { word: "JOURNEY", hint: "An act of traveling from one place to another." },
      { word: "GUITAR", hint: "A stringed instrument, with six or twelve strings, played by plucking or strumming." },
      { word: "ELEPHANT", hint: "A very large plant-eating mammal with a prehensile trunk and long tusks." },
      { word: "HORIZON", hint: "The line at which the earth's surface and the sky appear to meet." },
      { word: "MYSTERY", hint: "Something that is difficult or impossible to understand or explain." }
    ],
    hard: [
      { word: "SYCOPHANT", hint: "A person who acts obsequiously toward someone important to gain advantage." },
      { word: "UBIQUITOUS", hint: "Present, appearing, or found everywhere at the same time." },
      { word: "EPHEMERAL", hint: "Lasting for a very short time; transient." },
      { word: "CACOPHONY", hint: "A harsh, discordant mixture of sounds." },
      { word: "ANACHRONISM", hint: "A thing belonging to a period other than the one it's found in." }
    ]
  },

  developer: {
    beginner: [
      { word: "REACT", hint: "A popular open-source JavaScript library for building user interfaces." },
      { word: "HTML", hint: "The standard markup language used to structure pages on the web." },
      { word: "ARRAY", hint: "A data structure consisting of a collection of elements, each with an index." },
      { word: "PYTHON", hint: "A high-level, interpreted programming language famous for clean readability." },
      { word: "BUG", hint: "An error, flaw, or fault in a design, development, or operation of software." }
    ],
    medium: [
      { word: "PROMISE", hint: "An object representing the eventual completion of an asynchronous operation." },
      { word: "CLOSURE", hint: "A function bundled together with references to its surrounding state." },
      { word: "DATABASE", hint: "A structured set of data held in a computer, accessible in various ways." },
      { word: "RECURSION", hint: "The process in which a function calls itself directly or indirectly." },
      { word: "API", hint: "A set of protocols that lets different software applications communicate." }
    ],
    hard: [
      { word: "POLYMORPHISM", hint: "The condition of occurring in several different forms (OOP concept)." },
      { word: "MEMOIZATION", hint: "An optimization technique that caches expensive function results." },
      { word: "ASYNCHRONOUS", hint: "Operations that run independently of the main program flow." },
      { word: "ENCAPSULATION", hint: "Bundling data with the methods that operate on it, restricting access." },
      { word: "DEBOUNCE", hint: "A strategy that limits the rate at which a function triggers." }
    ]
  },

  student: {
    beginner: [
      { word: "EXAM", hint: "A formal test of a person's knowledge or proficiency in a subject." },
      { word: "ESSAY", hint: "A short piece of writing on a particular subject, done for a grade." },
      { word: "BOOK", hint: "A written work consisting of pages glued or sewn together along one side." },
      { word: "PENCIL", hint: "An instrument for writing, consisting of graphite in a wooden case." },
      { word: "CAMPUS", hint: "The grounds and buildings of a university or college." }
    ],
    medium: [
      { word: "SYLLABUS", hint: "An outline or summary of the subjects in a course of study." },
      { word: "SEMESTER", hint: "A half-year term in a school, typically fifteen to eighteen weeks." },
      { word: "TUITION", hint: "A sum of money charged for instruction by a school or university." },
      { word: "ACADEMIC", hint: "Relating to education and scholarship at a school or college level." },
      { word: "DORMITORY", hint: "A university residential building with communal sleeping quarters." }
    ],
    hard: [
      { word: "DISSERTATION", hint: "A long essay written as a requirement for a PhD." },
      { word: "PLAGIARISM", hint: "Taking someone else's work or ideas and passing them off as your own." },
      { word: "CURRICULUM", hint: "The subjects comprising a course of study in a school or college." },
      { word: "MATRICULATION", hint: "The formal process of enrolling at a university." },
      { word: "SCHOLARSHIP", hint: "A grant awarded to support a student's education." }
    ]
  },

  science: {
    beginner: [
      { word: "ATOM", hint: "The smallest unit of ordinary matter that forms a chemical element." },
      { word: "CELL", hint: "The smallest structural and functional unit of a living organism." },
      { word: "GRAVITY", hint: "The force that pulls objects toward the center of a planet." },
      { word: "PLANET", hint: "A large celestial body that orbits a star and produces no light of its own." },
      { word: "ENERGY", hint: "The capacity to do work, existing in forms like heat, light, and motion." }
    ],
    medium: [
      { word: "MOLECULE", hint: "A group of atoms bonded together, the smallest unit of a compound." },
      { word: "ECOSYSTEM", hint: "A biological community of interacting organisms and their environment." },
      { word: "MAGNETIC", hint: "Having the properties of a magnet; capable of attracting iron." },
      { word: "CHEMISTRY", hint: "The branch of science concerned with the properties and reactions of substances." },
      { word: "EVOLUTION", hint: "The process by which species change across successive generations." }
    ],
    hard: [
      { word: "PHOTOSYNTHESIS", hint: "The process by which plants convert light into chemical energy." },
      { word: "THERMODYNAMICS", hint: "The branch of physics dealing with heat, energy, and work." },
      { word: "MITOCHONDRIA", hint: "The organelle that generates most of a cell's supply of usable energy." },
      { word: "QUANTUM", hint: "Relating to the smallest discrete unit of a physical property." },
      { word: "ELECTROMAGNETISM", hint: "The branch of physics dealing with the electromagnetic force." }
    ]
  },

  movies: {
    beginner: [
      { word: "ACTOR", hint: "A person who performs a role in a film, play, or TV show." },
      { word: "SCREEN", hint: "The flat surface on which a film image is projected or displayed." },
      { word: "SEQUEL", hint: "A film that continues the story of a previous one." },
      { word: "TRAILER", hint: "A short preview clip used to advertise an upcoming film." },
      { word: "CAMERA", hint: "The device used to capture the moving images in a film." }
    ],
    medium: [
      { word: "DIRECTOR", hint: "The person responsible for the creative vision and staging of a film." },
      { word: "SUBTITLE", hint: "Text at the bottom of the screen translating or captioning dialogue." },
      { word: "ANIMATION", hint: "A filmmaking technique using a rapid sequence of images to create motion." },
      { word: "BLOCKBUSTER", hint: "A film that becomes a huge commercial success." },
      { word: "SOUNDTRACK", hint: "The recorded music that accompanies a film." }
    ],
    hard: [
      { word: "CINEMATOGRAPHY", hint: "The art of camera operation and lighting in filmmaking." },
      { word: "CHOREOGRAPHY", hint: "The sequence of steps and movements in a dance or staged scene." },
      { word: "SCREENPLAY", hint: "The written work a film is based on, including dialogue and directions." },
      { word: "DOCUMENTARY", hint: "A non-fiction film intended to document reality for education or record." },
      { word: "PROTAGONIST", hint: "The leading character, or one of the major characters, in a story." }
    ]
  },

  gaming: {
    beginner: [
      { word: "LEVEL", hint: "A distinct stage or section within a video game." },
      { word: "CONTROLLER", hint: "A handheld device used to interact with a video game." },
      { word: "AVATAR", hint: "A graphical representation of a player's character in a game." },
      { word: "QUEST", hint: "A mission or task a player must complete in a game." },
      { word: "SPAWN", hint: "The point where a character or object first appears in a game." }
    ],
    medium: [
      { word: "CHECKPOINT", hint: "A point in a game where progress is automatically saved." },
      { word: "MULTIPLAYER", hint: "A mode allowing multiple people to play a game together." },
      { word: "LEADERBOARD", hint: "A list ranking players by their scores or achievements." },
      { word: "SPEEDRUN", hint: "Playing through a game as quickly as possible." },
      { word: "INVENTORY", hint: "The collection of items a player's character is carrying." }
    ],
    hard: [
      { word: "PROCEDURAL", hint: "Content generated algorithmically rather than crafted by hand." },
      { word: "MATCHMAKING", hint: "The system that pairs players together for online games." },
      { word: "ACHIEVEMENT", hint: "A goal defined within a game that rewards the player for completing it." },
      { word: "PERMADEATH", hint: "A game mechanic where character death is permanent, with no respawn." },
      { word: "FRAMERATE", hint: "The frequency at which consecutive images are displayed in a game." }
    ]
  },

  sports: {
    beginner: [
      { word: "GOAL", hint: "The act of scoring in games like soccer or hockey; also the target itself." },
      { word: "COACH", hint: "A person who trains and instructs an athlete or team." },
      { word: "STADIUM", hint: "A large, usually roofless venue with tiered seating for spectators." },
      { word: "REFEREE", hint: "An official who supervises a match to ensure fair play." },
      { word: "MEDAL", hint: "An award, often metal, given for an achievement in sport." }
    ],
    medium: [
      { word: "MARATHON", hint: "A long-distance running race, typically just over 26 miles." },
      { word: "TOURNAMENT", hint: "A series of contests played to determine an overall winner." },
      { word: "OFFSIDE", hint: "A rule in soccer restricting an attacking player's positioning." },
      { word: "ENDURANCE", hint: "The ability to sustain prolonged physical effort." },
      { word: "SCRIMMAGE", hint: "A practice match or informal contest between teams." }
    ],
    hard: [
      { word: "DECATHLON", hint: "A combined athletics event made up of ten track and field events." },
      { word: "GOALKEEPER", hint: "The player whose job is to stop the ball or puck entering the goal." },
      { word: "CHAMPIONSHIP", hint: "A competition held to determine the best competitor in a sport." },
      { word: "QUALIFICATION", hint: "The process of earning the right to compete in a higher-level event." },
      { word: "PENTATHLON", hint: "An athletic event featuring five different disciplines." }
    ]
  }
};

// Display labels for the category selector — falls back to the raw key
// (capitalized) if a category doesn't have a custom label defined.
export const CATEGORY_LABELS = {
  english: 'English',
  developer: 'Dev Jargon',
  student: 'Student Life',
  science: 'Science',
  movies: 'Movie Buff',
  gaming: 'Gamer',
  sports: 'Sports's
};

export default wordBank;

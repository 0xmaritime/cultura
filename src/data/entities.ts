export type EntityType =
  | "topic"
  | "person"
  | "film"
  | "community"
  | "aesthetic"
  | "ideology";

export type ReceiptSource =
  | "reddit"
  | "twitter"
  | "youtube"
  | "rss"
  | "wiki"
  | "trends";

export type Receipt = {
  source: ReceiptSource;
  title: string;
  snippet: string;
  url: string;
  date: string;
  context: string;
};

export type Entity = {
  id: string;
  name: string;
  type: EntityType;
  summary: string;
  metrics: {
    attention: number; // 0 - 1 scale
    momentum: number; // -1 - 1 (positive = rising)
    controversy: number; // 0 - 1
  };
  sparkline: number[];
  momentumStatus: "surging" | "cooling" | "steady";
  lastPulse: string;
  communities: string[];
  adjacency: string[];
  receipts: Receipt[];
  related: string[];
  color: string;
};

export const entities: Entity[] = [
  {
    id: "seed-oils",
    name: "Seed Oils Debate",
    type: "topic",
    summary:
      "Nutrition creators, biohackers, and wellness moms reframing seed oils as the villain of metabolic health, with counter-skeptics from evidence-based medicine threads.",
    metrics: {
      attention: 0.86,
      momentum: 0.34,
      controversy: 0.68,
    },
    sparkline: [24, 28, 35, 40, 49, 61, 58],
    momentumStatus: "surging",
    lastPulse: "Seen in 312 new receipts past 48h",
    communities: ["r/Supplements", "WellnessTok", "Functional MDs"],
    adjacency: ["Mediterranean Diet", "Ultra-processed", "Blue Zones"],
    receipts: [
      {
        source: "reddit",
        title: "Nutrition science AMA",
        snippet:
          "Cardio residents debating whether linoleic acid avoidance is just vibes or actually moving biomarkers.",
        url: "https://reddit.com/r/nutrition",
        date: "2025-02-19",
        context: "r/nutrition",
      },
      {
        source: "youtube",
        title: "Huberman Lab clip",
        snippet:
          "Q&A segment where a caller cites seed oils as the hidden saboteur of HRV — chat explodes.",
        url: "https://youtube.com/watch?v=seed-oils",
        date: "2025-02-18",
        context: "Huberman Lab",
      },
    ],
    related: ["Carnivore diet", "Metabolic flexibility", "Cold plunges"],
    color: "from-amber-300/70 to-rose-300/70",
  },
  {
    id: "anora",
    name: "Anora (Film)",
    type: "film",
    summary:
      "A24's Sundance breakout mixing Brooklyn nightlife with class satire; film Twitter treats it as a referendum on messy female leads.",
    metrics: {
      attention: 0.62,
      momentum: 0.21,
      controversy: 0.44,
    },
    sparkline: [10, 12, 14, 29, 41, 47, 43],
    momentumStatus: "surging",
    lastPulse: "Critics roundups + Letterboxd meme reviews",
    communities: ["Letterboxd", "NYC Film Twitter", "TikTok Film Essays"],
    adjacency: ["Bottoms", "Euphoria aesthetics", "Succession fans"],
    receipts: [
      {
        source: "twitter",
        title: "Critic thread",
        snippet:
          "Film critics mapping Anora to the 'Coyote Ugly' lineage of NYC worker fantasies.",
        url: "https://twitter.com/anora-thread",
        date: "2025-02-20",
        context: "@filmwithgrace",
      },
      {
        source: "reddit",
        title: "r/movies discussion",
        snippet:
          "Viewers compare Anora's class politics to Paradise Suite; thread devolves into satire vs sincerity debate.",
        url: "https://reddit.com/r/movies",
        date: "2025-02-18",
        context: "r/movies",
      },
    ],
    related: ["Dasha Nekrasova", "Sofia Coppola", "Messy girl canon"],
    color: "from-purple-300/60 to-pink-300/60",
  },
  {
    id: "ai-doom",
    name: "AI Doom vs e/acc",
    type: "ideology",
    summary:
      "Accelerationists and doomers trading threads about AI takeover timelines, with venture guys trying to mediate via governance compacts.",
    metrics: {
      attention: 0.91,
      momentum: 0.12,
      controversy: 0.82,
    },
    sparkline: [52, 60, 63, 65, 70, 75, 74],
    momentumStatus: "steady",
    lastPulse: "Policy letter by OpenAI alumni resurfaced",
    communities: ["LessWrong", "VC X", "EA Forum"],
    adjacency: ["Frontier labs", "AI safety", "Effective acceleration"],
    receipts: [
      {
        source: "twitter",
        title: "Governance thread",
        snippet:
          "Marc Andreessen replies to doom timeline with e/acc doctrine bullet list.",
        url: "https://twitter.com/a16z",
        date: "2025-02-17",
        context: "@pmarca",
      },
      {
        source: "rss",
        title: "Substack essay",
        snippet:
          "Policy analyst proposes 'pause bubbles' where labs flip between sprint and moratorium windows.",
        url: "https://substack.com/aidiscourse",
        date: "2025-02-16",
        context: "Simulacra Notes",
      },
    ],
    related: ["OpenAI board drama", "Techno-optimism", "AI existential risk"],
    color: "from-cyan-300/70 to-emerald-300/70",
  },
  {
    id: "vibe-shift",
    name: "Vibe Shift Economy",
    type: "topic",
    summary:
      "Macro takes + meme accounts explaining the 2025 vibe shift: small venues, analog hobbies, and the revenge of earnestness.",
    metrics: {
      attention: 0.48,
      momentum: 0.27,
      controversy: 0.22,
    },
    sparkline: [9, 11, 15, 19, 25, 31, 36],
    momentumStatus: "surging",
    lastPulse: "Thread about indie sleaze 2.0 hitting LinkedIn",
    communities: ["HighSnobiety", "Indie sleaze", "Brand strategists"],
    adjacency: ["Analog revival", "Third spaces", "2000s nostalgia"],
    receipts: [
      {
        source: "rss",
        title: "Brand memo leak",
        snippet:
          "Deck claiming 'earnest cringe' is the new premium marketing tone — widely mocked.",
        url: "https://medium.com/vibeshift",
        date: "2025-02-15",
        context: "Brand Deck Leak",
      },
      {
        source: "twitter",
        title: "Creator thread",
        snippet:
          "@workweek rebundles vibe shift into a new KPI: joy-per-follower.",
        url: "https://twitter.com/workweek",
        date: "2025-02-18",
        context: "@workweek",
      },
    ],
    related: ["Analog film", "Indie sleaze", "Third place revival"],
    color: "from-sky-300/60 to-indigo-300/60",
  },
  {
    id: "cottagecore",
    name: "Cottagecore Supply Chain",
    type: "aesthetic",
    summary:
      "The pastoral internet aesthetic graduating into real supply chains: heirloom seeds, sourdough tour startups, and Etsy regulation fights.",
    metrics: {
      attention: 0.37,
      momentum: -0.04,
      controversy: 0.19,
    },
    sparkline: [18, 20, 19, 17, 16, 15, 15],
    momentumStatus: "cooling",
    lastPulse: "Newsletters calling peak cottagecore",
    communities: ["Homestead YouTube", "Goblin Mode descendants", "Slow fashion"],
    adjacency: ["Regenerative ag", "Slow living", "Fairycore"],
    receipts: [
      {
        source: "youtube",
        title: "Farm vlog",
        snippet:
          "Creator shares the math behind running a 'fantasy B&B', kicks off realism discourse.",
        url: "https://youtube.com/watch?v=cottagecore",
        date: "2025-02-14",
        context: "Moonrise Farms",
      },
      {
        source: "reddit",
        title: "r/femalefashionadvice thread",
        snippet:
          "Users question whether linen hauls without labor transparency still count as cottagecore.",
        url: "https://reddit.com/r/femalefashionadvice",
        date: "2025-02-13",
        context: "r/FFA",
      },
    ],
    related: ["Fairycore", "Slow fashion", "Fantasy B&B"],
    color: "from-emerald-200/70 to-lime-200/70",
  },
  {
    id: "ozempic-style",
    name: "Ozempic Aesthetic",
    type: "community",
    summary:
      "Semaglutide users sharing wardrobe swaps, skin elasticity hacks, and etiquette for explaining drastic body changes at work.",
    metrics: {
      attention: 0.58,
      momentum: 0.05,
      controversy: 0.51,
    },
    sparkline: [22, 27, 33, 39, 37, 42, 41],
    momentumStatus: "steady",
    lastPulse: "#ozempicstyle playlist crosses 12M views",
    communities: ["GLP-1 Reddit", "Corporate TikTok", "DermTok"],
    adjacency: ["Compassionate HR", "Metabolic clinic boom", "Insurance hacks"],
    receipts: [
      {
        source: "reddit",
        title: "Weekly check-in",
        snippet:
          "GLP-1 users exchange tips on tailoring and nutrient tracking while on reduced appetite.",
        url: "https://reddit.com/r/Ozempic",
        date: "2025-02-16",
        context: "r/Ozempic",
      },
      {
        source: "twitter",
        title: "Work etiquette thread",
        snippet:
          "HR pros debate if weight-loss conversations belong in ERGs or wellness budgets.",
        url: "https://twitter.com/hrthread",
        date: "2025-02-17",
        context: "@thepeopleops",
      },
    ],
    related: ["GLP-1 economy", "Metabolic clinics", "Corporate wellness"],
    color: "from-rose-200/70 to-orange-200/70",
  },
];

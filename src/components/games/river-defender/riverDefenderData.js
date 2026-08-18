// ============================================================
// RIVER DEFENDER — GAME DATA
// ============================================================
// Static configuration for River Defender.
//
// FINAL DESIGN:
// ------------------------------------------------------------
// • Stylized miniature flood town
// • Kid-friendly visual style
// • No budget / money system
// • Three flood-defense tools
// • Hospital + School as major landmarks
// • Fire station
// • Dense varied residential community
// • Roads + bridge
// • Wetland + low ground + high ground
// • Limited defenses + gameplay unlocks
//
// Game        -> UI / controls
// Engine      -> simulation
// Renderer    -> visuals
// World       -> map mathematics
// Data        -> configuration
// ============================================================


// ============================================================
// WORLD
// ============================================================

export const WORLD = {
  width: 46,
  height: 30,

  // Soft isometric presentation.
  // The renderer uses these values for the miniature-town view.
  tileWidth: 35,
  tileHeight: 18,

  camera: {
    panX: -120,
    panY: -260,
    zoom: 0.82,

    minZoom: 0.72,
    maxZoom: 1.35,
  },
};


// ============================================================
// DEFENSE TYPES
// ============================================================
// IMPORTANT:
// There is intentionally NO price or budget field.
// Defenses are earned and limited through gameplay.
// ============================================================

export const DEFENSE_TYPES = {
  wall: {
    id: "wall",

    name: "Flood Wall",

    label: "FLOOD WALL",

    icon: "🧱",

    startingCount: 2,

    strength: 0.98,

    radius: 0,

    description:
      "Strong barrier that redirects floodwater.",

    placement: "land",
  },

  pump: {
    id: "pump",

    name: "Pump",

    label: "PUMP",

    icon: "💧",

    startingCount: 1,

    strength: 0,

    radius: 3,

    removalRate: 0.12,

    description:
      "Removes water from the area around it.",

    placement: "water-or-land",
  },

  sand: {
    id: "sand",

    name: "Sand Bags",

    label: "SAND BAGS",

    icon: "🟨",

    startingCount: 3,

    strength: 0.56,

    radius: 1,

    description:
      "Slows water and buys time.",

    placement: "land",
  },
};


// ============================================================
// DEFENSE ORDER
// ============================================================

export const DEFENSE_ORDER = [
  "wall",
  "pump",
  "sand",
];


// ============================================================
// BUILDINGS
// ============================================================
// The town is intentionally denser than the previous version.
//
// Hospital + school are large landmarks.
// Residential buildings have different roof/body colors.
// ============================================================

export const BUILDINGS = [

  // ==========================================================
  // HOSPITAL
  // ==========================================================

  {
    id: "hospital",

    type: "hospital",

    name: "HOSPITAL",

    x: 25,
    y: 11,

    w: 4,
    h: 4,

    floors: 3,

    importance: 2,

    priority: "critical",

    body: "#fffdf5",

    roof: "#e45a52",

    accent: "#e33232",

    landmark: true,

    vehicle: "ambulance",

    description:
      "Critical building. Keep it safe.",
  },


  // ==========================================================
  // SCHOOL
  // ==========================================================

  {
    id: "school",

    type: "school",

    name: "SCHOOL",

    x: 32,
    y: 17,

    w: 4,
    h: 3,

    floors: 2,

    importance: 2,

    priority: "critical",

    body: "#ffd96e",

    roof: "#dd7d36",

    accent: "#e6a03d",

    landmark: true,

    vehicle: "school-bus",

    description:
      "Critical building. Keep it safe.",
  },


  // ==========================================================
  // FIRE STATION
  // ==========================================================

  {
    id: "fire",

    type: "fire",

    name: "FIRE STATION",

    x: 19,
    y: 20,

    w: 3,
    h: 3,

    floors: 1,

    importance: 1,

    priority: "important",

    body: "#d95343",

    roof: "#7d2d2d",

    accent: "#f3c34b",

    landmark: true,

    vehicle: "fire-truck",

    description:
      "Emergency response station.",
  },


  // ==========================================================
  // RESIDENTIAL AREA — NORTH
  // ==========================================================

  {
    id: "home1",

    type: "home",

    name: "HOME 1",

    x: 22,
    y: 8,

    w: 2,
    h: 2,

    floors: 1,

    roof: "#ce5952",

    body: "#f5dfbd",

    safe: true,

    priority: "community",
  },

  {
    id: "home2",

    type: "home",

    name: "HOME 2",

    x: 29,
    y: 7,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#4aa5bd",

    body: "#e9d6bd",

    safe: true,

    priority: "community",
  },

  {
    id: "home3",

    type: "home",

    name: "HOME 3",

    x: 34,
    y: 7,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#d88b3d",

    body: "#f1e2bf",

    safe: true,

    priority: "community",
  },

  {
    id: "home4",

    type: "home",

    name: "HOME 4",

    x: 39,
    y: 9,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#b45571",

    body: "#e6d5c2",

    safe: true,

    priority: "community",
  },


  // ==========================================================
  // RESIDENTIAL AREA — CENTRAL
  // ==========================================================

  {
    id: "home5",

    type: "home",

    name: "HOME 5",

    x: 22,
    y: 15,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#5a9d6f",

    body: "#f0dfb8",

    safe: true,

    priority: "community",
  },

  {
    id: "home6",

    type: "home",

    name: "HOME 6",

    x: 28,
    y: 16,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#ba6f3c",

    body: "#e8d8c0",

    safe: true,

    priority: "community",
  },

  {
    id: "home7",

    type: "home",

    name: "HOME 7",

    x: 37,
    y: 14,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#657bc4",

    body: "#f0d8b2",

    safe: true,

    priority: "community",
  },

  {
    id: "home8",

    type: "home",

    name: "HOME 8",

    x: 41,
    y: 15,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#cf7057",

    body: "#ead6b8",

    safe: true,

    priority: "community",
  },


  // ==========================================================
  // RESIDENTIAL AREA — SOUTH
  // ==========================================================

  {
    id: "home9",

    type: "home",

    name: "HOME 9",

    x: 25,
    y: 20,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#8d6ac2",

    body: "#f1dfc4",

    safe: true,

    priority: "community",
  },

  {
    id: "home10",

    type: "home",

    name: "HOME 10",

    x: 30,
    y: 22,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#4d9b91",

    body: "#f4e2bd",

    safe: true,

    priority: "community",
  },

  {
    id: "home11",

    type: "home",

    name: "HOME 11",

    x: 35,
    y: 22,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#d25a62",

    body: "#ead9c1",

    safe: true,

    priority: "community",
  },

  {
    id: "home12",

    type: "home",

    name: "HOME 12",

    x: 40,
    y: 21,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#d49b45",

    body: "#f0dfbc",

    safe: true,

    priority: "community",
  },


  // ==========================================================
  // RESIDENTIAL AREA — EASTERN EDGE
  // ==========================================================

  {
    id: "home13",

    type: "home",

    name: "HOME 13",

    x: 37,
    y: 25,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#658eb8",

    body: "#e9d7bc",

    safe: true,

    priority: "community",
  },

  {
    id: "home14",

    type: "home",

    name: "HOME 14",

    x: 42,
    y: 24,

    w: 2,

    h: 2,

    floors: 1,

    roof: "#a96652",

    body: "#f2dfc2",

    safe: true,

    priority: "community",
  },

];


// ============================================================
// ROADS
// ============================================================
// Roads create a recognizable town structure instead of a
// collection of isolated buildings.
// ============================================================

export const ROADS = [

  // Main north road
  [
    { x: 17, y: 10 },
    { x: 43, y: 10 },
  ],

  // Main central road
  [
    { x: 17, y: 17 },
    { x: 43, y: 17 },
  ],

  // Main southern road
  [
    { x: 18, y: 23 },
    { x: 43, y: 23 },
  ],

  // Western vertical connector
  [
    { x: 21, y: 10 },
    { x: 21, y: 24 },
  ],

  // Central connector
  [
    { x: 27, y: 10 },
    { x: 27, y: 25 },
  ],

  // School connector
  [
    { x: 35, y: 10 },
    { x: 35, y: 27 },
  ],

  // Eastern connector
  [
    { x: 41, y: 10 },
    { x: 41, y: 27 },
  ],

  // Hospital access road
  [
    { x: 24, y: 13 },
    { x: 31, y: 13 },
  ],

  // Fire station access
  [
    { x: 18, y: 21 },
    { x: 27, y: 21 },
  ],

  // Southern connection
  [
    { x: 27, y: 23 },
    { x: 35, y: 23 },
  ],
];


// ============================================================
// SPECIAL ZONES
// ============================================================

export const SPECIAL_ZONES = {

  wetland: {
    x1: 11,
    x2: 17,

    y1: 20,
    y2: 26,

    label: "WETLAND",
  },

  lowGround: {
    x1: 14,
    x2: 20,

    y1: 14,
    y2: 20,

    label: "LOW-LYING AREA",
  },

  highGround: {
    x1: 34,
    x2: 43,

    y1: 4,
    y2: 12,

    label: "HIGH GROUND",
  },
};


// ============================================================
// BRIDGE
// ============================================================
// Connects the western side of town across the river.
// ============================================================

export const BRIDGE = {

  start: {
    x: 9.8,
    y: 12.4,
  },

  end: {
    x: 16.2,
    y: 12.4,
  },

  height: 0.28,
};


// ============================================================
// GAME RULES
// ============================================================
// NO BUDGET.
//
// The player manages a limited set of defenses and earns
// additional tools by protecting important areas.
//
// The game is about:
//   observe -> plan -> place -> protect
// ============================================================

export const GAME_RULES = {

  preparationSeconds: 16,

  gameDurationSeconds: 145,

  // Community objective.
  targetHomesSafe: 0.8,

  // Building safety thresholds.
  hospitalSafeThreshold: 0.18,

  schoolSafeThreshold: 0.18,

  normalBuildingSafeThreshold: 0.24,

  // Flood progression.
  riverStartLevel: 0.46,

  riverRiseAmount: 0.56,

  // ==========================================================
  // UNLOCKS
  // ==========================================================
  // These remain compatible with RiverDefenderEngine.js.
  // They are achievement-style rewards, NOT purchases.
  // ==========================================================

  unlocks: [

    {
      id: "hospital-reward",

      riverLevel: 0.58,

      defense: "wall",

      amount: 1,

      message:
        "HOSPITAL SECURED! +1 FLOOD WALL",
    },

    {
      id: "school-reward",

      riverLevel: 0.68,

      defense: "pump",

      amount: 1,

      message:
        "SCHOOL SECURED! +1 PUMP",
    },

    {
      id: "community-reward",

      riverLevel: 0.78,

      defense: "sand",

      amount: 3,

      message:
        "COMMUNITY SAFE! +3 SANDBAGS",
    },
  ],
};


// ============================================================
// BUILDING STATE
// ============================================================

export function createBuildingState() {
  return BUILDINGS.map(
    (building) => ({
      ...building,

      safe: true,
    })
  );
}


// ============================================================
// DEFENSE INVENTORY
// ============================================================

export function createDefenseInventory() {
  return Object.fromEntries(
    DEFENSE_ORDER.map(
      (id) => [
        id,
        DEFENSE_TYPES[id]
          .startingCount,
      ]
    )
  );
}


// ============================================================
// END OF DATA
// ============================================================
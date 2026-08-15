// MOUNTAIN SCOUT — LANDSLIDE WARNING SIGNS SINGLE SOURCE OF TRUTH DATA MODEL

export const HAZARDS_DATA = [
  {
    id: "ground-cracks",
    name: "Cracked Terrain",
    type: "ground-cracks",
    icon: "⚡",
    zone: "Exposed Slope Soil",
    description: "New or widening cracks in the ground can indicate that soil or rock is beginning to move.",
    explanation: "Ground cracks can indicate that the soil or slope is beginning to move. New or widening cracks should be taken seriously as early indicators of slope failure.",
    whyItMatters: "Widening cracks allow rainwater to penetrate deeper into the slope, increasing internal water pressure and accelerating slope failure.",
    whatToWatchFor: "New, widening, or extending cracks in soil, asphalt, or concrete foundations.",
    clueText: "Inspect the exposed brown soil patch on the lower-left hillside near the village slope.",
    svgPos: { left: "24%", top: "58%", width: "12%", height: "16%" },
    highlightPos: { left: "30%", top: "66%" }
  },
  {
    id: "leaning-tree",
    name: "Leaning Tree",
    type: "leaning-tree",
    icon: "🌲",
    zone: "Forest Hillside",
    description: "A newly leaning tree can indicate movement of the ground beneath it.",
    explanation: "A newly leaning tree can indicate movement of the ground beneath it. Increasing tilt may be a warning sign of ongoing slope instability.",
    whyItMatters: "Trees grow straight towards sunlight (geotropism). When a tree leans suddenly, it means the topsoil layer holding its roots is sliding downhill.",
    whatToWatchFor: "Trees, utility poles, or fences that tilt out of alignment compared to nearby vegetation.",
    clueText: "Compare the pine trees on the upper right forest slope. Is one tree tilted differently?",
    svgPos: { left: "68%", top: "34%", width: "12%", height: "16%" },
    highlightPos: { left: "74%", top: "42%" }
  },
  {
    id: "rockfall",
    name: "Rockfall",
    type: "rockfall",
    icon: "🪨",
    zone: "Rocky Cliff Face",
    description: "Fallen rocks may indicate that a slope is becoming unstable.",
    explanation: "Fallen rocks can indicate that the slope is becoming unstable. Repeated rockfalls may signal increasing danger of larger landslides.",
    whyItMatters: "Minor rockfalls often precede major slope collapses as upper rock joints loosen and destabilize.",
    whatToWatchFor: "Fresh rock debris, tumbling stones, or cracks appearing along cliff faces.",
    clueText: "Inspect the base of the steep rocky cliff on the upper left side of the mountain.",
    svgPos: { left: "12%", top: "42%", width: "14%", height: "16%" },
    highlightPos: { left: "19%", top: "50%" }
  },
  {
    id: "water-seepage",
    name: "Water Seepage",
    type: "water-seepage",
    icon: "💧",
    zone: "Slope Soil Wall",
    description: "Unusual water seepage can weaken soil and increase landslide risk.",
    explanation: "New or unusual water seepage can weaken soil shear strength and dramatically increase the risk of a landslide.",
    whyItMatters: "Saturated soil loses friction between soil particles. Water pressure acts like a lubricant, causing entire hillsides to slide rapidly.",
    whatToWatchFor: "Muddy streams, wet soil patches, or new springs emerging from dry hillside slopes.",
    clueText: "Look for unusual moisture or wet streams leaking out of the soil wall on the lower right.",
    svgPos: { left: "81%", top: "58%", width: "12%", height: "14%" },
    highlightPos: { left: "87%", top: "64%" }
  },
  {
    id: "ground-movement",
    name: "Ground Movement",
    type: "ground-movement",
    icon: "🥾",
    zone: "Central Footpath",
    description: "Small shifts or displacement of soil can be an early warning of slope instability.",
    explanation: "Small ground movements can be an early indication that a slope is becoming unstable before a major landslide occurs.",
    whyItMatters: "Early minor soil displacement gives critical advance warning to evacuate high-risk mountain zones before sudden collapse.",
    whatToWatchFor: "Offset dirt steps, displaced retaining walls, or misaligned trail paths.",
    clueText: "Look closely at the dirt footpath in the center where soil steps have shifted.",
    svgPos: { left: "42%", top: "72%", width: "14%", height: "14%" },
    highlightPos: { left: "49%", top: "78%" }
  },
  {
    id: "unstable-slope",
    name: "Unstable Slope",
    type: "unstable-slope",
    icon: "⛰️",
    zone: "Central Mountain Bulge",
    description: "A bulging or visibly deformed slope may indicate that the ground is moving downhill.",
    explanation: "A bulging slope can indicate that soil or rock is moving downhill and pressure is building within the lower slope face.",
    whyItMatters: "The bulge marks the toe of a sliding mass where downward weight is pushing the bottom outwards before a complete catastrophic break.",
    whatToWatchFor: "Unusual curved humps, raised soil mounds, or deformation along hillside slopes.",
    clueText: "Inspect the central green hill slope where the earth appears pushed outward.",
    svgPos: { left: "48%", top: "40%", width: "14%", height: "16%" },
    highlightPos: { left: "55%", top: "48%" }
  }
];

export const GAME_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which of the following is a key early warning sign of a landslide?",
    options: [
      "Cracked Terrain near slope roads or foundations",
      "Healthy green grass growing on lawns",
      "Clear sunny weather in the afternoon",
      "Normal vertical tree growth"
    ],
    correctIndex: 0,
    explanation: "Cracked terrain indicates soil movement and internal slope displacement!"
  },
  {
    id: 2,
    question: "Why is a suddenly leaning tree on a slope dangerous?",
    options: [
      "The tree is seeking more sunlight",
      "The topsoil layer holding its root system is sliding downhill",
      "Strong wind always turns trees permanently sideways",
      "Birds built a heavy nest on one side"
    ],
    correctIndex: 1,
    explanation: "Trees naturally grow vertically towards sunlight. A sudden tilt indicates the ground beneath is sliding!"
  },
  {
    id: 3,
    question: "What does new water seepage emerging from a slope indicate?",
    options: [
      "The soil is getting stronger and firmer",
      "Saturated soil is losing friction and gaining water pressure",
      "Groundwater is completely disappearing",
      "The slope is 100% safe from landslides"
    ],
    correctIndex: 1,
    explanation: "Water seepage saturates soil, reducing friction between soil particles and lubricating landslide slides!"
  },
  {
    id: 4,
    question: "What does an Unstable Slope bulge signify?",
    options: [
      "Downward soil mass is pushing the lower slope outwards under pressure",
      "An underground cave is collapsing inwards",
      "Grass is growing faster in that spot",
      "It is a natural decorative landscape feature"
    ],
    correctIndex: 0,
    explanation: "Bulges mark the toe of a landslide where weight from above is forcing the slope bottom outward!"
  }
];

export const GAME_SETTINGS = {
  initialTime: 60,
  maxClues: 3,
  maxBinoculars: 3,
  basePoints: 100,
  comboIncrement: 20,
  timeBonusMultiplier: 10,
  clueBonus: 50,
  binocularBonus: 50
};

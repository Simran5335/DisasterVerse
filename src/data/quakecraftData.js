// QUAKECRAFT 3D EARTHQUAKE SAFETY GAME DATA MODEL

export const ROOM_SPECS = {
  living_room: { id: 'living_room', name: 'Living Room', icon: '🛋️', desc: 'Main living space with sofa, TV, bookshelves, and chandeliers' },
  bedroom: { id: 'bedroom', name: 'Bedroom', icon: '🛏️', desc: 'Sleeping area with comfort bed, wardrobe, and bedside lamps' },
  kitchen: { id: 'kitchen', name: 'Kitchen', icon: '🍳', desc: 'Cooking area with cabinets, refrigerator, stove, and dining table' },
  bathroom: { id: 'bathroom', name: 'Bathroom', icon: '🛁', desc: 'Washing area with mirror, sink, and emergency water supply' },
  study_room: { id: 'study_room', name: 'Study Room', icon: '💻', desc: 'Workspace with desk, computer, heavy bookcase, and desk lamp' },
  hallway: { id: 'hallway', name: 'Hallway / Exit', icon: '🚪', desc: 'Main evacuation route connecting rooms to the outdoor exit' }
};

export const MATERIAL_SPECS = {
  // Foundations
  weak_base: { category: 'Foundation', name: 'Weak Base', desc: 'Shallow soil foundation', color: '#8a7a5c', topColor: '#a89878', sideColor: '#695b42', texture: 'concrete', strength: 25, flexibility: 10, mass: 20, cost: 10 },
  normal_base: { category: 'Foundation', name: 'Normal Base', desc: 'Standard concrete pad', color: '#9a9a94', topColor: '#b8b8b2', sideColor: '#787872', texture: 'concrete', strength: 50, flexibility: 20, mass: 30, cost: 25 },
  strong_base: { category: 'Foundation', name: 'Strong Base', desc: 'Deep reinforced concrete pilings', color: '#5c6670', topColor: '#75808c', sideColor: '#434b53', texture: 'steel', strength: 85, flexibility: 30, mass: 50, cost: 60 },

  // Pillars / Columns
  wood_pillar: { category: 'Columns', name: 'Wood Column', desc: 'Light & flexible timber', color: '#a5713a', topColor: '#c78a4b', sideColor: '#7d5225', texture: 'wood', strength: 35, flexibility: 75, mass: 10, cost: 15 },
  concrete_pillar: { category: 'Columns', name: 'Concrete Column', desc: 'Rigid & heavy support', color: '#8f8f88', topColor: '#ababa3', sideColor: '#6e6e67', texture: 'concrete', strength: 65, flexibility: 20, mass: 35, cost: 35 },
  steel_pillar: { category: 'Columns', name: 'Steel Column', desc: 'Ductile high-strength I-beam', color: '#6b7f94', topColor: '#869bb2', sideColor: '#4e5f71', texture: 'steel', strength: 95, flexibility: 80, mass: 25, cost: 75 },

  // Beams & Bracing
  steel_beam: { category: 'Beams', name: 'Steel Beam', desc: 'Horizontal load distributor', color: '#4a6572', topColor: '#628090', sideColor: '#344955', texture: 'steel', strength: 90, flexibility: 70, mass: 20, cost: 50 },
  cross_brace: { category: 'Bracing', name: 'X-Brace Frame', desc: 'Seismic lateral diagonal brace', color: '#0284c7', topColor: '#38bdf8', sideColor: '#0369a1', texture: 'steel', strength: 98, flexibility: 85, mass: 15, cost: 65 },

  // Walls / Panels
  brick_wall: { category: 'Walls', name: 'Brick Wall', desc: 'Unreinforced masonry', color: '#a4462c', topColor: '#c7593c', sideColor: '#7e321d', texture: 'brick', strength: 30, flexibility: 10, mass: 30, cost: 20 },
  concrete_wall: { category: 'Walls', name: 'Concrete Wall', desc: 'Shear-resistant solid wall', color: '#b5b5ae', topColor: '#d4d4cd', sideColor: '#91918b', texture: 'concrete', strength: 70, flexibility: 30, mass: 40, cost: 45 },
  steel_wall: { category: 'Walls', name: 'Steel Panel Wall', desc: 'Modern seismic curtain wall', color: '#7d94a8', topColor: '#9cb4c9', sideColor: '#5b6f80', texture: 'steel', strength: 90, flexibility: 65, mass: 20, cost: 80 },

  // Roofs
  flat_roof: { category: 'Roof', name: 'Flat Deck', desc: 'Lightweight roof slab', color: '#c9863f', topColor: '#e6a157', sideColor: '#9e6429', texture: 'concrete', strength: 35, flexibility: 30, mass: 12, cost: 20 },
  sloped_roof: { category: 'Roof', name: 'Tile Roof', desc: 'Traditional pitched roof', color: '#b0553f', topColor: '#d16a52', sideColor: '#873d2a', texture: 'brick', strength: 55, flexibility: 40, mass: 18, cost: 30 },
  heavy_roof: { category: 'Roof', name: 'Reinforced Roof', desc: 'Heavy weather-resistant slab', color: '#5c6670', topColor: '#75808c', sideColor: '#434b53', texture: 'concrete', strength: 80, flexibility: 20, mass: 45, cost: 70 },
};

export const FURNITURE_SPECS = {
  bed: { name: 'Comfort Bed', category: 'Furniture', cost: 60, icon: '🛏️', size: '2x1', hazardRisk: 10, anchored: true, desc: 'Safe low-center sleeping area' },
  sofa: { name: 'Comfy Sofa', category: 'Furniture', cost: 75, icon: '🛋️', size: '2x1', hazardRisk: 15, anchored: true, desc: 'Stable low seating' },
  table: { name: 'Heavy Dining Table', category: 'Furniture', cost: 50, icon: '🪑', size: '1x1', hazardRisk: 20, anchored: false, desc: 'Ideal for DROP → COVER → HOLD ON shelter!' },
  cupboard: { name: 'Tall Wooden Cupboard', category: 'Furniture', cost: 110, icon: '🗄️', size: '1x1', hazardRisk: 80, anchored: false, desc: '⚠️ High tipping risk during earthquakes if unanchored!' },
  bookshelf: { name: 'Tall Bookcase', category: 'Furniture', cost: 90, icon: '📚', size: '1x1', hazardRisk: 75, anchored: false, desc: '⚠️ Books fall and unit can tip over!' },
  lamp: { name: 'Floor Lamp', category: 'Decoration', cost: 35, icon: '💡', size: '1x1', hazardRisk: 40, anchored: false, desc: 'Can tip and break during shaking' },
  tv: { name: 'Flat TV & Stand', category: 'Decoration', cost: 120, icon: '📺', size: '1x1', hazardRisk: 60, anchored: false, desc: 'Needs strap anchor to prevent falling' },
  chandelier: { name: 'Hanging Chandelier', category: 'Decoration', cost: 150, icon: '🕯️', size: '1x1', hazardRisk: 90, anchored: false, desc: '⚠️ High danger of swinging and falling from ceiling!' },
  wall_anchor: { name: 'Seismic Wall Anchor Kit', category: 'Safety', cost: 40, icon: '⚓', size: '1x1', hazardRisk: 0, anchored: true, desc: 'Secures cupboards & TVs directly to wall studs!' },
  emergency_kit: { name: 'Survival Emergency Kit', category: 'Safety', cost: 80, icon: '🎒', size: '1x1', hazardRisk: 0, anchored: true, desc: 'Contains 72-hr water, food, radio & flashlight' },
  fire_extinguisher: { name: 'Fire Extinguisher', category: 'Safety', cost: 50, icon: '🧯', size: '1x1', hazardRisk: 0, anchored: true, desc: 'Essential for post-quake fire safety' }
};

export const OCCUPANT_SPECS = {
  adult: { name: 'Adult Resident', icon: '👨', mobility: 'Fast', riskFactor: 'Low', desc: 'Can evacuate quickly and take cover under tables' },
  child: { name: 'Child Resident', icon: '🧒', mobility: 'Medium', riskFactor: 'High', desc: 'Needs clear guidance to safe zones and protection from falling objects' },
  elderly: { name: 'Elderly Citizen', icon: '👴', mobility: 'Slow', riskFactor: 'Very High', desc: 'Requires wide uncluttered walking paths and easy ground-floor exit access' },
  dog: { name: 'Pet Dog', icon: '🐶', mobility: 'Fast', riskFactor: 'Medium', desc: 'Stays calm near safe zone shelters' },
  cat: { name: 'Pet Cat', icon: '🐱', mobility: 'Agile', riskFactor: 'Low', desc: 'Requires safe indoor retreat away from tall unanchored shelves' }
};

export const GEM_SPECS = {
  quartz: { name: 'Quartz Gem', icon: '💎', color: '#e2e8f0', rarity: 'Common', sellValue: 50 },
  emerald: { name: 'Emerald Gem', icon: '💚', color: '#10b981', rarity: 'Uncommon', sellValue: 100 },
  sapphire: { name: 'Sapphire Gem', icon: '💙', color: '#06b6d4', rarity: 'Rare', sellValue: 180 },
  amethyst: { name: 'Amethyst Gem', icon: '💜', color: '#a855f7', rarity: 'Epic', sellValue: 350 }
};

export const EMERGENCY_KIT_ITEMS = [
  { id: 'water', name: '72-Hr Bottled Water', icon: '💧', isCorrect: true, category: 'Essential', desc: '1 gallon per person per day for drinking & sanitation' },
  { id: 'first_aid', name: 'First Aid Kit', icon: '🩹', isCorrect: true, category: 'Medical', desc: 'Bandages, antiseptics, scissors, and essential meds' },
  { id: 'flashlight', name: 'Crank Flashlight', icon: '🔦', isCorrect: true, category: 'Tools', desc: 'Light source when power grid fails' },
  { id: 'whistle', name: 'Emergency Whistle', icon: '📢', isCorrect: true, category: 'Signal', desc: 'Signal for rescue if trapped under debris' },
  { id: 'radio', name: 'Battery NOAA Radio', icon: '📻', isCorrect: true, category: 'Info', desc: 'Receive official emergency broadcasts' },
  { id: 'food', name: 'Non-Perishable Food', icon: '🥫', isCorrect: true, category: 'Food', desc: 'High-energy canned rations and protein bars' },
  { id: 'documents', name: 'ID & Documents', icon: '📄', isCorrect: true, category: 'Legal', desc: 'Waterproof pouch with passport, insurance & cash' },
  
  // Incorrect / Non-essential items for decision-making
  { id: 'heavy_tv', name: '50-Inch Heavy TV', icon: '📺', isCorrect: false, category: 'Unnecessary', desc: 'Too heavy and useless during evacuation!' },
  { id: 'glass_vase', name: 'Decorative Glass Vase', icon: '🏺', isCorrect: false, category: 'Dangerous', desc: 'Can shatter and cause severe injuries!' },
  { id: 'ice_cream', name: 'Frozen Ice Cream', icon: '🍦', isCorrect: false, category: 'Perishable', desc: 'Melts immediately when power is lost!' }
];

export const SAFETY_CHALLENGES = [
  { id: 'c1', title: 'Challenge 1: Identify Hazards', icon: '🔍', desc: 'Find 3 unanchored tipping hazards in the house' },
  { id: 'c2', title: 'Challenge 2: Secure the Room', icon: '⚓', desc: 'Attach Seismic Wall Anchors to tall bookcases & TVs' },
  { id: 'c3', title: 'Challenge 3: Emergency Kit Builder', icon: '🎒', desc: 'Assemble 6 essential 72-hour survival items' },
  { id: 'c4', title: 'Challenge 4: Safe Spot Finder', icon: '🛡️', desc: 'Identify sturdy Drop-Cover-Hold spots away from windows' },
  { id: 'c5', title: 'Challenge 5: Drop, Cover & Hold Drill', icon: '🧘', desc: 'Perform the 3-step earthquake survival action' },
  { id: 'c6', title: 'Challenge 6: Safe Evacuation Escape', icon: '🏃', desc: 'Navigate past hazards to the outdoor assembly area' }
];

export const MISSION_SPECS = [
  { id: 1, title: 'Mission 1: Explore the 3D House', desc: 'Explore all 6 rooms (Living Room, Bedroom, Kitchen, Bathroom, Study, Hallway)', target: 6 },
  { id: 2, title: 'Mission 2: Find Hidden Gems', desc: 'Discover 10 hidden gems tucked behind furniture & corners', target: 10 },
  { id: 3, title: 'Mission 3: Identify Hazards', desc: 'Identify unanchored tall cupboards and hanging chandeliers', target: 3 },
  { id: 4, title: 'Mission 4: Prepare Emergency Kit', desc: 'Select 6 essential survival items for your emergency kit', target: 6 },
  { id: 5, title: 'Mission 5: Designate Safe Spots', desc: 'Locate sturdy tables suitable for Drop-Cover-Hold shelter', target: 2 },
  { id: 6, title: 'Mission 6: Survive the Quake Event', desc: 'Execute Drop-Cover-Hold drill during a Magnitude 6.5 earthquake', target: 1 },
  { id: 7, title: 'Mission 7: Post-Quake Safety Quiz', desc: 'Score 100% on the post-earthquake safety assessment', target: 4 }
];

export const EARTHQUAKE_QUIZ = [
  {
    id: 1,
    question: "An earthquake starts while you are inside a room. What is the safest immediate action?",
    options: [
      "Run immediately towards windows to look outside",
      "Use the elevator to evacuate quickly",
      "DROP, COVER under a sturdy table, and HOLD ON",
      "Stand directly underneath a heavy hanging chandelier"
    ],
    correctIndex: 2,
    explanation: "DROP to hands and knees, COVER under a sturdy desk or table, and HOLD ON until shaking stops!"
  },
  {
    id: 2,
    question: "How should tall furniture (bookcases, wardrobes, TVs) be prepared BEFORE an earthquake?",
    options: [
      "Left unanchored so they can slide freely",
      "Secured to wall studs using seismic L-brackets or strap anchors",
      "Placed directly in front of main exit doorways",
      "Stacked on top of smaller tables"
    ],
    correctIndex: 1,
    explanation: "Tall furniture should be anchored to wall studs using seismic brackets to prevent tipping injuries!"
  },
  {
    id: 3,
    question: "What is the primary danger inside a kitchen during strong earthquake shaking?",
    options: [
      "Unanchored appliances, flying glass dishes, and gas line leaks",
      "Wooden dining table legs",
      "Soft sofa cushions",
      "Floor rugs"
    ],
    correctIndex: 0,
    explanation: "Cabinet doors can fly open spilling glass, heavy appliances tip over, and gas lines can rupture!"
  },
  {
    id: 4,
    question: "What should you do IMMEDIATELY AFTER violent shaking stops?",
    options: [
      "Light a match to inspect for darkness",
      "Check for injuries, inspect gas/electrical hazards, and safely evacuate to an open assembly area",
      "Immediately run back inside to grab decorative items",
      "Use elevators to go down"
    ],
    correctIndex: 1,
    explanation: "Check for injuries, avoid damaged structures, check for gas leaks (NEVER light matches), and evacuate via stairs!"
  }
];

export const BADGE_SPECS = [
  { id: 'safety_explorer', title: 'SAFETY EXPLORER', icon: '🏆', desc: 'Explored all 6 rooms of the 3D house', requirement: 'Complete Mission 1' },
  { id: 'gem_collector', title: 'GEM COLLECTOR', icon: '💎', desc: 'Discovered 10 hidden gems inside the 3D house', requirement: 'Find 10 Gems' },
  { id: 'hazard_hunter', title: 'HAZARD HUNTER', icon: '🔍', desc: 'Identified & anchored all tipping room hazards', requirement: 'Complete Challenge 1 & 2' },
  { id: 'kit_master', title: 'EMERGENCY EXPERT', icon: '🎒', desc: 'Assembled a complete 72-hour emergency survival kit', requirement: 'Complete Kit Challenge' },
  { id: 'quake_survivor', title: 'EARTHQUAKE READY', icon: '🛡️', desc: 'Successfully executed Drop-Cover-Hold during M6.5 quake', requirement: 'Survive Earthquake Event' },
  { id: 'quiz_champion', title: 'SAFETY CHAMPION', icon: '⭐', desc: 'Scored 100% on the Earthquake Safety Assessment', requirement: 'Complete Quiz' },
  { id: 'senior_architect', title: 'SENIOR ARCHITECT', icon: '🏆', desc: 'Survive 3 distinct earthquake challenges!', requirement: 'Survive 3 Earthquakes' }
];

export const CAMPAIGN_LEVELS = [
  {
    id: 1,
    title: 'HOUSE EXPLORATION',
    subtitle: 'Explore the 3D multi-room house & discover hidden gems',
    type: 'EXPLORE',
    icon: '🏠',
    unlocked: true,
    magnitude: 4.0,
    coinsReward: 200,
    xpReward: 150,
    gemReward: 2,
    description: 'Explore the Living Room, Bedroom, Kitchen, Bathroom, Study, and Hallway. Uncover 10 hidden gems tucked behind furniture.',
    objectives: [
      { id: 'obj_rooms', label: 'Explore all 6 rooms in the 3D house', target: 6 },
      { id: 'obj_gems', label: 'Find 10 hidden gems in the house', target: 10 }
    ]
  },
  {
    id: 2,
    title: 'HAZARD IDENTIFICATION',
    subtitle: 'Inspect rooms for tipping furniture & glass risks',
    type: 'SAFETY',
    icon: '🔍',
    unlocked: false,
    magnitude: 4.5,
    coinsReward: 300,
    xpReward: 200,
    gemReward: 2,
    description: 'Inspect tall bookcases, unanchored wardrobes, hanging chandeliers, and blocked exit pathways.',
    objectives: [
      { id: 'obj_inspect', label: 'Inspect unanchored bookcases & chandeliers', target: 3 },
      { id: 'obj_anchor', label: 'Attach L-bracket anchors to tall furniture', target: 2 }
    ]
  },
  {
    id: 3,
    title: 'EMERGENCY KIT BUILDER',
    subtitle: 'Assemble a 72-hour survival kit with essential supplies',
    type: 'KIT',
    icon: '🎒',
    unlocked: false,
    magnitude: 5.0,
    coinsReward: 400,
    xpReward: 250,
    gemReward: 3,
    description: 'Select bottled water, first aid, crank flashlight, NOAA radio, whistle, food rations, and documents.',
    objectives: [
      { id: 'obj_kit_items', label: 'Select 6 essential 72-hour emergency items', target: 6 }
    ]
  },
  {
    id: 4,
    title: 'SAFE SPOT FINDER',
    subtitle: 'Locate Drop-Cover-Hold shelters away from windows',
    type: 'SAFESPOT',
    icon: '🛡️',
    unlocked: false,
    magnitude: 5.5,
    coinsReward: 500,
    xpReward: 300,
    gemReward: 3,
    description: 'Find sturdy dining tables and desks while avoiding glass windows, mirrors, and unanchored shelves.',
    objectives: [
      { id: 'obj_tables', label: 'Designate 2 sturdy Drop-Cover-Hold tables', target: 2 }
    ]
  },
  {
    id: 5,
    title: 'EARTHQUAKE EVENT DRILL',
    subtitle: 'Experience dynamic 3D shaking & execute Drop-Cover-Hold',
    type: 'QUAKE_EVENT',
    icon: '⚡',
    unlocked: false,
    magnitude: 6.5,
    coinsReward: 750,
    xpReward: 500,
    gemReward: 4,
    description: 'Trigger a Magnitude 6.5 earthquake simulation! Execute DROP → COVER → HOLD ON under shelter as furniture sways.',
    objectives: [
      { id: 'obj_drop_cover', label: 'Execute DROP → COVER → HOLD ON drill', done: false },
      { id: 'obj_survive_event', label: 'Survive the 3D earthquake event safely', done: false }
    ]
  },
  {
    id: 6,
    title: 'POST-QUAKE ASSESSMENT & QUIZ',
    subtitle: 'Inspect hazards, safe exit routes, and complete knowledge check',
    type: 'QUIZ',
    icon: '📚',
    unlocked: false,
    magnitude: 7.0,
    coinsReward: 1000,
    xpReward: 750,
    gemReward: 5,
    description: 'Check post-quake gas & electrical hazards, navigate to assembly area, and pass the final safety assessment.',
    objectives: [
      { id: 'obj_quiz', label: 'Complete the 4-question Earthquake Safety Quiz', done: false }
    ]
  }
];

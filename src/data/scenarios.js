export const SCENARIOS = [
  {
    id: 'scenario_1',
    title: 'SCENARIO 1 — RIVERSIDE TOWN',
    subtitle: 'Moderate Rainfall & Basic Defenses',
    difficulty: 'EASY',
    difficultyColor: '#10b981',
    initialBudget: 10000,
    prepTimeSeconds: 45,
    floodDurationSeconds: 180,
    gridSize: { cols: 24, rows: 24 },
    riverColRange: [0, 3], // Columns occupied by river
    baseRainfallRate: 1.2,
    peakRainfallRate: 4.5,
    description: 'A quiet riverside municipality threatened by rising river levels. Learn terrain elevation dynamics and protect the municipal hospital and school.',
    objectives: [
      { id: 'obj_hospital', text: 'Protect City General Hospital', target: 'hospital', maxDamage: 10 },
      { id: 'obj_school', text: 'Protect Central High School', target: 'school', maxDamage: 15 },
      { id: 'obj_houses', text: 'Save at least 80% of residential houses', target: 'houses_pct', minSavePct: 80 },
      { id: 'obj_road', text: 'Keep main evacuation road clear', target: 'evac_road', maxDamage: 25 },
      { id: 'obj_budget', text: 'Stay within ₹10,000 budget', target: 'budget', maxSpend: 10000 }
    ],
    unlockedByDefault: true
  },
  {
    id: 'scenario_2',
    title: 'SCENARIO 2 — URBAN FLOOD',
    subtitle: 'Heavy Storm & High Density',
    difficulty: 'MEDIUM',
    difficultyColor: '#f59e0b',
    initialBudget: 12000,
    prepTimeSeconds: 40,
    floodDurationSeconds: 210,
    gridSize: { cols: 26, rows: 26 },
    riverColRange: [0, 4],
    baseRainfallRate: 2.0,
    peakRainfallRate: 7.0,
    description: 'Dense urban center with limited open ground and high runoff accumulation. Requires smart combination of pumps and engineered drainage channels.',
    objectives: [
      { id: 'obj_hospital', text: 'Protect City General Hospital', target: 'hospital', maxDamage: 5 },
      { id: 'obj_fire', text: 'Protect Fire & Rescue Station', target: 'fire_station', maxDamage: 10 },
      { id: 'obj_houses', text: 'Save at least 85% of residential houses', target: 'houses_pct', minSavePct: 85 },
      { id: 'obj_road', text: 'Keep evacuation corridor functional', target: 'evac_road', maxDamage: 20 },
      { id: 'obj_combo', text: 'Achieve at least 1 Infrastructure Combo', target: 'combo', minCombos: 1 }
    ],
    unlockedByDefault: false
  },
  {
    id: 'scenario_3',
    title: 'SCENARIO 3 — EXTREME STORM',
    subtitle: 'Flash Flood & Power Grid Emergencies',
    difficulty: 'HARD',
    difficultyColor: '#ef4444',
    initialBudget: 15000,
    prepTimeSeconds: 30,
    floodDurationSeconds: 240,
    gridSize: { cols: 28, rows: 28 },
    riverColRange: [0, 5],
    baseRainfallRate: 3.5,
    peakRainfallRate: 10.0,
    description: 'Catastrophic typhoon condition causing rapid river surge and power failure events. Demands nature-based wetland buffers and quick emergency response.',
    objectives: [
      { id: 'obj_hospital', text: 'Protect Hospital & Command Center', target: 'critical_all', maxDamage: 5 },
      { id: 'obj_school', text: 'Protect Central High School', target: 'school', maxDamage: 10 },
      { id: 'obj_houses', text: 'Save at least 75% of houses', target: 'houses_pct', minSavePct: 75 },
      { id: 'obj_rescues', text: 'Complete at least 2 Emergency Rescue Missions', target: 'rescues', minRescues: 2 },
      { id: 'obj_budget', text: 'Finish with ₹1,500+ budget remaining', target: 'budget_left', minRemaining: 1500 }
    ],
    unlockedByDefault: false
  }
];

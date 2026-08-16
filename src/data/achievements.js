export const ACHIEVEMENTS = [
  {
    id: 'flood_hero',
    title: 'FLOOD HERO',
    icon: '🏆',
    description: 'Save 95%+ of all city buildings in any scenario.',
    xp: 50,
    check: (stats) => stats.buildingsSavedPct >= 95
  },
  {
    id: 'green_defender',
    title: 'GREEN DEFENDER',
    icon: '🌿',
    description: 'Deploy at least 3 Wetlands to mitigate flooding with nature-based solutions.',
    xp: 40,
    check: (stats) => stats.wetlandsBuilt >= 3
  },
  {
    id: 'budget_master',
    title: 'BUDGET MASTER',
    icon: '💰',
    description: 'Complete a scenario while spending less than 70% of total allocated budget.',
    xp: 35,
    check: (stats) => stats.budgetSpentPct <= 70 && stats.success
  },
  {
    id: 'life_saver',
    title: 'LIFE SAVER',
    icon: '🏥',
    description: 'Keep the Hospital, School, and Fire Station completely free of flood damage.',
    xp: 50,
    check: (stats) => stats.hospitalDamage === 0 && stats.schoolDamage === 0 && stats.fireStationDamage === 0
  },
  {
    id: 'quick_response',
    title: 'QUICK RESPONSE',
    icon: '⚡',
    description: 'Successfully complete all emergency events and rescue mini-missions.',
    xp: 30,
    check: (stats) => stats.rescuesCompleted >= 2
  },
  {
    id: 'water_whisperer',
    title: 'WATER WHISPERER',
    icon: '🌊',
    description: 'Redirect or manage over 10,000 liters of flood water during a storm.',
    xp: 45,
    check: (stats) => stats.waterManaged >= 10000
  },
  {
    id: 'strategist',
    title: 'STRATEGIST',
    icon: '🧠',
    description: 'Complete a scenario and review the What-If optimization analysis.',
    xp: 25,
    check: (stats) => stats.whatIfReviewed
  }
];

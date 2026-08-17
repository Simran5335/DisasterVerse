export const RESCUE_MISSIONS = [
  {
    id: 'trapped_residents',
    title: '🚨 RESCUE MISSION: Trapped Residents',
    description: '3 residents are trapped in a flooded low-lying home in Sector B. Water is rising fast!',
    cost: 300,
    timeLimitSeconds: 20,
    rewardScore: 400,
    rewardXP: 30,
    icon: '🚤',
    optionApproveText: 'Deploy Rescue Boat (₹300)',
    optionIgnoreText: 'Ignore Warning'
  },
  {
    id: 'blocked_culvert',
    title: '⚠️ EMERGENCY: Blocked Main Culvert',
    description: 'Debris is clogging the main drainage culvert near the school. Water flow is backing up!',
    cost: 400,
    timeLimitSeconds: 25,
    rewardScore: 500,
    rewardXP: 35,
    icon: '🛠️',
    optionApproveText: 'Deploy Clearance Team (₹400)',
    optionIgnoreText: 'Bypass Culvert'
  },
  {
    id: 'stranded_animals',
    title: '🐕 RESCUE MISSION: Stranded Animals',
    description: 'A local animal shelter on the riverbank is surrounded by floodwater!',
    cost: 250,
    timeLimitSeconds: 20,
    rewardScore: 350,
    rewardXP: 25,
    icon: '🐕',
    optionApproveText: 'Deploy Evac Truck (₹250)',
    optionIgnoreText: 'Skip Rescue'
  },
  {
    id: 'hospital_generator',
    title: '⚡ CRITICAL EVENT: Backup Generator Water Threat',
    description: 'Rising water is threatening the hospital basement backup generator. Fast sandbag bund needed!',
    cost: 500,
    timeLimitSeconds: 15,
    rewardScore: 700,
    rewardXP: 50,
    icon: '🏥',
    optionApproveText: 'Rush Generator Defense (₹500)',
    optionIgnoreText: 'Risk Power Cut'
  }
];

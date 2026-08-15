// LOCALSTORAGE SAVE SYSTEM FOR QUAKECRAFT

const SAVE_KEY = 'QUAKECRAFT_PLAYER_DATA_V1';

const DEFAULT_SAVE_DATA = {
  playerName: 'Architect Player',
  architectLevel: 1,
  xp: 0,
  coins: 500,
  gems: {
    quartz: 0,
    emerald: 0,
    sapphire: 0,
    amethyst: 0
  },
  unlockedLevels: [1],
  completedLevels: [],
  badges: [],
  bestStructuralScore: 0,
  bestSafetyScore: 0,
  earthquakesSurvived: 0,
  inventory: {
    materials: {
      normal_base: 20,
      concrete_pillar: 10,
      brick_wall: 15,
      flat_roof: 10
    },
    furniture: {}
  },
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    reduceMotion: false
  }
};

export const loadSaveData = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_SAVE_DATA;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SAVE_DATA, ...parsed };
  } catch (e) {
    return DEFAULT_SAVE_DATA;
  }
};

export const savePlayerData = (data) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save QuakeCraft data', e);
  }
};

export const resetPlayerData = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.error('Failed to reset QuakeCraft data', e);
  }
  return DEFAULT_SAVE_DATA;
};

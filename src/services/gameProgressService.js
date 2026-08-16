const PROGRESS_KEY = 'disasterverse_river_defender_progress';

const defaultProgress = {
  unlockedScenarios: ['scenario_1'],
  achievements: [],
  totalXP: 0,
  highGrade: 'C',
  gamesPlayed: 0
};

export const gameProgressService = {
  getProgress: () => {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return defaultProgress;
      return { ...defaultProgress, ...JSON.parse(data) };
    } catch (e) {
      return defaultProgress;
    }
  },

  saveProgress: (updates) => {
    const current = gameProgressService.getProgress();
    const newProgress = {
      ...current,
      ...updates
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    return newProgress;
  },

  recordGameCompletion: (scenarioId, grade, xpEarned, newAchievements = []) => {
    const current = gameProgressService.getProgress();

    const unlockedScenarios = new Set(current.unlockedScenarios);
    if (grade === 'S' || grade === 'A' || grade === 'B') {
      if (scenarioId === 'scenario_1') unlockedScenarios.add('scenario_2');
      if (scenarioId === 'scenario_2') unlockedScenarios.add('scenario_3');
    }

    const achievements = new Set(current.achievements);
    newAchievements.forEach(a => achievements.add(a));

    const updated = {
      unlockedScenarios: Array.from(unlockedScenarios),
      achievements: Array.from(achievements),
      totalXP: current.totalXP + xpEarned,
      gamesPlayed: current.gamesPlayed + 1
    };

    gameProgressService.saveProgress(updated);

    // Also update global DisasterVerse XP in localStorage if available
    try {
      const globalXP = parseInt(localStorage.getItem('userXP') || '3450', 10);
      localStorage.setItem('userXP', (globalXP + xpEarned).toString());
    } catch (e) {}

    return updated;
  }
};

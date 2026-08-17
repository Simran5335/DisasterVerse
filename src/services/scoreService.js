// Score Service for River Defender - Prepared for backend sync
const LOCAL_SCORES_KEY = 'disasterverse_river_defender_scores';

export const scoreService = {
  getHighScores: () => {
    try {
      const data = localStorage.getItem(LOCAL_SCORES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read scores from localStorage', e);
      return [];
    }
  },

  saveScore: async (scoreEntry) => {
    const entry = {
      id: 'score_' + Date.now(),
      scenarioId: scoreEntry.scenarioId || 'scenario_1',
      scenarioName: scoreEntry.scenarioName || 'Riverside Town',
      score: scoreEntry.finalScore || 0,
      grade: scoreEntry.grade || 'C',
      xpEarned: scoreEntry.xpEarned || 0,
      buildingsSavedPct: scoreEntry.buildingsSavedPct || 0,
      budgetUsed: scoreEntry.budgetUsed || 0,
      date: new Date().toISOString()
    };

    // Save locally
    const currentScores = scoreService.getHighScores();
    currentScores.push(entry);
    currentScores.sort((a, b) => b.score - a.score);
    const top20 = currentScores.slice(0, 20);
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(top20));

    // Optional API dispatch structure for DisasterVerse backend integration
    try {
      if (window.DISASTER_VERSE_API_URL) {
        await fetch(`${window.DISASTER_VERSE_API_URL}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      }
    } catch (err) {
      console.log('Backend sync offline, score stored locally.');
    }

    return entry;
  }
};

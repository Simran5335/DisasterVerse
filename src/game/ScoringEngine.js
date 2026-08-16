export class ScoringEngine {
  static calculateFinalScore(stats) {
    const {
      buildingsStats,
      defensesManager,
      simulation,
      rescueManager,
      comboSystem,
      weatherSystem
    } = stats;

    let score = 0;
    const xpBreakdown = [];

    // 1. Base Game Completion
    xpBreakdown.push({ label: 'Scenario Completed', xp: 50 });

    // 2. Critical Infrastructure Protection
    let hospitalSaved = true;
    let schoolSaved = true;
    let fireSaved = true;

    buildingsStats.criticalList && buildingsStats.criticalList.forEach(b => {
      if (b.type === 'hospital' && b.status !== 'SAFE') hospitalSaved = false;
      if (b.type === 'school' && b.status !== 'SAFE') schoolSaved = false;
      if (b.type === 'fire_station' && b.status !== 'SAFE') fireSaved = false;
    });

    if (hospitalSaved) {
      score += 1500;
      xpBreakdown.push({ label: 'Hospital Fully Protected', xp: 30 });
    }
    if (schoolSaved) {
      score += 1000;
      xpBreakdown.push({ label: 'School Protected', xp: 20 });
    }
    if (fireSaved) {
      score += 1000;
      xpBreakdown.push({ label: 'Fire Station Protected', xp: 20 });
    }

    // 3. Residential Protection Rate
    const savedPct = buildingsStats.housesSavedPct || 0;
    score += Math.round(savedPct * 40); // Max 4000 pts
    if (savedPct >= 80) {
      xpBreakdown.push({ label: '80%+ Residential Saved', xp: 30 });
    }
    if (savedPct >= 95) {
      score += 1000;
      xpBreakdown.push({ label: '95%+ Flood Hero Bonus', xp: 50 });
    }

    // 4. Water Volume Managed
    const waterManaged = Math.round(simulation ? simulation.waterManagedTotal : 0);
    score += Math.min(2000, waterManaged * 2);

    // 5. Budget Efficiency
    const budgetLeft = defensesManager ? defensesManager.budget : 0;
    const initialBudget = defensesManager ? defensesManager.initialBudget : 10000;
    const budgetUsedPct = Math.round(((initialBudget - budgetLeft) / initialBudget) * 100);

    score += Math.round(budgetLeft * 0.2); // ₹2,000 left = 400 pts
    if (budgetUsedPct <= 70) {
      xpBreakdown.push({ label: 'Budget Master (<70% Used)', xp: 20 });
    }

    // 6. Rescue Missions & Combos
    const rescues = rescueManager ? rescueManager.completedCount : 0;
    score += rescues * 400;
    if (rescues > 0) {
      xpBreakdown.push({ label: `Rescue Missions (${rescues})`, xp: rescues * 20 });
    }

    const comboScore = comboSystem ? comboSystem.comboScore : 0;
    const comboXP = comboSystem ? comboSystem.comboXP : 0;
    score += comboScore;
    if (comboXP > 0) {
      xpBreakdown.push({ label: 'Smart Combos Achieved', xp: comboXP });
    }

    // Determine Letter Grade
    let grade = 'C';
    if (score >= 8500) grade = 'S';
    else if (score >= 7000) grade = 'A';
    else if (score >= 5500) grade = 'B';
    else if (score >= 4000) grade = 'C';
    else grade = 'D';

    const totalXP = xpBreakdown.reduce((sum, item) => sum + item.xp, 0);

    return {
      finalScore: score,
      grade,
      totalXP,
      xpBreakdown,
      buildingsSavedPct: savedPct,
      waterManaged,
      budgetUsed: initialBudget - budgetLeft,
      budgetUsedPct,
      rescuesCompleted: rescues,
      combosAchieved: comboSystem ? comboSystem.comboHistory.length : 0,
      hospitalSaved,
      schoolSaved,
      fireSaved
    };
  }
}

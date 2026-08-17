export class WhatIfAnalyzer {
  static analyzeStrategy(grid, defensesManager, scoreResult) {
    const placed = defensesManager.placedDefenses || [];
    const savedPct = scoreResult.buildingsSavedPct || 80;

    let mainIssue = 'Suboptimal defense placement near low-lying sector.';
    let recommendation = 'Place Wetlands in low-lying zones to absorb runoff, and place Flood Walls upstream to redirect flow into natural retention channels.';
    let potentialSavedPct = Math.min(98, savedPct + 14);

    let wallCount = 0;
    let wetlandCount = 0;
    let pumpCount = 0;
    let drainCount = 0;

    placed.forEach(d => {
      if (d.type === 'flood_wall') wallCount++;
      if (d.type === 'wetland') wetlandCount++;
      if (d.type === 'pump') pumpCount++;
      if (d.type === 'drainage') drainCount++;
    });

    if (wallCount > 0 && wetlandCount === 0) {
      mainIssue = 'Over-reliance on solid Flood Walls without absorption buffers.';
      recommendation = 'Solid flood walls block water, but force excess volume into adjacent low-lying residential sectors. Adding Wetlands absorbs the surge safely.';
      potentialSavedPct = Math.min(98, savedPct + 16);
    } else if (pumpCount === 0 && savedPct < 90) {
      mainIssue = 'Lack of active Pumping near critical infrastructure.';
      recommendation = 'Pumps actively remove accumulated water from low elevation pockets near the General Hospital and School.';
      potentialSavedPct = Math.min(98, savedPct + 12);
    } else if (drainCount === 0) {
      mainIssue = 'Missing Drainage conduction channels.';
      recommendation = 'Drainage channels prevent standing water accumulation on evacuation highways and main streets.';
      potentialSavedPct = Math.min(98, savedPct + 10);
    } else {
      mainIssue = 'Defense timing and sector coverage.';
      recommendation = 'Deploy temporary barriers early in Phase 1 before river surge reaches peak velocity.';
      potentialSavedPct = 98;
    }

    return {
      currentStrategyScore: scoreResult.finalScore,
      currentSavedPct: savedPct,
      potentialSavedPct,
      scoreGain: (potentialSavedPct - savedPct) * 120,
      mainIssue,
      recommendation,
      keyInsight: 'Flood management requires a green-gray hybrid approach: barriers redirect water, drainage conducts water, and wetlands absorb volume.',
      suggestedPresetDefenses: [
        { type: 'wetland', col: 6, row: 8 },
        { type: 'flood_wall', col: 4, row: 10 },
        { type: 'pump', col: 13, row: 10 },
        { type: 'drainage', col: 8, row: 12 }
      ]
    };
  }
}

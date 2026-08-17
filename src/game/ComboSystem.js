import { soundManager } from './SoundManager.js';

export class ComboSystem {
  constructor() {
    this.activeCombos = new Set();
    this.comboHistory = [];
    this.comboXP = 0;
    this.comboScore = 0;
  }

  checkCombos(grid) {
    const newCombos = [];
    let hasWetland = false;
    let hasDrainage = false;
    let hasWall = false;
    let hasPump = false;
    let hasParkAbsorber = false;

    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const cell = grid.cells[r][c];
        if (cell.defense) {
          if (cell.defense.type === 'wetland') hasWetland = true;
          if (cell.defense.type === 'drainage') hasDrainage = true;
          if (cell.defense.type === 'flood_wall') hasWall = true;
          if (cell.defense.type === 'pump') hasPump = true;
        }
        if (cell.building && cell.building.type === 'park' && cell.waterDepth > 5) {
          hasParkAbsorber = true;
        }
      }
    }

    // Check Combo 1: Wetland + Drainage
    if (hasWetland && hasDrainage && !this.activeCombos.has('nature_infra')) {
      this.activeCombos.add('nature_infra');
      const combo = {
        id: 'nature_infra',
        title: '🌿 NATURE + INFRASTRUCTURE COMBO!',
        description: 'Combining Wetlands and Drainage channels maximizes absorption and conduction.',
        bonusXP: 25,
        bonusScore: 300
      };
      newCombos.push(combo);
    }

    // Check Combo 2: Wall + Pump
    if (hasWall && hasPump && !this.activeCombos.has('defense_drainage')) {
      this.activeCombos.add('defense_drainage');
      const combo = {
        id: 'defense_drainage',
        title: '🛡️ DEFENSE + PUMP COMBO!',
        description: 'Wall blocks incoming surge while Pump continuously empties backed-up water.',
        bonusXP: 25,
        bonusScore: 300
      };
      newCombos.push(combo);
    }

    // Check Combo 3: Smart City (Wetland + Drainage + Park Overflow)
    if (hasWetland && hasDrainage && hasParkAbsorber && !this.activeCombos.has('smart_city')) {
      this.activeCombos.add('smart_city');
      const combo = {
        id: 'smart_city',
        title: '🌱 SMART CITY COMBINATION!',
        description: 'Comprehensive green-gray resilience network protecting low-lying residential sectors.',
        bonusXP: 50,
        bonusScore: 600
      };
      newCombos.push(combo);
    }

    for (let combo of newCombos) {
      this.comboHistory.push(combo);
      this.comboXP += combo.bonusXP;
      this.comboScore += combo.bonusScore;
      soundManager.playVictory();
    }

    return newCombos;
  }
}

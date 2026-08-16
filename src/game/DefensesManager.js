import { DEFENSES_DATA } from '../data/defenses.js';
import { soundManager } from './SoundManager.js';

export class DefensesManager {
  constructor(grid, initialBudget = 10000) {
    this.grid = grid;
    this.budget = initialBudget;
    this.initialBudget = initialBudget;
    this.placedDefenses = [];
    this.wetlandsCount = 0;
  }

  canPlaceDefense(col, row, defenseType) {
    const cell = this.grid.getCell(col, row);
    if (!cell) return { valid: false, reason: 'Out of bounds' };
    if (cell.isRiver) return { valid: false, reason: 'Cannot place on river channel' };
    if (cell.defense) return { valid: false, reason: 'Cell already has a defense' };
    if (cell.building && cell.building.priority === 'VERY HIGH') {
      return { valid: false, reason: 'Cannot overwrite critical building' };
    }

    const defMeta = DEFENSES_DATA[defenseType];
    if (!defMeta) return { valid: false, reason: 'Unknown defense' };
    if (this.budget < defMeta.cost) return { valid: false, reason: 'Insufficient funds' };

    return { valid: true, cost: defMeta.cost };
  }

  placeDefense(col, row, defenseType) {
    const check = this.canPlaceDefense(col, row, defenseType);
    if (!check.valid) return null;

    const cell = this.grid.getCell(col, row);
    const defMeta = DEFENSES_DATA[defenseType];

    const defenseObj = {
      id: `def_${col}_${row}_${Date.now()}`,
      type: defenseType,
      col,
      row,
      blockHeight: defMeta.blockHeight,
      friction: defMeta.friction,
      pumpRate: defMeta.pumpRate,
      drainRate: defMeta.drainRate,
      absorbRate: defMeta.absorbRate,
      maxAbsorption: defMeta.maxAbsorption || 0,
      absorbed: 0,
      constructionProgress: 0, // 0 to 1 for placement animation
      placedAtTime: Date.now()
    };

    cell.defense = defenseObj;
    this.placedDefenses.push(defenseObj);
    this.budget -= defMeta.cost;

    if (defenseType === 'wetland') {
      this.wetlandsCount++;
    }

    soundManager.playPlacement(defenseType);

    return defenseObj;
  }

  updateConstructions(dt) {
    for (let d of this.placedDefenses) {
      if (d.constructionProgress < 1) {
        d.constructionProgress = Math.min(1, d.constructionProgress + dt * 2.5);
      }
    }
  }

  getBudgetSpent() {
    return this.initialBudget - this.budget;
  }
}

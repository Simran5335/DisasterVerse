// Cellular Grid & Elevation Heightmap Model for River Defender Rebuild
import { BUILDING_TYPES } from '../data/buildings.js';

export class Cell {
  constructor(x, y, height = 5) {
    this.x = x;
    this.y = y;
    this.height = height; // Elevation level (0 = Riverbed, 2-3 = Lowland, 5-7 = City, 8-10 = High Hill)
    this.waterDepth = 0; // Current water depth
    this.flowVx = 0; // Horizontal flow velocity vector
    this.flowVy = 0; // Vertical flow velocity vector
    this.defense = null; // Placed defense object
    this.building = null; // City building structure
    this.isRiver = false; // Is part of the main river channel
    this.isEvacRoad = false; // Is part of the main evacuation highway
    this.riskZone = 'LOW'; // LOW, MEDIUM, HIGH, EXTREME
    this.absorbedWater = 0; // Accumulated absorption for wetlands
  }

  getEffectiveHeight() {
    let extraHeight = 0;
    if (this.defense) {
      extraHeight += this.defense.blockHeight || 0;
    }
    return this.height + extraHeight;
  }

  getTotalSurfaceElevation() {
    return this.getEffectiveHeight() + this.waterDepth;
  }
}

export class WaterGrid {
  constructor(cols = 28, rows = 28, scenario = null) {
    this.cols = cols;
    this.rows = rows;
    this.cells = [];
    this.scenario = scenario;
    this.initGrid();
  }

  initGrid() {
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(new Cell(c, r));
      }
      this.cells.push(row);
    }
    this.generateTerrain();
  }

  generateTerrain() {
    const riverStartCol = this.scenario ? (this.scenario.riverColRange ? this.scenario.riverColRange[0] : 0) : 0;
    const riverEndCol = this.scenario ? (this.scenario.riverColRange ? this.scenario.riverColRange[1] : 4) : 4;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];

        // S-Curve River Channel on West side
        const riverCurve = Math.sin(r * 0.2) * 2.0;
        const inRiver = c >= (riverStartCol + riverCurve) && c <= (riverEndCol + riverCurve);

        if (inRiver) {
          cell.isRiver = true;
          cell.height = 0; // Lowest riverbed elevation
          cell.waterDepth = 15; // Initial river water
        } else {
          // Elevation tiers: Lowland near river -> City Residential -> High Ground Hills
          const distFromRiver = c - riverEndCol;
          if (distFromRiver <= 4) {
            cell.height = 2 + Math.floor(distFromRiver * 0.5); // Low-lying sector (2-4)
          } else if (distFromRiver <= 16) {
            cell.height = 5 + Math.floor((distFromRiver - 4) * 0.15); // City sector (5-7)
          } else {
            cell.height = 8 + Math.floor(Math.sin(r * 0.4) * 1.5); // High ground hills (8-10)
          }
        }
      }
    }

    // Place Evacuation Highway across the city middle
    const evacRow = Math.floor(this.rows / 2);
    for (let c = 0; c < this.cols; c++) {
      const cell = this.cells[evacRow][c];
      if (!cell.isRiver) {
        cell.isEvacRoad = true;
        cell.building = {
          id: `evac_road_${c}`,
          type: BUILDING_TYPES.EVACUATION_ROAD,
          name: 'Evacuation Highway',
          priority: 'HIGH',
          maxWaterTolerance: 30,
          waterDamage: 0,
          status: 'SAFE'
        };
      }
    }
  }

  getCell(c, r) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      return this.cells[r][c];
    }
    return null;
  }

  getNeighbors(c, r) {
    const neighbors = [];
    const dirs = [
      { dc: 0, dr: -1 }, // North
      { dc: 1, dr: 0 },  // East
      { dc: 0, dr: 1 },  // South
      { dc: -1, dr: 0 }  // West
    ];
    for (let d of dirs) {
      const nc = c + d.dc;
      const nr = r + d.dr;
      const neighbor = this.getCell(nc, nr);
      if (neighbor) {
        neighbors.push({ cell: neighbor, dc: d.dc, dr: d.dr });
      }
    }
    return neighbors;
  }

  updateRiskZones(riverLevelPct) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];
        if (cell.isRiver) {
          cell.riskZone = 'EXTREME';
          continue;
        }

        const depth = cell.waterDepth;
        const height = cell.height;

        if (depth > 25 || (height <= 3 && riverLevelPct > 70)) {
          cell.riskZone = 'EXTREME';
        } else if (depth > 12 || (height <= 4 && riverLevelPct > 50)) {
          cell.riskZone = 'HIGH';
        } else if (depth > 3 || (height <= 6 && riverLevelPct > 30)) {
          cell.riskZone = 'MEDIUM';
        } else {
          cell.riskZone = 'LOW';
        }
      }
    }
  }
}

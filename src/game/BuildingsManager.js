import { BUILDING_TYPES, BUILDINGS_DATA } from '../data/buildings.js';

export class BuildingsManager {
  constructor(grid) {
    this.grid = grid;
    this.buildingsList = [];
    this.criticalBuildings = [];
    this.housesCount = 0;
  }

  placeDefaultCityStructures() {
    this.buildingsList = [];
    this.criticalBuildings = [];
    this.housesCount = 0;

    const cols = this.grid.cols;
    const rows = this.grid.rows;
    const evacRow = Math.floor(rows / 2);

    // Key Landmark Locations (Large Hospitals, Schools, Fire Stations, Emergency Center)
    const keyLocations = [
      { col: 14, row: evacRow - 3, type: BUILDING_TYPES.HOSPITAL, label: 'HOSPITAL' },
      { col: 12, row: evacRow + 3, type: BUILDING_TYPES.SCHOOL, label: 'SCHOOL' },
      { col: 18, row: evacRow + 4, type: BUILDING_TYPES.FIRE_STATION, label: 'FIRE STATION' },
      { col: 20, row: evacRow - 4, type: BUILDING_TYPES.EMERGENCY_CENTER, label: 'EMERGENCY CENTER' }
    ];

    // Place Key Infrastructures
    keyLocations.forEach((loc, idx) => {
      const cell = this.grid.getCell(loc.col, loc.row);
      if (cell && !cell.isRiver && !cell.isEvacRoad) {
        const meta = BUILDINGS_DATA[loc.type] || {
          name: loc.label,
          icon: '🏥',
          priority: 'CRITICAL',
          priorityScore: 100,
          maxWaterTolerance: 20
        };
        const buildingObj = {
          id: `bld_key_${idx}_${loc.type}`,
          type: loc.type,
          name: meta.name || loc.label,
          icon: meta.icon,
          priority: meta.priority,
          priorityScore: meta.priorityScore,
          maxWaterTolerance: meta.maxWaterTolerance,
          cellCol: loc.col,
          cellRow: loc.row,
          waterDamage: 0, // 0 to 100
          status: 'SAFE' // SAFE, THREATENED, DAMAGED, SUBMERGED
        };
        cell.building = buildingObj;
        this.buildingsList.push(buildingObj);
        this.criticalBuildings.push(buildingObj);
      }
    });

    // Place 30+ Varied Residential Houses and Parks across the city
    const roofColors = ['#b91c1c', '#1d4ed8', '#d97706', '#059669', '#7c3aed'];
    let houseIndex = 0;

    for (let r = 2; r < rows - 2; r++) {
      for (let c = 6; c < cols - 2; c++) {
        const cell = this.grid.getCell(c, r);
        if (cell && !cell.isRiver && !cell.isEvacRoad && !cell.building) {
          // Grid distribution density
          if ((c + r * 2) % 3 === 0 && Math.random() > 0.25) {
            const isPark = (c % 6 === 0 && r % 4 === 0);
            const bType = isPark ? BUILDING_TYPES.PARK : BUILDING_TYPES.RESIDENTIAL;
            const meta = BUILDINGS_DATA[bType] || {
              name: isPark ? 'City Park' : 'Residential House',
              icon: isPark ? '🌳' : '🏠',
              priority: 'MEDIUM',
              priorityScore: 20,
              maxWaterTolerance: 15
            };

            const buildingObj = {
              id: `bld_${c}_${r}`,
              type: bType,
              name: bType === BUILDING_TYPES.PARK ? 'City Park' : 'Residential House',
              icon: meta.icon,
              priority: meta.priority,
              priorityScore: meta.priorityScore,
              maxWaterTolerance: meta.maxWaterTolerance,
              cellCol: c,
              cellRow: r,
              waterDamage: 0,
              status: 'SAFE',
              roofColor: roofColors[houseIndex % roofColors.length],
              floors: 1 + (houseIndex % 2)
            };
            cell.building = buildingObj;
            this.buildingsList.push(buildingObj);
            if (bType === BUILDING_TYPES.RESIDENTIAL) {
              this.housesCount++;
              houseIndex++;
            }
          }
        }
      }
    }
  }

  updateBuildingsState() {
    let housesSaved = 0;
    let totalDamage = 0;

    for (let b of this.buildingsList) {
      const cell = this.grid.getCell(b.cellCol, b.cellRow);
      if (!cell) continue;

      const water = cell.waterDepth;
      if (water > b.maxWaterTolerance) {
        b.waterDamage = Math.min(100, b.waterDamage + (water - b.maxWaterTolerance) * 0.12);
      } else if (water < 2 && b.waterDamage > 0) {
        b.waterDamage = Math.max(0, b.waterDamage - 0.08); // Recovery when dry
      }

      if (b.waterDamage >= 80) {
        b.status = 'SUBMERGED';
      } else if (b.waterDamage >= 30) {
        b.status = 'DAMAGED';
      } else if (water > 4) {
        b.status = 'THREATENED';
      } else {
        b.status = 'SAFE';
      }

      if (b.type === BUILDING_TYPES.RESIDENTIAL && b.status !== 'SUBMERGED') {
        housesSaved++;
      }
      totalDamage += b.waterDamage;
    }

    const savedPct = this.housesCount > 0 ? Math.round((housesSaved / this.housesCount) * 100) : 100;
    
    // Find key building statuses
    const hospital = this.criticalBuildings.find(b => b.type === BUILDING_TYPES.HOSPITAL);
    const school = this.criticalBuildings.find(b => b.type === BUILDING_TYPES.SCHOOL);

    return {
      housesSavedPct: savedPct,
      housesSavedCount: housesSaved,
      totalHouses: this.housesCount,
      hospitalSaved: hospital ? hospital.status !== 'SUBMERGED' : true,
      schoolSaved: school ? school.status !== 'SUBMERGED' : true,
      totalDamage
    };
  }
}

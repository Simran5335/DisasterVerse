// Real-Time Hydraulic Cellular Flood Simulation Engine for River Defender
export class FloodSimulation {
  constructor(grid, defensesManager, buildingsManager) {
    this.grid = grid;
    this.defensesManager = defensesManager;
    this.buildingsManager = buildingsManager;

    this.waterManagedTotal = 0;
    this.totalInflow = 0;
    this.simulationTime = 0;
    this.pumpsActive = true;
    this.pumpDisabledTimer = 0;
  }

  setPumpStatus(active, durationSec = 0) {
    this.pumpsActive = active;
    this.pumpDisabledTimer = durationSec;
  }

  step(dt, weatherPhase, riverLevelPct, rainfallRateMm) {
    this.simulationTime += dt;

    if (this.pumpDisabledTimer > 0) {
      this.pumpDisabledTimer -= dt;
      if (this.pumpDisabledTimer <= 0) {
        this.pumpsActive = true;
      }
    }

    const cols = this.grid.cols;
    const rows = this.grid.rows;

    // 1. INFLOW & RAINFALL ACCUMULATION
    // River level drives river cell water depth
    const riverTargetDepth = 10 + (riverLevelPct * 0.4); // e.g. 10 to 50
    const rainPerCell = (rainfallRateMm / 1000) * dt * 0.8;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid.cells[r][c];

        if (cell.isRiver) {
          // River depth rises
          if (cell.waterDepth < riverTargetDepth) {
            const surge = (riverTargetDepth - cell.waterDepth) * dt * 0.5;
            cell.waterDepth += surge;
            this.totalInflow += surge;
          }
        } else {
          // Rain falls across terrain
          cell.waterDepth += rainPerCell;
          this.totalInflow += rainPerCell;
        }
      }
    }

    // 2. DEFENSE EFFECTS (Pumps, Drainage, Wetlands)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid.cells[r][c];
        if (!cell.defense || cell.defense.constructionProgress < 0.8) continue;

        const def = cell.defense;

        // PUMPS: extract water in 3x3 radius
        if (def.type === 'pump' && this.pumpsActive) {
          const radius = def.pumpRate ? 1 : 1;
          for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
              const target = this.grid.getCell(c + dc, r + dr);
              if (target && target.waterDepth > 0) {
                const removed = Math.min(target.waterDepth, def.pumpRate * dt * 0.5);
                target.waterDepth -= removed;
                this.waterManagedTotal += removed;
              }
            }
          }
        }

        // DRAINAGE CHANNELS: quickly transfer water to lowest neighbor/outflow
        if (def.type === 'drainage' && cell.waterDepth > 0) {
          const drainAmount = Math.min(cell.waterDepth, def.drainRate * dt);
          cell.waterDepth -= drainAmount;
          this.waterManagedTotal += drainAmount;

          // Pass to adjacent river cell or lower neighbor
          const neighbors = this.grid.getNeighbors(c, r);
          let lowest = null;
          let minElev = Infinity;
          for (let n of neighbors) {
            const elev = n.cell.getTotalSurfaceElevation();
            if (elev < minElev) {
              minElev = elev;
              lowest = n.cell;
            }
          }
          if (lowest) {
            lowest.waterDepth += drainAmount * 0.7; // slight loss in transmission
          }
        }

        // WETLANDS: sponge up water up to max capacity
        if (def.type === 'wetland' && cell.waterDepth > 0) {
          if (def.absorbed < def.maxAbsorption) {
            const absorb = Math.min(cell.waterDepth, def.absorbRate * dt * 2.0);
            const actualAbsorb = Math.min(absorb, def.maxAbsorption - def.absorbed);
            cell.waterDepth -= actualAbsorb;
            def.absorbed += actualAbsorb;
            this.waterManagedTotal += actualAbsorb;
          }
        }
      }
    }

    // 3. FLUID DYNAMICS (HEIGHT GRADIENT CELLULAR FLOW)
    // Create delta matrix to prevent directional order bias
    const deltas = Array.from({ length: rows }, () => new Float32Array(cols));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid.cells[r][c];
        if (cell.waterDepth <= 0.05) continue;

        const surfaceElev = cell.getTotalSurfaceElevation();
        const neighbors = this.grid.getNeighbors(c, r);

        let totalOutflow = 0;

        for (let n of neighbors) {
          const target = n.cell;
          const targetElev = target.getTotalSurfaceElevation();

          // Flow happens if source surface is higher than target surface
          if (surfaceElev > targetElev) {
            let diff = surfaceElev - targetElev;

            // Apply defense friction / barrier block
            let flowMultiplier = 0.35; // base fluid viscosity

            if (target.defense) {
              if (target.defense.type === 'flood_wall' || target.defense.type === 'temp_barrier') {
                // Wall blocks water up to wall effective height
                const wallTop = target.getEffectiveHeight();
                if (surfaceElev <= wallTop) {
                  // Water cannot breach wall! Completely blocked & redirected
                  diff = 0;
                  flowMultiplier = 0;
                } else {
                  // Overflow above wall
                  diff = surfaceElev - wallTop;
                }
              }
              if (target.defense.friction) {
                flowMultiplier *= (1 - target.defense.friction * 0.8);
              }
            }

            if (diff > 0 && flowMultiplier > 0) {
              const flowRate = diff * flowMultiplier * dt * 2.0;
              const maxTransfer = cell.waterDepth * 0.25; // stability limit per frame
              const transfer = Math.min(flowRate, maxTransfer);

              deltas[r][c] -= transfer;
              deltas[target.y][target.x] += transfer;

              totalOutflow += transfer;
              cell.flowVx = n.dc * transfer;
              cell.flowVy = n.dr * transfer;
            }
          }
        }
      }
    }

    // Apply deltas to grid cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid.cells[r][c];
        cell.waterDepth = Math.max(0, cell.waterDepth + deltas[r][c]);
      }
    }

    // Update risk zones & building damage states
    this.grid.updateRiskZones(riverLevelPct);
    return this.buildingsManager.updateBuildingsState();
  }
}

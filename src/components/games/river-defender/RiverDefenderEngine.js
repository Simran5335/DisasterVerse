// ============================================================
// RIVER DEFENDER — GAME ENGINE
// ============================================================
// Runs the actual River Defender gameplay.
//
// Responsibilities:
//   - Run flood simulation
//   - Raise river level
//   - Spread water downhill
//   - Apply flood walls
//   - Apply sandbags
//   - Apply pumps
//   - Calculate building safety
//   - Handle rewards
//   - Calculate score
//   - Determine victory / defeat
//
// IMPORTANT:
//   - No React
//   - No canvas drawing
//   - No budget / money system
//
// Compatible with:
//   - riverDefenderData.js
//   - RiverDefenderWorld.js
//   - RiverDefenderRenderer.js
//   - RiverDefenderGame.jsx
// ============================================================

import {
  DEFENSE_TYPES,
  DEFENSE_ORDER,
  GAME_RULES,
  createBuildingState,
  createDefenseInventory,
} from "./riverDefenderData.js";

import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  createWorldArrays,
  initializeWorld,
  isRiver,
  isWetland,
  isLowGround,
  buildingAt,
  inBounds,
} from "./RiverDefenderWorld.js";


// ============================================================
// CONSTANTS
// ============================================================

const NEIGHBOURS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const WATER_EPSILON = 0.012;

const MAX_WATER_DEPTH = 1.35;

// Base amount of water transferred per simulation step.
const FLOW_RATE = 0.075;

// Flood movement is intentionally gradual so the player has time
// to read the map, place defenses, and react.
const MAX_TRANSFER_PER_CELL = 0.055;

// Prevent water from disappearing too quickly.
const WATER_RETENTION = 0.992;

// How strongly elevation influences movement.
const ELEVATION_INFLUENCE = 2.4;

// Wall effectiveness.
const WALL_BLOCK_STRENGTH = 0.94;

// Sandbag slowdown.
const SANDBAG_FLOW_MULTIPLIER = 0.42;

// Pump strength is supplied by the data file.
const DEFAULT_RAINFALL = 40;


// ============================================================
// ENGINE
// ============================================================

export class RiverDefenderEngine {

  constructor() {
    this.reset();
  }


  // ==========================================================
  // RESET
  // ==========================================================

  reset() {

    const world = createWorldArrays();

    this.elevation =
      world.elevation;

    this.water =
      world.water;

    this.nextWater =
      world.nextWater;


    initializeWorld(
      this.elevation,
      this.water,
      this.nextWater
    );


    // --------------------------------------------------------
    // Buildings
    // --------------------------------------------------------

    this.buildings =
      createBuildingState();


    // --------------------------------------------------------
    // Defenses
    // --------------------------------------------------------

    this.defenses = [];


    // --------------------------------------------------------
    // Inventory
    // --------------------------------------------------------

    this.inventory =
      createDefenseInventory();


    // --------------------------------------------------------
    // Rewards
    // --------------------------------------------------------

    this.unlocked =
      new Set();


    // --------------------------------------------------------
    // Flood state
    // --------------------------------------------------------

    this.riverLevel =
      GAME_RULES.riverStartLevel;

    this.rainfall =
      DEFAULT_RAINFALL;

    this.elapsed = 0;

    this.running = false;

    this.finished = false;

    this.floodStarted = false;


    // --------------------------------------------------------
    // PLAYER PROGRESSION
    // --------------------------------------------------------

    this.hasPlacedDefense = false;

    this.objectiveStage = 0;

    this.objectiveMessage =
      "🎯 First objective: place your first defense.";

    this.objectiveType =
      "info";

    this.hospitalProtectedOnce = false;

    this.schoolProtectedOnce = false;

    this.communityProtectedOnce = false;


    // --------------------------------------------------------
    // Score
    // --------------------------------------------------------

    this.score = 0;

    this.xp = 0;


    // --------------------------------------------------------
    // UI message
    // --------------------------------------------------------

    this.message =
      "Place your defenses before the flood reaches the town.";

    this.messageType =
      "info";


    // --------------------------------------------------------
    // Internal timing
    // --------------------------------------------------------

    this.lastUpdate = 0;


    // --------------------------------------------------------
    // React subscriptions
    // --------------------------------------------------------

    this.listeners =
      new Set();
  }


  // ==========================================================
  // SUBSCRIPTIONS
  // ==========================================================

  subscribe(listener) {

    if (
      typeof listener !==
      "function"
    ) {
      return () => {};
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }


  notify() {

    const snapshot =
      this.getSnapshot();

    for (
      const listener of this.listeners
    ) {
      listener(snapshot);
    }
  }


  // ==========================================================
  // START
  // ==========================================================

  start() {

    if (this.finished) {
      this.reset();
    }

    this.running = true;

    this.floodStarted = true;

    this.message =
      "🌊 Flood started! Protect the hospital, school and community.";

    this.messageType =
      "warning";

    this.lastUpdate = 0;

    this.notify();
  }


  // ==========================================================
  // PAUSE
  // ==========================================================

  pause() {

    if (this.finished) {
      return;
    }

    this.running = false;

    this.message =
      "⏸️ Flood paused. Plan your next move.";

    this.messageType =
      "info";

    this.notify();
  }


  // ==========================================================
  // RESUME
  // ==========================================================

  resume() {

    if (this.finished) {
      return;
    }

    this.running = true;

    this.message =
      "🌊 The flood is moving again!";

    this.messageType =
      "warning";

    this.notify();
  }


  // ==========================================================
  // STOP FLOOD
  // ==========================================================
  //
  // Used by UI controls when the player wants to stop the
  // simulation completely without resetting their defenses.
  // ==========================================================

  stopFlood() {

    if (this.finished) {
      return;
    }

    this.running = false;
    this.floodStarted = false;

    this.message =
      "⏹️ Flood stopped. Your defenses remain in place.";

    this.messageType =
      "info";

    this.notify();
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  update(deltaSeconds = 0.016) {

    if (
      !this.running ||
      this.finished
    ) {
      return;
    }


    const delta =
      Math.min(
        Math.max(deltaSeconds, 0),
        0.1
      );


    this.elapsed += delta;


    // ========================================================
    // FLOOD PROGRESS
    // ========================================================

    const progress =
      Math.min(
        this.elapsed /
          GAME_RULES.gameDurationSeconds,
        1
      );


    this.riverLevel =
      Math.min(
        1,
        GAME_RULES.riverStartLevel +
          progress *
            GAME_RULES.riverRiseAmount
      );


    // ========================================================
    // RAINFALL
    // ========================================================

    this.rainfall =
      Math.round(
        DEFAULT_RAINFALL +
          progress * 190
      );


    // ========================================================
    // RIVER INPUT
    // ========================================================

    this.injectRiverWater(delta);


    // ========================================================
    // WATER MOVEMENT
    // ========================================================

    this.simulateWater(delta);


    // ========================================================
    // DEFENSES
    // ========================================================

    this.applyDefenses(delta);


    // ========================================================
    // BUILDING SAFETY
    // ========================================================

    this.updateBuildingSafety();


    // ========================================================
    // REWARDS
    // ========================================================

    this.checkUnlocks();


    // ========================================================
    // SCORE
    // ========================================================

    this.updateScore();


    // ========================================================
    // VICTORY / DEFEAT
    // ========================================================

    if (
      progress >= 1
    ) {
      this.finishGame();
      return;
    }


    this.notify();
  }


  // ==========================================================
  // RIVER WATER
  // ==========================================================

  injectRiverWater(delta) {

    const riverStrength =
      this.riverLevel *
      delta *
      0.72;


    for (
      let y = 0;
      y < WORLD_HEIGHT;
      y++
    ) {

      for (
        let x = 0;
        x < WORLD_WIDTH;
        x++
      ) {

        if (
          !isRiver(x, y)
        ) {
          continue;
        }


        this.water[y][x] =
          Math.min(
            MAX_WATER_DEPTH,

            this.water[y][x] +
              riverStrength
          );
      }
    }
  }


  // ==========================================================
  // WATER SIMULATION
  // ==========================================================

  simulateWater(delta) {

    // --------------------------------------------------------
    // Reset next frame
    // --------------------------------------------------------

    for (
      let y = 0;
      y < WORLD_HEIGHT;
      y++
    ) {

      for (
        let x = 0;
        x < WORLD_WIDTH;
        x++
      ) {

        this.nextWater[y][x] =
          this.water[y][x] *
          WATER_RETENTION;
      }
    }


    // --------------------------------------------------------
    // Spread water
    // --------------------------------------------------------

    for (
      let y = 0;
      y < WORLD_HEIGHT;
      y++
    ) {

      for (
        let x = 0;
        x < WORLD_WIDTH;
        x++
      ) {

        const currentWater =
          this.water[y][x];


        if (
          currentWater <=
          WATER_EPSILON
        ) {
          continue;
        }


        const currentElevation =
          this.elevation[y][x];


        const candidates = [];


        // ----------------------------------------------------
        // Find lower neighbours
        // ----------------------------------------------------

        for (
          const neighbour of NEIGHBOURS
        ) {

          const nx =
            x + neighbour.x;

          const ny =
            y + neighbour.y;


          if (
            !inBounds(nx, ny)
          ) {
            continue;
          }


          // --------------------------------------------------
          // A wall occupying either cell blocks flow.
          // --------------------------------------------------

          if (
            this.hasWallBetween(
              x,
              y,
              nx,
              ny
            )
          ) {
            continue;
          }


          const neighbourElevation =
            this.elevation[ny][nx];


          const neighbourWater =
            this.water[ny][nx];


          const currentSurface =
            currentElevation +
            currentWater;


          const neighbourSurface =
            neighbourElevation +
            neighbourWater;


          const difference =
            currentSurface -
            neighbourSurface;


          if (
            difference <=
            0.01
          ) {
            continue;
          }


          candidates.push({
            x: nx,
            y: ny,
            difference,
          });
        }


        if (
          candidates.length === 0
        ) {
          continue;
        }


        // ----------------------------------------------------
        // Sort lowest first
        // ----------------------------------------------------

        candidates.sort(
          (a, b) =>
            b.difference -
            a.difference
        );


        // ----------------------------------------------------
        // We allow water to spread to more than one neighbour.
        // This makes the flood look much more natural.
        // ----------------------------------------------------

        const strongest =
          candidates.slice(0, 3);


        const share =
          currentWater /
          strongest.length;


        for (
          const target of strongest
        ) {

          let transfer =
            share *
            FLOW_RATE *
            delta *
            60;


          transfer *=
            Math.min(
              1,
              target.difference *
                ELEVATION_INFLUENCE
            );


          // --------------------------------------------------
          // Wetlands absorb / slow floodwater.
          // --------------------------------------------------

          if (
            isWetland(
              target.x,
              target.y
            )
          ) {
            transfer *= 0.28;
          }


          // --------------------------------------------------
          // Low ground attracts water.
          // --------------------------------------------------

          if (
            isLowGround(
              target.x,
              target.y
            )
          ) {
            transfer *= 1.45;
          }


          // --------------------------------------------------
          // Sandbags slow incoming water.
          // --------------------------------------------------

          if (
            this.hasSandbags(
              target.x,
              target.y
            )
          ) {
            transfer *=
              SANDBAG_FLOW_MULTIPLIER;
          }


          // --------------------------------------------------
          // Do not drain more than available.
          // --------------------------------------------------

          transfer =
            Math.min(
              transfer,
              currentWater * 0.22,
              MAX_TRANSFER_PER_CELL
            );


          this.nextWater[y][x] -=
            transfer;


          this.nextWater[target.y][target.x] +=
            transfer;
        }
      }
    }


    // --------------------------------------------------------
    // Clamp
    // --------------------------------------------------------

    for (
      let y = 0;
      y < WORLD_HEIGHT;
      y++
    ) {

      for (
        let x = 0;
        x < WORLD_WIDTH;
        x++
      ) {

        this.water[y][x] =
          Math.max(
            0,

            Math.min(
              MAX_WATER_DEPTH,
              this.nextWater[y][x]
            )
          );
      }
    }
  }


  // ==========================================================
  // CHECK WALL BETWEEN CELLS
  // ==========================================================

  hasWallBetween(
    x1,
    y1,
    x2,
    y2
  ) {

    return this.defenses.some(
      (defense) => {

        if (
          defense.type !==
          "wall"
        ) {
          return false;
        }


        const wx =
          Math.round(
            defense.x
          );

        const wy =
          Math.round(
            defense.y
          );


        // Wall cell itself.
        if (
          wx === x1 &&
          wy === y1
        ) {
          return true;
        }


        if (
          wx === x2 &&
          wy === y2
        ) {
          return true;
        }


        return false;
      }
    );
  }


  // ==========================================================
  // DEFENSE EFFECTS
  // ==========================================================

  applyDefenses(delta) {

    for (
      const defense of this.defenses
    ) {

      if (
        !defense.active
      ) {
        continue;
      }


      defense.animation =
        Math.min(
          1,
          (defense.animation || 0) +
            delta * 4
        );


      switch (
        defense.type
      ) {

        case "pump":

          this.applyPump(
            defense,
            delta
          );

          break;


        case "wall":

          this.applyWall(
            defense,
            delta
          );

          break;


        case "sand":

          this.applySandbags(
            defense,
            delta
          );

          break;


        default:
          break;
      }
    }
  }


  // ==========================================================
  // PUMP
  // ==========================================================

  applyPump(
    defense,
    delta
  ) {

    const radius =
      DEFENSE_TYPES.pump.radius;


    const removal =
      DEFENSE_TYPES.pump
        .removalRate *
      delta;


    for (
      let y =
        Math.floor(
          defense.y - radius
        );

      y <=
        Math.ceil(
          defense.y + radius
        );

      y++
    ) {

      for (
        let x =
          Math.floor(
            defense.x - radius
          );

        x <=
          Math.ceil(
            defense.x + radius
          );

        x++
      ) {

        if (
          !inBounds(x, y)
        ) {
          continue;
        }


        const dx =
          x - defense.x;

        const dy =
          y - defense.y;


        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        if (
          distance >
          radius
        ) {
          continue;
        }


        const factor =
          Math.max(
            0,
            1 -
              distance /
                radius
          );


        this.water[y][x] =
          Math.max(
            0,

            this.water[y][x] -
              removal *
                factor
          );
      }
    }
  }


  // ==========================================================
  // FLOOD WALL
  // ==========================================================
  //
  // The wall now acts as a real barrier.
  //
  // It:
  //   - blocks water movement through its cell
  //   - removes a small amount of water touching it
  //   - redirects pressure toward surrounding cells
  //
  // It does NOT create extra water.
  // ==========================================================

  applyWall(
    defense,
    delta
  ) {

    const x =
      Math.round(
        defense.x
      );

    const y =
      Math.round(
        defense.y
      );


    if (
      !inBounds(x, y)
    ) {
      return;
    }


    const strength =
      DEFENSE_TYPES.wall
        .strength;


    // --------------------------------------------------------
    // A wall can absorb a small amount of water pressure.
    // --------------------------------------------------------

    const localWater =
      this.water[y][x];


    if (
      localWater > 0
    ) {

      this.water[y][x] =
        Math.max(
          0,

          localWater -
            localWater *
              strength *
              delta *
              1.8
        );
    }


    // --------------------------------------------------------
    // Push water away from the wall.
    // --------------------------------------------------------

    for (
      const neighbour of NEIGHBOURS
    ) {

      const nx =
        x + neighbour.x;

      const ny =
        y + neighbour.y;


      if (
        !inBounds(nx, ny)
      ) {
        continue;
      }


      if (
        this.water[ny][nx] <=
        WATER_EPSILON
      ) {
        continue;
      }


      // The wall contains nearby water.
      // It never creates artificial water; it simply reduces
      // pressure around the barrier so the normal terrain flow
      // redirects water toward other available cells.

      this.water[ny][nx] *=
        Math.max(
          0.12,
          1 -
            WALL_BLOCK_STRENGTH *
              delta *
              1.35
        );
    }
  }


  // ==========================================================
  // SAND BAGS
  // ==========================================================

  applySandbags(
    defense,
    delta
  ) {

    const radius =
      DEFENSE_TYPES.sand.radius;


    const slowdown =
      DEFENSE_TYPES.sand
        .strength;


    for (
      let y =
        Math.floor(
          defense.y - radius
        );

      y <=
        Math.ceil(
          defense.y + radius
        );

      y++
    ) {

      for (
        let x =
          Math.floor(
            defense.x - radius
          );

        x <=
          Math.ceil(
            defense.x + radius
        );

        x++
      ) {

        if (
          !inBounds(x, y)
        ) {
          continue;
        }


        const dx =
          x - defense.x;

        const dy =
          y - defense.y;


        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        if (
          distance >
          radius
        ) {
          continue;
        }


        // Sandbags do not remove water.
        // They reduce its local pressure.
        this.water[y][x] *=
          Math.max(
            0.35,
            1 -
              slowdown *
                delta *
                2
          );
      }
    }
  }


  // ==========================================================
  // PLACE DEFENSE
  // ==========================================================

  placeDefense(
    type,
    x,
    y
  ) {

    // --------------------------------------------------------
    // Validate type
    // --------------------------------------------------------

    if (
      !DEFENSE_TYPES[type]
    ) {

      return {
        success: false,

        message:
          "Unknown defense.",
      };
    }


    // --------------------------------------------------------
    // Validate coordinates
    // --------------------------------------------------------

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {

      return {
        success: false,

        message:
          "Choose a location on the map.",
      };
    }


    const gridX =
      Math.round(x);

    const gridY =
      Math.round(y);


    if (
      !inBounds(
        gridX,
        gridY
      )
    ) {

      return {
        success: false,

        message:
          "That location is outside the map.",
      };
    }


    // --------------------------------------------------------
    // Inventory
    // --------------------------------------------------------

    if (
      !this.inventory[type] ||
      this.inventory[type] <= 0
    ) {

      return {
        success: false,

        message:
          `No ${DEFENSE_TYPES[type].name} left.`,
      };
    }


    // --------------------------------------------------------
    // Prevent stacking
    // --------------------------------------------------------

    const occupied =
      this.defenses.some(
        (defense) =>
          Math.round(
            defense.x
          ) === gridX &&
          Math.round(
            defense.y
          ) === gridY
      );


    if (occupied) {

      return {
        success: false,

        message:
          "Choose another spot.",
      };
    }


    // --------------------------------------------------------
    // Prevent placing directly on buildings
    // --------------------------------------------------------

    const building =
      buildingAt(
        this.buildings,
        gridX,
        gridY
      );


    if (building) {

      return {
        success: false,

        message:
          "Place the defense beside the building, not on it.",
      };
    }


    // --------------------------------------------------------
    // Don't put walls inside the river.
    // --------------------------------------------------------

    if (
      type === "wall" &&
      isRiver(
        gridX,
        gridY
      )
    ) {

      return {
        success: false,

        message:
          "Place the flood wall beside the river, not inside it.",
      };
    }

    // Pumps and sandbags can be placed near active water,
    // but a pump should not be wasted on the far edge of the map.
    if (
      type === "pump" &&
      this.water[gridY]?.[gridX] <= WATER_EPSILON &&
      !isRiver(gridX, gridY)
    ) {
      const nearbyFlood =
        NEIGHBOURS.some((offset) => {
          const nx = gridX + offset.x;
          const ny = gridY + offset.y;

          return (
            inBounds(nx, ny) &&
            this.water[ny][nx] > WATER_EPSILON
          );
        });

      if (!nearbyFlood) {
        return {
          success: false,
          message:
            "Place the pump near water or the river.",
        };
      }
    }


    // --------------------------------------------------------
    // Create defense
    // --------------------------------------------------------

    const defense = {

      id:
        `${type}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      type,

      x: gridX,

      y: gridY,

      createdAt:
        this.elapsed,

      active: true,

      animation: 0,
    };


    this.defenses.push(
      defense
    );


    this.inventory[type] -=
      1;


    // --------------------------------------------------------
    // PLAYER HAS MADE A REAL DEFENSE MOVE
    // --------------------------------------------------------

    this.hasPlacedDefense =
      true;


    if (
      this.objectiveStage === 0
    ) {

      this.objectiveMessage =
        "🏥 Protect the hospital! Keep floodwater away from it.";

      this.objectiveType =
        "warning";
    }


    // --------------------------------------------------------
    // Feedback
    // --------------------------------------------------------

    if (
      type === "wall"
    ) {

      this.message =
        "🧱 Flood wall built! It will block the flood path.";

      this.messageType =
        "success";
    }


    if (
      type === "pump"
    ) {

      this.message =
        "💧 Pump activated! Nearby floodwater is being removed.";

      this.messageType =
        "success";
    }


    if (
      type === "sand"
    ) {

      this.message =
        "🟨 Sandbags placed! Water will slow down here.";

      this.messageType =
        "success";
    }


    this.notify();


    return {
      success: true,

      defense,
    };
  }


  // ==========================================================
  // REMOVE DEFENSE
  // ==========================================================

  removeDefense(
    defenseId
  ) {

    const index =
      this.defenses.findIndex(
        (defense) =>
          defense.id ===
          defenseId
      );


    if (
      index === -1
    ) {

      return {
        success: false,

        message:
          "Defense not found.",
      };
    }


    const defense =
      this.defenses[index];


    this.defenses.splice(
      index,
      1
    );


    // Return the tool to inventory.
    if (
      this.inventory[
        defense.type
      ] !== undefined
    ) {

      this.inventory[
        defense.type
      ] += 1;
    }


    this.message =
      "Defense removed. You can reposition it.";

    this.messageType =
      "info";


    this.notify();


    return {
      success: true,
    };
  }


  // ==========================================================
  // BUILDING SAFETY
  // ==========================================================

  updateBuildingSafety() {

    for (
      const building of this.buildings
    ) {

      let totalWater = 0;

      let cells = 0;


      for (
        let y =
          building.y;

        y <
          building.y +
            building.h;

        y++
      ) {

        for (
          let x =
            building.x;

          x <
            building.x +
              building.w;

          x++
        ) {

          if (
            !inBounds(x, y)
          ) {
            continue;
          }


          totalWater +=
            this.water[y][x];

          cells += 1;
        }
      }


      const averageWater =
        cells > 0
          ? totalWater / cells
          : 0;


      let threshold =
        GAME_RULES
          .normalBuildingSafeThreshold;


      if (
        building.type ===
        "hospital"
      ) {

        threshold =
          GAME_RULES
            .hospitalSafeThreshold;
      }


      if (
        building.type ===
        "school"
      ) {

        threshold =
          GAME_RULES
            .schoolSafeThreshold;
      }


      building.waterDepth =
        averageWater;


      building.safe =
        averageWater <
        threshold;
    }
  }


  // ==========================================================
  // UNLOCKS
  // ==========================================================

  checkUnlocks() {

    if (
      !this.floodStarted ||
      !this.hasPlacedDefense
    ) {
      return;
    }


    const duration =
      Math.max(
        1,
        GAME_RULES.gameDurationSeconds
      );

    const progress =
      Math.min(
        this.elapsed / duration,
        1
      );

    const hospital =
      this.getBuilding("hospital");

    const school =
      this.getBuilding("school");

    const totalHomes =
      this.getHomesCount();

    const safeHomes =
      this.getSafeHomesCount();

    const communityRatio =
      totalHomes > 0
        ? safeHomes / totalHomes
        : 0;


    if (
      progress >= 0.18 &&
      hospital?.safe === true
    ) {
      this.hospitalProtectedOnce = true;
    }


    if (
      progress >= 0.42 &&
      school?.safe === true
    ) {
      this.schoolProtectedOnce = true;
    }


    if (
      progress >= 0.65 &&
      totalHomes > 0 &&
      communityRatio >= GAME_RULES.targetHomesSafe
    ) {
      this.communityProtectedOnce = true;
    }


    if (
      !this.unlocked.has("hospital-reward") &&
      this.hospitalProtectedOnce
    ) {

      const unlock =
        GAME_RULES.unlocks.find(
          (item) =>
            item.id === "hospital-reward"
        );

      if (unlock) {
        this.unlockReward(unlock);
        return;
      }
    }


    if (
      !this.unlocked.has("school-reward") &&
      this.hospitalProtectedOnce &&
      this.schoolProtectedOnce
    ) {

      const unlock =
        GAME_RULES.unlocks.find(
          (item) =>
            item.id === "school-reward"
        );

      if (unlock) {
        this.unlockReward(unlock);
        return;
      }
    }


    if (
      !this.unlocked.has("community-reward") &&
      this.schoolProtectedOnce &&
      this.communityProtectedOnce
    ) {

      const unlock =
        GAME_RULES.unlocks.find(
          (item) =>
            item.id === "community-reward"
        );

      if (unlock) {
        this.unlockReward(unlock);
      }
    }

  }


  unlockReward(
    unlock
  ) {

    if (
      this.unlocked.has(unlock.id)
    ) {
      return;
    }


    this.unlocked.add(
      unlock.id
    );

    this.inventory[unlock.defense] =
      (this.inventory[unlock.defense] ?? 0) +
      unlock.amount;

    this.xp += 100;
    this.score += 500;

    this.message =
      unlock.message ||
      "🎁 New defense unlocked!";

    this.messageType =
      "reward";


    if (
      unlock.id === "hospital-reward"
    ) {

      this.objectiveStage = 1;

      this.objectiveMessage =
        "🏥 HOSPITAL SECURED! Now protect the school.";

      this.objectiveType =
        "reward";
    }

    else if (
      unlock.id === "school-reward"
    ) {

      this.objectiveStage = 2;

      this.objectiveMessage =
        "🏫 SCHOOL SECURED! Now save at least 80% of the homes.";

      this.objectiveType =
        "reward";
    }

    else if (
      unlock.id === "community-reward"
    ) {

      this.objectiveStage = 3;

      this.objectiveMessage =
        "🏠 COMMUNITY PROTECTED! Keep the town safe until the flood ends.";

      this.objectiveType =
        "reward";
    }

    this.notify();

  }


  // ==========================================================
  // SCORE
  // ==========================================================

  updateScore() {

    const hospital =
      this.getBuilding(
        "hospital"
      );


    const school =
      this.getBuilding(
        "school"
      );


    const homes =
      this.getHomesCount();


    const safeHomes =
      this.getSafeHomesCount();


    let score = 0;


    // Hospital
    if (
      hospital?.safe
    ) {

      score += 3000;
    }


    // School
    if (
      school?.safe
    ) {

      score += 2500;
    }


    // Community
    if (
      homes > 0
    ) {

      score += Math.round(
        (safeHomes /
          homes) *
          2500
      );
    }


    // Smart defense bonus.
    score +=
      Math.max(
        0,

        1000 -
          this.defenses.length *
            80
      );


    this.score =
      Math.max(
        this.score,
        score
      );
  }


  // ==========================================================
  // FINISH GAME
  // ==========================================================

  finishGame() {

    this.running = false;

    this.finished = true;


    this.updateBuildingSafety();


    const hospital =
      this.getBuilding(
        "hospital"
      );


    const school =
      this.getBuilding(
        "school"
      );


    const homes =
      this.getHomesCount();


    const safeHomes =
      this.getSafeHomesCount();


    const homesRatio =
      homes > 0
        ? safeHomes /
          homes
        : 0;


    const victory =
      hospital?.safe === true &&
      school?.safe === true &&
      homesRatio >=
        GAME_RULES
          .targetHomesSafe;


    if (victory) {

      this.xp += 500;

      this.score += 1000;


      this.message =
        "🏆 FLOOD DEFENDED! You protected the city!";


      this.messageType =
        "success";

    } else {

      this.message =
        "🌊 The flood reached the end. Try a different defense strategy.";


      this.messageType =
        "warning";
    }


    this.notify();
  }


  // ==========================================================
  // BUILDING HELPERS
  // ==========================================================

  getBuilding(id) {

    return this.buildings.find(
      (building) =>
        building.id === id
    );
  }


  getHomes() {

    return this.buildings.filter(
      (building) =>
        building.type ===
        "home"
    );
  }


  getHomesCount() {

    return this.getHomes()
      .length;
  }


  getSafeHomesCount() {

    return this.getHomes()
      .filter(
        (home) =>
          home.safe
      )
      .length;
  }


  getBuildingsSafeCount() {

    return this.buildings.filter(
      (building) =>
        building.safe
    ).length;
  }


  getBuildingsCount() {

    return this.buildings.length;
  }


  // ==========================================================
  // WATER STATS
  // ==========================================================

  getWaterManaged() {

    let total = 0;


    for (
      let y = 0;
      y < WORLD_HEIGHT;
      y++
    ) {

      for (
        let x = 0;
        x < WORLD_WIDTH;
        x++
      ) {

        total +=
          this.water[y][x];
      }
    }


    return total;
  }


  getFloodedCells() {

    let count = 0;


    for (
      let y = 0;
      y < WORLD_HEIGHT;
      y++
    ) {

      for (
        let x = 0;
        x < WORLD_WIDTH;
        x++
      ) {

        if (
          this.water[y][x] >
          0.08
        ) {

          count += 1;
        }
      }
    }


    return count;
  }


  // ==========================================================
  // DEFENSE HELPERS
  // ==========================================================

  hasWallAt(
    x,
    y
  ) {

    return this.defenses.some(
      (defense) =>
        defense.type ===
          "wall" &&
        Math.round(
          defense.x
        ) === Math.round(x) &&
        Math.round(
          defense.y
        ) === Math.round(y)
    );
  }


  hasSandbags(
    x,
    y
  ) {

    return this.defenses.some(
      (defense) => {

        if (
          defense.type !==
          "sand"
        ) {
          return false;
        }


        const dx =
          x -
          defense.x;

        const dy =
          y -
          defense.y;


        return (
          Math.sqrt(
            dx * dx +
              dy * dy
          ) <=
          DEFENSE_TYPES.sand.radius
        );
      }
    );
  }


  getDefenseCount(
    type
  ) {

    return this.defenses.filter(
      (defense) =>
        defense.type ===
        type
    ).length;
  }


  // ==========================================================
  // SNAPSHOT
  // ==========================================================

  getSnapshot() {

    return {

      riverLevel:
        this.riverLevel,

      rainfall:
        this.rainfall,

      elapsed:
        this.elapsed,

      running:
        this.running,

      finished:
        this.finished,

      floodStarted:
        this.floodStarted,

      message:
        this.message,

      messageType:
        this.messageType,

      objectiveStage:
        this.objectiveStage,

      objectiveMessage:
        this.objectiveMessage,

      objectiveType:
        this.objectiveType,

      hasPlacedDefense:
        this.hasPlacedDefense,

      score:
        this.score,

      xp:
        this.xp,


      inventory: {
        ...this.inventory,
      },


      defenses:
        this.defenses.map(
          (defense) => ({
            ...defense,
          })
        ),


      buildings:
        this.buildings.map(
          (building) => ({
            ...building,
          })
        ),


      unlocked: [
        ...this.unlocked,
      ],


      buildingsSafe:
        this.getBuildingsSafeCount(),


      buildingsTotal:
        this.getBuildingsCount(),


      homesSafe:
        this.getSafeHomesCount(),


      homesTotal:
        this.getHomesCount(),


      floodedCells:
        this.getFloodedCells(),


      waterManaged:
        this.getWaterManaged(),


      water:
        this.water,


      elevation:
        this.elevation,
    };
  }


  // ==========================================================
  // GET WORLD
  // ==========================================================
  //
  // The renderer owns visual-only objects such as animated cars,
  // trees, road markings and building artwork. The engine only
  // supplies gameplay state for those visuals.
  //
  // ==========================================================

  getWorld() {

    return {

      elevation:
        this.elevation,

      water:
        this.water,

      buildings:
        this.buildings,

      defenses:
        this.defenses,
    };
  }


  // ==========================================================
  // CLEANUP
  // ==========================================================

  destroy() {

    this.running = false;

    this.listeners.clear();
  }
}


// ============================================================
// FACTORY
// ============================================================

export function createRiverDefenderEngine() {

  return new RiverDefenderEngine();
}


export default RiverDefenderEngine;
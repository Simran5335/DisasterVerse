// ============================================================
// RIVER DEFENDER — GAME ENGINE
// ============================================================
// Simulation layer.
//
// ENGINE RESPONSIBILITIES
// ------------------------------------------------------------
// • Raise the river
// • Spread floodwater
// • Simulate terrain height
// • Apply flood walls
// • Apply pumps
// • Apply sandbags
// • Track building safety
// • Unlock defensive rewards
// • Track score / XP
// • Determine victory / failure
//
// IMPORTANT
// ------------------------------------------------------------
// There is NO budget system.
// There is NO money.
// There are NO prices.
//
// The player manages a LIMITED number of defenses and earns
// additional defenses by successfully protecting the town.
//
// Renderer -> visuals
// World    -> map mathematics
// Engine   -> simulation
// React    -> UI
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
  isHighGround,
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

// Natural water movement.
const BASE_FLOW_SPEED = 0.9;

// Maximum fraction of a cell's water that can move in
// one simulation step.
const MAX_TRANSFER_RATIO = 0.28;

// How strongly terrain height affects water movement.
const HEIGHT_DIFFERENCE_FACTOR = 2.4;

// Small amount of water naturally evaporates / drains
// from non-river cells.
const NATURAL_DRAIN_RATE = 0.004;


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

    const world =
      createWorldArrays();

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
    // BUILDINGS
    // --------------------------------------------------------

    this.buildings =
      createBuildingState();


    // --------------------------------------------------------
    // DEFENSES
    // --------------------------------------------------------

    this.defenses = [];


    // --------------------------------------------------------
    // INVENTORY
    // --------------------------------------------------------

    this.inventory =
      createDefenseInventory();


    // --------------------------------------------------------
    // UNLOCK STATE
    // --------------------------------------------------------

    this.unlocked =
      new Set();


    // --------------------------------------------------------
    // FLOOD STATE
    // --------------------------------------------------------

    this.riverLevel =
      GAME_RULES.riverStartLevel;

    this.rainfall = 40;

    this.elapsed = 0;

    this.running = false;

    this.finished = false;

    this.floodStarted = false;


    // --------------------------------------------------------
    // GAME FEEDBACK
    // --------------------------------------------------------

    this.score = 0;

    this.xp = 0;

    this.message =
      "Protect the hospital, school and community.";

    this.messageType =
      "info";


    // --------------------------------------------------------
    // INTERNAL STATE
    // --------------------------------------------------------

    this.lastUpdate = 0;

    this.lastRewardCheck = 0;

    this.lastScoreUpdate = 0;

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

    this.listeners.add(
      listener
    );

    return () => {
      this.listeners.delete(
        listener
      );
    };
  }


  notify() {

    for (
      const listener of this.listeners
    ) {
      listener(
        this.getSnapshot()
      );
    }
  }


  // ==========================================================
  // START
  // ==========================================================

  start() {

    if (
      this.finished
    ) {
      this.reset();
    }

    this.running = true;

    this.floodStarted = true;

    this.message =
      "🌊 The flood has started! Protect the town.";

    this.messageType =
      "warning";

    this.notify();
  }


  // ==========================================================
  // PAUSE
  // ==========================================================

  pause() {

    this.running = false;

    this.message =
      "Game paused.";

    this.messageType =
      "info";

    this.notify();
  }


  // ==========================================================
  // RESUME
  // ==========================================================

  resume() {

    if (
      this.finished
    ) {
      return;
    }

    this.running = true;

    this.message =
      "🌊 The flood is moving again.";

    this.messageType =
      "warning";

    this.notify();
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  update(
    deltaSeconds = 0.016
  ) {

    if (
      !this.running ||
      this.finished
    ) {
      return;
    }

    // Prevent huge simulation jumps if the browser tab
    // was inactive for a moment.
    const delta =
      Math.min(
        Math.max(
          deltaSeconds,
          0
        ),
        0.1
      );

    this.elapsed +=
      delta;


    // ========================================================
    // FLOOD PROGRESS
    // ========================================================

    const duration =
      Math.max(
        1,
        GAME_RULES.gameDurationSeconds
      );

    const progress =
      Math.min(
        this.elapsed /
          duration,
        1
      );


    // ========================================================
    // RIVER LEVEL
    // ========================================================

    this.riverLevel =
      Math.min(
        1.35,
        GAME_RULES.riverStartLevel +
          progress *
            GAME_RULES.riverRiseAmount
      );


    // ========================================================
    // RAINFALL
    // ========================================================

    this.rainfall =
      Math.round(
        40 +
          progress *
            190
      );


    // ========================================================
    // WATER INPUT
    // ========================================================

    this.injectRiverWater(
      delta
    );


    // ========================================================
    // WATER MOVEMENT
    // ========================================================

    this.simulateWater(
      delta
    );


    // ========================================================
    // DEFENSE EFFECTS
    // ========================================================

    this.applyDefenses(
      delta
    );


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

    if (
      this.elapsed -
        this.lastScoreUpdate >
      0.25
    ) {
      this.updateScore();

      this.lastScoreUpdate =
        this.elapsed;
    }


    // ========================================================
    // END
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

  injectRiverWater(
    delta
  ) {

    const strength =
      this.riverLevel *
      delta *
      0.48;


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
          !isRiver(
            x,
            y
          )
        ) {
          continue;
        }


        // River cells naturally fill first.
        this.water[y][x] =
          Math.min(
            MAX_WATER_DEPTH,
            this.water[y][x] +
              strength
          );
      }
    }
  }


  // ==========================================================
  // WATER SIMULATION
  // ==========================================================

  simulateWater(
    delta
  ) {

    // --------------------------------------------------------
    // Start next frame from current water.
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
          this.water[y][x];
      }
    }


    // --------------------------------------------------------
    // Spread water downhill.
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


        const currentHeight =
          this.elevation[y][x] +
          currentWater;


        const candidates = [];


        for (
          const neighbour of
            NEIGHBOURS
        ) {

          const nx =
            x +
            neighbour.x;

          const ny =
            y +
            neighbour.y;


          if (
            !inBounds(
              nx,
              ny
            )
          ) {
            continue;
          }


          const neighbourHeight =
            this.elevation[ny][nx] +
            this.water[ny][nx];


          const difference =
            currentHeight -
            neighbourHeight;


          if (
            difference >
            0.018
          ) {

            candidates.push({
              x: nx,
              y: ny,
              difference,
            });
          }
        }


        if (
          candidates.length === 0
        ) {
          continue;
        }


        // Lowest destination first.
        candidates.sort(
          (
            a,
            b
          ) =>
            b.difference -
            a.difference
        );


        // We distribute water between the two best
        // destinations instead of always choosing one.
        const destinations =
          candidates.slice(
            0,
            2
          );


        let remainingWater =
          currentWater;


        for (
          const destination of
            destinations
        ) {

          if (
            remainingWater <=
            WATER_EPSILON
          ) {
            break;
          }


          let transfer =
            remainingWater *
            BASE_FLOW_SPEED *
            delta;


          transfer *=
            Math.min(
              1,
              destination.difference *
                HEIGHT_DIFFERENCE_FACTOR
            );


          transfer =
            Math.min(
              transfer,
              currentWater *
                MAX_TRANSFER_RATIO
            );


          // --------------------------------------------------
          // Wetlands absorb / slow floodwater.
          // --------------------------------------------------

          if (
            isWetland(
              destination.x,
              destination.y
            )
          ) {

            transfer *=
              0.34;
          }


          // --------------------------------------------------
          // Low ground attracts water.
          // --------------------------------------------------

          if (
            isLowGround(
              destination.x,
              destination.y
            )
          ) {

            transfer *=
              1.35;
          }


          // --------------------------------------------------
          // High ground resists water slightly.
          // --------------------------------------------------

          if (
            isHighGround(
              destination.x,
              destination.y
            )
          ) {

            transfer *=
              0.68;
          }


          transfer =
            Math.min(
              transfer,
              remainingWater *
                0.45
            );


          if (
            transfer <=
            WATER_EPSILON
          ) {
            continue;
          }


          this.nextWater[y][x] -=
            transfer;

          this.nextWater[
            destination.y
          ][
            destination.x
          ] +=
            transfer;


          remainingWater -=
            transfer;
        }
      }
    }


    // --------------------------------------------------------
    // Natural drainage.
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

        if (
          isRiver(
            x,
            y
          )
        ) {
          continue;
        }


        const drainage =
          this.nextWater[y][x] *
          NATURAL_DRAIN_RATE *
          delta *
          60;


        this.nextWater[y][x] =
          Math.max(
            0,
            this.nextWater[y][x] -
              drainage
          );
      }
    }


    // --------------------------------------------------------
    // Clamp.
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
  // DEFENSE EFFECTS
  // ==========================================================

  applyDefenses(
    delta
  ) {

    for (
      const defense of
        this.defenses
    ) {

      if (
        !defense.active
      ) {
        continue;
      }


      defense.animation =
        Math.min(
          1,
          (
            defense.animation ??
            0
          ) +
            delta *
              2.8
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

    const config =
      DEFENSE_TYPES.pump;

    const radius =
      Math.max(
        1,
        config.radius ?? 3
      );

    const removalRate =
      config.removalRate ??
      0.12;


    const minX =
      Math.floor(
        defense.x -
          radius
      );

    const maxX =
      Math.ceil(
        defense.x +
          radius
      );

    const minY =
      Math.floor(
        defense.y -
          radius
      );

    const maxY =
      Math.ceil(
        defense.y +
          radius
      );


    for (
      let y = minY;
      y <= maxY;
      y++
    ) {

      for (
        let x = minX;
        x <= maxX;
        x++
      ) {

        if (
          !inBounds(
            x,
            y
          )
        ) {
          continue;
        }


        const dx =
          x -
          defense.x;

        const dy =
          y -
          defense.y;


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
          1 -
          distance /
            radius;


        const removal =
          removalRate *
          delta *
          factor;


        this.water[y][x] =
          Math.max(
            0,
            this.water[y][x] -
              removal
          );
      }
    }
  }


  // ==========================================================
  // FLOOD WALL
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
      !inBounds(
        x,
        y
      )
    ) {
      return;
    }


    const strength =
      DEFENSE_TYPES.wall
        .strength ??
      0.9;


    /*
     * A wall doesn't magically remove water.
     *
     * It works by reducing the amount of water able to
     * cross its cell and gently redistributing pressure
     * toward surrounding cells.
     */


    const wallWater =
      this.water[y][x];


    if (
      wallWater <=
      WATER_EPSILON
    ) {
      return;
    }


    const pressure =
      wallWater *
      strength *
      delta *
      1.8;


    this.water[y][x] =
      Math.max(
        0,
        this.water[y][x] -
          pressure
      );


    // Redirect pressure to the least flooded adjacent
    // cells rather than creating additional water.
    const candidates = [];


    for (
      const neighbour of
        NEIGHBOURS
    ) {

      const nx =
        x +
        neighbour.x;

      const ny =
        y +
        neighbour.y;


      if (
        !inBounds(
          nx,
          ny
        )
      ) {
        continue;
      }


      candidates.push({
        x: nx,
        y: ny,
        water:
          this.water[ny][nx],
      });
    }


    candidates.sort(
      (
        a,
        b
      ) =>
        a.water -
        b.water
    );


    if (
      candidates.length
    ) {

      const target =
        candidates[0];


      this.water[
        target.y
      ][
        target.x
      ] =
        Math.min(
          MAX_WATER_DEPTH,
          this.water[
            target.y
          ][
            target.x
          ] +
            pressure
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

    const config =
      DEFENSE_TYPES.sand;

    const radius =
      Math.max(
        1,
        config.radius ?? 1
      );

    const slowdown =
      config.strength ??
      0.56;


    for (
      let y =
        Math.floor(
          defense.y -
            radius
        );

      y <=
        Math.ceil(
          defense.y +
            radius
        );

      y++
    ) {

      for (
        let x =
          Math.floor(
            defense.x -
              radius
        );

        x <=
          Math.ceil(
            defense.x +
              radius
          );

        x++
      ) {

        if (
          !inBounds(
            x,
            y
          )
        ) {
          continue;
        }


        const dx =
          x -
          defense.x;

        const dy =
          y -
          defense.y;


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


        /*
         * Sandbags primarily reduce water depth very
         * slightly and, more importantly, make that cell
         * less attractive as a flow path.
         */

        const factor =
          1 -
          distance /
            (radius + 0.001);


        const reduction =
          slowdown *
          factor *
          delta *
          0.08;


        this.water[y][x] =
          Math.max(
            0,
            this.water[y][x] -
              reduction
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

    if (
      !DEFENSE_TYPES[type]
    ) {

      return {
        success: false,

        message:
          "Unknown defense.",
      };
    }


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
      Math.round(
        x
      );

    const gridY =
      Math.round(
        y
      );


    if (
      !inBounds(
        gridX,
        gridY
      )
    ) {

      return {
        success: false,

        message:
          "That location is outside the town.",
      };
    }


    // ========================================================
    // INVENTORY
    // ========================================================

    if (
      (
        this.inventory[type] ??
        0
      ) <= 0
    ) {

      return {
        success: false,

        message:
          `No ${
            DEFENSE_TYPES[type]
              .name
          } left.`,
      };
    }


    // ========================================================
    // EXISTING DEFENSE
    // ========================================================

    const occupied =
      this.defenses.some(
        (
          defense
        ) =>
          Math.round(
            defense.x
          ) === gridX &&
          Math.round(
            defense.y
          ) === gridY
      );


    if (
      occupied
    ) {

      return {
        success: false,

        message:
          "Choose another spot.",
      };
    }


    // ========================================================
    // BUILDING CHECK
    // ========================================================

    const building =
      buildingAt(
        this.buildings,
        gridX,
        gridY
      );


    if (
      building
    ) {

      return {
        success: false,

        message:
          "Place the defense beside the building, not on it.",
      };
    }


    // ========================================================
    // RIVER CHECK
    // ========================================================

    /*
     * Walls and sandbags should be placed on land.
     * Pumps are allowed near water.
     */

    if (
      type !== "pump" &&
      isRiver(
        gridX,
        gridY
      )
    ) {

      return {
        success: false,

        message:
          "Place this defense on land beside the river.",
      };
    }


    // ========================================================
    // CREATE DEFENSE
    // ========================================================

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


    // ========================================================
    // PLAYER FEEDBACK
    // ========================================================

    switch (
      type
    ) {

      case "wall":

        this.message =
          "🧱 Flood wall built! The barrier is redirecting water.";

        this.messageType =
          "success";

        break;


      case "pump":

        this.message =
          "💧 Pump activated! Nearby floodwater is being removed.";

        this.messageType =
          "success";

        break;


      case "sand":

        this.message =
          "🟨 Sandbags placed! Water flow is slowing here.";

        this.messageType =
          "success";

        break;


      default:

        this.message =
          "Defense placed!";

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
  // BUILDING SAFETY
  // ==========================================================

  updateBuildingSafety() {

    for (
      const building of
        this.buildings
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
            !inBounds(
              x,
              y
            )
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
          ? totalWater /
            cells
          : 0;


      // ------------------------------------------------------
      // Building-specific thresholds
      // ------------------------------------------------------

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

    for (
      const unlock of
        GAME_RULES.unlocks
    ) {

      if (
        this.unlocked.has(
          unlock.id
        )
      ) {
        continue;
      }


      let shouldUnlock =
        false;


      // ======================================================
      // HOSPITAL REWARD
      // ======================================================

      if (
        unlock.id ===
        "hospital-reward"
      ) {

        const hospital =
          this.getBuilding(
            "hospital"
          );


        shouldUnlock =
          hospital?.safe ===
          true;
      }


      // ======================================================
      // SCHOOL REWARD
      // ======================================================

      if (
        unlock.id ===
        "school-reward"
      ) {

        const school =
          this.getBuilding(
            "school"
          );


        shouldUnlock =
          school?.safe ===
          true &&
          this.elapsed >
          20;
      }


      // ======================================================
      // COMMUNITY REWARD
      // ======================================================

      if (
        unlock.id ===
        "community-reward"
      ) {

        const totalHomes =
          this.getHomesCount();

        const safeHomes =
          this.getSafeHomesCount();


        shouldUnlock =
          totalHomes > 0 &&
          safeHomes /
            totalHomes >=
            GAME_RULES
              .targetHomesSafe;
      }


      if (
        shouldUnlock
      ) {

        this.unlockReward(
          unlock
        );
      }
    }
  }


  // ==========================================================
  // REWARD
  // ==========================================================

  unlockReward(
    unlock
  ) {

    this.unlocked.add(
      unlock.id
    );


    this.inventory[
      unlock.defense
    ] =
      (
        this.inventory[
          unlock.defense
        ] ??
        0
      ) +
      unlock.amount;


    // XP is progression feedback.
    // It is NOT money and cannot be spent.
    this.xp +=
      100;


    this.score +=
      500;


    this.message =
      unlock.message;


    this.messageType =
      "reward";


    this.notify();
  }


  // ==========================================================
  // SCORE
  // ==========================================================
  // Score measures how well the player protects the town.
  // It is NOT a currency.
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

      score +=
        3000;
    }


    // School
    if (
      school?.safe
    ) {

      score +=
        2500;
    }


    // Community
    if (
      homes > 0
    ) {

      score +=
        Math.round(
          (
            safeHomes /
            homes
          ) *
          2500
        );
    }


    // --------------------------------------------------------
    // Efficient defense bonus.
    //
    // This is NOT a budget mechanic.
    // It rewards thoughtful placement.
    // --------------------------------------------------------

    const defenseBonus =
      Math.max(
        0,
        1000 -
          this.defenses.length *
            80
      );


    score +=
      defenseBonus;


    this.score =
      Math.max(
        this.score,
        Math.round(
          score
        )
      );
  }


  // ==========================================================
  // FINISH GAME
  // ==========================================================

  finishGame() {

    this.running = false;

    this.finished = true;


    // Make sure the final state is accurate.
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
      hospital?.safe ===
        true &&
      school?.safe ===
        true &&
      homesRatio >=
        GAME_RULES
          .targetHomesSafe;


    if (
      victory
    ) {

      this.xp +=
        500;

      this.score +=
        1000;


      this.message =
        "🏆 FLOOD DEFENDED! You protected the community!";

      this.messageType =
        "success";

    } else {

      this.message =
        "🌊 The flood reached the end. Try a different strategy!";

      this.messageType =
        "warning";
    }


    this.notify();
  }


  // ==========================================================
  // HELPERS
  // ==========================================================

  getBuilding(
    id
  ) {

    return this.buildings.find(
      (
        building
      ) =>
        building.id ===
        id
    );
  }


  getHomes() {

    return this.buildings.filter(
      (
        building
      ) =>
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
        (
          home
        ) =>
          home.safe
      )
      .length;
  }


  getBuildingsSafeCount() {

    return this.buildings.filter(
      (
        building
      ) =>
        building.safe
    ).length;
  }


  getBuildingsCount() {

    return this.buildings.length;
  }


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


  // ==========================================================
  // GET BUILDING STATUS
  // ==========================================================

  getCriticalBuildings() {

    return this.buildings.filter(
      (
        building
      ) =>
        building.priority ===
          "critical" ||
        building.importance >=
          2
    );
  }


  // ==========================================================
  // GET COMMUNITY STATUS
  // ==========================================================

  getCommunityStatus() {

    const homes =
      this.getHomesCount();

    const safeHomes =
      this.getSafeHomesCount();


    const ratio =
      homes > 0
        ? safeHomes /
          homes
        : 0;


    return {
      homes,
      safeHomes,
      ratio,

      target:
        GAME_RULES
          .targetHomesSafe,

      protected:
        ratio >=
        GAME_RULES
          .targetHomesSafe,
    };
  }


  // ==========================================================
  // SNAPSHOT
  // ==========================================================

  getSnapshot() {

    return {

      // ------------------------------------------------------
      // Flood
      // ------------------------------------------------------

      riverLevel:
        this.riverLevel,

      rainfall:
        this.rainfall,

      elapsed:
        this.elapsed,


      // ------------------------------------------------------
      // Game state
      // ------------------------------------------------------

      running:
        this.running,

      finished:
        this.finished,

      floodStarted:
        this.floodStarted,


      // ------------------------------------------------------
      // Feedback
      // ------------------------------------------------------

      message:
        this.message,

      messageType:
        this.messageType,


      // ------------------------------------------------------
      // Progress
      // ------------------------------------------------------

      score:
        this.score,

      xp:
        this.xp,


      // ------------------------------------------------------
      // Inventory
      // ------------------------------------------------------

      inventory: {
        ...this.inventory,
      },


      // ------------------------------------------------------
      // Defenses
      // ------------------------------------------------------

      defenses:
        this.defenses.map(
          (
            defense
          ) => ({
            ...defense,
          })
        ),


      // ------------------------------------------------------
      // Buildings
      // ------------------------------------------------------

      buildings:
        this.buildings.map(
          (
            building
          ) => ({
            ...building,
          })
        ),


      // ------------------------------------------------------
      // Rewards
      // ------------------------------------------------------

      unlocked: [
        ...this.unlocked,
      ],


      // ------------------------------------------------------
      // Community
      // ------------------------------------------------------

      buildingsSafe:
        this.getBuildingsSafeCount(),

      buildingsTotal:
        this.getBuildingsCount(),

      homesSafe:
        this.getSafeHomesCount(),

      homesTotal:
        this.getHomesCount(),


      community:
        this.getCommunityStatus(),


      // ------------------------------------------------------
      // World arrays
      // ------------------------------------------------------

      water:
        this.water,

      elevation:
        this.elevation,
    };
  }


  // ==========================================================
  // GET WORLD DATA
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

    this.running =
      false;

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
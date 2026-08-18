// ============================================================
// RIVER DEFENDER — WORLD
// ============================================================
// World mathematics only.
// No React.
// No rendering.
// No game loop.
//
// Renderer -> draws the world
// Engine   -> simulates the flood
// World    -> understands terrain, river, roads and zones
// ============================================================

import {
  WORLD,
  ROADS,
  BUILDINGS,
  SPECIAL_ZONES,
} from "./riverDefenderData.js";

// ============================================================
// WORLD SIZE
// ============================================================

export const WORLD_WIDTH = WORLD.width;
export const WORLD_HEIGHT = WORLD.height;

// ============================================================
// CREATE WORLD ARRAYS
// ============================================================

export function createWorldArrays() {
  const elevation = Array.from(
    { length: WORLD_HEIGHT },
    () => Array(WORLD_WIDTH).fill(0)
  );

  const water = Array.from(
    { length: WORLD_HEIGHT },
    () => Array(WORLD_WIDTH).fill(0)
  );

  const nextWater = Array.from(
    { length: WORLD_HEIGHT },
    () => Array(WORLD_WIDTH).fill(0)
  );

  return {
    elevation,
    water,
    nextWater,
  };
}

// ============================================================
// RIVER
// ============================================================
// The river remains mathematically compatible with the existing
// flood simulation, but its shape is more organic.
//
// Important:
// Keep this function deterministic.
// The engine relies on the river remaining stable throughout
// the game.
// ============================================================

export function riverCenterX(y) {
  const primaryWave =
    Math.sin(y * 0.31) * 1.15;

  const secondaryWave =
    Math.sin(y * 0.73 + 1.4) * 0.38;

  const gentleDrift =
    (y - WORLD_HEIGHT * 0.5) * 0.025;

  return (
    5.1 +
    primaryWave +
    secondaryWave +
    gentleDrift
  );
}

export function riverWidthAt(y) {
  const widthVariation =
    Math.sin(y * 0.42 + 0.8) * 0.28;

  return 2.05 + widthVariation;
}

export function riverDistance(x, y) {
  return Math.abs(
    x - riverCenterX(y)
  );
}

export function isRiver(x, y) {
  return (
    riverDistance(x, y) <
    riverWidthAt(y)
  );
}

// ============================================================
// RIVER BANK
// ============================================================

export function isRiverBank(x, y) {
  const distance =
    riverDistance(x, y);

  const width =
    riverWidthAt(y);

  return (
    distance >= width &&
    distance < width + 0.75
  );
}

// ============================================================
// RIVER SIDE
// ============================================================

export function riverSide(x, y) {
  const center =
    riverCenterX(y);

  if (x < center) {
    return "west";
  }

  if (x > center) {
    return "east";
  }

  return "center";
}

// ============================================================
// WETLAND
// ============================================================

export function isWetland(x, y) {
  const zone =
    SPECIAL_ZONES.wetland;

  return (
    x >= zone.x1 &&
    x <= zone.x2 &&
    y >= zone.y1 &&
    y <= zone.y2
  );
}

// ============================================================
// LOW GROUND
// ============================================================

export function isLowGround(x, y) {
  const zone =
    SPECIAL_ZONES.lowGround;

  return (
    x >= zone.x1 &&
    x <= zone.x2 &&
    y >= zone.y1 &&
    y <= zone.y2
  );
}

// ============================================================
// HIGH GROUND
// ============================================================

export function isHighGround(x, y) {
  const zone =
    SPECIAL_ZONES.highGround;

  return (
    x >= zone.x1 &&
    x <= zone.x2 &&
    y >= zone.y1 &&
    y <= zone.y2
  );
}

// ============================================================
// ROAD DETECTION
// ============================================================

function pointToSegmentDistance(
  px,
  py,
  ax,
  ay,
  bx,
  by
) {
  const dx = bx - ax;
  const dy = by - ay;

  const lengthSquared =
    dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(
      px - ax,
      py - ay
    );
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      (
        (px - ax) * dx +
        (py - ay) * dy
      ) / lengthSquared
    )
  );

  const closestX =
    ax + t * dx;

  const closestY =
    ay + t * dy;

  return Math.hypot(
    px - closestX,
    py - closestY
  );
}

export function isRoadCell(x, y) {
  return ROADS.some(
    ([a, b]) =>
      pointToSegmentDistance(
        x,
        y,
        a.x,
        a.y,
        b.x,
        b.y
      ) <= 0.62
  );
}

// ============================================================
// ROAD INTERSECTION
// ============================================================

export function isRoadIntersection(
  x,
  y
) {
  let nearbyRoads = 0;

  for (const [a, b] of ROADS) {
    const distance =
      pointToSegmentDistance(
        x,
        y,
        a.x,
        a.y,
        b.x,
        b.y
      );

    if (distance <= 0.75) {
      nearbyRoads += 1;
    }
  }

  return nearbyRoads >= 2;
}

// ============================================================
// BOUNDS
// ============================================================

export function inBounds(x, y) {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    y >= 0 &&
    x < WORLD_WIDTH &&
    y < WORLD_HEIGHT
  );
}

// ============================================================
// BUILDING LOOKUP
// ============================================================

export function buildingAt(
  buildings,
  x,
  y
) {
  return buildings.find(
    (building) =>
      x >= building.x &&
      x < building.x + building.w &&
      y >= building.y &&
      y < building.y + building.h
  );
}

// ============================================================
// DEFENSE LOOKUP
// ============================================================

export function defenseAt(
  defenses,
  x,
  y
) {
  return defenses.find(
    (defense) =>
      Math.round(defense.x) ===
        Math.round(x) &&
      Math.round(defense.y) ===
        Math.round(y)
  );
}

// ============================================================
// TERRAIN HEIGHT
// ============================================================

function gaussian(
  x,
  y,
  centerX,
  centerY,
  radiusX,
  radiusY,
  strength
) {
  return (
    Math.exp(
      -(
        (x - centerX) ** 2 /
          radiusX +
        (y - centerY) ** 2 /
          radiusY
      )
    ) * strength
  );
}

function naturalTerrainVariation(
  x,
  y
) {
  const large =
    Math.sin(x * 0.19 + y * 0.13) *
    0.028;

  const medium =
    Math.cos(x * 0.43 - y * 0.17) *
    0.014;

  const small =
    Math.sin(
      x * 0.77 +
      y * 0.61
    ) * 0.006;

  return (
    large +
    medium +
    small
  );
}

// ============================================================
// INITIALIZE TERRAIN
// ============================================================

export function initializeWorld(
  elevation,
  water,
  nextWater
) {
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
      const riverDistanceValue =
        riverDistance(x, y);

      const riverWidth =
        riverWidthAt(y);

      // --------------------------------------------------------
      // Valley around the river
      // --------------------------------------------------------

      const riverValley =
        Math.max(
          0,
          1 -
            riverDistanceValue /
              (riverWidth + 3.8)
        ) * 0.13;

      // --------------------------------------------------------
      // Main lowland
      // --------------------------------------------------------

      const lowland =
        gaussian(
          x,
          y,
          18,
          18,
          110,
          72,
          0.22
        );

      // --------------------------------------------------------
      // Main elevated town edge
      // --------------------------------------------------------

      const upperTown =
        gaussian(
          x,
          y,
          37,
          9,
          85,
          54,
          0.32
        );

      // --------------------------------------------------------
      // Secondary hill
      // --------------------------------------------------------

      const backgroundHill =
        gaussian(
          x,
          y,
          43,
          26,
          110,
          92,
          0.17
        );

      // --------------------------------------------------------
      // Natural variation
      // --------------------------------------------------------

      const variation =
        naturalTerrainVariation(
          x,
          y
        );

      // --------------------------------------------------------
      // Base terrain
      // --------------------------------------------------------

      let terrain =
        0.55 +
        upperTown +
        backgroundHill -
        lowland -
        riverValley +
        variation;

      // --------------------------------------------------------
      // River banks sit slightly lower
      // --------------------------------------------------------

      if (
        isRiverBank(x, y)
      ) {
        terrain -= 0.045;
      }

      // --------------------------------------------------------
      // Wetland is naturally low
      // --------------------------------------------------------

      if (
        isWetland(x, y)
      ) {
        terrain -= 0.035;
      }

      // --------------------------------------------------------
      // Low/high special zones
      // --------------------------------------------------------

      if (
        isLowGround(x, y)
      ) {
        terrain -= 0.07;
      }

      if (
        isHighGround(x, y)
      ) {
        terrain += 0.08;
      }

      // --------------------------------------------------------
      // Keep terrain in a safe simulation range
      // --------------------------------------------------------

      elevation[y][x] =
        Math.max(
          0.18,
          Math.min(
            1.05,
            terrain
          )
        );

      // --------------------------------------------------------
      // Starting river water
      // --------------------------------------------------------

      if (
        riverDistanceValue <
        riverWidth
      ) {
        const riverDepth =
          0.43 +
          Math.max(
            0,
            riverWidth -
              riverDistanceValue
          ) *
            0.035;

        water[y][x] =
          riverDepth;
      } else {
        water[y][x] = 0;
      }

      nextWater[y][x] = 0;
    }
  }
}

// ============================================================
// TERRAIN CLASSIFICATION
// ============================================================

export function getTerrainType(
  x,
  y,
  elevation
) {
  if (
    isRiver(x, y)
  ) {
    return "river";
  }

  if (
    isRiverBank(x, y)
  ) {
    return "bank";
  }

  if (
    isRoadCell(x, y)
  ) {
    return "road";
  }

  if (
    isWetland(x, y)
  ) {
    return "wetland";
  }

  const e =
    elevation[y][x];

  if (e < 0.34) {
    return "low";
  }

  if (e > 0.86) {
    return "high";
  }

  return "grass";
}

// ============================================================
// TERRAIN COLORS
// ============================================================
// These are still used by older renderer code.
// The new renderer can use terrain type + elevation for
// richer shading.
// ============================================================

export function getTerrainColor(
  x,
  y,
  elevation
) {
  const type =
    getTerrainType(
      x,
      y,
      elevation
    );

  switch (type) {
    case "river":
      return "#1596dd";

    case "bank":
      return "#82c96a";

    case "wetland":
      return "#72c36b";

    case "road":
      return "#8e918a";

    case "low":
      return "#76bd5f";

    case "high":
      return "#6db769";

    default:
      return (
        (x * 3 + y * 5) % 3 === 0
          ? "#68c45f"
          : "#5fbd5d"
      );
  }
}

// ============================================================
// ZONE LABEL
// ============================================================

export function getZoneLabel(
  x,
  y
) {
  if (
    isWetland(x, y)
  ) {
    return SPECIAL_ZONES.wetland.label;
  }

  if (
    isLowGround(x, y)
  ) {
    return SPECIAL_ZONES.lowGround.label;
  }

  if (
    isHighGround(x, y)
  ) {
    return SPECIAL_ZONES.highGround.label;
  }

  return null;
}

// ============================================================
// WORLD STATISTICS
// ============================================================

export function getWorldStats(
  elevation,
  water
) {
  let totalWater = 0;
  let floodedCells = 0;

  let minimumElevation =
    Infinity;

  let maximumElevation =
    -Infinity;

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
      const currentElevation =
        elevation[y][x];

      const currentWater =
        water[y][x];

      totalWater +=
        currentWater;

      if (
        currentWater > 0.08
      ) {
        floodedCells += 1;
      }

      minimumElevation =
        Math.min(
          minimumElevation,
          currentElevation
        );

      maximumElevation =
        Math.max(
          maximumElevation,
          currentElevation
        );
    }
  }

  const totalCells =
    WORLD_WIDTH *
    WORLD_HEIGHT;

  return {
    totalWater,

    floodedCells,

    floodRatio:
      floodedCells /
      totalCells,

    minElevation:
      minimumElevation,

    maxElevation:
      maximumElevation,
  };
}

// ============================================================
// RESET BUILDINGS
// ============================================================

export function cloneBuildings() {
  return BUILDINGS.map(
    (building) => ({
      ...building,
      safe: true,
    })
  );
}

// ============================================================
// VISUAL HELPERS
// ============================================================
// These don't affect simulation. They exist so the renderer can
// create a richer miniature-world appearance without putting
// visual logic inside the engine.
// ============================================================

export function getTerrainShade(
  x,
  y,
  elevation
) {
  const e =
    elevation[y][x];

  const variation =
    Math.sin(
      x * 0.31 +
      y * 0.17
    );

  if (e > 0.86) {
    return "hill";
  }

  if (e < 0.34) {
    return "lowland";
  }

  if (variation > 0.35) {
    return "light";
  }

  if (variation < -0.35) {
    return "dark";
  }

  return "normal";
}

export function getRiverFlowDirection(
  x,
  y
) {
  const nextY =
    Math.min(
      WORLD_HEIGHT - 1,
      y + 1
    );

  const currentCenter =
    riverCenterX(y);

  const nextCenter =
    riverCenterX(nextY);

  return {
    x:
      nextCenter -
      currentCenter,
    y: 1,
  };
}
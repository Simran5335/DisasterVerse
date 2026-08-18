// ============================================================
// RIVER DEFENDER — STYLIZED WORLD RENDERER
// ============================================================
// Visual layer only.
//
// Renderer -> draws the world
// Engine   -> simulates the world
// World    -> understands the map
//
// FINAL VISUAL DIRECTION
// ------------------------------------------------------------
// - Stylized miniature flood town
// - Soft isometric perspective
// - No visible grid
// - Organic river
// - Colorful buildings
// - Large hospital + school landmarks
// - Rich greenery
// - Animated floodwater
// - Kid-friendly defensive structures
// - No budget / money visuals
// ============================================================

import {
  WORLD,
  ROADS,
  BUILDINGS,
  BRIDGE,
  SPECIAL_ZONES,
} from "./riverDefenderData.js";

import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  getTerrainColor,
  isRiver,
  isRiverBank,
  isWetland,
  isLowGround,
  isHighGround,
  riverCenterX,
  riverWidthAt,
} from "./RiverDefenderWorld.js";

// ============================================================
// HELPERS
// ============================================================

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function roundRect(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {
  const r = Math.min(
    radius,
    width / 2,
    height / 2
  );

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

  ctx.lineTo(
    x + width - r,
    y
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r
  );

  ctx.lineTo(
    x + width,
    y + height - r
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height
  );

  ctx.lineTo(
    x + r,
    y + height
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r
  );

  ctx.lineTo(
    x,
    y + r
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  );

  ctx.closePath();
}

function polygon(
  ctx,
  points
) {
  if (!points.length) {
    return;
  }

  ctx.beginPath();

  ctx.moveTo(
    points[0][0],
    points[0][1]
  );

  for (
    let i = 1;
    i < points.length;
    i++
  ) {
    ctx.lineTo(
      points[i][0],
      points[i][1]
    );
  }

  ctx.closePath();
}

function drawCircle(
  ctx,
  x,
  y,
  radius,
  fill
) {
  ctx.beginPath();
  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = fill;
  ctx.fill();
}

// ============================================================
// RENDERER
// ============================================================

export default class RiverDefenderRenderer {
  constructor(
    canvas,
    options = {}
  ) {
    this.canvas = canvas;
    this.ctx =
      canvas?.getContext("2d");

    this.width = 0;
    this.height = 0;

    this.dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    this.animationTime = 0;

    this.selectedDefense = null;
    this.hoverCell = null;

    this.camera = {
      x:
        options.camera?.x ??
        WORLD.camera?.panX ??
        0,

      y:
        options.camera?.y ??
        WORLD.camera?.panY ??
        0,

      zoom:
        options.camera?.zoom ??
        WORLD.camera?.zoom ??
        1,
    };

    this.resize();

    if (
      typeof ResizeObserver !==
      "undefined"
    ) {
      this.resizeObserver =
        new ResizeObserver(() => {
          this.resize();
        });

      this.resizeObserver.observe(
        this.canvas
      );
    } else {
      this.resizeObserver = null;
    }
  }

  // ==========================================================
  // RESIZE
  // ==========================================================

  resize() {
    if (!this.canvas) {
      return;
    }

    const rect =
      this.canvas.getBoundingClientRect();

    this.width =
      Math.max(
        1,
        rect.width
      );

    this.height =
      Math.max(
        1,
        rect.height
      );

    this.canvas.width =
      Math.floor(
        this.width * this.dpr
      );

    this.canvas.height =
      Math.floor(
        this.height * this.dpr
      );

    this.ctx.setTransform(
      this.dpr,
      0,
      0,
      this.dpr,
      0,
      0
    );
  }

  // ==========================================================
  // CAMERA
  // ==========================================================

  pan(
    dx,
    dy
  ) {
    this.camera.x += dx;
    this.camera.y += dy;
  }

  zoom(
    amount,
    screenX,
    screenY
  ) {
    const oldZoom =
      this.camera.zoom;

    const minZoom =
      WORLD.camera?.minZoom ??
      0.55;

    const maxZoom =
      WORLD.camera?.maxZoom ??
      1.35;

    const newZoom =
      clamp(
        oldZoom + amount,
        minZoom,
        maxZoom
      );

    if (
      newZoom === oldZoom
    ) {
      return;
    }

    const rect =
      this.canvas.getBoundingClientRect();

    const localX =
      screenX - rect.left;

    const localY =
      screenY - rect.top;

    const before =
      this.screenToWorld(
        localX,
        localY
      );

    this.camera.zoom =
      newZoom;

    const after =
      this.screenToWorld(
        localX,
        localY
      );

    this.camera.x +=
      (after.x - before.x) *
      WORLD.tileWidth *
      newZoom;

    this.camera.y +=
      (after.y - before.y) *
      WORLD.tileHeight *
      newZoom;
  }

  // ==========================================================
  // ISOMETRIC MATH
  // ==========================================================

  worldToScreen(
    x,
    y
  ) {
    const tileWidth =
      WORLD.tileWidth *
      this.camera.zoom;

    const tileHeight =
      WORLD.tileHeight *
      this.camera.zoom;

    const isoX =
      (x - y) *
      tileWidth *
      0.5;

    const isoY =
      (x + y) *
      tileHeight *
      0.5;

    return {
      x:
        this.width / 2 +
        this.camera.x +
        isoX,

      y:
        48 +
        this.camera.y +
        isoY,
    };
  }

  screenToWorld(
    screenX,
    screenY
  ) {
    const tileWidth =
      WORLD.tileWidth *
      this.camera.zoom;

    const tileHeight =
      WORLD.tileHeight *
      this.camera.zoom;

    const isoX =
      screenX -
      this.width / 2 -
      this.camera.x;

    const isoY =
      screenY -
      48 -
      this.camera.y;

    return {
      x:
        isoX / tileWidth +
        isoY / tileHeight,

      y:
        isoY / tileHeight -
        isoX / tileWidth,
    };
  }

  screenToCell(
    screenX,
    screenY
  ) {
    const world =
      this.screenToWorld(
        screenX,
        screenY
      );

    return {
      x: Math.floor(world.x),
      y: Math.floor(world.y),
    };
  }

  // ==========================================================
  // DEFENSE SELECTION
  // ==========================================================

  setSelectedDefense(
    type
  ) {
    this.selectedDefense =
      type;
  }

  setHoverFromScreen(
    x,
    y
  ) {
    this.hoverCell =
      this.screenToCell(
        x,
        y
      );
  }

  clearHover() {
    this.hoverCell = null;
  }

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  render(
    snapshot
  ) {
    if (
      !this.ctx ||
      !snapshot
    ) {
      return;
    }

    this.animationTime +=
      0.016;

    this.clear();

    // Back-to-front order
    this.drawAtmosphere();

    this.drawTerrain(
      snapshot
    );

    this.drawRiver(
      snapshot
    );

    this.drawFlood(
      snapshot
    );

    this.drawWetland();

    this.drawRoads();

    this.drawBridge();

    this.drawTrees(
      snapshot
    );

    this.drawBuildings(
      snapshot
    );

    this.drawDefenses(
      snapshot
    );

    this.drawZoneLabels();

    this.drawHoverPreview(
      snapshot
    );
  }

  // ==========================================================
  // BACKGROUND
  // ==========================================================

  clear() {
    const ctx = this.ctx;

    const sky =
      ctx.createLinearGradient(
        0,
        0,
        0,
        this.height
      );

    sky.addColorStop(
      0,
      "#aee4fa"
    );

    sky.addColorStop(
      0.34,
      "#d9f3ec"
    );

    sky.addColorStop(
      0.62,
      "#a8d986"
    );

    sky.addColorStop(
      1,
      "#4eaa58"
    );

    ctx.fillStyle =
      sky;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );
  }

  drawAtmosphere() {
    const ctx = this.ctx;

    ctx.save();

    // Soft sunlight
    const glow =
      ctx.createRadialGradient(
        this.width * 0.52,
        this.height * 0.14,
        0,
        this.width * 0.52,
        this.height * 0.14,
        this.width * 0.48
      );

    glow.addColorStop(
      0,
      "rgba(255,255,255,0.55)"
    );

    glow.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle =
      glow;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    // Distant clouds
    const cloudShift =
      (this.animationTime * 2) %
      (this.width + 180);

    this.drawCloud(
      110 - cloudShift * 0.2,
      70,
      1
    );

    this.drawCloud(
      this.width - 130 +
        cloudShift * 0.12,
      105,
      0.78
    );

    this.drawCloud(
      this.width * 0.55,
      45,
      0.6
    );

    ctx.restore();
  }

  drawCloud(
    x,
    y,
    scale
  ) {
    const ctx = this.ctx;

    ctx.save();

    ctx.globalAlpha =
      0.38;

    ctx.fillStyle =
      "#ffffff";

    drawCircle(
      ctx,
      x,
      y,
      18 * scale,
      "#ffffff"
    );

    drawCircle(
      ctx,
      x + 22 * scale,
      y + 2 * scale,
      14 * scale,
      "#ffffff"
    );

    drawCircle(
      ctx,
      x + 42 * scale,
      y + 6 * scale,
      11 * scale,
      "#ffffff"
    );

    roundRect(
      ctx,
      x - 10 * scale,
      y,
      65 * scale,
      18 * scale,
      9 * scale
    );

    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // TERRAIN
  // ==========================================================

  drawTerrain(
    snapshot
  ) {
    const elevation =
      snapshot.elevation ||
      [];

    const tileWidth =
      WORLD.tileWidth *
      this.camera.zoom;

    const tileHeight =
      WORLD.tileHeight *
      this.camera.zoom;

    /*
     * We still use the existing world grid for simulation,
     * but the visible terrain no longer has grid outlines.
     */

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
          isRiver(x, y)
        ) {
          continue;
        }

        const point =
          this.worldToScreen(
            x + 0.5,
            y + 0.5
          );

        const base =
          getTerrainColor(
            x,
            y,
            elevation
          );

        const shade =
          this.getTerrainVisualShade(
            x,
            y,
            elevation
          );

        this.drawSoftGroundPatch(
          point.x,
          point.y,
          tileWidth,
          tileHeight,
          base,
          shade
        );
      }
    }

    this.drawTerrainBlossoms();
  }

  getTerrainVisualShade(
    x,
    y,
    elevation
  ) {
    const variation =
      Math.sin(
        x * 0.41 +
        y * 0.23
      );

    if (
      isHighGround(
        x,
        y
      ) ||
      elevation?.[y]?.[x] >
        0.86
    ) {
      return "rgba(255,255,255,0.08)";
    }

    if (
      isLowGround(
        x,
        y
      ) ||
      elevation?.[y]?.[x] <
        0.34
    ) {
      return "rgba(42,112,59,0.09)";
    }

    if (
      variation > 0.45
    ) {
      return "rgba(255,255,255,0.055)";
    }

    if (
      variation < -0.45
    ) {
      return "rgba(25,104,54,0.05)";
    }

    return "rgba(255,255,255,0.025)";
  }

  drawSoftGroundPatch(
    x,
    y,
    width,
    height,
    base,
    shade
  ) {
    const ctx = this.ctx;

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
      x,
      y - height * 0.5
    );

    ctx.lineTo(
      x + width * 0.5,
      y
    );

    ctx.lineTo(
      x,
      y + height * 0.5
    );

    ctx.lineTo(
      x - width * 0.5,
      y
    );

    ctx.closePath();

    ctx.fillStyle =
      base;

    ctx.fill();

    ctx.fillStyle =
      shade;

    ctx.fill();

    ctx.restore();
  }

  drawTerrainBlossoms() {
    const positions = [
      [8, 8],
      [12, 13],
      [18, 6],
      [23, 9],
      [29, 5],
      [34, 11],
      [40, 6],
      [43, 16],
      [36, 22],
      [30, 25],
      [21, 24],
      [13, 21],
    ];

    for (
      const [x, y] of positions
    ) {
      if (
        isRiver(x, y)
      ) {
        continue;
      }

      const point =
        this.worldToScreen(
          x,
          y
        );

      const pulse =
        Math.sin(
          this.animationTime * 1.4 +
          x +
          y
        ) *
        0.5 +
        0.5;

      this.drawGrassTuft(
        point.x,
        point.y,
        0.7 +
          pulse * 0.15
      );
    }
  }

  drawGrassTuft(
    x,
    y,
    scale = 1
  ) {
    const ctx = this.ctx;

    ctx.save();

    ctx.strokeStyle =
      "rgba(38,116,54,0.38)";

    ctx.lineWidth =
      1.4 * scale;

    ctx.lineCap =
      "round";

    for (
      let i = -1;
      i <= 1;
      i++
    ) {
      ctx.beginPath();

      ctx.moveTo(
        x + i * 4 * scale,
        y
      );

      ctx.quadraticCurveTo(
        x + i * 5 * scale,
        y - 6 * scale,
        x + i * 7 * scale,
        y - 10 * scale
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // RIVER
  // ==========================================================

  drawRiver(
    snapshot
  ) {
    const ctx = this.ctx;

    /*
     * Draw one continuous organic river body.
     * This is the major visual departure from the old
     * individual blue diamond tiles.
     */

    ctx.save();

    const leftBank = [];
    const rightBank = [];

    for (
      let y = 0;
      y <= WORLD_HEIGHT;
      y += 0.5
    ) {
      const center =
        riverCenterX(
          Math.min(
            WORLD_HEIGHT - 1,
            y
          )
        );

      const width =
        riverWidthAt(
          Math.min(
            WORLD_HEIGHT - 1,
            y
          )
        );

      leftBank.push(
        this.worldToScreen(
          center - width,
          y
        )
      );

      rightBank.push(
        this.worldToScreen(
          center + width,
          y
        )
      );
    }

    const riverGradient =
      ctx.createLinearGradient(
        0,
        0,
        this.width,
        this.height
      );

    riverGradient.addColorStop(
      0,
      "#43c7ed"
    );

    riverGradient.addColorStop(
      0.42,
      "#1ca7df"
    );

    riverGradient.addColorStop(
      1,
      "#0879bd"
    );

    ctx.beginPath();

    if (
      leftBank.length
    ) {
      ctx.moveTo(
        leftBank[0].x,
        leftBank[0].y
      );

      for (
        let i = 1;
        i < leftBank.length;
        i++
      ) {
        ctx.lineTo(
          leftBank[i].x,
          leftBank[i].y
        );
      }

      for (
        let i =
          rightBank.length - 1;
        i >= 0;
        i--
      ) {
        ctx.lineTo(
          rightBank[i].x,
          rightBank[i].y
        );
      }
    }

    ctx.closePath();

    ctx.fillStyle =
      riverGradient;

    ctx.fill();

    // River edge highlight
    ctx.strokeStyle =
      "rgba(225,251,255,0.8)";

    ctx.lineWidth =
      2.2 *
      this.camera.zoom;

    ctx.beginPath();

    for (
      let i = 0;
      i < leftBank.length;
      i++
    ) {
      const p =
        leftBank[i];

      if (i === 0) {
        ctx.moveTo(
          p.x,
          p.y
        );
      } else {
        ctx.lineTo(
          p.x,
          p.y
        );
      }
    }

    ctx.stroke();

    ctx.globalAlpha =
      0.55;

    ctx.strokeStyle =
      "rgba(4,104,167,0.5)";

    ctx.lineWidth =
      3 *
      this.camera.zoom;

    ctx.beginPath();

    for (
      let i = 0;
      i < rightBank.length;
      i++
    ) {
      const p =
        rightBank[i];

      if (i === 0) {
        ctx.moveTo(
          p.x,
          p.y
        );
      } else {
        ctx.lineTo(
          p.x,
          p.y
        );
      }
    }

    ctx.stroke();

    ctx.restore();

    this.drawRiverShoreFoam();
    this.drawWaterFlow();
  }

  drawRiverShoreFoam() {
    const ctx = this.ctx;

    ctx.save();

    ctx.lineWidth =
      1.5 *
      this.camera.zoom;

    ctx.strokeStyle =
      "rgba(235,253,255,0.58)";

    ctx.lineCap =
      "round";

    for (
      let i = 0;
      i < 16;
      i++
    ) {
      const y =
        (
          i * 2.1 +
          this.animationTime * 0.08
        ) %
        (WORLD_HEIGHT - 1);

      const center =
        riverCenterX(y);

      const width =
        riverWidthAt(y);

      const left =
        this.worldToScreen(
          center - width + 0.15,
          y
        );

      const right =
        this.worldToScreen(
          center + width - 0.15,
          y
        );

      const wave =
        Math.sin(
          this.animationTime * 2 +
          i
        ) * 5;

      ctx.beginPath();

      ctx.moveTo(
        left.x,
        left.y + wave
      );

      ctx.quadraticCurveTo(
        left.x + 8,
        left.y + wave - 3,
        left.x + 16,
        left.y + wave
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        right.x,
        right.y - wave
      );

      ctx.quadraticCurveTo(
        right.x - 8,
        right.y - wave - 3,
        right.x - 16,
        right.y - wave
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  drawWaterFlow() {
    const ctx = this.ctx;

    ctx.save();

    ctx.strokeStyle =
      "rgba(238,252,255,0.7)";

    ctx.lineWidth =
      1.6 *
      this.camera.zoom;

    ctx.lineCap =
      "round";

    const movement =
      (
        this.animationTime *
        2.6
      ) %
      5;

    for (
      let y = 3;
      y < WORLD_HEIGHT - 1;
      y += 2.7
    ) {
      const center =
        riverCenterX(y);

      const width =
        riverWidthAt(y);

      for (
        let side = -1;
        side <= 1;
        side += 2
      ) {
        const offset =
          side *
          width *
          0.45;

        const point =
          this.worldToScreen(
            center + offset,
            y +
              movement * 0.06
          );

        const length =
          7 *
          this.camera.zoom;

        ctx.globalAlpha =
          0.28 +
          (
            Math.sin(
              y +
              this.animationTime
            ) +
            1
          ) *
            0.12;

        ctx.beginPath();

        ctx.moveTo(
          point.x - length,
          point.y
        );

        ctx.lineTo(
          point.x + length,
          point.y
        );

        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================================
  // FLOOD
  // ==========================================================

  drawFlood(
    snapshot
  ) {
    const water =
      snapshot.water ||
      [];

    const tileWidth =
      WORLD.tileWidth *
      this.camera.zoom;

    const tileHeight =
      WORLD.tileHeight *
      this.camera.zoom;

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
        const amount =
          water[y]?.[x] ??
          0;

        if (
          amount < 0.055 ||
          isRiver(x, y)
        ) {
          continue;
        }

        const point =
          this.worldToScreen(
            x + 0.5,
            y + 0.5
          );

        this.drawFloodPatch(
          point.x,
          point.y,
          tileWidth,
          tileHeight,
          amount
        );
      }
    }
  }

  drawFloodPatch(
    x,
    y,
    width,
    height,
    amount
  ) {
    const ctx = this.ctx;

    const intensity =
      clamp(
        amount,
        0,
        1
      );

    const pulse =
      Math.sin(
        this.animationTime * 2.2 +
        x * 0.02 +
        y * 0.03
      ) *
      0.04;

    ctx.save();

    ctx.globalAlpha =
      0.35 +
      intensity * 0.38;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y -
        height * 0.44
    );

    ctx.quadraticCurveTo(
      x +
        width * 0.38,
      y -
        height * 0.12,
      x +
        width * 0.44,
      y
    );

    ctx.quadraticCurveTo(
      x +
        width * 0.25,
      y +
        height * 0.4,
      x,
      y +
        height * 0.44
    );

    ctx.quadraticCurveTo(
      x -
        width * 0.4,
      y +
        height * 0.2,
      x -
        width * 0.44,
      y
    );

    ctx.quadraticCurveTo(
      x -
        width * 0.3,
      y -
        height * 0.35,
      x,
      y -
        height * 0.44
    );

    ctx.closePath();

    ctx.fillStyle =
      `rgba(35,170,224,${
        0.42 +
        intensity * 0.25 +
        pulse
      })`;

    ctx.fill();

    // Water highlight
    ctx.strokeStyle =
      "rgba(222,251,255,0.68)";

    ctx.lineWidth =
      1.2 *
      this.camera.zoom;

    ctx.beginPath();

    ctx.moveTo(
      x -
        width * 0.2,
      y -
        height * 0.03
    );

    ctx.quadraticCurveTo(
      x,
      y -
        height * 0.12,
      x +
        width * 0.2,
      y -
        height * 0.03
    );

    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // ROADS
  // ==========================================================

  drawRoads() {
    const ctx = this.ctx;

    ctx.save();

    for (
      const road of ROADS || []
    ) {
      if (
        !Array.isArray(road) ||
        road.length < 2
      ) {
        continue;
      }

      const start =
        this.worldToScreen(
          road[0].x,
          road[0].y
        );

      const end =
        this.worldToScreen(
          road[1].x,
          road[1].y
        );

      const roadWidth =
        15 *
        this.camera.zoom;

      // Soft road shadow
      ctx.strokeStyle =
        "rgba(30,70,54,0.18)";

      ctx.lineWidth =
        roadWidth + 7;

      ctx.lineCap =
        "round";

      ctx.beginPath();

      ctx.moveTo(
        start.x + 2,
        start.y + 4
      );

      ctx.lineTo(
        end.x + 2,
        end.y + 4
      );

      ctx.stroke();

      // Outer road
      ctx.strokeStyle =
        "#737879";

      ctx.lineWidth =
        roadWidth + 3;

      ctx.beginPath();

      ctx.moveTo(
        start.x,
        start.y
      );

      ctx.lineTo(
        end.x,
        end.y
      );

      ctx.stroke();

      // Main road
      ctx.strokeStyle =
        "#a4a49e";

      ctx.lineWidth =
        roadWidth;

      ctx.beginPath();

      ctx.moveTo(
        start.x,
        start.y
      );

      ctx.lineTo(
        end.x,
        end.y
      );

      ctx.stroke();

      // Center marking
      ctx.strokeStyle =
        "rgba(255,245,179,0.8)";

      ctx.lineWidth =
        1.7 *
        this.camera.zoom;

      ctx.setLineDash([
        8 *
          this.camera.zoom,
        8 *
          this.camera.zoom,
      ]);

      ctx.beginPath();

      ctx.moveTo(
        start.x,
        start.y
      );

      ctx.lineTo(
        end.x,
        end.y
      );

      ctx.stroke();

      ctx.setLineDash([]);

      // Side highlights
      ctx.strokeStyle =
        "rgba(255,255,255,0.3)";

      ctx.lineWidth =
        1;

      ctx.beginPath();

      ctx.moveTo(
        start.x,
        start.y -
          roadWidth * 0.38
      );

      ctx.lineTo(
        end.x,
        end.y -
          roadWidth * 0.38
      );

      ctx.stroke();
    }

    ctx.restore();

    this.drawRoadIntersections();
  }

  drawRoadIntersections() {
    const intersections = [
      [17, 11],
      [24, 16],
      [31, 12],
      [35, 20],
    ];

    for (
      const [x, y] of intersections
    ) {
      const point =
        this.worldToScreen(
          x,
          y
        );

      this.drawCrosswalk(
        point.x,
        point.y
      );
    }
  }

  drawCrosswalk(
    x,
    y
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.strokeStyle =
      "rgba(255,255,255,0.55)";

    ctx.lineWidth =
      1.4 * s;

    for (
      let i = -2;
      i <= 2;
      i++
    ) {
      ctx.beginPath();

      ctx.moveTo(
        x - 12 * s,
        y + i * 4 * s
      );

      ctx.lineTo(
        x + 12 * s,
        y + i * 4 * s
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // BRIDGE
  // ==========================================================

  drawBridge() {
    if (
      !BRIDGE?.start ||
      !BRIDGE?.end
    ) {
      return;
    }

    const ctx = this.ctx;

    const start =
      this.worldToScreen(
        BRIDGE.start.x,
        BRIDGE.start.y
      );

    const end =
      this.worldToScreen(
        BRIDGE.end.x,
        BRIDGE.end.y
      );

    const width =
      22 *
      this.camera.zoom;

    ctx.save();

    // Shadow
    ctx.strokeStyle =
      "rgba(20,55,55,0.25)";

    ctx.lineWidth =
      width + 8;

    ctx.lineCap =
      "round";

    ctx.beginPath();

    ctx.moveTo(
      start.x + 3,
      start.y + 5
    );

    ctx.lineTo(
      end.x + 3,
      end.y + 5
    );

    ctx.stroke();

    // Bridge
    ctx.strokeStyle =
      "#6b7474";

    ctx.lineWidth =
      width;

    ctx.beginPath();

    ctx.moveTo(
      start.x,
      start.y
    );

    ctx.lineTo(
      end.x,
      end.y
    );

    ctx.stroke();

    // Warm rails
    ctx.strokeStyle =
      "#e2c574";

    ctx.lineWidth =
      3 *
      this.camera.zoom;

    ctx.beginPath();

    ctx.moveTo(
      start.x,
      start.y -
        width * 0.42
    );

    ctx.lineTo(
      end.x,
      end.y -
        width * 0.42
    );

    ctx.moveTo(
      start.x,
      start.y +
        width * 0.42
    );

    ctx.lineTo(
      end.x,
      end.y +
        width * 0.42
    );

    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // WETLAND
  // ==========================================================

  drawWetland() {
    const zone =
      SPECIAL_ZONES?.wetland;

    if (!zone) {
      return;
    }

    const center =
      this.worldToScreen(
        (
          zone.x1 +
          zone.x2
        ) / 2,
        (
          zone.y1 +
          zone.y2
        ) / 2
      );

    const width =
      Math.max(
        50,
        (
          zone.x2 -
          zone.x1
        ) *
          WORLD.tileWidth *
          this.camera.zoom *
          0.45
      );

    const height =
      Math.max(
        30,
        (
          zone.y2 -
          zone.y1
        ) *
          WORLD.tileHeight *
          this.camera.zoom *
          0.5
      );

    const ctx =
      this.ctx;

    ctx.save();

    ctx.fillStyle =
      "rgba(56,145,91,0.24)";

    ctx.beginPath();

    ctx.ellipse(
      center.x,
      center.y,
      width,
      height,
      -0.08,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Small wetland reeds
    for (
      let i = 0;
      i < 12;
      i++
    ) {
      const angle =
        (i / 12) *
        Math.PI *
        2;

      const px =
        center.x +
        Math.cos(angle) *
          width *
          0.65;

      const py =
        center.y +
        Math.sin(angle) *
          height *
          0.6;

      this.drawReed(
        px,
        py
      );
    }

    ctx.restore();
  }

  drawReed(
    x,
    y
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.strokeStyle =
      "rgba(41,112,59,0.48)";

    ctx.lineWidth =
      1.2 * s;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y + 5 * s
    );

    ctx.quadraticCurveTo(
      x - 2 * s,
      y - 4 * s,
      x + 1 * s,
      y - 11 * s
    );

    ctx.stroke();
  }

  // ==========================================================
  // TREES
  // ==========================================================

  drawTrees() {
    const trees = [
      [6, 7, 1.2],
      [9, 10, 0.85],
      [12, 6, 1.05],
      [15, 8, 0.75],
      [19, 5, 1.3],
      [23, 7, 0.9],
      [27, 5, 1.15],
      [31, 6, 0.85],
      [35, 5, 1.25],
      [39, 8, 0.9],
      [43, 11, 1.1],
      [40, 15, 0.8],
      [44, 20, 1.2],
      [39, 24, 0.9],
      [34, 26, 1.15],
      [28, 25, 0.8],
      [22, 26, 1.2],
      [17, 24, 0.9],
      [13, 22, 1.15],
      [9, 19, 0.8],
      [6, 16, 1],
    ];

    for (
      const [x, y, scale] of trees
    ) {
      if (
        isRiver(x, y)
      ) {
        continue;
      }

      const point =
        this.worldToScreen(
          x,
          y
        );

      this.drawTree(
        point.x,
        point.y,
        scale
      );
    }
  }

  drawTree(
    x,
    y,
    scale = 1
  ) {
    const ctx = this.ctx;

    const s =
      this.camera.zoom *
      scale;

    ctx.save();

    // Ground shadow
    ctx.fillStyle =
      "rgba(25,70,40,0.2)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 8 * s,
      15 * s,
      6 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Trunk
    const trunk =
      ctx.createLinearGradient(
        x - 3 * s,
        y,
        x + 4 * s,
        y
      );

    trunk.addColorStop(
      0,
      "#70482d"
    );

    trunk.addColorStop(
      1,
      "#9a693d"
    );

    ctx.fillStyle =
      trunk;

    roundRect(
      ctx,
      x - 3 * s,
      y - 15 * s,
      6 * s,
      20 * s,
      2 * s
    );

    ctx.fill();

    // Back foliage
    drawCircle(
      ctx,
      x - 9 * s,
      y - 20 * s,
      10 * s,
      "#25834b"
    );

    drawCircle(
      ctx,
      x + 9 * s,
      y - 20 * s,
      10 * s,
      "#25834b"
    );

    // Main foliage
    drawCircle(
      ctx,
      x,
      y - 27 * s,
      14 * s,
      "#35a952"
    );

    // Top highlight
    drawCircle(
      ctx,
      x - 4 * s,
      y - 31 * s,
      6 * s,
      "#55c75d"
    );

    ctx.restore();
  }

  // ==========================================================
  // BUILDINGS
  // ==========================================================

  drawBuildings(
    snapshot
  ) {
    const buildings =
      snapshot.buildings ||
      BUILDINGS ||
      [];

    const sorted =
      [...buildings].sort(
        (a, b) => {
          const ay =
            (a.y || 0) +
            (a.h || 1);

          const by =
            (b.y || 0) +
            (b.h || 1);

          return ay - by;
        }
      );

    for (
      const building of sorted
    ) {
      const x =
        (building.x || 0) +
        (building.w || 1) / 2;

      const y =
        (building.y || 0) +
        (building.h || 1) / 2;

      const point =
        this.worldToScreen(
          x,
          y
        );

      const type =
        String(
          building.type ||
          building.kind ||
          building.id ||
          ""
        ).toLowerCase();

      if (
        type.includes(
          "hospital"
        )
      ) {
        this.drawHospital(
          point.x,
          point.y,
          building
        );
      } else if (
        type.includes(
          "school"
        )
      ) {
        this.drawSchool(
          point.x,
          point.y,
          building
        );
      } else if (
        type.includes(
          "fire"
        )
      ) {
        this.drawFireStation(
          point.x,
          point.y,
          building
        );
      } else {
        this.drawHouse(
          point.x,
          point.y,
          building
        );
      }
    }
  }

  // ==========================================================
  // HOUSE
  // ==========================================================

  drawHouse(
    x,
    y,
    building
  ) {
    const ctx = this.ctx;

    const s =
      this.camera.zoom;

    const width =
      40 * s;

    const height =
      29 * s;

    const body =
      building.body ||
      "#f0d4aa";

    const roof =
      building.roof ||
      "#b55d4e";

    this.buildingShadow(
      x,
      y,
      width
    );

    // Small yard
    ctx.fillStyle =
      "rgba(69,145,71,0.2)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 3 * s,
      width * 0.75,
      9 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Building side
    ctx.fillStyle =
      "#d1b68f";

    polygon(
      ctx,
      [
        [
          x -
            width / 2,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            6 * s,
        ],
        [
          x,
          y -
            3 * s,
        ],
        [
          x -
            width / 2,
          y,
        ],
      ]
    );

    ctx.fill();

    // Front wall
    ctx.fillStyle =
      body;

    ctx.fillRect(
      x,
      y -
        height -
        6 * s,
      width / 2,
      height + 6 * s
    );

    // Roof
    ctx.fillStyle =
      roof;

    polygon(
      ctx,
      [
        [
          x -
            width / 2 -
            3 * s,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            18 * s,
        ],
        [
          x +
            width / 2 +
            3 * s,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            7 * s,
        ],
      ]
    );

    ctx.fill();

    // Roof highlight
    ctx.strokeStyle =
      "rgba(255,255,255,0.28)";

    ctx.lineWidth =
      1;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y -
        height -
        17 * s
    );

    ctx.lineTo(
      x +
        width / 2,
      y -
        height
    );

    ctx.stroke();

    // Windows
    this.drawWindow(
      x -
        11 * s,
      y -
        height +
        8 * s,
      7 * s,
      8 * s
    );

    this.drawWindow(
      x +
        5 * s,
      y -
        height +
        8 * s,
      7 * s,
      8 * s
    );

    // Door
    ctx.fillStyle =
      "#765039";

    roundRect(
      ctx,
      x -
        4 * s,
      y -
        16 * s,
      8 * s,
      16 * s,
      2 * s
    );

    ctx.fill();

    // Tiny garden
    drawCircle(
      ctx,
      x +
        width * 0.42,
      y -
        5 * s,
      3 * s,
      "#3b9d4e"
    );
  }

  // ==========================================================
  // WINDOW
  // ==========================================================

  drawWindow(
    x,
    y,
    width,
    height
  ) {
    const ctx = this.ctx;

    ctx.fillStyle =
      "#65c5e3";

    roundRect(
      ctx,
      x,
      y,
      width,
      height,
      2
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(255,255,255,0.7)";

    ctx.lineWidth =
      0.8;

    ctx.beginPath();

    ctx.moveTo(
      x + width / 2,
      y
    );

    ctx.lineTo(
      x + width / 2,
      y + height
    );

    ctx.moveTo(
      x,
      y + height / 2
    );

    ctx.lineTo(
      x + width,
      y + height / 2
    );

    ctx.stroke();
  }

  // ==========================================================
  // HOSPITAL
  // ==========================================================

  drawHospital(
    x,
    y,
    building
  ) {
    const ctx = this.ctx;

    const s =
      this.camera.zoom;

    const width =
      72 * s;

    const height =
      68 * s;

    this.buildingShadow(
      x,
      y,
      width
    );

    // Hospital ground/parking area
    ctx.fillStyle =
      "rgba(216,218,201,0.8)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 3 * s,
      width * 0.78,
      12 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Building side
    ctx.fillStyle =
      "#d6dfdf";

    polygon(
      ctx,
      [
        [
          x -
            width / 2,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            6 * s,
        ],
        [
          x,
          y,
        ],
        [
          x -
            width / 2,
          y,
        ],
      ]
    );

    ctx.fill();

    // Main facade
    const facade =
      ctx.createLinearGradient(
        x,
        y -
          height,
        x,
        y
      );

    facade.addColorStop(
      0,
      "#ffffff"
    );

    facade.addColorStop(
      1,
      "#e9f4f2"
    );

    ctx.fillStyle =
      facade;

    ctx.fillRect(
      x,
      y -
        height -
        6 * s,
      width / 2,
      height + 6 * s
    );

    // Roof
    ctx.fillStyle =
      "#d8e8e5";

    polygon(
      ctx,
      [
        [
          x -
            width / 2 -
            3 * s,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            16 * s,
        ],
        [
          x +
            width / 2 +
            3 * s,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            6 * s,
        ],
      ]
    );

    ctx.fill();

    // Windows
    for (
      let row = 0;
      row < 3;
      row++
    ) {
      for (
        let col = 0;
        col < 3;
        col++
      ) {
        this.drawWindow(
          x +
            8 * s +
            col * 13 * s,
          y -
            height +
            11 * s +
            row * 15 * s,
          8 * s,
          9 * s
        );
      }
    }

    // Entrance
    ctx.fillStyle =
      "#527d89";

    roundRect(
      ctx,
      x -
        8 * s,
      y -
        24 * s,
      16 * s,
      24 * s,
      3 * s
    );

    ctx.fill();

    // Red cross sign
    ctx.fillStyle =
      "#e54747";

    ctx.fillRect(
      x -
        5 * s,
      y -
        height -
        5 * s,
      10 * s,
      27 * s
    );

    ctx.fillRect(
      x -
        13 * s,
      y -
        height +
        3 * s,
      26 * s,
      9 * s
    );

    // Ambulance
    this.drawAmbulance(
      x +
        width * 0.52,
      y -
        2 * s
    );

    this.label(
      x,
      y -
        height -
        28 * s,
      "HOSPITAL",
      building.safe !== false,
      true
    );
  }

  drawAmbulance(
    x,
    y
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.fillStyle =
      "#f8f8f1";

    roundRect(
      ctx,
      x -
        16 * s,
      y -
        9 * s,
      32 * s,
      13 * s,
      3 * s
    );

    ctx.fill();

    ctx.fillStyle =
      "#e64e4e";

    ctx.fillRect(
      x -
        3 * s,
      y -
        7 * s,
      6 * s,
      10 * s
    );

    ctx.fillRect(
      x -
        7 * s,
      y -
        4 * s,
      14 * s,
      4 * s
    );

    drawCircle(
      ctx,
      x -
        10 * s,
      y +
        5 * s,
      3 * s,
      "#334a54"
    );

    drawCircle(
      ctx,
      x +
        10 * s,
      y +
        5 * s,
      3 * s,
      "#334a54"
    );

    ctx.restore();
  }

  // ==========================================================
  // SCHOOL
  // ==========================================================

  drawSchool(
    x,
    y,
    building
  ) {
    const ctx = this.ctx;

    const s =
      this.camera.zoom;

    const width =
      82 * s;

    const height =
      53 * s;

    this.buildingShadow(
      x,
      y,
      width
    );

    // Playground
    ctx.fillStyle =
      "rgba(89,161,77,0.45)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 4 * s,
      width * 0.88,
      13 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Building body
    ctx.fillStyle =
      "#ffd86d";

    ctx.fillRect(
      x -
        width / 2,
      y -
        height,
      width,
      height
    );

    // Side shading
    ctx.fillStyle =
      "#dba94e";

    polygon(
      ctx,
      [
        [
          x -
            width / 2,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            7 * s,
        ],
        [
          x,
          y,
        ],
        [
          x -
            width / 2,
          y,
        ],
      ]
    );

    ctx.fill();

    // Roof
    ctx.fillStyle =
      "#d57a3b";

    polygon(
      ctx,
      [
        [
          x -
            width / 2 -
            5 * s,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            21 * s,
        ],
        [
          x +
            width / 2 +
            5 * s,
          y -
            height,
        ],
      ]
    );

    ctx.fill();

    // Windows
    for (
      let col = 0;
      col < 4;
      col++
    ) {
      this.drawWindow(
        x -
          27 * s +
          col * 17 * s,
        y -
          height +
          13 * s,
        10 * s,
        9 * s
      );

      this.drawWindow(
        x -
          27 * s +
          col * 17 * s,
        y -
          height +
          29 * s,
        10 * s,
        9 * s
      );
    }

    // Entrance
    ctx.fillStyle =
      "#744c38";

    roundRect(
      ctx,
      x -
        8 * s,
      y -
        25 * s,
      16 * s,
      25 * s,
      3 * s
    );

    ctx.fill();

    // School sign
    roundRect(
      ctx,
      x -
        27 * s,
      y -
        height -
        7 * s,
      54 * s,
      12 * s,
      4 * s
    );

    ctx.fillStyle =
      "#f7f0bf";

    ctx.fill();

    ctx.fillStyle =
      "#b04c3f";

    ctx.font =
      `900 ${
        8 * s
      }px Arial`;

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      "SCHOOL",
      x,
      y -
        height +
        -1 * s
    );

    // Playground fence
    ctx.strokeStyle =
      "#e8e0b5";

    ctx.lineWidth =
      2 * s;

    ctx.beginPath();

    ctx.rect(
      x -
        width * 0.72,
      y -
        3 * s,
      width * 1.44,
      17 * s
    );

    ctx.stroke();

    // School bus
    this.drawSchoolBus(
      x -
        width * 0.72,
      y +
        3 * s
    );

    this.label(
      x,
      y -
        height -
        31 * s,
      "SCHOOL",
      building.safe !== false,
      true
    );
  }

  drawSchoolBus(
    x,
    y
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.fillStyle =
      "#f5c94f";

    roundRect(
      ctx,
      x -
        18 * s,
      y -
        9 * s,
      36 * s,
      13 * s,
      3 * s
    );

    ctx.fill();

    ctx.fillStyle =
      "#6cb5d0";

    for (
      let i = 0;
      i < 4;
      i++
    ) {
      ctx.fillRect(
        x -
          14 * s +
          i * 7 * s,
        y -
          6 * s,
        5 * s,
        5 * s
      );
    }

    drawCircle(
      ctx,
      x -
        10 * s,
      y +
        5 * s,
      3 * s,
      "#3d4b4e"
    );

    drawCircle(
      ctx,
      x +
        10 * s,
      y +
        5 * s,
      3 * s,
      "#3d4b4e"
    );

    ctx.restore();
  }

  // ==========================================================
  // FIRE STATION
  // ==========================================================

  drawFireStation(
    x,
    y,
    building
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    const width =
      58 * s;

    const height =
      43 * s;

    this.buildingShadow(
      x,
      y,
      width
    );

    ctx.fillStyle =
      "#d9574d";

    ctx.fillRect(
      x -
        width / 2,
      y -
        height,
      width,
      height
    );

    ctx.fillStyle =
      "#8c3f3c";

    polygon(
      ctx,
      [
        [
          x -
            width / 2 -
            3 * s,
          y -
            height,
        ],
        [
          x,
          y -
            height -
            17 * s,
        ],
        [
          x +
            width / 2 +
            3 * s,
          y -
            height,
        ],
      ]
    );

    ctx.fill();

    // Garage doors
    ctx.fillStyle =
      "#59676a";

    ctx.fillRect(
      x -
        20 * s,
      y -
        height +
        7 * s,
      14 * s,
      25 * s
    );

    ctx.fillRect(
      x +
        6 * s,
      y -
        height +
        7 * s,
      14 * s,
      25 * s
    );

    // Cross
    ctx.fillStyle =
      "#fff0c4";

    ctx.fillRect(
      x -
        4 * s,
      y -
        height -
        1 * s,
      8 * s,
      20 * s
    );

    ctx.fillRect(
      x -
        10 * s,
      y -
        height +
        5 * s,
      20 * s,
      7 * s
    );

    this.label(
      x,
      y -
        height -
        26 * s,
      "FIRE STATION",
      building.safe !== false,
      true
    );
  }

  // ==========================================================
  // BUILDING SHADOW
  // ==========================================================

  buildingShadow(
    x,
    y,
    width
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.fillStyle =
      "rgba(22,67,42,0.22)";

    ctx.beginPath();

    ctx.ellipse(
      x + 4 * s,
      y + 5 * s,
      width * 0.7,
      8 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // LABEL
  // ==========================================================

  label(
    x,
    y,
    text,
    safe,
    important = false
  ) {
    const ctx = this.ctx;

    const s =
      this.camera.zoom;

    ctx.save();

    const fontSize =
      important
        ? 10 * s
        : 8 * s;

    ctx.font =
      `900 ${fontSize}px Arial`;

    const textWidth =
      ctx.measureText(
        text
      ).width;

    const width =
      textWidth +
      16 * s;

    const height =
      20 * s;

    roundRect(
      ctx,
      x -
        width / 2,
      y -
        height / 2,
      width,
      height,
      7 * s
    );

    ctx.fillStyle =
      safe
        ? "rgba(255,249,213,0.94)"
        : "rgba(224,74,68,0.94)";

    ctx.fill();

    ctx.strokeStyle =
      safe
        ? "rgba(255,255,255,0.75)"
        : "rgba(255,255,255,0.35)";

    ctx.lineWidth =
      1;

    ctx.stroke();

    ctx.fillStyle =
      safe
        ? "#236a48"
        : "#ffffff";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      text,
      x,
      y
    );

    ctx.restore();
  }

  // ==========================================================
  // DEFENSES
  // ==========================================================

  drawDefenses(
    snapshot
  ) {
    const defenses =
      snapshot.defenses ||
      [];

    for (
      const defense of defenses
    ) {
      const point =
        this.worldToScreen(
          defense.x + 0.5,
          defense.y + 0.5
        );

      const type =
        String(
          defense.type ||
          ""
        ).toLowerCase();

      if (
        type === "wall" ||
        type.includes("wall")
      ) {
        this.drawFloodWall(
          point.x,
          point.y,
          false
        );
      } else if (
        type === "pump" ||
        type.includes("pump")
      ) {
        this.drawPump(
          point.x,
          point.y,
          false
        );
      } else {
        this.drawSandbags(
          point.x,
          point.y,
          false
        );
      }
    }
  }

  // ==========================================================
  // FLOOD WALL
  // ==========================================================

  drawFloodWall(
    x,
    y,
    preview
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.globalAlpha =
      preview
        ? 0.6
        : 1;

    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.2)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 8 * s,
      31 * s,
      7 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    for (
      let row = 0;
      row < 2;
      row++
    ) {
      for (
        let col = 0;
        col < 4;
        col++
      ) {
        const bx =
          x -
          29 * s +
          col * 15 * s +
          (
            row
              ? 7.5
              : 0
          ) *
            s;

        const by =
          y -
          15 * s -
          row * 12 * s;

        const gradient =
          ctx.createLinearGradient(
            bx,
            by,
            bx,
            by +
              12 * s
          );

        gradient.addColorStop(
          0,
          preview
            ? "#d6ffe0"
            : "#e0e3df"
        );

        gradient.addColorStop(
          1,
          preview
            ? "#61d879"
            : "#7d8987"
        );

        ctx.fillStyle =
          gradient;

        roundRect(
          ctx,
          bx,
          by,
          14 * s,
          11 * s,
          3 * s
        );

        ctx.fill();

        ctx.strokeStyle =
          preview
            ? "#46ed6b"
            : "#5c6868";

        ctx.lineWidth =
          1;

        ctx.stroke();
      }
    }

    // Safety glow
    if (!preview) {
      ctx.shadowColor =
        "rgba(65,225,111,0.25)";

      ctx.shadowBlur =
        8 * s;

      ctx.strokeStyle =
        "rgba(89,230,117,0.5)";

      ctx.lineWidth =
        1.5 * s;

      ctx.beginPath();

      ctx.moveTo(
        x - 30 * s,
        y - 16 * s
      );

      ctx.lineTo(
        x + 30 * s,
        y - 16 * s
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // PUMP
  // ==========================================================

  drawPump(
    x,
    y,
    preview
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.globalAlpha =
      preview
        ? 0.62
        : 1;

    // Shadow
    ctx.fillStyle =
      "rgba(0,0,0,0.22)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 8 * s,
      23 * s,
      7 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Pump body
    const body =
      ctx.createLinearGradient(
        x - 14 * s,
        y,
        x + 14 * s,
        y
      );

    body.addColorStop(
      0,
      preview
        ? "#78e596"
        : "#2e6983"
    );

    body.addColorStop(
      1,
      preview
        ? "#b5f7c3"
        : "#4e9bc4"
    );

    ctx.fillStyle =
      body;

    roundRect(
      ctx,
      x - 14 * s,
      y - 18 * s,
      28 * s,
      25 * s,
      6 * s
    );

    ctx.fill();

    ctx.strokeStyle =
      preview
        ? "#42ed68"
        : "#214c61";

    ctx.lineWidth =
      1.5 * s;

    ctx.stroke();

    // Motor
    ctx.fillStyle =
      preview
        ? "#caffd1"
        : "#6ab8d8";

    ctx.beginPath();

    ctx.arc(
      x,
      y - 9 * s,
      10 * s,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Center
    drawCircle(
      ctx,
      x,
      y - 9 * s,
      4 * s,
      preview
        ? "#56d979"
        : "#32647c"
    );

    // Pipe
    ctx.strokeStyle =
      preview
        ? "#9cffae"
        : "#4f5c60";

    ctx.lineWidth =
      5 * s;

    ctx.lineCap =
      "round";

    ctx.beginPath();

    ctx.moveTo(
      x + 9 * s,
      y - 7 * s
    );

    ctx.lineTo(
      x + 22 * s,
      y - 7 * s
    );

    ctx.lineTo(
      x + 25 * s,
      y - 2 * s
    );

    ctx.stroke();

    // Pumping water
    if (
      !preview
    ) {
      const pulse =
        (
          this.animationTime *
          4
        ) %
        1;

      ctx.globalAlpha =
        0.7 -
        pulse * 0.5;

      drawCircle(
        ctx,
        x + 27 * s,
        y +
          2 * s -
          pulse * 10 * s,
        (
          2 +
          pulse * 2
        ) *
          s,
        "#8beaff"
      );
    }

    ctx.restore();
  }

  // ==========================================================
  // SAND BAGS
  // ==========================================================

  drawSandbags(
    x,
    y,
    preview
  ) {
    const ctx = this.ctx;
    const s =
      this.camera.zoom;

    ctx.save();

    ctx.globalAlpha =
      preview
        ? 0.62
        : 1;

    ctx.fillStyle =
      "rgba(0,0,0,0.2)";

    ctx.beginPath();

    ctx.ellipse(
      x,
      y + 8 * s,
      28 * s,
      7 * s,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    const bags = [
      [-18, 0],
      [0, 0],
      [18, 0],
      [-9, -9],
      [9, -9],
    ];

    for (
      const [
        dx,
        dy,
      ] of bags
    ) {
      this.drawSandbag(
        x + dx * s,
        y + dy * s,
        s,
        preview
      );
    }

    ctx.restore();
  }

  drawSandbag(
    x,
    y,
    s,
    preview
  ) {
    const ctx = this.ctx;

    const gradient =
      ctx.createLinearGradient(
        x,
        y - 9 * s,
        x,
        y + 1 * s
      );

    gradient.addColorStop(
      0,
      preview
        ? "#c9fbd0"
        : "#e8c985"
    );

    gradient.addColorStop(
      1,
      preview
        ? "#6bd987"
        : "#ad813d"
    );

    ctx.fillStyle =
      gradient;

    roundRect(
      ctx,
      x - 10 * s,
      y - 8 * s,
      20 * s,
      10 * s,
      4 * s
    );

    ctx.fill();

    ctx.strokeStyle =
      preview
        ? "#43ec69"
        : "#80602d";

    ctx.lineWidth =
      1;

    ctx.stroke();

    if (
      !preview
    ) {
      ctx.strokeStyle =
        "rgba(91,65,28,0.5)";

      ctx.lineWidth =
        0.8;

      ctx.beginPath();

      ctx.moveTo(
        x - 6 * s,
        y - 3 * s
      );

      ctx.lineTo(
        x + 6 * s,
        y - 3 * s
      );

      ctx.stroke();
    }
  }

  // ==========================================================
  // ZONE LABELS
  // ==========================================================

  drawZoneLabels() {
    if (
      SPECIAL_ZONES?.wetland
    ) {
      this.zoneLabel(
        SPECIAL_ZONES.wetland,
        "#e9f3bf"
      );
    }

    /*
     * Low/high terrain labels are deliberately subtle.
     * The world should feel like a game, not a technical map.
     */

    if (
      SPECIAL_ZONES?.highGround
    ) {
      this.zoneLabel(
        SPECIAL_ZONES.highGround,
        "#e3f4c9"
      );
    }
  }

  zoneLabel(
    zone,
    background
  ) {
    if (!zone?.label) {
      return;
    }

    const ctx = this.ctx;

    const s =
      this.camera.zoom;

    const center =
      this.worldToScreen(
        (
          zone.x1 +
          zone.x2
        ) / 2,
        (
          zone.y1 +
          zone.y2
        ) / 2
      );

    ctx.save();

    ctx.font =
      `900 ${
        8 * s
      }px Arial`;

    const width =
      ctx.measureText(
        zone.label
      ).width +
      15 * s;

    const height =
      18 * s;

    roundRect(
      ctx,
      center.x -
        width / 2,
      center.y -
        height / 2,
      width,
      height,
      6 * s
    );

    ctx.fillStyle =
      background;

    ctx.globalAlpha =
      0.72;

    ctx.fill();

    ctx.globalAlpha =
      1;

    ctx.fillStyle =
      "#286746";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      zone.label,
      center.x,
      center.y
    );

    ctx.restore();
  }

  // ==========================================================
  // HOVER / PLACEMENT
  // ==========================================================

  drawHoverPreview(
    snapshot
  ) {
    if (
      !this.hoverCell ||
      !this.selectedDefense
    ) {
      return;
    }

    const {
      x,
      y,
    } = this.hoverCell;

    if (
      x < 0 ||
      y < 0 ||
      x >= WORLD_WIDTH ||
      y >= WORLD_HEIGHT
    ) {
      return;
    }

    const point =
      this.worldToScreen(
        x + 0.5,
        y + 0.5
      );

    const tileWidth =
      WORLD.tileWidth *
      this.camera.zoom;

    const tileHeight =
      WORLD.tileHeight *
      this.camera.zoom;

    const count =
      snapshot.inventory?.[
        this.selectedDefense
      ] ?? 0;

    const available =
      count > 0;

    const ctx =
      this.ctx;

    ctx.save();

    // Soft placement halo
    ctx.fillStyle =
      available
        ? "rgba(79,221,107,0.12)"
        : "rgba(238,75,75,0.12)";

    ctx.strokeStyle =
      available
        ? "#63e879"
        : "#ee6464";

    ctx.lineWidth =
      2;

    ctx.beginPath();

    ctx.ellipse(
      point.x,
      point.y,
      tileWidth * 0.46,
      tileHeight * 0.3,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();

    if (
      this.selectedDefense ===
      "wall"
    ) {
      this.drawFloodWall(
        point.x,
        point.y,
        true
      );
    } else if (
      this.selectedDefense ===
      "pump"
    ) {
      this.drawPump(
        point.x,
        point.y,
        true
      );
    } else if (
      this.selectedDefense ===
      "sand"
    ) {
      this.drawSandbags(
        point.x,
        point.y,
        true
      );
    }
  }

  // ==========================================================
  // DESTROY
  // ==========================================================

  destroy() {
    if (
      this.resizeObserver
    ) {
      this.resizeObserver.disconnect();
    }

    this.canvas = null;
    this.ctx = null;
  }
}
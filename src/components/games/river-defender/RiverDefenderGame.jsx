import React, { useEffect } from "react";
import "../../../styles/RiverDefender.css";

export default function RiverDefenderGame() {
  useEffect(() => {
    const root = document.getElementById("river-defender-game");
    if (!root) return;

    let rafId = 0;
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const startScreen = document.getElementById('startScreen');
  const tutorialScreen = document.getElementById('tutorialScreen');
  const reportScreen = document.getElementById('reportScreen');

  const W = 46;
  const H = 30;
  const tools = {
    wall: { name: 'Flood Wall', radius: 0, color: '#7c6a56' },
    pump: { name: 'Pump', radius: 3, color: '#f0f6ff' },
    sand: { name: 'Sand Bags', radius: 1, color: '#d9b44a' }
  };
  const state = {
    mode: 'start',
    paused: false,
    inventory: {
      wall: 2,
      pump: 1,
      sand: 3
    },
    elapsed: 0,
    prep: 16,
    selected: null,
    hover: null,
    messageTimer: 0,
    message: 'PREPARE YOUR DEFENSES',
    panX: -72,
    panY: -220,
    zoom: .90,
    dragging: false,
    dragStart: null,
    lastPointer: null,
    pointerMoved: false,
    pointerId: null,
    rainBurst: 0,
    ended: false
  };

  const elevation = [];
  const water = [];
  const nextWater = [];
  const defenses = [];
  const particles = [];
  const ripples = [];

  const buildings = [
    // Community anchors
    { id: 'hospital', type: 'hospital', name: 'HOSPITAL', x: 28, y: 11, w: 4, h: 4, floors: 3, safe: true, importance: 2 },
    { id: 'school', type: 'school', name: 'SCHOOL', x: 31, y: 18, w: 4, h: 3, floors: 2, safe: true, importance: 2 },
    { id: 'fire', type: 'fire', name: 'FIRE STATION', x: 22, y: 18, w: 3, h: 3, floors: 1, safe: true },

    // Compact residential neighborhood around the community core
    { id: 'home1', type: 'home', x: 18, y: 10, w: 2, h: 2, roof: '#4f86b6', safe: true },
    { id: 'home2', type: 'home', x: 22, y: 10, w: 2, h: 2, roof: '#d36a49', safe: true },
    { id: 'home3', type: 'home', x: 26, y: 9, w: 2, h: 2, roof: '#6c9a62', safe: true },
    { id: 'home4', type: 'home', x: 32, y: 10, w: 2, h: 2, roof: '#d49a3e', safe: true },
    { id: 'home5', type: 'home', x: 36, y: 11, w: 2, h: 2, roof: '#5b8fb8', safe: true },

    { id: 'home6', type: 'home', x: 17, y: 14, w: 2, h: 2, roof: '#c85c51', safe: true },
    { id: 'home7', type: 'home', x: 21, y: 14, w: 2, h: 2, roof: '#d99a3f', safe: true },
    { id: 'home8', type: 'home', x: 25, y: 14, w: 2, h: 2, roof: '#5d9566', safe: true },
    { id: 'home9', type: 'home', x: 35, y: 15, w: 2, h: 2, roof: '#c35d70', safe: true },
    { id: 'home10', type: 'home', x: 39, y: 16, w: 2, h: 2, roof: '#4f8fba', safe: true },

    { id: 'home11', type: 'home', x: 18, y: 20, w: 2, h: 2, roof: '#d58d3c', safe: true },
    { id: 'home12', type: 'home', x: 27, y: 20, w: 2, h: 2, roof: '#c65b51', safe: true },
    { id: 'home13', type: 'home', x: 36, y: 20, w: 2, h: 2, roof: '#6c9c62', safe: true },
    { id: 'home14', type: 'home', x: 40, y: 21, w: 2, h: 2, roof: '#d69c40', safe: true },

    { id: 'home15', type: 'home', x: 16, y: 24, w: 2, h: 2, roof: '#4f8db8', safe: true },
    { id: 'home16', type: 'home', x: 21, y: 24, w: 2, h: 2, roof: '#c45e70', safe: true },
    { id: 'home17', type: 'home', x: 26, y: 25, w: 2, h: 2, roof: '#d38c3c', safe: true },
    { id: 'home18', type: 'home', x: 32, y: 24, w: 2, h: 2, roof: '#558eb9', safe: true },
    { id: 'home19', type: 'home', x: 37, y: 25, w: 2, h: 2, roof: '#c55d51', safe: true },
    { id: 'home20', type: 'home', x: 41, y: 25, w: 2, h: 2, roof: '#6d9c62', safe: true }
  ];

  const roads = [
    [{x: 16, y: 13}, {x: 40, y: 13}],
    [{x: 16, y: 18}, {x: 42, y: 18}],
    [{x: 16, y: 23}, {x: 42, y: 23}],
    [{x: 21, y: 27}, {x: 40, y: 27}],
    [{x: 21, y: 10}, {x: 21, y: 27}],
    [{x: 28, y: 9}, {x: 28, y: 28}],
    [{x: 35, y: 10}, {x: 35, y: 28}],
    [{x: 40, y: 12}, {x: 40, y: 27}]
  ];

  function initField() {
    for (let y = 0; y < H; y++) {
      elevation[y] = [];
      water[y] = [];
      nextWater[y] = [];
      for (let x = 0; x < W; x++) {
        const riverBand = riverDistance(x, y);
        const low = Math.exp(-((x - 15) ** 2 / 105 + (y - 18) ** 2 / 65)) * .30;
        const hill = Math.exp(-((x - 39) ** 2 / 70 + (y - 7) ** 2 / 46)) * .55;
        elevation[y][x] = .52 + hill - low + Math.max(0, riverBand - 2) * .018;
        water[y][x] = riverBand < 2.55 ? .44 : 0;
        nextWater[y][x] = 0;
      }
    }
  }

  function resetGame() {
    state.mode = 'play';
    state.paused = false;
    state.inventory = {
      wall: 2,
      pump: 1,
      sand: 3
    };
    state.elapsed = 0;
    state.prep = 16;
    state.selected = null;
    state.hover = null;
    state.message = 'PREPARE YOUR DEFENSES';
    state.messageTimer = 0;
    state.rainBurst = 0;
    state.ended = false;
    state.panX = -72;
    state.panY = -220;
    state.zoom = .90;
    defenses.length = 0;
    particles.length = 0;
    ripples.length = 0;
    initField();
    buildings.forEach(b => b.safe = true);
    reportScreen.classList.remove('active');
    startScreen.classList.remove('active');
    tutorialScreen.classList.remove('active');
    hud.classList.remove('hidden');
    setTool(null);
    resize();
  }

  function riverDistance(x, y) {
    const center = 6.2 + Math.sin(y * .31) * 1.25 + y * .18;
    return Math.abs(x - center);
  }

  function isRiver(x, y) {
    return riverDistance(x, y) < 2.35;
  }

  function isWetland(x, y) {
    return x >= 11 && x <= 17 && y >= 20 && y <= 26;
  }

  function isRoadCell(x, y) {
    return roads.some(([a, b]) => {
      const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x);
      const minY = Math.min(a.y, b.y), maxY = Math.max(a.y, b.y);
      return x >= minX - .45 && x <= maxX + .45 && y >= minY - .45 && y <= maxY + .45 &&
        (Math.abs(a.x - b.x) < .1 || Math.abs(a.y - b.y) < .1);
    });
  }

  function buildingAt(x, y) {
    return buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  }

  function defenseAt(x, y) {
    return defenses.find(d => Math.round(d.x) === Math.round(x) && Math.round(d.y) === Math.round(y));
  }

  function resize() {
    const rect = root.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function iso(x, y, z = 0) {
    const rect = root.getBoundingClientRect();
    const tileW = 34 * state.zoom;
    const tileH = 17 * state.zoom;
    const originX = rect.width * .49 + state.panX;
    const originY = rect.height * .23 + state.panY;
    return {
      x: originX + (x - y) * tileW,
      y: originY + (x + y) * tileH - z * 28 * state.zoom
    };
  }

  function screenToGrid(px, py) {
    const rect = root.getBoundingClientRect();
    const tileW = 34 * state.zoom;
    const tileH = 17 * state.zoom;
    const ox = rect.width * .49 + state.panX;
    const oy = rect.height * .23 + state.panY;
    const dx = (px - ox) / tileW;
    const dy = (py - oy) / tileH;
    return { x: Math.floor((dy + dx) / 2), y: Math.floor((dy - dx) / 2) };
  }

  function diamond(x, y, z = 0) {
    const a = iso(x, y, z), b = iso(x + 1, y, z), c = iso(x + 1, y + 1, z), d = iso(x, y + 1, z);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
  }

  function fillDiamond(x, y, color, z = 0, stroke = null) {
    diamond(x, y, z);
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function colorForTerrain(x, y) {
    if (isRiver(x, y)) return '#1596dd';
    if (isWetland(x, y)) return '#7bc771';
    if (riverDistance(x, y) < 3.05) return '#7acb69';
    if (isRoadCell(x, y)) return '#8e918a';
    const e = elevation[y][x];
    if (e < .34) return '#76bd5f';
    if (e > .87) return '#6db769';
    return ((x + y) % 2) ? '#69c663' : '#5fbd5d';
  }

  function drawTileSides(x, y, z) {
    const p1 = iso(x, y + 1, z);
    const p2 = iso(x + 1, y + 1, z);
    const p3 = iso(x + 1, y + 1, 0);
    const p4 = iso(x, y + 1, 0);
    if (z > .02) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fillStyle = '#3f9b4d';
      ctx.fill();
    }
  }

  function drawWorld(now) {
    const rect = root.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    drawBackdrop(rect);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const z = elevation[y][x] * .18;
        drawTileSides(x, y, z);
        fillDiamond(x, y, colorForTerrain(x, y), z, 'rgba(35,90,60,.055)');
        const w = water[y][x];
        if (w > .02) drawWaterTile(x, y, z, w, now);
      }
    }
    drawRoadDetails();
    drawBridge();
    drawWetlandLabel();
    drawTrees();
    drawBuildings();
    drawDefenses(now);
    drawGhost();
    drawRain(now);
  }

  function drawBackdrop(rect) {
    ctx.fillStyle = '#bde7ff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    const g = ctx.createLinearGradient(0, 0, 0, rect.height);
    g.addColorStop(0, '#bde7ff');
    g.addColorStop(.43, '#ddf7ff');
    g.addColorStop(.44, '#80c96d');
    g.addColorStop(1, '#50a94d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function drawWaterTile(x, y, z, amount, now) {
    const level = z + Math.min(.24, amount * .22);
    diamond(x, y, level);
    const g = ctx.createLinearGradient(0, iso(x,y,level).y, 0, iso(x,y,level).y + 28*state.zoom);
    g.addColorStop(0, 'rgba(55,181,239,.92)');
    g.addColorStop(.55, 'rgba(19,139,207,.86)');
    g.addColorStop(1, 'rgba(7,99,165,.88)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.32)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if ((x + y + Math.floor(now / 220)) % 4 === 0) {
      const a = iso(x + .16, y + .53, level + .025);
      const b = iso(x + .76, y + .48, level + .025);
      ctx.strokeStyle = 'rgba(226,249,255,.58)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
  }

  function drawRoadDetails() {
    roads.forEach(([a,b]) => {
      const p1 = iso(a.x + .5, a.y + .5, .16);
      const p2 = iso(b.x + .5, b.y + .5, .16);
      const s = state.zoom;
      ctx.save();
      ctx.lineCap = 'round';
      // soft ground shadow
      ctx.strokeStyle = 'rgba(25,48,45,.28)';
      ctx.lineWidth = 22*s;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y+3*s); ctx.lineTo(p2.x,p2.y+3*s); ctx.stroke();
      // sidewalk edge
      ctx.strokeStyle = '#c6c8c2';
      ctx.lineWidth = 17*s;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      // asphalt
      const roadGrad = ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);
      roadGrad.addColorStop(0,'#737875');
      roadGrad.addColorStop(.5,'#8a8d88');
      roadGrad.addColorStop(1,'#6c706d');
      ctx.strokeStyle = roadGrad;
      ctx.lineWidth = 14*s;
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      // lane markings
      ctx.strokeStyle = 'rgba(255,249,213,.92)';
      ctx.lineWidth = 1.6*s;
      ctx.setLineDash([7*s,6*s]);
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });
  }

  function drawBridge() {
    const p1 = iso(7.0, 13.2, .34), p2 = iso(15.2, 13.2, .34);
    ctx.strokeStyle = '#6e6251';
    ctx.lineWidth = 18 * state.zoom;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.strokeStyle = '#fff0b5';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawWetlandLabel() {
    const p = iso(13.2, 23.2, .28);
    drawLabel('WETLAND', p.x, p.y, '#245f36');
    const q = iso(17, 17, .18);
    drawLabel('LOW-LYING AREA', q.x, q.y, '#245f36');
  }

  function drawTrees() {
    for (let i = 0; i < 74; i++) {
      const x = (i * 17 + 4) % (W - 4) + 2;
      const y = (i * 23 + 2) % (H - 4) + 2;
      const inCommunity = x >= 15 && x <= 43 && y >= 8 && y <= 27;
      if (buildingAt(x, y) || isRiver(x, y) || isRoadCell(x, y)) continue;
      if (inCommunity && i % 3 !== 0) continue;
      const p = iso(x + .5, y + .5, elevation[y][x] * .18 + .16);
      const s = state.zoom * (0.82 + ((i * 7) % 5) * .08);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.fillStyle='rgba(28,60,38,.22)';
      ctx.beginPath(); ctx.ellipse(0,5*s,13*s,5*s,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#6f4d2d'; ctx.fillRect(-2.2*s,-14*s,4.4*s,17*s);
      ctx.fillStyle='#2e7438'; ctx.beginPath(); ctx.arc(-6*s,-18*s,8*s,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#49a34c'; ctx.beginPath(); ctx.arc(5*s,-21*s,9*s,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#67b957'; ctx.beginPath(); ctx.arc(0,-27*s,8*s,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(-2*s,-29*s,3*s,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function drawBuildings() {
    const sorted = [...buildings].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    sorted.forEach(b => drawBuilding(b));
  }

  function drawBuilding(b) {
    const z = elevation[b.y][b.x] * .18;
    const center = iso(b.x + b.w / 2, b.y + b.h / 2, z + .24);
    const s = state.zoom;
    const isHome = b.type === 'home';
    const h = (isHome ? 28 : 32 + b.floors * 19) * s;
    const w = (isHome ? 54 : 66 + b.w * 8) * s;
    const depth = (isHome ? 28 : 38) * s;
    let body = '#eee5d0', roof = b.roof || '#bd5147';
    if (b.type === 'hospital') { body='#f7f7ee'; roof='#d94740'; }
    if (b.type === 'school') { body='#f2c965'; roof='#d87530'; }
    if (b.type === 'fire') { body='#c94b3e'; roof='#71302e'; }

    ctx.save();
    ctx.translate(center.x,center.y);

    // landscaped plot / shadow
    ctx.fillStyle='rgba(24,60,40,.20)';
    ctx.beginPath(); ctx.ellipse(0,depth*.72,w*.72,depth*.5,0,0,Math.PI*2); ctx.fill();
    if (isHome) {
      ctx.fillStyle='rgba(87,141,71,.55)';
      ctx.fillRect(-w*.62,0,w*1.24,5*s);
      ctx.fillStyle='#b8a06c';
      ctx.fillRect(-w*.55,5*s,w*1.1,2*s);
    }

    // facade
    const facade=ctx.createLinearGradient(-w/2,-h,w/2,0);
    facade.addColorStop(0,body); facade.addColorStop(.65,body); facade.addColorStop(1,shade(body,-16));
    ctx.fillStyle=facade; ctx.fillRect(-w/2,-h,w,h);

    // right side depth
    ctx.fillStyle=shade(body,-32);
    ctx.beginPath();
    ctx.moveTo(w/2,-h); ctx.lineTo(w/2+depth*.58,-h+depth*.28); ctx.lineTo(w/2+depth*.58,0); ctx.lineTo(w/2,0); ctx.closePath(); ctx.fill();

    // roof front plane
    ctx.fillStyle=roof;
    ctx.beginPath();
    ctx.moveTo(-w/2-6*s,-h); ctx.lineTo(0,-h-20*s); ctx.lineTo(w/2+6*s,-h); ctx.lineTo(0,-h+7*s); ctx.closePath(); ctx.fill();
    // roof side plane
    ctx.fillStyle=shade(roof,-30);
    ctx.beginPath();
    ctx.moveTo(0,-h-20*s); ctx.lineTo(w/2+6*s,-h); ctx.lineTo(w/2+depth*.48,-h+depth*.25); ctx.lineTo(0,-h-11*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.moveTo(-w/2,-h-1*s); ctx.lineTo(0,-h-20*s); ctx.lineTo(w/2,-h-1*s); ctx.lineTo(0,-h-5*s); ctx.closePath(); ctx.fill();

    // windows / shutters
    const cols=isHome?2:Math.max(2,Math.floor(w/(20*s)));
    const rows=isHome?1:Math.max(1,Math.floor(h/(22*s)));
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
      const wx=-w/2+11*s+c*((w-22*s)/Math.max(1,cols-1));
      const wy=-h+13*s+r*20*s;
      ctx.fillStyle='#79bad3'; ctx.fillRect(wx,wy,9*s,9*s);
      ctx.fillStyle='rgba(255,255,255,.38)'; ctx.fillRect(wx+1*s,wy+1*s,3*s,3*s);
      ctx.strokeStyle='rgba(50,82,91,.5)'; ctx.lineWidth=1*s; ctx.strokeRect(wx,wy,9*s,9*s);
      ctx.beginPath();ctx.moveTo(wx+4.5*s,wy);ctx.lineTo(wx+4.5*s,wy+9*s);ctx.stroke();
    }

    // door + porch
    ctx.fillStyle='#654631'; ctx.fillRect(-7*s,-17*s,14*s,17*s);
    ctx.fillStyle='#d5ad55'; ctx.beginPath();ctx.arc(3*s,-9*s,1.4*s,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c69b65'; ctx.fillRect(-11*s,0,22*s,4*s);

    if(isHome){
      // chimney + tiny yard accents
      ctx.fillStyle='#8b5d47'; ctx.fillRect(w*.18,-h-9*s,5*s,12*s);
      ctx.fillStyle='#5f974e'; ctx.beginPath();ctx.arc(-w*.58,7*s,5*s,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#7aa952'; ctx.beginPath();ctx.arc(w*.55,7*s,4*s,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#c99a52'; ctx.fillRect(-w*.35,7*s,8*s,2*s);
    }

    if(b.type==='hospital'){
      ctx.fillStyle='#e53232'; ctx.fillRect(-9*s,-h-8*s,18*s,5*s); ctx.fillRect(-3*s,-h-14*s,6*s,17*s);
      drawAmbulance(w*.55,depth*.58);
    }
    if(b.type==='school') drawBus(-w*.52,depth*.58);
    if(b.type==='fire') drawTruck(w*.55,depth*.58);

    ctx.restore();
    if(b.name) drawLabel(statusForBuilding(b),center.x,center.y-h-31*s,b.safe?'#0e6e35':'#b82925');
  }

  function drawWindows(w, h, type) {
    ctx.fillStyle = type === 'fire' ? '#ffe7aa' : '#6fb7d6';
    const cols = Math.max(2, Math.floor(w / (18 * state.zoom)));
    const rows = Math.max(1, Math.floor(h / (20 * state.zoom)));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(-w / 2 + 10 * state.zoom + c * 17 * state.zoom, -h + 12 * state.zoom + r * 18 * state.zoom, 7 * state.zoom, 8 * state.zoom);
      }
    }
    ctx.fillStyle = '#5b4532';
    ctx.fillRect(-7 * state.zoom, -12 * state.zoom, 14 * state.zoom, 12 * state.zoom);
  }

  function drawAmbulance(x, y) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 16, y - 9, 28, 12);
    ctx.fillStyle = '#e33232';
    ctx.fillRect(x - 5, y - 7, 9, 3);
    ctx.fillRect(x - 2, y - 10, 3, 9);
    wheels(x - 9, y + 4, x + 8, y + 4);
  }

  function drawBus(x, y) {
    ctx.fillStyle = '#ffd15c';
    ctx.fillRect(x - 18, y - 10, 34, 14);
    ctx.fillStyle = '#315e7c';
    ctx.fillRect(x - 12, y - 8, 20, 5);
    wheels(x - 10, y + 5, x + 10, y + 5);
  }

  function drawTruck(x, y) {
    ctx.fillStyle = '#cc2d27';
    ctx.fillRect(x - 18, y - 10, 32, 14);
    ctx.fillStyle = '#f3c34b';
    ctx.fillRect(x - 10, y - 13, 18, 3);
    wheels(x - 10, y + 5, x + 9, y + 5);
  }

  function wheels(x1, y1, x2, y2) {
    ctx.fillStyle = '#253239';
    ctx.beginPath(); ctx.arc(x1, y1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x2, y2, 3, 0, Math.PI * 2); ctx.fill();
  }

  function drawLabel(text, x, y, color) {
    ctx.save();
    ctx.font = `900 ${12 * state.zoom}px Trebuchet MS`;
    const width = ctx.measureText(text).width + 13;
    ctx.fillStyle = 'rgba(255,248,216,.9)';
    roundRect(x - width / 2, y - 18, width, 20, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - 8);
    ctx.restore();
  }

  function statusForBuilding(b) {
    if (b.type === 'hospital') return b.safe ? 'HOSPITAL SAFE ✓' : 'HOSPITAL AT RISK';
    if (b.type === 'school') return b.safe ? 'SCHOOL SAFE ✓' : 'SCHOOL AT RISK';
    return b.name;
  }

  function drawDefenses(now) {
    defenses.forEach(d => {
      const z = elevation[d.y][d.x] * .18 + .18;
      const p = iso(d.x + .5, d.y + .5, z);
      const s = state.zoom;

      ctx.save();
      // realistic ground shadow
      ctx.fillStyle = 'rgba(24,55,42,.24)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 2*s, 24*s, 9*s, 0, 0, Math.PI*2);
      ctx.fill();

      if (d.kind === 'wall') {
        // Sturdy modular concrete flood barrier with individual blocks
        const bw = 10*s, bh = 7*s;
        for (let row=0; row<3; row++) {
          for (let col=0; col<4; col++) {
            const ox = p.x - 20*s + col*bw + (row%2 ? 5*s : 0);
            const oy = p.y - 8*s - row*bh;
            const grad = ctx.createLinearGradient(ox, oy, ox, oy+bh);
            grad.addColorStop(0, '#d8d2c7');
            grad.addColorStop(.55, '#aaa69e');
            grad.addColorStop(1, '#817e78');
            ctx.fillStyle = grad;
            ctx.fillRect(ox, oy, bw-1*s, bh-1*s);
            ctx.strokeStyle = 'rgba(65,64,60,.55)';
            ctx.lineWidth = .8*s;
            ctx.strokeRect(ox, oy, bw-1*s, bh-1*s);
          }
        }
        ctx.fillStyle = 'rgba(255,255,255,.28)';
        ctx.fillRect(p.x-19*s, p.y-29*s, 38*s, 2*s);
      }

      if (d.kind === 'sand') {
        // Stacked burlap sandbags with seams and highlights
        const bags = [
          [-15, -5, 0], [-5, -5, .04], [5, -5, -.04], [15, -5, .03],
          [-10, -11, -.03], [0, -11, .04], [10, -11, -.02],
          [-5, -17, .02], [5, -17, -.03]
        ];
        bags.forEach(([ox, oy, rot], i) => {
          ctx.save();
          ctx.translate(p.x + ox*s, p.y + oy*s);
          ctx.rotate(rot);
          const g = ctx.createLinearGradient(0,-4*s,0,5*s);
          g.addColorStop(0, '#e6c77d');
          g.addColorStop(.5, '#c9a45b');
          g.addColorStop(1, '#9e793f');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(0,0,9*s,5*s,0,0,Math.PI*2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(106,76,35,.55)';
          ctx.lineWidth = .8*s;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,240,180,.5)';
          ctx.beginPath(); ctx.moveTo(-5*s, -1*s); ctx.lineTo(5*s, -1*s); ctx.stroke();
          ctx.restore();
        });
      }

      if (d.kind === 'pump') {
        const pulse = 1 + Math.sin(now/220 + d.x) * .04;
        // steel pump base
        ctx.fillStyle = '#263b45';
        ctx.fillRect(p.x-7*s, p.y-3*s, 14*s, 9*s);
        ctx.fillStyle = '#516a72';
        ctx.fillRect(p.x-10*s, p.y+3*s, 20*s, 3*s);
        // cylindrical body
        const body = ctx.createLinearGradient(p.x-7*s, p.y-25*s, p.x+7*s, p.y-25*s);
        body.addColorStop(0, '#254c61'); body.addColorStop(.45, '#5fa6bd'); body.addColorStop(.72, '#2c6177'); body.addColorStop(1, '#173b4d');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.roundRect(p.x-7*s, p.y-25*s, 14*s, 25*s, 4*s);
        ctx.fill();
        // top cap
        ctx.fillStyle = '#82c7d9';
        ctx.beginPath(); ctx.ellipse(p.x, p.y-25*s, 7*s, 3*s, 0, 0, Math.PI*2); ctx.fill();
        // handle / pipe
        ctx.strokeStyle = '#244d5f'; ctx.lineWidth = 4*s; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(p.x+5*s,p.y-19*s); ctx.lineTo(p.x+15*s,p.y-19*s); ctx.lineTo(p.x+15*s,p.y-8*s); ctx.stroke();
        ctx.strokeStyle = '#78bfd2'; ctx.lineWidth = 2*s;
        ctx.beginPath(); ctx.moveTo(p.x+5*s,p.y-20*s); ctx.lineTo(p.x+14*s,p.y-20*s); ctx.lineTo(p.x+14*s,p.y-9*s); ctx.stroke();
        // active water spray / drain effect
        ctx.strokeStyle = `rgba(95,195,236,${.55 + pulse*.25})`; ctx.lineWidth=2*s;
        ctx.beginPath(); ctx.arc(p.x+14*s,p.y-7*s,7*s,0,Math.PI*1.35); ctx.stroke();
        ctx.fillStyle = '#8bd7ef';
        for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(p.x+18*s+i*3*s,p.y-7*s+(i%2)*3*s,1.3*s,0,Math.PI*2); ctx.fill(); }
      }

      if (d.building > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,.45)';
        ctx.lineWidth = 2*s;
        ctx.beginPath();
        ctx.arc(p.x, p.y-13*s, 22*s + Math.sin(now/120)*2*s, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawGhost() {
    if (!state.selected || !state.hover) return;
    const { x, y } = state.hover;
    const valid = validPlacement(x, y, state.selected);
    const z = inBounds(x, y) ? elevation[y][x] * .18 + .2 : .2;
    fillDiamond(x, y, valid ? 'rgba(60,207,104,.42)' : 'rgba(239,93,76,.48)', z, valid ? 'rgba(60,207,104,.9)' : 'rgba(239,93,76,.95)');
    const p = iso(x + .5, y + .5, z + .1);
    ctx.save();
    ctx.globalAlpha = .72;
    if (state.selected === 'wall') {
      ctx.fillStyle = valid ? '#c7c0b5' : '#c74b42';
      ctx.fillRect(p.x-18*state.zoom,p.y-27*state.zoom,36*state.zoom,18*state.zoom);
    } else if (state.selected === 'sand') {
      ctx.fillStyle = valid ? '#d5b36a' : '#c74b42';
      for(let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(p.x-12*state.zoom+i*8*state.zoom,p.y-8*state.zoom-(i%2)*4*state.zoom,7*state.zoom,4*state.zoom,0,0,Math.PI*2); ctx.fill(); }
    } else {
      ctx.fillStyle = valid ? '#66b8d2' : '#c74b42';
      ctx.beginPath(); ctx.arc(p.x,p.y-13*state.zoom,10*state.zoom,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = valid ? '#176c39' : '#a52c27';
    ctx.font = `900 ${11 * state.zoom}px Trebuchet MS`;
    ctx.textAlign = 'center';
    ctx.fillText(valid ? 'PLACE' : 'NO', p.x, p.y - 31*state.zoom);
    ctx.restore();
  }

  function drawRain(now) {
    if (state.prep > 0 || state.paused) return;
    const rect = root.getBoundingClientRect();
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 1;
    const count = state.rainBurst > 0 ? 76 : 38;
    for (let i = 0; i < count; i++) {
      const x = (i * 97 + now * .05) % (rect.width + 90) - 45;
      const y = (i * 53 + now * .13) % rect.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 8, y + 16);
      ctx.stroke();
    }
  }

  function step(dt) {
    if (state.mode !== 'play' || state.paused || state.ended) return;
    state.elapsed += dt;
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    state.rainBurst = Math.max(0, state.rainBurst - dt);
    if (state.prep > 0) {
      state.prep -= dt;
      if (state.prep <= 0) flash('FLOOD INCOMING');
    } else {
      simulateWater(dt);
      if (Math.random() < dt * .05) state.rainBurst = 2.2;
    }
    defenses.forEach(d => d.building = Math.max(0, d.building - dt * 1.8));
    updateBuildingRisk();
    updateHud();
    if (state.elapsed > 145) finishGame();
  }

  function simulateWater(dt) {
    const riverLevel = .46 + Math.min(.56, (state.elapsed - 16) / 140 * .56);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) nextWater[y][x] = water[y][x] * .992;
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (isRiver(x, y)) nextWater[y][x] = Math.max(nextWater[y][x], riverLevel + Math.sin(state.elapsed * 2 + y) * .025);
        if (!isRiver(x, y) && state.elapsed > 36) nextWater[y][x] += dt * .0012;
      }
    }
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (let iter = 0; iter < 2; iter++) {
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          if (nextWater[y][x] <= .015) continue;
          const current = elevation[y][x] + nextWater[y][x];
          dirs.forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            const block = barrierBetween(x, y, nx, ny);
            if (block >= .98) return;
            const target = elevation[ny][nx] + nextWater[ny][nx];
            const slope = current - target;
            if (slope <= .006) return;
            const flow = Math.min(nextWater[y][x] * .18, slope * .12) * (1 - block);
            nextWater[y][x] -= flow;
            nextWater[ny][nx] += flow;
          });
        }
      }
    }
    defenses.forEach(d => {
      if (d.kind !== 'pump') return;
      for (let y = Math.max(0, d.y - 3); y <= Math.min(H - 1, d.y + 3); y++) {
        for (let x = Math.max(0, d.x - 3); x <= Math.min(W - 1, d.x + 3); x++) {
          const dist = Math.hypot(x - d.x, y - d.y);
          if (dist <= 3) nextWater[y][x] = Math.max(0, nextWater[y][x] - dt * (.12 - dist * .025));
        }
      }
    });
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) water[y][x] = Math.max(0, Math.min(1.28, nextWater[y][x]));
    }
  }

  function barrierBetween(x, y, nx, ny) {
    const here = defenseAt(x, y);
    const there = defenseAt(nx, ny);
    let block = 0;
    if (here?.kind === 'wall' || there?.kind === 'wall') block = Math.max(block, .98);
    if (here?.kind === 'sand' || there?.kind === 'sand') block = Math.max(block, .56);
    if ((here?.kind === 'wall' || there?.kind === 'wall') && isRiver(x, y)) block = .78;
    return block;
  }

  function updateBuildingRisk() {
    buildings.forEach(b => {
      let wet = 0, cells = 0;
      for (let y = Math.max(0, b.y - 1); y < Math.min(H, b.y + b.h + 1); y++) {
        for (let x = Math.max(0, b.x - 1); x < Math.min(W, b.x + b.w + 1); x++) {
          wet += water[y][x];
          cells++;
        }
      }
      const risk = wet / cells;
      b.safe = risk < (b.importance ? .18 : .24);
    });
  }

  function validPlacement(x, y, kind) {
    if (!inBounds(x, y)) return false;
    if (!state.inventory[kind] || state.inventory[kind] <= 0) return false;
    if (isRiver(x, y) && kind !== 'pump') return false;
    if (buildingAt(x, y) || defenseAt(x, y)) return false;
    if (isRoadCell(x, y) && kind !== 'sand') return false;
    return true;
  }

  function placeDefense(x, y) {
    if (!state.selected) return;

    const kind = state.selected;

    if (!validPlacement(x, y, kind)) {
      if (!state.inventory[kind] || state.inventory[kind] <= 0) {
        flash('NO DEFENSES LEFT');
      } else {
        flash('CAN’T BUILD THERE');
      }
      return;
    }

    state.inventory[kind] -= 1;
    defenses.push({ kind, x, y, building: 1 });

    if (kind === 'wall') {
      water[y][x] = Math.max(0, water[y][x] - .18);
      flash('🧱 FLOOD WALL BUILT!');
    }

    if (kind === 'pump') {
      flash('💧 PUMP RUNNING!');
      for (let yy = Math.max(0, y - 3); yy <= Math.min(H - 1, y + 3); yy++) {
        for (let xx = Math.max(0, x - 3); xx <= Math.min(W - 1, x + 3); xx++) {
          water[yy][xx] = Math.max(0, water[yy][xx] - .25);
        }
      }
    }

    if (kind === 'sand') flash('🧱 SANDBAGS PLACED!');

    setTool(null);
    updateHud();
  }

  function flash(message) {
    state.message = message;
    state.messageTimer = 2.1;
  }

  function updateHud() {
    const riverPct = Math.round(
      state.prep > 0
        ? 42
        : 46 + Math.min(56, (state.elapsed - 16) / 140 * 56)
    );

    document.getElementById('riverLevel').textContent = `${riverPct}%`;

    const safeCount = buildings.filter(b => b.safe).length;
    document.getElementById('safeBuildings').textContent = `${Math.round(safeCount / buildings.length * 100)}%`;
    document.getElementById('clock').textContent = formatTime(Math.max(0, state.elapsed));

    const status = document.getElementById('status');
    status.textContent = state.messageTimer > 0
      ? state.message
      : state.prep > 0
        ? 'PREPARE YOUR DEFENSES'
        : 'FLOOD INCOMING';

    const hint = document.getElementById('placeHint');
    if (state.selected) {
      const remaining = state.inventory[state.selected];
      hint.textContent = `${tools[state.selected].name.toUpperCase()} ×${remaining} — CLICK THE MAP TO PLACE.`;
    } else if (!buildings[0].safe) {
      hint.textContent = '🏥 HOSPITAL AT RISK!';
    } else if (!buildings[1].safe) {
      hint.textContent = '🏫 SCHOOL AT RISK!';
    } else {
      hint.textContent = '🌊 The river is rising. Protect the hospital and school.';
    }

    document.querySelectorAll('.tool').forEach(btn => {
      const kind = btn.dataset.tool;
      btn.classList.toggle('selected', state.selected === kind);
      btn.disabled = state.inventory[kind] <= 0;
    });

    document.getElementById('wallCount').textContent = `×${state.inventory.wall}`;
    document.getElementById('pumpCount').textContent = `×${state.inventory.pump}`;
    document.getElementById('sandCount').textContent = `×${state.inventory.sand}`;
  }

  function finishGame() {
    state.ended = true;
    state.mode = 'report';
    hud.classList.add('hidden');
    reportScreen.classList.add('active');

    const hospital = buildings.find(b => b.id === 'hospital').safe;
    const school = buildings.find(b => b.id === 'school').safe;
    const fireStation = buildings.find(b => b.id === 'fire').safe;
    const homes = buildings.filter(b => b.type === 'home');
    const safeHomes = homes.filter(b => b.safe).length;
    const homePercent = safeHomes / homes.length;

    const score = Math.max(0, Math.round(
      (hospital ? 3000 : 0) +
      (school ? 2500 : 0) +
      (fireStation ? 1500 : 0) +
      homePercent * 3000
    ));

    const grade = score >= 8500 ? 'A' : score >= 7000 ? 'B' : score >= 5000 ? 'C' : 'D';

    document.getElementById('reportTitle').textContent =
      hospital && school && homePercent >= .8
        ? 'CITY SAFE!'
        : 'RIVER DEFENDER REPORT';

    document.getElementById('hospitalResult').textContent = hospital ? '✓ SAFE' : 'AT RISK';
    document.getElementById('schoolResult').textContent = school ? '✓ SAFE' : 'AT RISK';
    document.getElementById('homeResult').textContent = `${Math.round(homePercent * 100)}%`;
    document.getElementById('scoreResult').textContent = score.toLocaleString('en-IN');
    document.getElementById('gradeResult').textContent = grade;
  }

  function setTool(kind) {
    state.selected = kind;
    canvas.classList.toggle('placing', Boolean(kind));
    updateHud();
  }

  function onPointerDown(e) {
    if (state.mode !== 'play' || e.button !== 0) return;

    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    state.dragging = true;
    state.pointerId = e.pointerId;
    state.pointerMoved = false;
    state.dragStart = {
      x: e.clientX,
      y: e.clientY,
      panX: state.panX,
      panY: state.panY
    };
    state.lastPointer = { x: px, y: py };
    state.hover = screenToGrid(px, py);
    canvas.classList.add('dragging');
  }

  function onPointerMove(e) {
    if (state.mode === 'play') e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    state.lastPointer = { x: px, y: py };
    state.hover = screenToGrid(px, py);

    if (!state.dragging || !state.dragStart || state.pointerId !== e.pointerId) return;

    const dx = e.clientX - state.dragStart.x;
    const dy = e.clientY - state.dragStart.y;

    if (Math.hypot(dx, dy) > 5) {
      state.pointerMoved = true;
      state.panX = state.dragStart.panX + dx;
      state.panY = state.dragStart.panY + dy;
    }
  }

  function onPointerUp(e) {
    if (state.pointerId !== null && e.pointerId !== state.pointerId) return;

    const wasDrag = state.pointerMoved;
    const rect = canvas.getBoundingClientRect();

    if (!wasDrag && state.selected && state.mode === 'play') {
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const g = screenToGrid(px, py);
      placeDefense(g.x, g.y);
    }

    state.dragging = false;
    state.dragStart = null;
    state.pointerMoved = false;
    state.pointerId = null;
    canvas.classList.remove('dragging');

    try {
      canvas.releasePointerCapture?.(e.pointerId);
    } catch {}
  }

  function onWheel(e) {

    e.preventDefault();
    const next = Math.max(.72, Math.min(1.35, state.zoom - e.deltaY * .001));
    state.zoom = next;
  }

  function shade(hex, amt) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return `rgb(${r},${g},${b})`;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < W && y < H;
  }

  function formatTime(t) {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    step(dt);
    drawWorld(now);
    rafId = requestAnimationFrame(loop);
  }

  const howToPlayBtn = document.getElementById('howToPlay');
  const onHowToPlay = () => {
    startScreen.classList.remove('active');
    tutorialScreen.classList.add('active');
  }; 
  howToPlayBtn.addEventListener('click', onHowToPlay);
  const quickStartBtn = document.getElementById('quickStart');
  quickStartBtn.addEventListener('click', resetGame);
  const startGameBtn = document.getElementById('startGame');
  startGameBtn.addEventListener('click', resetGame);
  const playAgainBtn = document.getElementById('playAgain');
  playAgainBtn.addEventListener('click', resetGame);
  const pauseButton = document.getElementById('pauseButton');
  const onPause = e => {
    state.paused = !state.paused;
    e.currentTarget.textContent = state.paused ? 'Resume' : 'Pause';
    e.currentTarget.setAttribute('aria-pressed', String(state.paused));
  };
  pauseButton.addEventListener('click', onPause);
  const toolButtons = [...document.querySelectorAll('.tool')];
  const toolHandlers = new Map();
  toolButtons.forEach(btn => {
    const handler = () => {
      const kind = btn.dataset.tool;
      setTool(state.selected === kind ? null : kind);
    };
    toolHandlers.set(btn, handler);
    btn.addEventListener('click', handler);
  });
  const onKeyDown = e => {
    if (e.key === 'Escape') setTool(null);
  };
  const onContextMenu = e => {
    e.preventDefault();
    setTool(null);
  };
  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('contextmenu', onContextMenu);
  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', resize);

  initField();
  resize();
  rafId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(rafId);
    howToPlayBtn.removeEventListener('click', onHowToPlay);
    quickStartBtn.removeEventListener('click', resetGame);
    startGameBtn.removeEventListener('click', resetGame);
    playAgainBtn.removeEventListener('click', resetGame);
    pauseButton.removeEventListener('click', onPause);
    toolHandlers.forEach((handler, btn) => btn.removeEventListener('click', handler));
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('contextmenu', onContextMenu);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', resize);
  };
  }, []);

  return (
<div id="river-defender-game">
      <canvas id="world" aria-label="River Defender game world"></canvas>
    
      <section className="start screen active" id="startScreen">
        <div className="logo">
          <span>RIVER</span>
          <span>DEFENDER</span>
          <small>PROTECT. PLAN. PREVAIL.</small>
        </div>
        <div className="start-actions">
          <button type="button" id="howToPlay">HOW TO PLAY</button>
          <button type="button" id="quickStart">START</button>
        </div>
      </section>
    
      <section className="tutorial screen" id="tutorialScreen">
        <div className="tutorial-card">
          <h1>HOW TO PLAY</h1>
          <p>🌊 The river is rising! Use your limited defenses to keep the hospital, school and homes safe.</p>
          <div className="steps">
            <strong>1️⃣ Choose a defense: 🧱 Wall ×2 · 💧 Pump ×1 · 🪣 Sandbags ×3</strong>
            <strong>2️⃣ Click the map to place it</strong>
            <strong>3️⃣ Watch where the water flows and protect low ground</strong>
            <strong>4️⃣ Save the hospital, school and at least 80% of homes</strong>
          </div>
          <p className="tutorial-tip">🧱 Walls block water. 💧 Pumps remove nearby water. 🪣 Sandbags slow the flow.</p>
          <p className="tutorial-tip">⭐ Every placement uses one defense — there are no extra purchases.</p>
          <button type="button" id="startGame">START GAME</button>
        </div>
      </section>
    
      <section className="hud hidden" id="hud">
        <header className="topbar">
          <div className="game-logo">
            <strong>RIVER</strong>
            <strong>DEFENDER</strong>
            <span>PROTECT. PLAN. PREVAIL.</span>
          </div>
          <div className="stats" aria-live="polite">
            <div><span>RIVER LEVEL</span><strong id="riverLevel">42%</strong></div>
            <div><span>BUILDINGS SAFE</span><strong id="safeBuildings">100%</strong></div>
            <div><span>TIME</span><strong id="clock">00:00</strong></div>
          </div>
          <button className="pause" type="button" id="pauseButton" aria-pressed="false">Pause</button>
        </header>
    
        <aside className="mission">
          <h2>MISSION</h2>
          <p>Protect:</p>
          <ul>
            <li>★ Hospital</li>
            <li>★ School</li>
            <li>★ 80% of Homes</li>
          </ul>
          <h3>TIP</h3>
          <p>Drag the map to explore. Scroll to zoom. Place defenses before the river reaches the low ground.</p>
        </aside>
    
        <div className="status" id="status">PREPARE YOUR DEFENSES</div>
        <div className="place-hint" id="placeHint">The river is rising. Protect the hospital and school.</div>
    
        <menu className="toolbar" aria-label="Defense toolbar">
          <button type="button" className="tool wall-tool" data-tool="wall">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="img">
                <path d="M7 49h50v8H7z" fill="#66615b"/>
                <path d="M10 18h44v31H10z" fill="#a9a39a" stroke="#625f5a" strokeWidth="2"/>
                <path d="M10 18h44v8H10z" fill="#d7d1c7"/>
                <path d="M21 18v10M42 18v10M16 28v10M32 28v10M48 28v10M21 38v10M42 38v10" stroke="#625f5a" strokeWidth="2"/>
                <path d="M8 49h48" stroke="#eee9df" strokeWidth="3"/>
              </svg>
            </span>
            <strong>FLOOD WALL</strong>
            <small>BLOCKS WATER</small>
            <em id="wallCount">×2</em>
          </button>
          <button type="button" className="tool pump-tool" data-tool="pump">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="img">
                <path d="M17 52h30" stroke="#263c46" strokeWidth="5" strokeLinecap="round"/>
                <path d="M23 50V24c0-7 5-11 11-11h5" fill="none" stroke="#397d95" strokeWidth="8" strokeLinecap="round"/>
                <path d="M39 13h8v12" fill="none" stroke="#245469" strokeWidth="6" strokeLinecap="round"/>
                <ellipse cx="32" cy="25" rx="10" ry="5" fill="#78bed0"/>
                <path d="M47 25c7 1 9 6 9 12v6" fill="none" stroke="#245469" strokeWidth="6" strokeLinecap="round"/>
                <path d="M54 46c2-5 5-7 8-9" fill="none" stroke="#79c9df" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="57" cy="38" r="2" fill="#a8e6f5"/>
              </svg>
            </span>
            <strong>PUMP</strong>
            <small>DRAINS WATER</small>
            <em id="pumpCount">×1</em>
          </button>
          <button type="button" className="tool sand-tool" data-tool="sand">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="img">
                <g stroke="#856733" strokeWidth="1.5">
                  <path d="M10 44c0-6 5-9 11-9s11 3 11 9-5 9-11 9-11-3-11-9Z" fill="#d8b56b"/>
                  <path d="M31 44c0-6 5-9 11-9s11 3 11 9-5 9-11 9-11-3-11-9Z" fill="#caa15a"/>
                  <path d="M20 32c0-6 5-9 11-9s11 3 11 9-5 9-11 9-11-3-11-9Z" fill="#e0bf78"/>
                  <path d="M30 20c0-5 4-8 9-8s9 3 9 8-4 8-9 8-9-3-9-8Z" fill="#c59c52"/>
                </g>
                <path d="M14 42h12M35 42h12M25 30h12M35 18h8" stroke="#f3dca3" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <strong>SAND BAGS</strong>
            <small>QUICK PROTECTION</small>
            <em id="sandCount">×3</em>
          </button>
        </menu>
    
      </section>
    
      <section className="report screen" id="reportScreen">
        <div className="report-card">
          <h1 id="reportTitle">CITY SAFE!</h1>
          <div className="report-grid">
            <p><span>Hospital</span><strong id="hospitalResult">✓</strong></p>
            <p><span>School</span><strong id="schoolResult">✓</strong></p>
            <p><span>Homes Safe</span><strong id="homeResult">84%</strong></p>
            <p><span>Score</span><strong id="scoreResult">8,650</strong></p>
            <p><span>Grade</span><strong id="gradeResult">A</strong></p>
          </div>
          <button type="button" id="playAgain">PLAY AGAIN</button>
        </div>
      </section>
    </div>
  );
}
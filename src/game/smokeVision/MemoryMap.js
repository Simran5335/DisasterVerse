import { ROOMS, DOOR_DEFS, FIRE_ORIGIN } from './Building.js';

const WX0 = -8, WX1 = 28, WZ0 = -9, WZ1 = 9;

function toCanvas(x, z, w, h) {
  const cx = ((x - WX0) / (WX1 - WX0)) * w;
  const cy = ((z - WZ0) / (WZ1 - WZ0)) * h;
  return [cx, cy];
}

export function drawMemoryMap(canvas, playerStart) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0d1116';
  ctx.fillRect(0, 0, w, h);

  // Rooms
  ROOMS.forEach(r => {
    const [x0, y0] = toCanvas(r.x0, r.z0, w, h);
    const [x1, y1] = toCanvas(r.x1, r.z1, w, h);
    ctx.fillStyle = r.id === 'fireRoom' ? 'rgba(255,80,40,0.14)' : 'rgba(79,195,247,0.08)';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = '#dfe6ea';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(r.name, (x0 + x1) / 2, (y0 + y1) / 2);
  });

  // Doors
  DOOR_DEFS.forEach(d => {
    const [x, z] = toCanvas(d.x, d.z, w, h);
    ctx.fillStyle = d.exterior ? '#35d07f' : '#ffb020';
    ctx.beginPath();
    ctx.arc(x, z, 5, 0, Math.PI * 2);
    ctx.fill();
    if (d.exterior) {
      ctx.fillStyle = '#35d07f';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(d.label, x, z - 10);
    }
  });

  // Fire origin
  const [fx, fz] = toCanvas(FIRE_ORIGIN.x, FIRE_ORIGIN.z, w, h);
  ctx.fillStyle = '#ff3b30';
  ctx.beginPath();
  ctx.arc(fx, fz, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#ff3b30';
  ctx.fillText('FIRE START', fx, fz + 20);

  // Player start
  if (playerStart) {
    const [px, pz] = toCanvas(playerStart.x, playerStart.z, w, h);
    ctx.fillStyle = '#fff2cf';
    ctx.beginPath();
    ctx.arc(px, pz, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff2cf';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('YOU START HERE', px, pz - 14);
  }
}

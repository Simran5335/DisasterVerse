import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envs = ['home', 'school', 'office', 'outdoors'];

const envThemes = {
  home: {
    title: "RESIDENTIAL HOME SAFETY SCENE",
    bgGrad: ["#1c1917", "#0c0a09"],
    wallColor: "#292524",
    floorColor: "#44403c",
    accentColor: "#f97316"
  },
  school: {
    title: "EDUCATIONAL SCHOOL CLASSROOM",
    bgGrad: ["#0f2942", "#08131a"],
    wallColor: "#1e3a5f",
    floorColor: "#244366",
    accentColor: "#38bdf8"
  },
  office: {
    title: "CORPORATE OFFICE WORKSPACE",
    bgGrad: ["#1e1a30", "#0d0b16"],
    wallColor: "#2a2444",
    floorColor: "#362f54",
    accentColor: "#a78bfa"
  },
  outdoors: {
    title: "COMMUNITY OUTDOOR ENVIRONMENT",
    bgGrad: ["#0f281e", "#07120c"],
    wallColor: "#1b3d2f",
    floorColor: "#26523f",
    accentColor: "#22c55e"
  }
};

envs.forEach(env => {
  const dir = path.join(__dirname, '..', 'public', 'images', 'hazard', env);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (let lvl = 1; lvl <= 5; lvl++) {
    const filePath = path.join(dir, `level${lvl}.jpg`);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 50000) {
      console.log(`Skipping existing high-res photo: ${filePath}`);
      continue;
    }

    const theme = envThemes[env];
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <defs>
          <linearGradient id="bg_${env}_${lvl}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${theme.bgGrad[0]}"/>
            <stop offset="100%" stop-color="${theme.bgGrad[1]}"/>
          </linearGradient>
          <linearGradient id="wall_${env}_${lvl}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${theme.wallColor}"/>
            <stop offset="100%" stop-color="${theme.bgGrad[1]}"/>
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#bg_${env}_${lvl})"/>
        
        <!-- Room Architecture Wall & Floor -->
        <rect x="40" y="40" width="1200" height="420" fill="url(#wall_${env}_${lvl})" rx="16" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
        <polygon points="40,460 1240,460 1280,680 0,680" fill="${theme.floorColor}" opacity="0.9"/>
        
        <!-- Perspective Grid Lines -->
        <line x1="200" y1="460" x2="100" y2="680" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
        <line x1="400" y1="460" x2="350" y2="680" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
        <line x1="640" y1="460" x2="640" y2="680" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
        <line x1="880" y1="460" x2="930" y2="680" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>
        <line x1="1080" y1="460" x2="1180" y2="680" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>

        <!-- Scene Decorative Windows & Lighting -->
        <rect x="120" y="80" width="220" height="260" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4" rx="8"/>
        <line x1="230" y1="80" x2="230" y2="340" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
        <line x1="120" y1="210" x2="340" y2="210" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>

        <!-- Environment Banner -->
        <rect x="420" y="80" width="440" height="60" fill="rgba(0,0,0,0.6)" rx="12" stroke="${theme.accentColor}" stroke-width="1.5"/>
        <text x="640" y="118" fill="#ffffff" font-family="Inter, sans-serif" font-size="20" font-weight="800" text-anchor="middle" letter-spacing="2">
          ${theme.title} — LEVEL ${lvl}
        </text>

        <!-- Simulated Realistic Furniture & Equipment Elements -->
        <rect x="460" y="260" width="360" height="200" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" rx="12"/>
        <rect x="180" y="440" width="240" height="120" fill="rgba(0,0,0,0.4)" rx="10"/>
        <rect x="860" y="420" width="260" height="140" fill="rgba(0,0,0,0.4)" rx="10"/>

        <!-- Subtle Photo Grain Texture Overlay -->
        <circle cx="200" cy="300" r="1.5" fill="#ffffff" opacity="0.3"/>
        <circle cx="800" cy="500" r="1.5" fill="#ffffff" opacity="0.3"/>
        <circle cx="1100" cy="200" r="1.5" fill="#ffffff" opacity="0.3"/>
      </svg>
    `;

    fs.writeFileSync(filePath, svgContent.trim());
    console.log(`Created image asset: ${filePath}`);
  }
});

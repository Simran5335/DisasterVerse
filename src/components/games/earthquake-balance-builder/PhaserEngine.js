import Phaser from 'phaser';

export class EarthquakeScene extends Phaser.Scene {
  constructor() {
    super('EarthquakeScene');
    this.config = null;
    this.structureParts = [];
    this.isShaking = false;
    this.shakeTimer = 0;
    this.groundBody = null;
    
    this.COLLAPSE_TILT_RADIANS = 0.8; // ~45 degrees tilt
    this.FALLEN_MARGIN_FROM_GROUND = 30; // Pixels above the ground surface
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    
    this.matter.world.setBounds(0, -1000, 2000, 2000);

    // Dark background
    this.add.rectangle(w / 2, h / 2, 2000, 2000, 0x0f172a).setDepth(-10);

    // Dust particle texture
    const g = this.make.graphics({x: 0, y: 0});
    g.fillStyle(0x94a3b8, 0.6);
    g.fillCircle(4, 4, 4);
    g.generateTexture('dust', 8, 8);
    
    this.dustEmitter = this.add.particles(0, 0, 'dust', {
      x: { min: w / 2 - 150, max: w / 2 + 150 },
      y: h - 30,
      lifespan: 1500,
      speedY: { min: -100, max: -10 },
      speedX: { min: -30, max: 30 },
      scale: { start: 1, end: 0 },
      emitting: false
    });

    // Static Ground
    const gRect = this.add.rectangle(w / 2, h - 10, w + 100, 40, 0x1e293b);
    gRect.setStrokeStyle(2, 0x334155);
    const gObj = this.matter.add.gameObject(gRect, { isStatic: true, label: 'Ground' });
    this.groundBody = gObj.body;

    // UI Layer
    this.magText = this.add.text(w / 2, 40, '', { 
      fontSize: '28px', color: '#f43f5e', fontStyle: '900', fontFamily: 'system-ui' 
    }).setOrigin(0.5).setAlpha(0);

    // Structural Stress indicator UI
    this.add.rectangle(w / 2, 80, 200, 10, 0x334155).setOrigin(0.5);
    this.stressBarFill = this.add.rectangle(w / 2 - 100, 80, 0, 10, 0x10b981).setOrigin(0, 0.5);
    this.add.text(w / 2, 65, 'STRUCTURAL STRESS', { fontSize: '10px', color: '#94a3b8', fontStyle: 'bold' }).setOrigin(0.5);

    this.scale.on('resize', this.handleResize, this);

    this.buildStructure();
  }

  handleResize(gameSize) {
    const w = gameSize.width;
    const h = gameSize.height;
    
    if (this.groundBody) {
      this.matter.body.setPosition(this.groundBody, { x: w / 2, y: h - 10 });
    }
    if (this.magText) this.magText.setPosition(w / 2, 40);
    
    if (!this.isShaking) {
       this.buildStructure();
    }
  }

  updateConfig(newConfig) {
    this.config = newConfig;
    if (this.matter && this.matter.world) {
      this.buildStructure();
    }
  }

  buildStructure() {
    if (this.structureParts.length > 0) {
      this.structureParts.forEach(part => this.matter.world.remove(part));
      this.structureParts = [];
    }

    this.children.getAll().forEach(child => {
      if (child.body && child.body.label !== 'Ground') {
        child.destroy();
      }
    });

    if (!this.config?.foundation) return;

    const { foundation, pillars, material, roof } = this.config;

    const w = this.scale.width;
    const h = this.scale.height;
    const basex = w / 2;
    let currentY = h - 30;
    
    const getFoundationPhysics = (type) => {
      if (type === 'strong') return { density: 0.1, friction: 0.9, frictionStatic: 1.0 };
      if (type === 'normal') return { density: 0.05, friction: 0.7, frictionStatic: 0.8 };
      return { density: 0.01, friction: 0.3, frictionStatic: 0.4 }; 
    };

    const getMaterialPhysics = (type) => {
      if (type === 'steel') return { density: 0.08, friction: 0.6 };
      if (type === 'concrete') return { density: 0.06, friction: 0.8 };
      if (type === 'brick') return { density: 0.04, friction: 0.7 };
      return { density: 0.02, friction: 0.5 }; 
    };

    const getRoofPhysics = (type) => {
      if (type === 'heavy') return { density: 0.07, friction: 0.8 };
      if (type === 'sloped') return { density: 0.03, friction: 0.5 };
      return { density: 0.01, friction: 0.4 }; 
    };

    // 1. Foundation
    const fHeight = foundation === 'strong' ? 30 : foundation === 'normal' ? 20 : 10;
    const bldWidth = 240;
    
    const fColor = foundation === 'strong' ? 0x0f766e : foundation === 'normal' ? 0x1d4ed8 : 0x0369a1;
    
    const fRect = this.add.rectangle(basex, currentY - fHeight/2, bldWidth + 20, fHeight, fColor);
    fRect.setStrokeStyle(3, 0x1e293b);
    
    const fGObj = this.matter.add.gameObject(fRect, { label: 'Foundation', ...getFoundationPhysics(foundation) });
    this.structureParts.push(fGObj.body);
    currentY -= (fHeight + 2);

    // 2. Multi-Storey (4 Levels)
    const storeyHeight = material === 'steel' ? 80 : 70;
    const storeyCount = 4;
    
    let isConcrete = false, isSteel = false, isWood = false, isBrick = false;
    const p = pillars || material;
    const m = material || pillars;
    
    if (p === 'steel' || m === 'steel') isSteel = true;
    if (p === 'concrete' || m === 'concrete') isConcrete = true;
    if (p === 'wood') isWood = true;
    if (m === 'brick') isBrick = true;
    
    const primaryWallStr = 0x334155; 
    const secWallStr = 0x475569;

    for (let i = 0; i < storeyCount; i++) {
        const lvColor = isSteel ? primaryWallStr : secWallStr;
        
        const lvlRect = this.add.rectangle(basex, currentY - storeyHeight/2, bldWidth, storeyHeight, lvColor);
        lvlRect.setStrokeStyle(2, 0x1e293b);
        
        const textureStr = Array.from({length: 4}).fill(isWood ? '||' : isBrick ? '===' : isConcrete ? '••' : '≡≡').join('  ');
        this.add.text(basex, currentY - storeyHeight/2, textureStr, { fontSize: '10px', color: '#94a3b8' }).setOrigin(0.5).setAlpha(0.3);

        const actMat = material || pillars || 'wood';
        const lGObj = this.matter.add.gameObject(lvlRect, { label: 'Material', ...getMaterialPhysics(actMat) });
        this.structureParts.push(lGObj.body);
        
        if (i < storeyCount - 1) {
            const slabH = 6;
            currentY -= (storeyHeight + 2);
            
            const slabRect = this.add.rectangle(basex, currentY - slabH/2, bldWidth + 8, slabH, 0x64748b);
            const sGObj = this.matter.add.gameObject(slabRect, { label: 'Material', ...getMaterialPhysics(actMat) });
            this.structureParts.push(sGObj.body);
            currentY -= (slabH + 2);
        } else {
             currentY -= (storeyHeight + 2);
        }
    }

    // 3. Roof
    if (roof) {
      const rHeight = roof === 'heavy' ? 25 : roof === 'sloped' ? 40 : 10;
      const rWidth = bldWidth + 20;
      
      let rGObj;
      if (roof === 'sloped') {
        const path = `0 ${rHeight} ${rWidth/2} 0 ${rWidth} ${rHeight}`; 
        const rPoly = this.add.polygon(basex, currentY - rHeight/2, path, 0x64748b);
        rPoly.setStrokeStyle(2, 0x1e293b);
        rGObj = this.matter.add.gameObject(rPoly, {
           label: 'Roof',
           shape: { type: 'fromVerts', verts: path, flagInternal: true },
           ...getRoofPhysics(roof)
        });
      } else {
        const rRect = this.add.rectangle(basex, currentY - rHeight/2, rWidth, rHeight, 0x94a3b8);
        rRect.setStrokeStyle(2, 0x1e293b);
        rGObj = this.matter.add.gameObject(rRect, { label: 'Roof', ...getRoofPhysics(roof) });
      }
      this.structureParts.push(rGObj.body);
    }
  }

  triggerEarthquake() {
    if (this.isShaking) return;
    this.isShaking = true;
    this.shakeTimer = 0;

    const magLevel = this.config?.magnitude ? Number(this.config.magnitude) : 0;
    const durationMs = 6000;
    
    this.magText.setText(`MAGNITUDE ${magLevel}`).setAlpha(1);
    if (this.dustEmitter) this.dustEmitter.start();
    
    this.cameras.main.shake(durationMs, 0.002 * Math.pow(magLevel - 3, 1.5));

    this.events.on('update', this.shakeUpdate, this);

    this.time.delayedCall(durationMs, () => {
      this.isShaking = false;
      this.events.off('update', this.shakeUpdate, this);
      if (this.dustEmitter) this.dustEmitter.stop();
      this.magText.setAlpha(0);
      
      this.time.delayedCall(2000, () => {
        const survived = this.evaluateSurvival();
        if (this.config?.onSimulationComplete) {
          this.config.onSimulationComplete(survived);
        }
      });
    });
  }

  evaluateSurvival() {
    let survived = true;
    if (!this.groundBody) return true;

    const groundSurfaceY = this.groundBody.position.y - 20; 
    const collapseAltitude = groundSurfaceY - this.FALLEN_MARGIN_FROM_GROUND;

    for (let i = 0; i < this.structureParts.length; i++) {
      const part = this.structureParts[i];
      if (!part) continue;

      if (part.label === 'Foundation') continue;

      if (part.position.y > collapseAltitude) {
        survived = false;
      }
      
      if (Math.abs(part.angle) > this.COLLAPSE_TILT_RADIANS) {
        survived = false;
      }
    }

    return survived;
  }

  shakeUpdate(time, delta) {
    if (!this.isShaking || !this.config?.magnitude) return;

    this.shakeTimer += delta;
    
    const magScale = Math.pow((Number(this.config.magnitude) - 3) * 0.5, 2); 

    const frequency = 0.015;
    const amplitude = 0.003 * magScale;
    
    const noise = (Math.random() - 0.5) * 0.005 * magScale;
    
    const lateralForce = (Math.sin(this.shakeTimer * frequency) * amplitude) + noise;
    const verticalForce = (Math.random() - 0.5) * 0.001 * magScale;

    let currentMaxAngle = 0;

    this.structureParts.forEach(part => {
      if (part) {
        if (part.label !== 'Foundation') {
           const absAngle = Math.abs(part.angle);
           if (absAngle > currentMaxAngle) currentMaxAngle = absAngle;
        }

        const structuralMass = part.mass;
        part.force.x += lateralForce * structuralMass;
        part.force.y += verticalForce * structuralMass;
      }
    });

    if (this.stressBarFill) {
      const stressRatio = Math.min(1, currentMaxAngle / this.COLLAPSE_TILT_RADIANS);
      this.stressBarFill.width = 200 * stressRatio;
      const stressColor = stressRatio > 0.8 ? 0xef4444 : stressRatio > 0.5 ? 0xf59e0b : 0x10b981;
      this.stressBarFill.fillColor = stressColor;
    }
  }
}

export function initPhaser(containerId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
       mode: Phaser.Scale.RESIZE,
       parent: containerId,
       width: '100%',
       height: '100%'
    },
    backgroundColor: 'transparent',
    audio: {
      noAudio: true
    },
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 1 },
        debug: false
      }
    },
    scene: [EarthquakeScene]
  });
}

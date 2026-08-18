const PHASES = [
  { level: 0, blur: 0.0, clear: 60, vignette: 0.05, contrast: 1.00, brightness: 1.00, saturate: 1.00, haze: 0.00 },
  { level: 1, blur: 2.0, clear: 46, vignette: 0.18, contrast: 0.97, brightness: 0.96, saturate: 0.94, haze: 0.08 },
  { level: 2, blur: 4.4, clear: 34, vignette: 0.32, contrast: 0.90, brightness: 0.88, saturate: 0.85, haze: 0.17 },
  { level: 3, blur: 6.8, clear: 24, vignette: 0.47, contrast: 0.82, brightness: 0.77, saturate: 0.73, haze: 0.27 },
  { level: 4, blur: 9.2, clear: 17, vignette: 0.60, contrast: 0.75, brightness: 0.66, saturate: 0.62, haze: 0.36 }
];

function lerp(a, b, t) { return a + (b - a) * t; }

function sampleTarget(level) {
  const clamped = Math.max(0, Math.min(4, level));
  const i = Math.min(3, Math.floor(clamped));
  const t = clamped - i;
  const a = PHASES[i], b = PHASES[i + 1];
  return {
    blur: lerp(a.blur, b.blur, t),
    clear: lerp(a.clear, b.clear, t),
    vignette: lerp(a.vignette, b.vignette, t),
    contrast: lerp(a.contrast, b.contrast, t),
    brightness: lerp(a.brightness, b.brightness, t),
    saturate: lerp(a.saturate, b.saturate, t),
    haze: lerp(a.haze, b.haze, t)
  };
}

export class VisionSystem {
  constructor(blurLayerEl, hazeLayerEl, vignetteLayerEl, canvasEl) {
    this.blurLayer = blurLayerEl;
    this.hazeLayer = hazeLayerEl;
    this.vignetteLayer = vignetteLayerEl;
    this.canvas = canvasEl;

    this.current = { blur: 0, clear: 60, vignette: 0.05, contrast: 1, brightness: 1, saturate: 1, haze: 0 };
    this._lastFilterKey = '';
  }

  reset() {
    this.current = { blur: 0, clear: 60, vignette: 0.05, contrast: 1, brightness: 1, saturate: 1, haze: 0 };
    this._apply();
  }

  update(dt, level, flashOn) {
    let target = sampleTarget(level);

    if (flashOn) {
      target = {
        blur: target.blur * 0.55,
        clear: Math.min(72, target.clear + 13),
        vignette: target.vignette * 0.68,
        contrast: Math.min(1, target.contrast + 0.05),
        brightness: Math.min(1.05, target.brightness + 0.14),
        saturate: Math.min(1, target.saturate + 0.08),
        haze: target.haze * 0.75
      };
    }

    const smoothing = Math.min(1, dt * 3.2);
    const c = this.current;
    for (const key in c) {
      c[key] += (target[key] - c[key]) * smoothing;
    }

    this._apply();
  }

  _apply() {
    const c = this.current;
    if (this.blurLayer) {
      this.blurLayer.style.setProperty('--vision-blur', c.blur.toFixed(2) + 'px');
      this.blurLayer.style.setProperty('--vision-clear', c.clear.toFixed(1) + '%');
    }
    if (this.vignetteLayer) {
      this.vignetteLayer.style.opacity = c.vignette.toFixed(3);
    }
    if (this.hazeLayer) {
      this.hazeLayer.style.opacity = c.haze.toFixed(3);
    }

    const key = c.contrast.toFixed(3) + '|' + c.brightness.toFixed(3) + '|' + c.saturate.toFixed(3);
    if (key !== this._lastFilterKey && this.canvas) {
      this._lastFilterKey = key;
      this.canvas.style.filter =
        `contrast(${c.contrast.toFixed(3)}) brightness(${c.brightness.toFixed(3)}) saturate(${c.saturate.toFixed(3)})`;
    }
  }
}

import React, { useEffect, useRef, useState } from 'react';
import { initPhaser } from './PhaserEngine';

const MATERIALS_PALETTE = [
  { id: 'base', name: 'BASE', color: '#6b7280', count: '7' },
  { id: 'wood', name: 'WOOD', color: '#8b5a2b', count: 'INF' },
  { id: 'brick', name: 'BRICK', color: '#b33a2f', count: 'INF' },
  { id: 'concrete', name: 'CONCRETE', color: '#9ca3af', count: 'INF' },
  { id: 'steel', name: 'STEEL', color: '#374151', count: 'INF' },
  { id: 'roof', name: 'ROOF', color: '#b45309', count: 'INF' },
];

export default function GameCanvas({
  foundation, pillars, material, roof, magnitude, isSimulating, rebuildSignal, onSimulationComplete
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const dragMaterialRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [activeMaterial, setActiveMaterial] = useState('wood');

  const getScene = () => {
    if (!gameRef.current) return null;
    return gameRef.current.scene.getScene('EarthquakeScene');
  };

  const handleSelectMaterial = (matId) => {
    setActiveMaterial(matId);
    const scene = getScene();
    if (scene?.setSelectedMaterial) {
      scene.setSelectedMaterial(matId);
    }
  };

  const getCanvasPoint = (clientX, clientY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      isInside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
    };
  };

  const handleMaterialPointerDown = (matId, event) => {
    if (isSimulating) return;

    event.preventDefault();
    handleSelectMaterial(matId);
    dragMaterialRef.current = matId;

    const buttonRect = event.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: buttonRect.left + buttonRect.width / 2 - event.clientX,
      y: buttonRect.top + buttonRect.height / 2 - event.clientY,
    };

    const scene = getScene();
    if (scene?.beginExternalMaterialDrag) {
      scene.beginExternalMaterialDrag(matId, dragOffsetRef.current);
    }

    const moveDrag = (moveEvent) => {
      if (!dragMaterialRef.current) return;
      const point = getCanvasPoint(moveEvent.clientX, moveEvent.clientY);
      if (point && scene?.moveExternalMaterialDrag) {
        scene.moveExternalMaterialDrag(point.x, point.y, point.isInside);
      }
    };

    const endDrag = (upEvent) => {
      const point = getCanvasPoint(upEvent.clientX, upEvent.clientY);
      if (scene?.endExternalMaterialDrag) {
        scene.endExternalMaterialDrag(point?.x ?? 0, point?.y ?? 0, Boolean(point?.isInside));
      }

      dragMaterialRef.current = null;
      window.removeEventListener('pointermove', moveDrag);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };

    window.addEventListener('pointermove', moveDrag);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = initPhaser(containerRef.current.id);

      setTimeout(() => {
        const scene = getScene();
        if (scene?.updateConfig) {
          scene.updateConfig({ foundation, pillars, material, roof, magnitude, onSimulationComplete });
        }
        if (scene?.setSelectedMaterial) {
          scene.setSelectedMaterial(activeMaterial);
        }
      }, 100);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const scene = getScene();
    if (scene?.updateConfig && !isSimulating) {
      scene.updateConfig({ foundation, pillars, material, roof, magnitude, onSimulationComplete });
    }
  }, [foundation, pillars, material, roof, magnitude, rebuildSignal, isSimulating, onSimulationComplete]);

  useEffect(() => {
    const scene = getScene();
    if (isSimulating && scene?.triggerEarthquake) {
      scene.triggerEarthquake();
    }
  }, [isSimulating]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        {MATERIALS_PALETTE.map((mat) => {
          const isSelected = activeMaterial === mat.id;
          const needsDarkText = mat.id === 'concrete';
          return (
            <button
              key={mat.id}
              onClick={() => handleSelectMaterial(mat.id)}
              onPointerDown={(event) => handleMaterialPointerDown(mat.id, event)}
              title={`Drag ${mat.name.toLowerCase()} onto the active build level`}
              style={{
                ...styles.matBtn,
                borderColor: isSelected ? '#06b6d4' : '#475569',
                boxShadow: isSelected ? '0 0 8px rgba(6,182,212,0.8)' : 'none',
                color: needsDarkText ? '#111827' : '#ffffff',
              }}
            >
              <span style={{ ...styles.swatch, backgroundColor: mat.color }} />
              <span style={styles.matName}>{mat.name}</span>
              <span style={styles.matCount}>{mat.count}</span>
            </button>
          );
        })}
      </div>

      <div id="phaser-game-container" ref={containerRef} style={styles.canvasContainer} />
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    display: 'flex',
    gap: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    padding: '5px 8px',
    borderRadius: '10px',
    border: '1px solid #334155',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },
  matBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    touchAction: 'none',
    userSelect: 'none',
    padding: '4px 7px',
    backgroundColor: '#1e293b',
    fontSize: '10px',
    border: '2px solid',
    borderRadius: '6px',
    cursor: 'grab',
    transition: 'all 0.15s ease-in-out',
  },
  swatch: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    border: '1px solid rgba(255,255,255,0.45)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
    flex: '0 0 auto',
  },
  matName: { fontWeight: 'bold' },
  matCount: {
    marginLeft: '2px',
    padding: '0 4px',
    borderRadius: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    color: '#cbd5e1',
    fontSize: '8px',
    fontWeight: 'bold',
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  }
};

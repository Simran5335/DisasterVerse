import React, { useEffect, useRef } from 'react';
import { initPhaser } from './PhaserEngine';

export default function GameCanvas({ 
  foundation, pillars, material, roof, magnitude, isSimulating, rebuildSignal, onSimulationComplete 
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = initPhaser(containerRef.current.id);
      
      setTimeout(() => {
        if (gameRef.current) {
          const scene = gameRef.current.scene.getScene('EarthquakeScene');
          if (scene && scene.updateConfig) {
            scene.updateConfig({ foundation, pillars, material, roof, magnitude, onSimulationComplete });
          }
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
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('EarthquakeScene');
      if (scene && scene.updateConfig && !isSimulating) {
        scene.updateConfig({ foundation, pillars, material, roof, magnitude, onSimulationComplete });
      }
    }
  }, [rebuildSignal]);

  useEffect(() => {
    if (isSimulating && gameRef.current) {
      const scene = gameRef.current.scene.getScene('EarthquakeScene');
      if (scene && scene.triggerEarthquake) {
        scene.triggerEarthquake();
      }
    }
  }, [isSimulating]);

  return <div id="phaser-game-container" ref={containerRef} style={styles.canvasContainer} />;
}

const styles = {
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

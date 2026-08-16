import React, { useState } from 'react';
import { soundManager } from '../../game/SoundManager.js';

const SettingsPanel = ({ isOpen, onClose, onResetProgress }) => {
  const [masterVol, setMasterVol] = useState(0.8);
  const [musicVol, setMusicVol] = useState(0.5);
  const [sfxVol, setSfxVol] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleMasterChange = (val) => {
    setMasterVol(val);
    soundManager.setVolumes(val, musicVol, sfxVol);
  };

  const handleMusicChange = (val) => {
    setMusicVol(val);
    soundManager.setVolumes(masterVol, val, sfxVol);
  };

  const handleSfxChange = (val) => {
    setSfxVol(val);
    soundManager.setVolumes(masterVol, musicVol, val);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>⚙️ GAME SETTINGS</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.settingsGroup}>
          <div style={styles.settingRow}>
            <span>Audio Mute</span>
            <button style={{ ...styles.toggleBtn, background: isMuted ? '#ef4444' : '#22c55e' }} onClick={handleMuteToggle}>
              {isMuted ? 'MUTED' : 'SOUND ON'}
            </button>
          </div>

          <div style={styles.sliderRow}>
            <label>Master Volume ({Math.round(masterVol * 100)}%)</label>
            <input type="range" min="0" max="1" step="0.05" value={masterVol} onChange={e => handleMasterChange(parseFloat(e.target.value))} />
          </div>

          <div style={styles.sliderRow}>
            <label>Music Volume ({Math.round(musicVol * 100)}%)</label>
            <input type="range" min="0" max="1" step="0.05" value={musicVol} onChange={e => handleMusicChange(parseFloat(e.target.value))} />
          </div>

          <div style={styles.sliderRow}>
            <label>Sound Effects ({Math.round(sfxVol * 100)}%)</label>
            <input type="range" min="0" max="1" step="0.05" value={sfxVol} onChange={e => handleSfxChange(parseFloat(e.target.value))} />
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.resetBtn} onClick={onResetProgress}>Reset Progress</button>
          <button style={styles.confirmBtn} onClick={onClose}>Save & Close</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60
  },
  modal: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: '90%',
    maxWidth: 440,
    padding: 24,
    color: '#f8fafc'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' },
  settingsGroup: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' },
  toggleBtn: { color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' },
  sliderRow: { display: 'flex', flexDirection: 'column', gap: 6, color: '#cbd5e1', fontSize: '0.88rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resetBtn: { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 14px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' },
  confirmBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }
};

export default SettingsPanel;

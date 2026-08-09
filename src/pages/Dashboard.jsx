import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Load user data
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'Survivor');
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar') || 'https://api.dicebear.com/7.x/bottts/svg?seed=DisasterVerse');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');

  // Profile edit states
  const [newName, setNewName] = useState(userName);
  const [newPassword, setNewPassword] = useState('');
  const [selectedAvatarOption, setSelectedAvatarOption] = useState(userAvatar);

  const avatarOptions = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=DisasterVerse',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=LeoBoy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=MiaGirl',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hero',
    'https://api.dicebear.com/7.x/micah/svg?seed=Survivor',
    'https://api.dicebear.com/7.x/bottts/svg?seed=RescueBot',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Emma'
  ];

  // Expanded Thematic XP-Based Ranks (User has 3,450 XP)
  const currentXP = 3450;
  const badgesList = [
    { id: 1, icon: '🌱', name: 'Preparedness Novice', xpRequired: 200, desc: 'Awarded for taking your first steps into emergency readiness education.', unlocked: currentXP >= 200 },
    { id: 2, icon: '🛡️', name: 'Shield Apprentice', xpRequired: 600, desc: 'Mastered basic household safety audits and hazard identification.', unlocked: currentXP >= 600 },
    { id: 3, icon: '⚡', name: 'Crisis Navigator', xpRequired: 1200, desc: 'Successfully navigated multi-hazard response drills and emergency kits.', unlocked: currentXP >= 1200 },
    { id: 4, icon: '🏗️', name: 'Structural Guardian', xpRequired: 2200, desc: 'Demonstrated resilience in engineering and earthquake-resistant simulations.', unlocked: currentXP >= 2200 },
    { id: 5, icon: '🔥', name: 'Flame & Flood Defender', xpRequired: 3500, desc: 'Conquered smoke-vision navigation and river flood defense operations.', unlocked: currentXP >= 3500 },
    { id: 6, icon: '🧭', name: 'Master Survivalist', xpRequired: 5500, desc: 'Achieved elite disaster preparedness knowledge across all regional maps.', unlocked: currentXP >= 5500 },
    { id: 7, icon: '👑', name: 'DisasterVerse Vanguard', xpRequired: 8000, desc: 'Stands among the top tier emergency leaders on the leaderboard.', unlocked: currentXP >= 8000 },
    { id: 8, icon: '🌟', name: 'Legendary Apex Hero', xpRequired: 12000, desc: 'The ultimate pinnacle of absolute crisis mastery and safety excellence.', unlocked: currentXP >= 12000 }
  ];

  const [hoveredBadge, setHoveredBadge] = useState(null);

  useEffect(() => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userAvatar', userAvatar);
  }, [userName, userAvatar]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserName(newName);
    setUserAvatar(selectedAvatarOption);
    localStorage.setItem('userName', newName);
    localStorage.setItem('userAvatar', selectedAvatarOption);
    setShowSettingsModal(false);
    alert('Profile updated successfully!');
  };

  const handleSwitchAccount = () => {
    navigate('/login');
  };

  return (
    <div style={styles.dashboardContainer}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>🛡️</div>
            <span style={styles.logoText}>DisasterVerse</span>
          </div>

          <nav style={styles.navLinks}>
            <button onClick={() => setActiveTab('achievements')} style={{ ...styles.navBtn, ...(activeTab === 'achievements' ? styles.activeNavBtn : {}) }}>🏅 Badges & Progress</button>
            <button onClick={() => setActiveTab('games')} style={{ ...styles.navBtn, ...(activeTab === 'games' ? styles.activeNavBtn : {}) }}>🎮 Disaster Games</button>
            <button onClick={() => setActiveTab('map')} style={{ ...styles.navBtn, ...(activeTab === 'map' ? styles.activeNavBtn : {}) }}>🗺️ India Disaster Map</button>
            <button onClick={() => setActiveTab('kit')} style={{ ...styles.navBtn, ...(activeTab === 'kit' ? styles.activeNavBtn : {}) }}>🎒 Emergency Kit</button>
            <button onClick={() => setActiveTab('hazard')} style={{ ...styles.navBtn, ...(activeTab === 'hazard' ? styles.activeNavBtn : {}) }}>🔍 Hazard Spotter</button>
            <button onClick={() => setActiveTab('checklist')} style={{ ...styles.navBtn, ...(activeTab === 'checklist' ? styles.activeNavBtn : {}) }}>📋 Readiness Checklist</button>
            <button onClick={() => setActiveTab('firstaid')} style={{ ...styles.navBtn, ...(activeTab === 'firstaid' ? styles.activeNavBtn : {}) }}>🩹 First Aid Guide</button>
            <button onClick={() => setActiveTab('plan')} style={{ ...styles.navBtn, ...(activeTab === 'plan' ? styles.activeNavBtn : {}) }}>📑 Safety Plan</button>
          </nav>
        </div>

        <div style={styles.sidebarPromo} onClick={() => setShowSettingsModal(true)}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#fca5a5' }}>⚙️ Profile Settings</p>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Customize avatar, name & password</span>
        </div>
      </aside>

      {/* 2. MIDDLE CONTENT AREA */}
      <main style={styles.mainContent}>
        
        {/* Top Header */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.welcomeTitle}>Hello, {userName} 👋</h1>
            <p style={styles.welcomeSubtitle}>Your command center for emergency readiness and interactive survival training.</p>
          </div>

          <div style={styles.topRightControls}>
            <div style={styles.searchBox}>
              <span style={{ color: '#9ca3af' }}>🔍</span>
              <input type="text" placeholder="Search modules..." style={styles.searchInput} />
            </div>

            <div style={styles.profileBadge} onClick={() => setShowSettingsModal(true)} title="Open Profile Settings">
              <img src={userAvatar} alt="avatar" style={styles.avatarImg} />
            </div>
          </div>
        </header>

        {/* Dynamic Center Panel */}
        {activeTab === 'achievements' && (
          <div style={styles.tabContentCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px' }}>🏅 DisasterVerse Ranks & Achievements</h2>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0 0' }}>Earn XP through simulations, checklists, and safety training to unlock exclusive ranks.</p>
              </div>
              <div style={styles.xpStatusPill}>
                <span>Current XP: <strong>{currentXP} XP</strong></span>
              </div>
            </div>

            <div style={styles.badgeDetailsGrid}>
              {badgesList.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    ...styles.badgeDetailBox,
                    borderColor: item.unlocked ? '#dc2626' : '#2a2422',
                    backgroundColor: item.unlocked ? '#161211' : '#120f0e'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '32px' }}>{item.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', color: item.unlocked ? '#fff' : '#9ca3af' }}>{item.name}</h4>
                      <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 'bold' }}>Required XP: {item.xpRequired}</span>
                    </div>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '12px 0 0 0' }}>{item.desc}</p>
                  <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 'bold', color: item.unlocked ? '#4ade80' : '#f87171' }}>
                    {item.unlocked ? '✓ Unlocked' : `🔒 Locked (${item.xpRequired - currentXP} XP needed)`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div style={styles.tabContentCard}>
            <h2>🎮 Interactive Disaster Simulations</h2>
            <div style={styles.gameGrid}>
              <div style={styles.gameBox}>
                <h3>1. Earthquake – "Balance Builder"</h3>
                <p style={styles.gameDesc}>Build houses selecting foundations, pillars, and roofs, then test against earthquakes (4.5–8.5 magnitude).</p>
                <button style={styles.actionBtn} onClick={() => alert('Starting Balance Builder...')}>Play Simulation</button>
              </div>
              <div style={styles.gameBox}>
                <h3>2. Flood – "River Defender"</h3>
                <p style={styles.gameDesc}>Place sandbags, flood barriers, pumps, and wetlands to stop urban flooding.</p>
                <button style={styles.actionBtn} onClick={() => alert('Starting River Defender...')}>Play Simulation</button>
              </div>
              <div style={styles.gameBox}>
                <h3>3. Fire – "Smoke Vision"</h3>
                <p style={styles.gameDesc}>Navigate a low-visibility smoke maze by crawling and feeling walls.</p>
                <button style={styles.actionBtn} onClick={() => alert('Starting Smoke Vision...')}>Play Simulation</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div style={styles.tabContentCard}>
            <h2>🗺️ India Disaster Risk Map</h2>
            <p style={{ color: '#9ca3af' }}>Select any region or state to inspect active hazard indices, flood-prone zones, and seismic activity ratings.</p>
          </div>
        )}

        {activeTab === 'kit' && (
          <div style={styles.tabContentCard}>
            <h2>🎒 Emergency Kit Builder</h2>
            <p style={{ color: '#9ca3af' }}>Pick survival gear items (water filters, first aid, rations, flashlights) and test your readiness score.</p>
          </div>
        )}

        {activeTab === 'hazard' && (
          <div style={styles.tabContentCard}>
            <h2>🔍 Hazard Spotter</h2>
            <p style={{ color: '#9ca3af' }}>Inspect virtual rooms in homes and offices to spot electrical hazards and blocked exits.</p>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div style={styles.tabContentCard}>
            <h2>📋 Preparedness Checklist & Readiness Score</h2>
            <p style={{ color: '#9ca3af' }}>Answer a few quick household questions to compute your overall disaster resilience score.</p>
          </div>
        )}

        {activeTab === 'firstaid' && (
          <div style={styles.tabContentCard}>
            <h2>🩹 First Aid Treatment Guide</h2>
            <p style={{ color: '#9ca3af' }}>Select an injury category (Burns, Fractures, Bleeding, Choking) for instant emergency protocols.</p>
          </div>
        )}

        {activeTab === 'plan' && (
          <div style={styles.tabContentCard}>
            <h2>📑 Personalized Safety Plan Generator</h2>
            <p style={{ color: '#9ca3af' }}>Enter your family details and location coordinates to auto-generate a custom family evacuation plan.</p>
          </div>
        )}

      </main>

      {/* 3. RIGHT SIDEBAR */}
      <aside style={styles.rightSidebar}>
        
        {/* XP Card */}
        <div style={styles.rightCard}>
          <div style={styles.xpHeader}>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Total XP</span>
            <span style={styles.xpBadge}>Level 4 Survivor</span>
          </div>
          <h2 style={styles.xpCount}>{currentXP} XP</h2>
          <div style={styles.progressBarBg}>
            <div style={styles.progressBarFill}></div>
          </div>
          <span style={styles.xpNextLevel}>550 XP to Level 5</span>
        </div>

        {/* Badges Section with Hover Tooltips */}
        <div style={styles.rightCard}>
          <h3 style={styles.rightCardTitle}>🏅 Milestone Ranks</h3>
          <div style={styles.badgesGrid}>
            {badgesList.map((item) => (
              <div 
                key={item.id}
                style={{
                  ...styles.badgeItem,
                  opacity: item.unlocked ? 1 : 0.4,
                  borderColor: hoveredBadge?.id === item.id ? '#dc2626' : '#2a2422'
                }}
                onMouseEnter={() => setHoveredBadge(item)}
                onMouseLeave={() => setHoveredBadge(null)}
                onClick={() => setActiveTab('achievements')}
              >
                {item.icon}
              </div>
            ))}
          </div>

          {/* Badge Tooltip Detail Box */}
          {hoveredBadge ? (
            <div style={styles.badgeTooltip}>
              <strong style={{ color: '#fca5a5' }}>{hoveredBadge.name}</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#d1d5db' }}>{hoveredBadge.desc}</p>
              <span style={{ fontSize: '10px', color: hoveredBadge.unlocked ? '#4ade80' : '#f87171' }}>
                {hoveredBadge.unlocked ? '✓ Unlocked' : `🔒 Unlocks at ${hoveredBadge.xpRequired} XP`}
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '10px 0 0 0', textAlign: 'center' }}>
              Hover over badges for details.
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <div style={styles.rightCard}>
          <h3 style={styles.rightCardTitle}>🏆 Leaderboard</h3>
          <div style={styles.leaderboardList}>
            <div style={styles.leaderboardRow}>
              <span>1. Aarav Sharma</span>
              <span style={styles.lbXp}>4,820 XP</span>
            </div>
            <div style={styles.leaderboardRow}>
              <span>2. Priya Verma</span>
              <span style={styles.lbXp}>4,150 XP</span>
            </div>
            <div style={{ ...styles.leaderboardRow, color: '#fca5a5', fontWeight: 'bold' }}>
              <span>3. {userName} (You)</span>
              <span style={styles.lbXp}>{currentXP} XP</span>
            </div>
            <div style={styles.leaderboardRow}>
              <span>4. Rohan Mehta</span>
              <span style={styles.lbXp}>3,100 XP</span>
            </div>
          </div>
        </div>

      </aside>

      {/* 4. SETTINGS MODAL */}
      {showSettingsModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>⚙️ Profile & Account Settings</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Update your registered name, password, or choose a custom avatar.</p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <div>
                <label style={styles.modalLabel}>Display Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  style={styles.modalInput} 
                  required 
                />
              </div>

              <div>
                <label style={styles.modalLabel}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  style={styles.modalInput} 
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Choose Avatar (Boys, Girls & Bots)</label>
                <div style={styles.avatarPickerGrid}>
                  {avatarOptions.map((av, index) => (
                    <img 
                      key={index}
                      src={av} 
                      alt="option" 
                      style={{
                        ...styles.avatarOptionImg,
                        border: selectedAvatarOption === av ? '2px solid #dc2626' : '2px solid transparent'
                      }}
                      onClick={() => setSelectedAvatarOption(av)}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.modalButtons}>
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
                <button type="button" onClick={handleSwitchAccount} style={styles.switchAccountBtn}>Switch Account / Logout</button>
                <button type="button" onClick={() => setShowSettingsModal(false)} style={styles.cancelBtn}>Close</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Styles
const styles = {
  dashboardContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0f0d0c',
    color: '#fff',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#161211',
    borderRight: '1px solid #241e1c',
    display: 'flex',
    flexDirection: 'column',
    padding: '25px 15px',
    justifyContent: 'space-between',
    overflowY: 'auto',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingLeft: '5px',
  },
  logoIcon: {
    fontSize: '22px',
    backgroundColor: '#1f1a18',
    padding: '8px',
    borderRadius: '10px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fca5a5',
  },
  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  navBtn: {
    color: '#9ca3af',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeNavBtn: {
    backgroundColor: '#241e1c',
    color: '#fff',
    borderLeft: '4px solid #dc2626',
  },
  sidebarPromo: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  mainContent: {
    flex: 1,
    padding: '30px 40px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: '26px',
    fontWeight: 'bold',
    margin: 0,
  },
  welcomeSubtitle: {
    color: '#9ca3af',
    fontSize: '13px',
    margin: '4px 0 0 0',
  },
  topRightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '8px 14px',
    borderRadius: '12px',
    gap: '10px',
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '13px',
  },
  profileBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#1f1a18',
    border: '2px solid #dc2626',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  tabContentCard: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '30px',
    borderRadius: '20px',
  },
  xpStatusPill: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    border: '1px solid #dc2626',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#fca5a5',
  },
  badgeDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginTop: '20px',
  },
  badgeDetailBox: {
    border: '1px solid #2a2422',
    padding: '20px',
    borderRadius: '14px',
  },
  gameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginTop: '20px',
  },
  gameBox: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '20px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  gameDesc: {
    color: '#9ca3af',
    fontSize: '12px',
    margin: '10px 0 15px 0',
  },
  actionBtn: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px',
  },
  rightSidebar: {
    width: '280px',
    backgroundColor: '#161211',
    borderLeft: '1px solid #241e1c',
    padding: '25px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
  },
  rightCard: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '20px',
    borderRadius: '16px',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  xpBadge: {
    fontSize: '11px',
    color: '#fca5a5',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  xpCount: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#2a2422',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  progressBarFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#dc2626',
  },
  xpNextLevel: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  rightCardTitle: {
    fontSize: '15px',
    margin: '0 0 14px 0',
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  badgeItem: {
    width: '40px',
    height: '40px',
    backgroundColor: '#161211',
    border: '1px solid #2a2422',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  badgeTooltip: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: '#161211',
    border: '1px solid #dc2626',
    borderRadius: '8px',
    fontSize: '12px',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  leaderboardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#d1d5db',
    padding: '6px 0',
    borderBottom: '1px solid #2a2422',
  },
  lbXp: {
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: '#161211',
    border: '1px solid #2a2422',
    padding: '30px',
    borderRadius: '20px',
    width: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
  },
  modalLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    display: 'block',
    marginBottom: '6px',
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  avatarPickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginTop: '6px',
  },
  avatarOptionImg: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: '#1f1a18',
    padding: '4px',
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  saveBtn: {
    padding: '12px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  switchAccountBtn: {
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#fca5a5',
    border: '1px solid #dc2626',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Dashboard;
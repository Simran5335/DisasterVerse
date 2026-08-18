import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FlipCard from './FlipCard';
import FirstAid from './FirstAid';

const Dashboard = () => {
  const navigate = useNavigate();

  const [userData] = useState(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (email) {
      const savedUser = localStorage.getItem(`user_${email}`);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    }
    return {
      name: 'Survivor',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DisasterVerse',
      xp: 3450
    };
  });

  const [userName, setUserName] = useState(userData.name);
  const [userAvatar, setUserAvatar] = useState(
    localStorage.getItem('userAvatar') ||
      userData.avatar ||
      'https://api.dicebear.com/7.x/bottts/svg?seed=DisasterVerse'
  );

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pokemon');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [newName, setNewName] = useState(userName);
  const [newPassword, setNewPassword] = useState('');
  const [selectedAvatarOption, setSelectedAvatarOption] = useState(userAvatar);

  // Sound Mute/Unmute state
  const [isMuted, setIsMuted] = useState(true);
  const activeVideoRef = useRef(null);

  // Evolution & Animation State
  const [isEvolving, setIsEvolving] = useState(false);

  // 9 Pokémon across 3 Rows
  const allPokemonList = [
    // Row 1: Electric Line
    { name: 'Pichu', video: '/pichu.mp4', minXp: 0, row: 1, type: 'electric', desc: 'Starter electric companion.' },
    { name: 'Pikachu', video: '/pikachu.mp4', minXp: 1200, row: 1, type: 'electric', desc: 'Evolves at 1,200 XP. Fast and agile.' },
    { name: 'Raichu', video: '/raichu.mp4', minXp: 5000, row: 1, type: 'electric', desc: 'Evolves at 5,000 XP. Absolute crisis master.' },
    // Row 2: Water Line
    { name: 'Squirtle', video: '/squirtle.mp4', minXp: 0, row: 2, type: 'water', desc: 'Starter water companion.' },
    { name: 'Wartortle', video: '/wortortle.mp4', minXp: 2000, row: 2, type: 'water', desc: 'Evolves at 2,000 XP. Tactical defender.' },
    { name: 'Blastoise', video: '/blastoise.mp4', minXp: 7000, row: 2, type: 'water', desc: 'Evolves at 7,000 XP. Massive hydro power.' },
    // Row 3: Fire Line
    { name: 'Charmander', video: '/charmander.mp4', minXp: 0, row: 3, type: 'fire', desc: 'Starter fire companion.' },
    { name: 'Charmeleon', video: '/charmeleon.mp4', minXp: 3000, row: 3, type: 'fire', desc: 'Evolves at 3,000 XP. Fiery spirit.' },
    { name: 'Charizard', video: '/charizard.mp4', minXp: 10000, row: 3, type: 'fire', desc: 'Evolves at 10,000 XP. Legendary apex flame master.' }
  ];

  const currentXP = parseInt(
    localStorage.getItem('userXP') || userData.xp || '3450',
    10
  );

  const [selectedPokemonName, setSelectedPokemonName] = useState(() => {
    if (currentXP >= 5000) return 'Raichu';
    if (currentXP >= 1200) return 'Pikachu';
    return 'Pichu';
  });

  const currentPokemon = allPokemonList.find((p) => p.name === selectedPokemonName) || allPokemonList[0];

  const getDynamicCardBackground = (type) => {
    if (type === 'electric') return 'linear-gradient(135deg, #242217 0%, #161211 100%)';
    if (type === 'water') return 'linear-gradient(135deg, #172128 0%, #161211 100%)';
    if (type === 'fire') return 'linear-gradient(135deg, #281d18 0%, #161211 100%)';
    return '#161211';
  };

  const getDynamicAccentColor = (type) => {
    if (type === 'electric') return '#d4af37';
    if (type === 'water') return '#5b92e5';
    if (type === 'fire') return '#e07a5f';
    return '#dc2626';
  };

  useEffect(() => {
    const lastSeenXp = parseInt(localStorage.getItem('lastKnownXP') || currentXP, 10);
    if (currentXP !== lastSeenXp) {
      if (
        (lastSeenXp < 1200 && currentXP >= 1200) ||
        (lastSeenXp < 5000 && currentXP >= 5000)
      ) {
        setIsEvolving(true);
        setTimeout(() => setIsEvolving(false), 2500);
      }
      localStorage.setItem('lastKnownXP', currentXP);
    }
  }, [currentXP]);

  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=MiaGirl',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Chloe',
    'https://api.dicebear.com/7.x/personas/svg?seed=Olivia',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=LeoBoy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Lucas',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Ethan',
    'https://api.dicebear.com/7.x/personas/svg?seed=Mason',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Liam',
    'https://api.dicebear.com/7.x/bottts/svg?seed=DisasterVerse',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Hero',
    'https://api.dicebear.com/7.x/micah/svg?seed=Survivor',
    'https://api.dicebear.com/7.x/bottts/svg?seed=RescueBot'
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatarOption(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const badgesList = [
    {
      id: 1,
      icon: '🌱',
      name: 'Preparedness Novice',
      xpRequired: 200,
      desc: 'Awarded for taking your first steps into emergency readiness education.',
      unlocked: currentXP >= 200
    },
    {
      id: 2,
      icon: '🛡️',
      name: 'Shield Apprentice',
      xpRequired: 600,
      desc: 'Mastered basic household safety audits and hazard identification.',
      unlocked: currentXP >= 600
    },
    {
      id: 3,
      icon: '⚡',
      name: 'Crisis Navigator',
      xpRequired: 1200,
      desc: 'Successfully navigated multi-hazard response drills and emergency kits.',
      unlocked: currentXP >= 1200
    },
    {
      id: 4,
      icon: '🏗️',
      name: 'Structural Guardian',
      xpRequired: 2200,
      desc: 'Demonstrated resilience in engineering and earthquake-resistant simulations.',
      unlocked: currentXP >= 2200
    },
    {
      id: 5,
      icon: '🔥',
      name: 'Flame & Flood Defender',
      xpRequired: 3500,
      desc: 'Conquered smoke-vision navigation and river flood defense operations.',
      unlocked: currentXP >= 3500
    },
    {
      id: 6,
      icon: '🧭',
      name: 'Master Survivalist',
      xpRequired: 5500,
      desc: 'Achieved elite disaster preparedness knowledge across all regional maps.',
      unlocked: currentXP >= 5500
    },
    {
      id: 7,
      icon: '👑',
      name: 'DisasterVerse Vanguard',
      xpRequired: 8000,
      desc: 'Stands among the top tier emergency leaders on the leaderboard.',
      unlocked: currentXP >= 8000
    },
    {
      id: 8,
      icon: '🌟',
      name: 'Legendary Apex Hero',
      xpRequired: 12000,
      desc: 'The ultimate pinnacle of absolute crisis mastery and safety excellence.',
      unlocked: currentXP >= 12000
    }
  ];

  const [hoveredBadge, setHoveredBadge] = useState(null);

  const disasterCards = [
    {
      title: '🌍 Earthquake',
      image: '/earthquake.png',
      protocols: [
        {
          stage: '🟢 Before',
          color: '#4ade80',
          items: [
            'Secure heavy furniture.',
            'Keep an emergency kit ready.',
            'Identify safe places.',
            'Prepare an emergency plan.'
          ]
        },
        {
          stage: '🟠 During',
          color: '#fbbf24',
          items: [
            'Drop, Cover & Hold On.',
            'Stay away from windows.',
            "Don't use elevators.",
            'Move away from buildings if outdoors.'
          ]
        },
        {
          stage: '🔵 After',
          color: '#60a5fa',
          items: [
            'Check for injuries.',
            'Watch for gas leaks and fires.',
            'Expect aftershocks.',
            'Follow official instructions.'
          ]
        }
      ]
    },
    {
      title: '🌊 Flood',
      image: '/flood.png',
      protocols: [
        {
          stage: '🟢 Before',
          color: '#4ade80',
          items: [
            'Keep an emergency kit ready.',
            'Know nearby safe/high-ground areas.',
            'Protect important documents.',
            'Follow weather warnings.'
          ]
        },
        {
          stage: '🟠 During',
          color: '#fbbf24',
          items: [
            'Move to higher ground.',
            'Avoid walking or driving through floodwater.',
            'Stay away from electrical wires.',
            'Follow evacuation instructions.'
          ]
        },
        {
          stage: '🔵 After',
          color: '#60a5fa',
          items: [
            'Avoid contaminated floodwater.',
            'Check for damaged wires and gas leaks.',
            'Return home only when declared safe.',
            'Follow official recovery instructions.'
          ]
        }
      ]
    },
    {
      title: '🔥 Forest Fire / Wildfire',
      image: '/forestfire.png',
      protocols: [
        {
          stage: '🟢 Before',
          color: '#4ade80',
          items: [
            'Clear dry vegetation near buildings.',
            'Keep emergency supplies ready.',
            'Know evacuation routes.'
          ]
        },
        {
          stage: '🟠 During',
          color: '#fbbf24',
          items: [
            'Evacuate when instructed.',
            'Stay away from smoke and flames.',
            'Keep windows and doors closed.'
          ]
        },
        {
          stage: '🔵 After',
          color: '#60a5fa',
          items: [
            'Return only when declared safe.',
            'Watch for hot spots and falling trees.',
            'Check for property damage.'
          ]
        }
      ]
    },
    {
      title: '🌪️ Cyclone',
      image: '/cyclone.png',
      protocols: [
        {
          stage: '🟢 Before',
          color: '#4ade80',
          items: [
            'Follow weather warnings.',
            'Secure doors, windows, and loose objects.',
            'Keep an emergency kit ready.'
          ]
        },
        {
          stage: '🟠 During',
          color: '#fbbf24',
          items: [
            'Stay indoors and away from windows.',
            'Keep emergency supplies nearby.',
            'Evacuate if instructed.'
          ]
        },
        {
          stage: '🔵 After',
          color: '#60a5fa',
          items: [
            'Avoid fallen wires and debris.',
            'Stay away from floodwater.',
            'Return outside only when safe.'
          ]
        }
      ]
    },
    {
      title: '⛰️ Landslide',
      image: '/landslide.png',
      protocols: [
        {
          stage: '🟢 Before',
          color: '#4ade80',
          items: [
            'Learn local landslide warning signs.',
            'Avoid building near unstable slopes.',
            'Know evacuation routes.'
          ]
        },
        {
          stage: '🟠 During',
          color: '#fbbf24',
          items: [
            'Move quickly to safer ground.',
            'Stay away from slopes and debris.',
            'Follow evacuation instructions.'
          ]
        },
        {
          stage: '🔵 After',
          color: '#60a5fa',
          items: [
            'Avoid the affected area.',
            'Watch for additional landslides.',
            'Report damaged roads or utilities.'
          ]
        }
      ]
    },
    {
      title: '🌊 Tsunami',
      image: '/tsunami.png',
      protocols: [
        { stage: '🟢 Before', color: '#4ade80', items: ['Know evacuation routes to higher ground.', 'Learn local tsunami warning signals.', 'Prepare an emergency kit.'] },
        { stage: '🟠 During', color: '#fbbf24', items: ['Move immediately to higher ground.', 'Stay away from beaches and rivers.', 'Follow official evacuation orders.'] },
        { stage: '🔵 After', color: '#60a5fa', items: ['Stay away until officials declare it safe.', 'Watch for additional waves.', 'Avoid damaged areas and debris.'] }
      ]
    }
  ];

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
    localStorage.removeItem('currentUserEmail');
    navigate('/login');
  };

  return (
    <div style={styles.dashboardContainer} className="dv-dashboard-root">

      {/* MOBILE TOGGLE HEADER BAR */}
      <div className="dv-mobile-header">
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🛡️</div>
          <span style={styles.logoText}>DisasterVerse</span>
        </div>

        <button
          className="dv-menu-toggle-btn"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      {/* LEFT SIDEBAR */}
      <aside
        className={`dv-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}
        style={styles.sidebar}
      >
        <div>
          <div style={styles.logoArea} className="dv-desktop-logo">
            <div style={styles.logoIcon}>🛡️</div>
            <span style={styles.logoText}>DisasterVerse</span>
          </div>

          <nav style={styles.navLinks}>
            <button onClick={() => { setActiveTab('achievements'); setMobileNavOpen(false); }} style={{ ...styles.navBtn, ...(activeTab === 'achievements' ? styles.activeNavBtn : {}) }}>🏅 Badges & Progress</button>
            <button onClick={() => { setActiveTab('games'); setMobileNavOpen(false); }} style={{ ...styles.navBtn, ...(activeTab === 'games' ? styles.activeNavBtn : {}) }}>🎮 Disaster Games & Sims</button>
            <button onClick={() => navigate('/india-map')} style={styles.navBtn}>🗺️ India Disaster Map</button>
            <button onClick={() => navigate('/crisis-archive')} style={styles.navBtn}>📰 Crisis Archive</button>
            <button onClick={() => navigate('/quiz')} style={styles.navBtn}>🧠 Disaster Quiz</button>
            <button onClick={() => { setActiveTab('flip-prepare'); setMobileNavOpen(false); }} style={{ ...styles.navBtn, ...(activeTab === 'flip-prepare' ? styles.activeNavBtn : {}) }}>🃏 Flip & Prepare</button>
            <button onClick={() => { setActiveTab('checklist'); setMobileNavOpen(false); }} style={{ ...styles.navBtn, ...(activeTab === 'checklist' ? styles.activeNavBtn : {}) }}>📋 Readiness Checklist</button>
            <button onClick={() => { setActiveTab('firstaid'); setMobileNavOpen(false); }} style={{ ...styles.navBtn, ...(activeTab === 'firstaid' ? styles.activeNavBtn : {}) }}>🩹 First Aid Guide</button>
            <button onClick={() => { setActiveTab('plan'); setMobileNavOpen(false); }} style={{ ...styles.navBtn, ...(activeTab === 'plan' ? styles.activeNavBtn : {}) }}>📑 Safety Plan</button>
          </nav>
        </div>

        <div
          style={styles.sidebarPromo}
          onClick={() => {
            setShowSettingsModal(true);
            setMobileNavOpen(false);
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#fca5a5'
            }}
          >
            ⚙️ Profile Settings
          </p>

          <span
            style={{
              fontSize: '11px',
              color: '#9ca3af'
            }}
          >
            Customize avatar, name & password
          </span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main
        style={styles.mainContent}
        className="dv-main-content"
      >
        <header
          style={styles.topBar}
          className="dv-top-bar"
        >
          <div>
            <h1 style={styles.welcomeTitle}>
              Hello, {userName} 👋
            </h1>

            <p style={styles.welcomeSubtitle}>
              Your command center for emergency readiness and interactive survival training.
            </p>
          </div>

          <div style={styles.topRightControls}>
            <div
              style={styles.searchBox}
              className="dv-search-box"
            >
              <span style={{ color: '#9ca3af' }}>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search modules..."
                style={styles.searchInput}
              />
            </div>

            <div
              style={styles.profileBadge}
              onClick={() => setShowSettingsModal(true)}
              title="Open Profile Settings"
            >
              <img
                src={userAvatar}
                alt="avatar"
                style={styles.avatarImg}
              />
            </div>
          </div>
        </header>

        {activeTab === 'achievements' && (
          <div style={styles.tabContentCard}>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px'
                  }}
                >
                  🏅 DisasterVerse Ranks & Achievements
                </h2>

                <p
                  style={{
                    color: '#9ca3af',
                    fontSize: '13px',
                    margin: '4px 0 0 0'
                  }}
                >
                  Earn XP through simulations, checklists, and safety training to unlock exclusive ranks.
                </p>
              </div>

              <div style={styles.xpStatusPill}>
                <span>
                  Current XP: <strong>{currentXP} XP</strong>
                </span>
              </div>
            </div>

            <div
              style={styles.badgeDetailsGrid}
              className="dv-fluid-grid"
            >
              {badgesList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.badgeDetailBox,
                    borderColor: item.unlocked
                      ? '#dc2626'
                      : '#2a2422',
                    backgroundColor: item.unlocked
                      ? '#161211'
                      : '#120f0e'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>
                      {item.icon}
                    </span>

                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          color: item.unlocked
                            ? '#fff'
                            : '#9ca3af'
                        }}
                      >
                        {item.name}
                      </h4>

                      <span
                        style={{
                          fontSize: '12px',
                          color: '#fca5a5',
                          fontWeight: 'bold'
                        }}
                      >
                        Required XP: {item.xpRequired}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      color: '#9ca3af',
                      fontSize: '13px',
                      margin: '12px 0 0 0'
                    }}
                  >
                    {item.desc}
                  </p>

                  <div
                    style={{
                      marginTop: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: item.unlocked
                        ? '#4ade80'
                        : '#f87171'
                    }}
                  >
                    {item.unlocked
                      ? '✓ Unlocked'
                      : `🔒 Locked (${item.xpRequired - currentXP} XP needed)`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================
            DISASTER GAMES & SIMULATIONS
        ====================================================== */}

        {activeTab === 'games' && (
          <div style={styles.tabContentCard}>
            <h2>
              🎮 Interactive Disaster Simulations & Modules
            </h2>

            <div
              style={styles.gameGrid}
              className="dv-fluid-grid"
            >

              {/* RIVER DEFENDER */}
              <div style={styles.gameBox}>
                <h3>
                  🌊 River Defender — "Flood Defense"
                </h3>

                <p style={styles.gameDesc}>
                  Protect a riverside community from rising floodwater!
                  Place defenses, manage resources, and protect critical buildings.
                </p>

                <button
                  style={styles.actionBtn}
                  onClick={() => navigate('/river-defender')}
                >
                  Play Game
                </button>
              </div>

              {/* SMOKE VISION */}
              <div style={styles.gameBox}>
                <h3>
                  🔥 Smoke Vision — 3D Fire Escape
                </h3>

                <p style={styles.gameDesc}>
                  Navigate a 3D school during a fire emergency!
                  Check door handles, stay low in smoke, use your flashlight,
                  and find safe exits.
                </p>

                <button
                  style={styles.actionBtn}
                  onClick={() => navigate('/smoke-vision')}
                >
                  Play Game
                </button>
              </div>

              {/* EARTHQUAKE */}
              <div style={styles.gameBox}>
                <h3>
                  🧱 Earthquake – "Balance Builder"
                </h3>

                <p style={styles.gameDesc}>
                  Build structural foundations, pillars, and roofs,
                  then test against 4.5–8.5 magnitude earthquakes.
                </p>

                <button
                  style={styles.actionBtn}
                  onClick={() => navigate('/earthquake-balance-builder')}
                >
                  Play Simulation
                </button>
              </div>

              {/* EMERGENCY KIT */}
              <div style={styles.gameBox}>
                <h3>
                  🧰 72hr Emergency Kit Builder
                </h3>

                <p style={styles.gameDesc}>
                  Pack essential medical and survival supplies into
                  an emergency first-aid kit before disaster strikes.
                </p>

                <button
                  style={styles.actionBtn}
                  onClick={() => navigate('/emergency-kit-builder')}
                >
                  Play Game
                </button>
              </div>

              {/* HAZARD SPOTTER */}
              <div style={styles.gameBox}>
                <h3>
                  🔍 Hazard Spotter – "Spot The Risk"
                </h3>

                <p style={styles.gameDesc}>
                  Scan 4 real-world environments across 20 levels
                  to spot hidden safety hazards and structural risks.
                </p>

                <button
                  style={styles.actionBtn}
                  onClick={() => navigate('/hazard-spotter')}
                >
                  Play Game
                </button>
              </div>

              {/* MOUNTAIN SCOUT */}
              <div style={styles.gameBox}>
                <h3>
                  🏞️ Landslide – "Mountain Scout"
                </h3>

                <p style={styles.gameDesc}>
                  Inspect mountain slope landscapes to spot ground cracks,
                  leaning trees, rockfalls, and water seepage.
                </p>

                <button
                  style={styles.actionBtn}
                  onClick={() => navigate('/mountain-scout')}
                >
                  Play Game
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            FLIP & PREPARE
        ====================================================== */}

        {activeTab === 'flip-prepare' && (
          <div style={styles.tabContentCard}>
            <h2>
              🃏 Flip & Prepare
            </h2>

            <p
              style={{
                color: '#9ca3af',
                marginBottom: '25px'
              }}
            >
              Click any card below to flip between the illustration
              and survival protocols.
            </p>

            <div
              style={styles.flipGrid}
              className="dv-fluid-grid"
            >
              {disasterCards.map((card, index) => (
                <FlipCard
                  key={index}
                  title={card.title}
                  imageSrc={card.image}
                  protocols={card.protocols}
                />
              ))}
            </div>
          </div>
        )}

        {/* =====================================================
            CHECKLIST
        ====================================================== */}

        {activeTab === 'checklist' && (
          <div style={styles.tabContentCard}>
            <h2>📋 Preparedness Checklist & Readiness Score</h2>
            <p style={{ color: '#9ca3af' }}>Answer a few quick household questions to compute your overall disaster resilience score.</p>
          </div>
        )}

        {/* =====================================================
            FIRST AID
        ====================================================== */}

        {/* FIRST AID */}
        {activeTab === 'firstaid' && (
          <div style={styles.firstAidDashboardCard}>
            <FirstAid />
          </div>
        )}

        {/* CHECKLIST */}
        {activeTab === 'checklist' && (
          <div style={styles.tabContentCard}>
            <h2>🩹 First Aid Treatment Guide</h2>
            <p style={{ color: '#9ca3af' }}>Select an injury category (Burns, Fractures, Bleeding, Choking) for instant emergency protocols.</p>
          </div>
        )}

        {/* =====================================================
            SAFETY PLAN
        ====================================================== */}

        {/* SAFETY PLAN */}
        {activeTab === 'plan' && (
          <div style={styles.tabContentCard}>
            <h2>📑 Personalized Safety Plan Generator</h2>
            <p style={{ color: '#9ca3af' }}>Enter your family details and location coordinates to auto-generate a custom family evacuation plan.</p>
          </div>
        )}

      </main>

      {/* =====================================================
          RIGHT SIDEBAR
      ====================================================== */}

      <aside
        style={styles.rightSidebar}
        className="dv-right-sidebar"
      >

        <div style={styles.rightCard}>
          <div style={styles.xpHeader}>
            <span
              style={{
                fontSize: '13px',
                color: '#9ca3af'
              }}
            >
              Total XP
            </span>

            <span style={styles.xpBadge}>
              Level 4 Survivor
            </span>
          </div>

          <h2 style={styles.xpCount}>
            {currentXP} XP
          </h2>

          <div style={styles.progressBarBg}>
            <div style={styles.progressBarFill}></div>
          </div>

          <span style={styles.xpNextLevel}>
            550 XP to Level 5
          </span>
        </div>

        <div style={styles.rightCard}>
          <h3 style={styles.rightCardTitle}>
            🏅 Milestone Ranks
          </h3>

          <div style={styles.badgesGrid}>
            {badgesList.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.badgeItem,
                  opacity: item.unlocked ? 1 : 0.4,
                  borderColor:
                    hoveredBadge?.id === item.id
                      ? '#dc2626'
                      : '#2a2422'
                }}
                onMouseEnter={() => setHoveredBadge(item)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                {item.icon}
              </div>
            ))}
          </div>

          {hoveredBadge ? (
            <div style={styles.badgeTooltip}>
              <strong style={{ color: '#fca5a5' }}>
                {hoveredBadge.name}
              </strong>

              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '11px',
                  color: '#d1d5db'
                }}
              >
                {hoveredBadge.desc}
              </p>

              <span
                style={{
                  fontSize: '10px',
                  color: hoveredBadge.unlocked
                    ? '#4ade80'
                    : '#f87171'
                }}
              >
                {hoveredBadge.unlocked
                  ? '✓ Unlocked'
                  : `🔒 Unlocks at ${hoveredBadge.xpRequired} XP`}
              </span>
            </div>
          ) : (
            <p
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                margin: '10px 0 0 0',
                textAlign: 'center'
              }}
            >
              Hover over badges for details.
            </p>
          )}
        </div>

        <div style={styles.rightCard}>
          <h3 style={styles.rightCardTitle}>
            🏆 Leaderboard
          </h3>

          <div style={styles.leaderboardList}>
            <div style={styles.leaderboardRow}>
              <span>1. Aarav Sharma</span>
              <span style={styles.lbXp}>4,820 XP</span>
            </div>

            <div style={styles.leaderboardRow}>
              <span>2. Priya Verma</span>
              <span style={styles.lbXp}>4,150 XP</span>
            </div>

            <div
              style={{
                ...styles.leaderboardRow,
                color: '#fca5a5',
                fontWeight: 'bold'
              }}
            >
              <span>
                3. {userName} (You)
              </span>

              <span style={styles.lbXp}>
                {currentXP} XP
              </span>
            </div>

            <div style={styles.leaderboardRow}>
              <span>4. Rohan Mehta</span>
              <span style={styles.lbXp}>3,100 XP</span>
            </div>
          </div>
        </div>

      </aside>

      {/* =====================================================
          SETTINGS MODAL
      ====================================================== */}

      {showSettingsModal && (
        <div style={styles.modalOverlay}>

          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>⚙️ Profile & Account Settings</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Update your registered name, password, or choose a custom avatar.</p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div>
                <label style={styles.modalLabel}>
                  Display Name
                </label>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div>
                <label style={styles.modalLabel}>
                  New Password
                </label>

                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.modalLabel}>Upload Custom Photo</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '5px' }} 
                />
              </div>

              <div>
                <label style={styles.modalLabel}>
                  Choose Avatar
                </label>

                <div style={styles.avatarPickerGrid}>
                  {avatarOptions.map((av, index) => (
                    <img
                      key={index}
                      src={av}
                      alt="avatar option"
                      style={{
                        ...styles.avatarOptionImg,
                        border:
                          selectedAvatarOption === av
                            ? '2px solid #dc2626'
                            : '2px solid transparent'
                      }}
                      onClick={() => setSelectedAvatarOption(av)}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.modalButtons}>

                <button
                  type="submit"
                  style={styles.saveBtn}
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  style={styles.switchAccountBtn}
                >
                  Switch Account / Logout
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  style={styles.cancelBtn}
                >
                  Close
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          RESPONSIVE INLINE CSS
      ====================================================== */}

      <style>{`
        .dv-dashboard-root {
          display: flex;
          width: 100%;
          min-height: 100vh;
          min-height: 100svh;
          background-color: #0f0d0c;
          color: #fff;
          font-family: sans-serif;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .dv-mobile-header {
          display: none;
        }

        .dv-fluid-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 280px), 1fr)
          );
          gap: 16px;
        }

        @keyframes evolveGlow {
          0% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0px #fbbf24); }
          50% { transform: scale(1.05); filter: brightness(1.8) drop-shadow(0 0 35px #fbbf24); }
          100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0px #fbbf24); }
        }

        .evolution-flash-anim {
          animation: evolveGlow 2.5s ease-in-out;
        }

        @media (max-width: 1024px) {
          .dv-dashboard-root {
            flex-direction: column;
          }

          .dv-right-sidebar {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid #241e1c !important;
            display: grid !important;
            grid-template-columns: repeat(
              auto-fit,
              minmax(280px, 1fr)
            ) !important;
          }
        }

        @media (max-width: 768px) {
          .dv-mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 18px;
            background: #161211;
            border-bottom: 1px solid #241e1c;
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .dv-desktop-logo {
            display: none !important;
          }

          .dv-menu-toggle-btn {
            background: #241e1c;
            color: #fca5a5;
            border: 1px solid #dc2626;
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
          }

          .dv-sidebar {
            display: none;
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid #241e1c !important;
          }

          .dv-sidebar.mobile-open {
            display: flex !important;
          }

          .dv-main-content {
            padding: 16px !important;
          }

          .dv-top-bar {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
        }
      `}</style>

    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    minHeight: '100svh',
    backgroundColor: '#0f0d0c',
    color: '#fff',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box'
  },

  sidebar: {
    width: '260px',
    backgroundColor: '#161211',
    borderRight: '1px solid #241e1c',
    display: 'flex',
    flexDirection: 'column',
    padding: '25px 15px',
    justifyContent: 'space-between',
    overflowY: 'auto'
  },

  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingLeft: '5px'
  },

  logoIcon: {
    fontSize: '22px',
    backgroundColor: '#1f1a18',
    padding: '8px',
    borderRadius: '10px'
  },

  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fca5a5'
  },

  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
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
    transition: 'all 0.2s'
  },

  activeNavBtn: {
    backgroundColor: '#241e1c',
    color: '#fff',
    borderLeft: '4px solid #dc2626'
  },

  sidebarPromo: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '20px'
  },

  mainContent: {
    flex: 1,
    padding: '30px 40px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  welcomeTitle: {
    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
    fontWeight: 'bold',
    margin: 0
  },

  welcomeSubtitle: {
    color: '#9ca3af',
    fontSize: '13px',
    margin: '4px 0 0 0'
  },

  topRightControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '8px 14px',
    borderRadius: '12px',
    gap: '10px'
  },

  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '13px'
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
    justifyContent: 'center'
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  tabContentCard: {
    backgroundColor: '#161211',
    border: '1px solid #241e1c',
    padding: '28px',
    borderRadius: '20px',
    transition: 'background 0.5s ease, border-color 0.5s ease'
  },

  flipGrid: {
    display: 'grid',
    gap: '20px',
    marginTop: '15px'
  },

  xpStatusPill: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    border: '1px solid #dc2626',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#fca5a5'
  },

  badgeDetailsGrid: {
    display: 'grid',
    gap: '16px',
    marginTop: '20px'
  },

  badgeDetailBox: {
    border: '1px solid #2a2422',
    padding: '20px',
    borderRadius: '14px'
  },

  gameGrid: {
    display: 'grid',
    gap: '15px',
    marginTop: '20px'
  },

  gameBox: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '20px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },

  gameDesc: {
    color: '#9ca3af',
    fontSize: '12px',
    margin: '10px 0 15px 0'
  },

  actionBtn: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px'
  },

  rightSidebar: {
    width: '280px',
    backgroundColor: '#161211',
    borderLeft: '1px solid #241e1c',
    padding: '25px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto'
  },

  rightCard: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    padding: '20px',
    borderRadius: '16px'
  },

  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },

  xpBadge: {
    fontSize: '11px',
    color: '#fca5a5',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: '2px 8px',
    borderRadius: '10px'
  },

  xpCount: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 12px 0'
  },

  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#2a2422',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '6px'
  },

  progressBarFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#dc2626'
  },

  xpNextLevel: {
    fontSize: '11px',
    color: '#9ca3af'
  },

  rightCardTitle: {
    fontSize: '15px',
    margin: '0 0 14px 0'
  },

  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
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
    transition: 'all 0.2s'
  },

  badgeTooltip: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: '#161211',
    border: '1px solid #dc2626',
    borderRadius: '8px',
    fontSize: '12px'
  },

  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  leaderboardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#d1d5db',
    padding: '6px 0',
    borderBottom: '1px solid #2a2422'
  },

  lbXp: {
    color: '#9ca3af',
    fontWeight: 'bold'
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
    zIndex: 100
  },

  modalContent: {
    backgroundColor: '#161211',
    border: '1px solid #2a2422',
    padding: '24px',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '440px',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
  },

  modalLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    display: 'block',
    marginBottom: '6px'
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
    fontSize: '14px'
  },

  avatarPickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginTop: '8px',
    maxHeight: '160px',
    overflowY: 'auto'
  },

  avatarOptionImg: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: '#1f1a18'
  },

  modalButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '15px'
  },

  saveBtn: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  switchAccountBtn: {
    backgroundColor: '#1f1a18',
    border: '1px solid #2a2422',
    color: '#fca5a5',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  cancelBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    padding: '8px',
    cursor: 'pointer'
  }
};

export default Dashboard;
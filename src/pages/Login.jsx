import React, { useState, useRef } from 'react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [eyeOffset, setEyeOffset] = useState(0);
  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    const length = e.target.value.length;
    const step = (length % 16) - 8;
    setEyeOffset(step);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setEyeOffset(0);
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailInput = e.target.elements.email?.value;

    if (!emailInput) {
      alert('Please enter a valid email.');
      return;
    }

    if (isRegister) {
      const nameInput = e.target.elements.fullName?.value || 'Survivor';
      const ageInput = e.target.elements.age?.value || '20';

      const userProfile = {
        name: nameInput,
        age: ageInput,
        email: emailInput,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(nameInput),
        xp: 3450
      };

      localStorage.setItem(`user_${emailInput}`, JSON.stringify(userProfile));
      alert('Registration successful! Please login with your credentials.');
      setIsRegister(false);
    } else {
      let storedUser = localStorage.getItem(`user_${emailInput}`);
      
      if (!storedUser) {
        const defaultName = emailInput.split('@')[0];
        const userProfile = {
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          email: emailInput,
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(defaultName),
          xp: 3450
        };
        localStorage.setItem(`user_${emailInput}`, JSON.stringify(userProfile));
      }

      localStorage.setItem('currentUserEmail', emailInput);
      
      // Force clean redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={styles.container}>
      <video autoPlay loop muted playsInline style={styles.video}>
        <source src="/VID_20260809_182140.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div style={styles.overlay}></div>

      {/* Top Center Glowing Heading */}
      <div style={styles.headingContainer}>
        <h1 style={styles.mainHeading}>Welcome To DisasterVerse</h1>
        <div style={styles.headingUnderline}></div>
      </div>

      {/* Left-Aligned Login Box Container */}
      <div style={styles.contentContainer}>
        <div style={styles.card}>
          <div style={styles.cloudWrapper}>
            <div style={styles.cloudPuff1}></div>
            <div style={styles.cloudPuff2}></div>
            <div style={styles.cloudPuff3}></div>
            <div style={styles.cloudBase}>
              <div style={{ ...styles.eyeLeft, transform: `translateX(${eyeOffset}px)` }}></div>
              <div style={{ ...styles.eyeRight, transform: `translateX(${eyeOffset}px)` }}></div>
              <div style={styles.blushLeft}></div>
              <div style={styles.blushRight}></div>
              <div style={styles.smile}></div>
            </div>
            <div style={styles.handLeft}></div>
            <div style={styles.handRight}></div>
          </div>

          <div style={styles.tabContainer}>
            <button 
              type="button"
              onClick={() => setIsRegister(false)} 
              style={{ ...styles.tabButton, borderBottom: !isRegister ? '2px solid #dc2626' : '2px solid transparent', color: !isRegister ? '#fff' : '#9ca3af' }}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setIsRegister(true)} 
              style={{ ...styles.tabButton, borderBottom: isRegister ? '2px solid #dc2626' : '2px solid transparent', color: isRegister ? '#fff' : '#9ca3af' }}
            >
              Register
            </button>
          </div>

          <div style={styles.header}>
            <h2 style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back!'}</h2>
            <p style={styles.subtitle}>{isRegister ? 'Join DisasterVerse today.' : 'Safety begins with you.'}</p>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input name="fullName" type="text" placeholder="Enter your name" style={styles.input} required onChange={handleTyping} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Age</label>
                  <input name="age" type="number" placeholder="Enter your age" style={styles.input} required onChange={handleTyping} />
                </div>
              </>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input name="email" type="email" placeholder="Enter your email" style={styles.input} required onChange={handleTyping} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input 
                name="password"
                type="password" 
                placeholder="Enter your password" 
                style={styles.input}
                required
                onChange={handleTyping}
              />
            </div>

            <button type="submit" style={styles.button}>
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    minHeight: '100vh',
    minHeight: '100svh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start', // Pins box to the left
    paddingLeft: '100px',     // Generous spacing from the left screen edge
    fontFamily: 'sans-serif',
    color: '#fff',
    boxSizing: 'border-box',
    overflowY: 'auto'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 1,
  },
  headingContainer: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    textAlign: 'center',
    width: '90%',
    maxWidth: '800px'
  },
  mainHeading: {
    fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
    fontWeight: '800',
    letterSpacing: '1px',
    margin: 0,
    color: '#ffffff',
    textShadow: '0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.5), 0 0 30px rgba(220, 38, 38, 0.3)',
  },
  headingUnderline: {
    width: '80px',
    height: '3px',
    backgroundColor: '#dc2626',
    margin: '6px auto 0 auto',
    borderRadius: '2px',
    boxShadow: '0 0 10px #dc2626',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '420px',
    marginTop: '40px',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(18, 15, 14, 0.92)',
    border: '1px solid rgba(153, 27, 27, 0.4)',
    padding: '28px 24px',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    position: 'relative',
    marginTop: '35px',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box'
  },
  cloudWrapper: {
    position: 'absolute',
    top: '-55px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '110px',
    height: '55px',
    zIndex: 10,
  },
  cloudBase: {
    position: 'absolute',
    bottom: 0,
    width: '110px',
    height: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  cloudPuff1: {
    position: 'absolute',
    top: '2px',
    left: '35px',
    width: '42px',
    height: '42px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
  },
  cloudPuff2: {
    position: 'absolute',
    top: '10px',
    left: '12px',
    width: '32px',
    height: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
  },
  cloudPuff3: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    width: '32px',
    height: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
  },
  eyeLeft: {
    position: 'absolute',
    top: '12px',
    left: '38px',
    width: '5px',
    height: '7px',
    backgroundColor: '#222',
    borderRadius: '50%',
    transition: 'transform 0.15s ease-out',
  },
  eyeRight: {
    position: 'absolute',
    top: '12px',
    right: '38px',
    width: '5px',
    height: '7px',
    backgroundColor: '#222',
    borderRadius: '50%',
    transition: 'transform 0.15s ease-out',
  },
  blushLeft: {
    position: 'absolute',
    top: '17px',
    left: '32px',
    width: '8px',
    height: '4px',
    backgroundColor: '#ffb6c1',
    borderRadius: '50%',
  },
  blushRight: {
    position: 'absolute',
    top: '17px',
    right: '32px',
    width: '8px',
    height: '4px',
    backgroundColor: '#ffb6c1',
    borderRadius: '50%',
  },
  smile: {
    position: 'absolute',
    top: '17px',
    left: '51px',
    width: '8px',
    height: '5px',
    borderBottom: '2px solid #222',
    borderRadius: '50%',
  },
  handLeft: {
    position: 'absolute',
    bottom: '-4px',
    left: '18px',
    width: '14px',
    height: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  handRight: {
    position: 'absolute',
    bottom: '-4px',
    right: '18px',
    width: '14px',
    height: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '15px',
    borderBottom: '1px solid #374151',
  },
  tabButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    outline: 'none',
  },
  header: {
    marginBottom: '18px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '13px',
    margin: '4px 0 0 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    color: '#d1d5db',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#1f1a18',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '6px',
  },
};

export default Login;
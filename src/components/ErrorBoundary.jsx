import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DisasterVerse Runtime Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <span style={styles.icon}>⚠️</span>
            <h2 style={styles.title}>System Alert — DisasterVerse Recovery</h2>
            <p style={styles.desc}>
              An unexpected module error occurred. DisasterVerse defensive recovery prevented a system blank screen.
            </p>
            {this.state.error && (
              <pre style={styles.errorBox}>
                {this.state.error.toString()}
              </pre>
            )}
            <div style={styles.btnRow}>
              <button style={styles.button} onClick={this.handleReset}>
                🔄 Return to Safety Dashboard
              </button>
              <button style={styles.buttonSecondary} onClick={() => window.location.reload()}>
                ⚡ Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0d0c',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#1c1917',
    border: '1px solid #dc2626',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
  },
  icon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px'
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#ef4444',
    margin: '0 0 12px 0'
  },
  desc: {
    color: '#a8a29e',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0 0 20px 0'
  },
  errorBox: {
    backgroundColor: '#0c0a09',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'left',
    overflowX: 'auto',
    marginBottom: '24px',
    border: '1px solid #444'
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  },
  buttonSecondary: {
    backgroundColor: '#292524',
    color: '#e7e5e4',
    border: '1px solid #444',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default ErrorBoundary;

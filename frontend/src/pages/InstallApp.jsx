import React, { useState, useEffect } from 'react';

// Page for app installation instructions
const InstallApp = () => {
  // --- RESPONSIVE LOGIC (Mobile check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;

  return (
    <div style={{
      ...styles.pageBackground,
      padding: isMobile ? '20px 10px' : '40px 20px'
    }}>
      <div style={{
        ...styles.container,
        maxWidth: isMobile ? '100%' : '600px'
      }}>
        <div style={styles.header}>
          <h1 style={{
            ...styles.mainTitle,
            fontSize: isMobile ? '26px' : '32px'
          }}>Install the App</h1>
          <p style={{
            ...styles.subtitle,
            fontSize: isMobile ? '14px' : '16px'
          }}>Install the app on your home screen — fast and easy!</p>
        </div>

        {/* Card 1: Installation Steps */}
        <div style={{
          ...styles.card,
          padding: isMobile ? '20px' : '30px'
        }}>
          <div style={styles.iconContainer}>
            {/* Download Icon SVG */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <h2 style={styles.cardTitle}>Install via Browser</h2>
          <p style={styles.cardSubtitle}>Follow these steps:</p>
          
          <div style={{
            ...styles.stepsBox,
            padding: isMobile ? '15px' : '20px'
          }}>
            <ol style={styles.list}>
              <li style={{...styles.listItem, fontSize: isMobile ? '14px' : '15px'}}>Tap the browser menu (<strong>⋮</strong>) (top right corner)</li>
              <li style={{...styles.listItem, fontSize: isMobile ? '14px' : '15px'}}>Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></li>
              <li style={{...styles.listItem, fontSize: isMobile ? '14px' : '15px'}}>Tap <strong>"Install"</strong> — Done! ✅</li>
            </ol>
          </div>
          
          <div style={{
            ...styles.warningText,
            fontSize: isMobile ? '12px' : '14px'
          }}>
            ⚠️ This only works in <strong>Chrome</strong> or <strong>Edge</strong> browsers
          </div>
        </div>

        {/* Card 2: Benefits */}
        <div style={{
          ...styles.card,
          padding: isMobile ? '20px' : '30px'
        }}>
          <h2 style={{
            ...styles.benefitsTitle,
            fontSize: isMobile ? '17px' : '18px'
          }}>Why install?</h2>
          <ul style={styles.benefitsList}>
            <li style={{...styles.benefitItem, fontSize: isMobile ? '14px' : '15px'}}><span style={styles.checkIcon}>✓</span> Works offline</li>
            <li style={{...styles.benefitItem, fontSize: isMobile ? '14px' : '15px'}}><span style={styles.checkIcon}>✓</span> Loads very fast</li>
            <li style={{...styles.benefitItem, fontSize: isMobile ? '14px' : '15px'}}><span style={styles.checkIcon}>✓</span> Access from home screen</li>
            <li style={{...styles.benefitItem, fontSize: isMobile ? '14px' : '15px'}}><span style={styles.checkIcon}>✓</span> No app store needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Styles matching your image ---
const styles = {
  pageBackground: {
    backgroundColor: '#f4f6f8', // Light background exactly like the image
    minHeight: '100vh',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center'
  },
  container: {
    maxWidth: '600px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px',
    color: '#333'
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111',
    margin: '0 0 15px 0'
  },
  cardSubtitle: {
    textAlign: 'center',
    fontSize: '15px',
    color: '#333',
    margin: '0 0 20px 0',
    fontWeight: '500'
  },
  stepsBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  list: {
    margin: 0,
    paddingLeft: '20px',
    color: '#555',
    lineHeight: '1.8'
  },
  listItem: {
    marginBottom: '10px',
    fontSize: '15px'
  },
  warningText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '15px'
  },
  benefitsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '20px',
    marginTop: 0
  },
  benefitsList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    lineHeight: '2'
  },
  benefitItem: {
    fontSize: '15px',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px'
  },
  checkIcon: {
    color: '#10b981', // Green color
    fontWeight: 'bold',
    marginRight: '10px',
    fontSize: '18px'
  }
};

export default InstallApp;
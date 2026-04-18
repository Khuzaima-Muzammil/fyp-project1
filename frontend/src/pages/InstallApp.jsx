import React from 'react';

const InstallApp = () => {
  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>Install Our App</h1>
          <p style={styles.subtitle}>Apni home screen par app install karein — fast, offline-ready!</p>
        </div>

        {/* Card 1: Installation Steps */}
        <div style={styles.card}>
          <div style={styles.iconContainer}>
            {/* Download Icon SVG */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          <h2 style={styles.cardTitle}>Browser se Install Karein</h2>
          <p style={styles.cardSubtitle}>Ye steps follow karein:</p>
          
          <div style={styles.stepsBox}>
            <ol style={styles.list}>
              <li style={styles.listItem}>Browser menu (<strong>⋮</strong>) tap karein (upar right corner)</li>
              <li style={styles.listItem}><strong>"Install app"</strong> ya <strong>"Add to Home Screen"</strong> select karein</li>
              <li style={styles.listItem}><strong>"Install"</strong> tap karein — Done! ✅</li>
            </ol>
          </div>
          
          <div style={styles.warningText}>
            ⚠️ Ye sirf <strong>Chrome</strong> ya <strong>Edge</strong> browser mein kaam karega
          </div>
        </div>

        {/* Card 2: Benefits */}
        <div style={styles.card}>
          <h2 style={styles.benefitsTitle}>Kyun install karein?</h2>
          <ul style={styles.benefitsList}>
            <li style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> Offline kaam karta hai</li>
            <li style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> Bahut fast load hota hai</li>
            <li style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> Home screen se access</li>
            <li style={styles.benefitItem}><span style={styles.checkIcon}>✓</span> App store ki zaroorat nahi</li>
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
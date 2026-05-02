// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';

const Privacy = () => {
  // --- RESPONSIVE LOGIC (Mobile & Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <div style={{
      ...styles.container,
      margin: isMobile ? '20px auto' : isTablet ? '30px auto' : '40px auto',
      padding: isMobile ? '20px' : isTablet ? '25px' : '30px',
      width: isMobile ? '90%' : isTablet ? '85%' : '800px'
    }}>
      {/* Main page heading */}
      <h1 style={{...styles.heading, fontSize: isMobile ? '24px' : isTablet ? '26px' : '28px'}}>Privacy Policy</h1>
      <p style={styles.text}>Your privacy is our top priority. We protect your data through SSL encryption.</p>
      
      {/* Point 1: Data collection */}
      <h3 style={{...styles.subHeading, fontSize: isMobile ? '18px' : isTablet ? '19px' : '20px'}}>1. Data Collection</h3>
      <p style={styles.text}>We only collect data that is necessary for processing your order (such as name, address, email). We also use cookies to improve website performance.</p>
      
      {/* Point 2: Data security */}
      <h3 style={{...styles.subHeading, fontSize: isMobile ? '18px' : isTablet ? '19px' : '20px'}}>2. Data Security</h3>
      <p style={styles.text}>Your data is completely safe on our servers and is not sold to any third party. Your data is only used for order processing and providing a better user experience.</p>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  heading: { fontSize: '28px', color: '#111', marginBottom: '20px' },
  subHeading: { fontSize: '20px', color: '#333', marginTop: '20px', marginBottom: '10px' },
  text: { fontSize: '16px', color: '#555', lineHeight: '1.6' }
};

export default Privacy;
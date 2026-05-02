// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';

const Shipping = () => {
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
      ...styles.container,
      margin: isMobile ? '20px auto' : '40px auto',
      padding: isMobile ? '20px' : '30px',
      width: isMobile ? '90%' : '800px'
    }}>
      {/* Main page heading */}
      <h1 style={{...styles.heading, fontSize: isMobile ? '24px' : '28px'}}>Shipping Policy</h1>
      
      {/* Delivery Time details */}
      <h3 style={{...styles.subHeading, fontSize: isMobile ? '18px' : '20px'}}>Delivery Time</h3>
      <p style={styles.text}>2-3 days in major cities, while remote areas take 5-7 working days.</p>
      
      {/* Shipping Charges details */}
      <h3 style={{...styles.subHeading, fontSize: isMobile ? '18px' : '20px'}}>Shipping Charges</h3>
      <p style={styles.text}>Delivery fee across Pakistan is Rs. 250. Delivery is absolutely free for orders above Rs. 5000.</p>
      
      {/* Return/Exchange details */}
      <h3 style={{...styles.subHeading, fontSize: isMobile ? '18px' : '20px'}}>Returns Policy</h3>
      <p style={styles.text}>You can return or exchange the product within 7 days if it is in its original packaging.</p>
    </div>
  );
};

// --- Missing Styles Block ---
const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  heading: { fontSize: '28px', color: '#111', marginBottom: '20px' },
  subHeading: { fontSize: '20px', color: '#333', marginTop: '20px', marginBottom: '10px' },
  text: { fontSize: '16px', color: '#555', lineHeight: '1.6' }
};

export default Shipping;
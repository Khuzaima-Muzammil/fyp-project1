// Importing React and necessary hooks
import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const Contact = () => {
  const { settings } = useContext(ShopContext);
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
      {/* Page heading */}
      <h1 style={{...styles.heading, fontSize: isMobile ? '24px' : isTablet ? '26px' : '28px'}}>Contact Us</h1>
      <p style={styles.text}>If you need any help, please contact us through the following channels:</p>
      
      {/* Information box with details */}
      <div style={styles.infoBox}>
        <p><strong>Email:</strong> {settings?.businessInfo?.email || 'support@fashionstore.com'}</p>
        <p><strong>Phone:</strong> {settings?.businessInfo?.phone || '+92-300-1234567'}</p>
        <p><strong>Address:</strong> {settings?.businessInfo?.address || 'Fashion Store, Gulberg III, Lahore, Pakistan'}</p>
      </div>
    </div>
  );
};

// --- This part was added for styling ---
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
  text: { fontSize: '16px', color: '#555', lineHeight: '1.6' },
  infoBox: { marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', lineHeight: '1.8' }
};

export default Contact;
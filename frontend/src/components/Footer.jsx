import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const [isPWA, setIsPWA] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Ye function check karega ke app PWA (Standalone) mode mein hai ya aam browser mein
    const checkIsPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches; // yani alag window me khol kr match krna
      const isIOSStandalone = window.navigator.standalone === true; // iPhones ke liye
      return isStandalone || isIOSStandalone;
    };

    // Jaise hi component load ho, check karo
    setIsPWA(checkIsPWA());

    // Agar user browser mein hi app install kar le, toh foran state update kar do
    const handleAppInstalled = () => {
      setIsPWA(true);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled); //page change krnai pr event listener na chalta rhai is liye isai remove krdo
    };
  }, []);

  // HIDE LOGIC: Agar PWA mein open hai, YA current page install-app hai, toh hide kar do
  const hideInstallLink = isPWA || location.pathname === '/install-app';

  return (
    <footer style={styles.footerContainer}>
      <div style={styles.linksContainer}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/all-products" style={styles.link}>Products</Link>
        <Link to="/contact" style={styles.link}>Contact</Link>
        <Link to="/privacy" style={styles.link}>Privacy</Link>
        
        {/* MAGIC CONDITION: Sirf tab dikhega jab dono hide conditions false hongi */}
        {!hideInstallLink && ( // if else a skta tha lekin ye short hai aur bracket is liye kyunkai jsx yani html me javascript direct likh nhi sktai
          <Link to="/install-app" style={styles.link}>Install App</Link>
        )}
        
        <Link to="/shipping" style={styles.link}>Shipping</Link>
      </div>

      <div style={styles.copyright}>
        © 2026 Shop. All rights reserved.
      </div>
    </footer>
  );
};

// --- Styles ---
const styles = {
  footerContainer: {
    backgroundColor: '#111',
    color: '#fff',
    padding: '40px 20px 20px 20px',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 'auto', 
  },
  linksContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '24px',
  },
  link: {
    color: '#e5e7eb',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  copyright: {
    fontSize: '13px',
    color: '#9ca3af',
    borderTop: '1px solid #333',
    paddingTop: '20px',
    marginTop: '10px',
  }
};

export default Footer;
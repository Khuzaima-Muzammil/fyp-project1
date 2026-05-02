// Importing React and Link for navigation
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShopContext } from '../context/ShopContext';

const Footer = () => {
  const { settings } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- RESPONSIVE LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <footer style={{...styles.footerContainer, padding: isMobile ? '40px 15px 20px 15px' : '60px 20px 20px 20px'}}>
      <div style={{ 
        ...styles.container, 
        flexDirection: isMobile ? 'column' : 'row', 
        flexWrap: isTablet ? 'wrap' : 'nowrap',
        gap: isMobile ? '30px' : isTablet ? '40px' : '60px' 
      }}>
        
        {/* 1. About Section */}
        <div style={{ flex: isMobile ? '1' : isTablet ? '1 1 40%' : '1.5' }}>
          <h2 style={styles.logoText}>LUMIERE</h2>
          <p style={styles.descText}>
            We provide high-quality premium products at affordable prices. Our mission is to make your lifestyle better with our unique collection.
          </p>
          <div style={styles.socialIcons}>
            <a href={settings?.businessInfo?.socialMedia?.facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer" style={styles.iconCircle}><Facebook size={18} /></a>
            <a href={settings?.businessInfo?.socialMedia?.twitter || "https://twitter.com"} target="_blank" rel="noopener noreferrer" style={styles.iconCircle}><Twitter size={18} /></a>
            <a href={settings?.businessInfo?.socialMedia?.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" style={styles.iconCircle}><Instagram size={18} /></a>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div style={{ flex: isMobile ? '1' : isTablet ? '1 1 20%' : '1' }}>
          <h4 style={styles.headingStyle}>QUICK LINKS</h4>
          <ul style={styles.listStyle}>
            <li><Link to="/" style={styles.linkStyle}>Home</Link></li>
            <li><Link to="/all-products" style={styles.linkStyle}>Shop</Link></li>
            <li><Link to="/cart" style={styles.linkStyle}>Cart</Link></li>
            <li><Link to="/privacy" style={styles.linkStyle}>Privacy</Link></li>
            <li><Link to="/shipping" style={styles.linkStyle}>Shipping</Link></li>
          </ul>
        </div>

        {/* 3. Contact Info */}
        <div style={{ flex: isMobile ? '1' : isTablet ? '1 1 30%' : '1' }}>
          <h4 style={styles.headingStyle}>CONTACT US</h4>
          <ul style={styles.listStyle}>
            <li style={styles.contactItem}><MapPin size={16} color="#aaa" /> {settings?.businessInfo?.address || 'Lahore, Pakistan'}</li>
            <li style={styles.contactItem}><Phone size={16} color="#aaa" /> {settings?.businessInfo?.phone || '+92 300 1234567'}</li>
            <li style={styles.contactItem}><Mail size={16} color="#aaa" /> {settings?.businessInfo?.email || 'info@lumiere.com'}</li>
          </ul>
        </div>

        {/* 4. Newsletter */}
        <div style={{ flex: isMobile ? '1' : isTablet ? '1 1 100%' : '1.5', marginTop: isTablet ? '20px' : '0' }}>
          <h4 style={styles.headingStyle}>NEWSLETTER</h4>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '15px' }}>Subscribe to get latest updates and offers.</p>
          <form 
            style={styles.inputGroup} 
            onSubmit={async (e) => {
              e.preventDefault();
              if (email && !isSubmitting) {
                setIsSubmitting(true);
                try {
                  await axios.post('http://localhost:5004/api/newsletter/subscribe', { email });
                  toast.success("Subscribed to newsletter successfully!");
                  setEmail("");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Subscription failed");
                } finally {
                  setIsSubmitting(false);
                }
              }
            }}
          >
            <input 
              type="email" 
              placeholder="Your email address" 
              style={styles.inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <button type="submit" style={styles.sendBtn} disabled={isSubmitting}>
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

      <div style={styles.bottomBar}>
        <p>© 2024 LUMIERE. All rights reserved.</p>
      </div>
    </footer>
  );
};

// --- Styles ---
const styles = {
  footerContainer: {
    backgroundColor: '#111',
    color: '#fff',
    padding: '60px 20px 20px 20px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 'auto', 
  },
  container: {
    display: 'flex',
    maxWidth: '1200px',
    margin: '0 auto',
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    letterSpacing: '2px', 
  },
  descText: {
    color: '#aaa',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  socialIcons: {
    display: 'flex',
    gap: '15px',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#222',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    textDecoration: 'none',
  },
  headingStyle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '25px',
    color: '#fff',
  },
  listStyle: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  linkStyle: {
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '12px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#aaa',
    fontSize: '14px',
    marginBottom: '15px',
  },
  inputGroup: {
    display: 'flex',
    height: '45px',
  },
  inputStyle: {
    backgroundColor: '#222',
    border: '1px solid #333',
    color: '#fff',
    padding: '0 15px', 
    flex: 1,
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#fff',
    border: 'none',
    padding: '0 15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    borderTop: '1px solid #333',
    paddingTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '40px',
  }
};

export default Footer;
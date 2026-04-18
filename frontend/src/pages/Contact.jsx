import React from 'react';

const Contact = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Contact Us</h1>
      <p style={styles.text}>Agar aapko kisi kism ki madad chahiye, toh humse raabta karein:</p>
      <div style={styles.infoBox}>
        <p><strong>Email:</strong> support@smartshop.com</p>
        <p><strong>Phone:</strong> +92 300 1234567</p>
        <p><strong>Address:</strong> 123 Main Street, Lahore, Pakistan</p>
      </div>
    </div>
  );
};

// --- Ye wala hissa miss ho gaya tha ---
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
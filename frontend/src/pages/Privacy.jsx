import React from 'react';

const Privacy = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Privacy Policy</h1>
      <p style={styles.text}>Aapki privacy hamari pehli tarjeeh (priority) hai.</p>
      <h3 style={styles.subHeading}>1. Data Collection</h3>
      <p style={styles.text}>Hum sirf wahi data collect karte hain jo order process karne ke liye zaroori hota hai (jaise naam, address, email).</p>
      <h3 style={styles.subHeading}>2. Data Security</h3>
      <p style={styles.text}>Aapka data hamare servers par bilkul mehfooz hai aur kisi third-party ko nahi becha jata.</p>
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
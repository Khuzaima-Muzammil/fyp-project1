import React from 'react';

const Shipping = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Shipping Policy</h1>
      <h3 style={styles.subHeading}>Delivery Time</h3>
      <p style={styles.text}>Normal orders 3 se 5 working days mein deliver ho jate hain.</p>
      <h3 style={styles.subHeading}>Shipping Charges</h3>
      <p style={styles.text}>Rs. 2500 se upar ke orders par shipping bilkul FREE hai. Us se kam par Rs. 200 standard charges apply honge.</p>
      <h3 style={styles.subHeading}>Returns</h3>
      <p style={styles.text}>Agar product mein koi masla ho toh aap 7 din ke andar return ya exchange karwa sakte hain.</p>
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
// Importing React and icons
import React, { useContext, useState, useEffect } from 'react';
import { CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { ShopContext } from '../context/ShopContext'; // For global state

const NotificationToast = () => {
  // Extracting message and toast type (success/error) from ShopContext
  const { showToast, toastMsg, toastType } = useContext(ShopContext);

  // --- RESPONSIVE LOGIC (Mobile check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;

  // If the toast is not supposed to be shown, return null
  if (!showToast) return null;

  return (
    <div style={{
      ...toastContainer, 
      backgroundColor: toastType === 'error' ? '#ef4444' : '#111',
      bottom: isMobile ? '20px' : '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: isMobile ? '90%' : 'max-content'
    }}>
      {/* Checking the icon based on toast type */}
      {toastType === 'success' && <CheckCircle size={18} color="#4ade80" />}
      {toastType === 'remove' && <Trash2 size={18} color="#4ade80" />}
      {toastType === 'error' && <AlertTriangle size={18} color="#fff" />}
      <span style={{fontSize: isMobile ? '13px' : '15px'}}>{toastMsg}</span>
    </div>
  );
};

const toastContainer = {
  position: 'fixed',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  zIndex: 10003,
  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  animation: 'slideUp 0.3s ease-out'
};

export default NotificationToast;

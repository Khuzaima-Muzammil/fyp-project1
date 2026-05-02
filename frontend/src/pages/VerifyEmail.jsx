import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';

// Email verification page where user confirms their account
const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email...'); // Verifying your email...

  // --- RESPONSIVE LOGIC (Mobile check) ---
  // State to track screen width
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768; // Mobile screen check

  useEffect(() => {
    // Function to verify email via API call
    const verifyEmail = async () => {
      try {
        const res = await axios.post('http://localhost:5004/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(res.data.message || res.data.msg);
      } catch (err) {
        setStatus('error');
        // If link is expired or invalid, show error message
        setMessage(err.response?.data?.message || err.response?.data?.msg || 'Verification failed. Link might be invalid or expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div style={{ 
      padding: isMobile ? '60px 15px' : '100px 20px', 
      textAlign: 'center', 
      minHeight: '60vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ 
        maxWidth: isMobile ? '100%' : '400px', 
        width: '100%',
        margin: 'auto', 
        padding: isMobile ? '25px' : '40px', 
        border: '1px solid #eee', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
        backgroundColor: '#fff' 
      }}>
        
        {status === 'loading' && (
          <div>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #111', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700' }}>Verifying...</h2>
            <p style={{ color: '#666', fontSize: isMobile ? '14px' : '16px' }}>Please wait, we are checking your email.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={isMobile ? 50 : 60} color="#10b981" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: isMobile ? '22px' : '24px', fontWeight: '800', marginBottom: '10px' }}>Verified!</h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: isMobile ? '14px' : '16px' }}>{message}</p>
            <Link to="/login" style={{ 
              display: 'inline-block', 
              backgroundColor: '#111', 
              color: '#fff', 
              textDecoration: 'none', 
              padding: isMobile ? '10px 20px' : '12px 30px', 
              borderRadius: '8px', 
              fontWeight: '700',
              width: isMobile ? '100%' : 'auto'
            }}>
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={isMobile ? 50 : 60} color="#ef4444" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', marginBottom: '10px' }}>Verification Failed</h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: isMobile ? '14px' : '16px' }}>{message}</p>
            <Link to="/register" style={{ 
              display: 'inline-block', 
              backgroundColor: '#f3f4f6', 
              color: '#111', 
              textDecoration: 'none', 
              padding: isMobile ? '10px 20px' : '12px 30px', 
              borderRadius: '8px', 
              fontWeight: '700',
              width: isMobile ? '100%' : 'auto'
            }}>
              Back to Register
            </Link>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VerifyEmail;

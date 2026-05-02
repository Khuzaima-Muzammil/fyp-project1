// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import { Link } from 'react-router-dom'; // For navigation between pages
import { Mail, ArrowLeft } from 'lucide-react'; // Icons
import toast, { Toaster } from 'react-hot-toast'; // For notifications

const ForgotPassword = () => {
  // States to save email and submission status
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- RESPONSIVE LOGIC (Mobile & Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Function to submit the form (to send reset link)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Sending reset link...');

    try {
      // Sending request to backend
      await axios.post('http://localhost:5004/api/auth/forgot-password', { email });
      toast.success('Password reset link has been sent to your email', { id: loadingToast, duration: 4000 });
      setIsSuccess(true);
    } catch (err) {
      // Show error if something goes wrong
      toast.error(err.response?.data?.message || err.response?.data?.msg || 'Failed to send link. Please check your email.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? '40px 15px' : isTablet ? '60px 20px' : '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfcfc' }}>
      <Toaster position="top-center" />
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: isMobile ? '25px' : isTablet ? '35px' : '40px', 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)', 
        border: '1px solid #eee' 
      }}>
        
        {/* Link to go back to Login */}
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#666', fontSize: '13px', marginBottom: '20px', fontWeight: '700' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <h2 style={{ fontSize: isMobile ? '22px' : isTablet ? '23px' : '24px', fontWeight: '800', marginBottom: '10px' }}>Forgot Password?</h2>
        
        {!isSuccess ? (
          <>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px', lineHeight: '1.5' }}>
              Enter your email address, and we will send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 12px 12px 40px', 
                      borderRadius: '8px', 
                      border: email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) ? '2px solid #e11d48' : '1px solid #ddd', 
                      fontSize: '14px', 
                      outline: 'none', 
                      boxSizing: 'border-box' 
                    }}
                  />
                </div>
                {email && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email) && (
                  <p style={{ color: '#e11d48', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>Please enter a valid Gmail address (name@gmail.com)</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: '#111', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  fontSize: '15px', 
                  cursor: (isSubmitting || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) ? 'not-allowed' : 'pointer', 
                  opacity: (isSubmitting || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) ? 0.6 : 1, 
                  transition: '0.3s'
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          /* Success message after link is sent */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mail size={30} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>Check Your Email</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              We have sent a password reset link to <b>{email}</b>. Please check your email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

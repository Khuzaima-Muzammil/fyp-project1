// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import { useParams, useNavigate } from 'react-router-dom'; // For URL parameters and navigation
import { Lock, CheckCircle } from 'lucide-react'; // Icons
import toast, { Toaster } from 'react-hot-toast'; // For toast messages

const ResetPassword = () => {
  const { token } = useParams(); // Extracting token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // --- RESPONSIVE LOGIC (Mobile & Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Function to submit form (to save new password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Checking if password meets requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Checking if both passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Saving new password...');

    try {
      // Sending request to backend to update password
      await axios.put(`http://localhost:5004/api/auth/reset-password/${token}`, { password });
      toast.success('Password changed successfully!', { id: loadingToast, duration: 2000 });
      setIsSuccess(true);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.msg || 'Failed to change password. The link might be expired.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password validation function
  const validatePassword = (pass) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length < minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Must contain at least one uppercase letter (A-Z)";
    if (!hasLowerCase) return "Must contain at least one lowercase letter (a-z)";
    if (!hasNumber) return "Must contain at least one number (0-9)";
    if (!hasSpecialChar) return "Must contain at least one special character (@, #, $, etc.)";
    return null;
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
        
        <h2 style={{ fontSize: isMobile ? '22px' : isTablet ? '23px' : '24px', fontWeight: '800', marginBottom: '10px' }}>Set New Password</h2>
        
        {!isSuccess ? (
          <>
            {/* Password requirements */}
            <div style={{ marginBottom: '25px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
              <p style={{ color: '#444', fontSize: '12px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>Requirements:</p>
              <ul style={{ color: '#666', fontSize: '11px', margin: '0', paddingLeft: '18px', lineHeight: '1.6', fontWeight: '600' }}>
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@, #, $, etc.)</li>
              </ul>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* New Password Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 12px 12px 40px', 
                      borderRadius: '8px', 
                      border: error && error !== "Passwords do not match" ? '2px solid #e11d48' : '1px solid #ddd', 
                      fontSize: '14px', 
                      outline: 'none', 
                      boxSizing: 'border-box' 
                    }}
                  />
                </div>
                {error && error !== "Passwords do not match" && (
                  <p style={{ color: '#e11d48', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>{error}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error === "Passwords do not match") setError('');
                    }}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 12px 12px 40px', 
                      borderRadius: '8px', 
                      border: error === "Passwords do not match" ? '2px solid #e11d48' : '1px solid #ddd', 
                      fontSize: '14px', 
                      outline: 'none', 
                      boxSizing: 'border-box' 
                    }}
                  />
                </div>
                {error === "Passwords do not match" && (
                  <p style={{ color: '#e11d48', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>{error}</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', padding: '14px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: '0.3s'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          /* Success message */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={30} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>Password Reset Successful!</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              Your password has been changed successfully. Redirecting you to the login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

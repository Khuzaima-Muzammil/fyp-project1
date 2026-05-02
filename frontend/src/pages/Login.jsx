// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import { Link } from 'react-router-dom'; // For navigation between pages
import { Loader2 } from 'lucide-react'; // Icon

const Login = () => {
  // States for email, password, and errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  // --- RESPONSIVE LOGIC (Mobile & Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Function to validate Gmail address
  const validateEmail = (inputEmail) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(inputEmail);
  };

  // Function to handle login button click
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 

    // 1. Frontend Check (Check email first)
    if (!validateEmail(email)) {
      setError("Please enter a valid Gmail address (e.g., name@gmail.com)");
      return;
    }

    setIsLoading(true);
    try {
      // 2. Request Token (Login request)
      const res = await axios.post('http://localhost:5004/api/auth/login', { email, password });
      
      const token = res.data.token;
      localStorage.setItem('token', token); // Save token in browser
      
      // 3. Get User Details to check Role (Admin or User)
      const userRes = await axios.get('http://localhost:5004/api/auth/me', {
        headers: { 'x-auth-token': token }
      });

      // 4. Redirect based on role
      if (userRes.data.role === 'admin') {
        window.location.href = '/admin-dashboard'; // Redirect to admin dashboard
      } else {
        window.location.href = '/'; // Redirect to home page
      }
      
    } catch (err) {
      // Show error message if login fails
      const message = err.response?.data?.msg || "Invalid email or password. Please try again.";
      setError(message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? '60px 20px' : isTablet ? '80px 40px' : '100px', textAlign: 'center' }}>
      <form onSubmit={handleLogin} style={{ 
        maxWidth: '350px', 
        margin: 'auto', 
        padding: isMobile ? '25px' : isTablet ? '28px' : '30px', 
        border: '1px solid #eee', 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ marginBottom: '25px', fontWeight: '800', fontSize: isMobile ? '24px' : isTablet ? '26px' : '28px' }}>Sign In</h2>

        {/* --- ERROR MESSAGE BOX --- */}
        {error && (
          <div style={{ 
            backgroundColor: '#fff1f2', 
            color: '#e11d48', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
            border: '1px solid #fda4af',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Email Input Field */}
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="example@gmail.com" 
            style={{
              ...inputStyle, 
              border: email && !validateEmail(email) ? '2px solid #e11d48' : '1px solid #ddd',
              backgroundColor: email && !validateEmail(email) ? '#fff1f2' : '#fff'
            }} 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if(error) setError(''); 
            }} 
            required 
          />
          {email && !validateEmail(email) && (
            <p style={{ color: '#e11d48', fontSize: '11px', marginTop: '5px', fontWeight: '600' }}>Enter a valid Gmail address (name@gmail.com)</p>
          )}
        </div>

        {/* Password Input Field */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
          <input 
            type="password" 
            placeholder="Enter your password" 
            style={inputStyle} 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if(error) setError('');
            }} 
            required 
          />
        </div>

        {/* Login Button */}
        <button 
          type="submit" 
          style={{
            ...buttonStyle,
            opacity: (!validateEmail(email) || !password || isLoading) ? 0.6 : 1,
            cursor: (!validateEmail(email) || !password || isLoading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          disabled={!validateEmail(email) || !password || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Register Page Link */}
        <div style={{ marginTop: '30px', fontSize: '14px' }}>
          <p style={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#10b981', fontWeight: '800', textDecoration: 'none' }}>
              Create New Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  marginTop: '5px', 
  borderRadius: '8px', 
  border: '1px solid #ddd', 
  boxSizing: 'border-box',
  outline: 'none',
  fontSize: '14px'
};

const buttonStyle = { 
  width: '100%', 
  padding: '12px', 
  backgroundColor: '#111', 
  color: '#fff', 
  border: 'none', 
  cursor: 'pointer', 
  borderRadius: '8px', 
  fontWeight: '700', 
  fontSize: '16px',
  transition: '0.3s'
};

export default Login;
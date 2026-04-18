import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // 1. Token save karna
      localStorage.setItem('token', res.data.token);
      
      // 2. SUCCESS ALERT DEIN (Optional, is se user ko pata chal jayega)
      alert("Login Successful!");

      // 3. ROLE KE MUTABIQ REDIRECT KAREIN (Hard Refresh ke sath)
      // Is se undefined loadUser wala error hamesha ke liye khatam ho jayega
      if (res.data.user && res.data.user.role === 'admin') {
        window.location.href = '/admin-dashboard'; 
      } else {
        window.location.href = '/profile'; 
      }
      
    } catch (err) {
      alert(err.response?.data?.msg || "Login Failed. Please check your email and password.");
    }
  };

  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: 'auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          style={inputStyle} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={inputStyle} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={buttonStyle}>Login</button>

        {/* --- SIGNUP LINK SECTION --- */}
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <p style={{ color: '#555' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ddd' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' };

export default Login;
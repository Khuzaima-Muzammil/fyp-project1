import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { 
      setUser(null); 
      setLoading(false); 
      return; 
    }
    try {
      const res = await axios.get('http://localhost:5004/api/auth/me', { 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'x-auth-token': token 
        } 
      });
      setUser(res.data);
    } catch (err) { 
      localStorage.removeItem('token'); 
      setUser(null); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lumiere_cart');
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loadUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

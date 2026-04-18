// check krai Authorized ya login hai kai nhi
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(ShopContext);

  // Agar loading ho rahi hai toh ek simple spinner dikhao
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Agar loading khatam ho gayi aur user nahi mila, toh login par bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
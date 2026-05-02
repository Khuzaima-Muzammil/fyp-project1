// Importing React and Context
import React, { useContext, useState, useEffect } from 'react';
import { X, Calculator, TrendingUp } from 'lucide-react'; // For icons
import { ShopContext } from '../context/ShopContext'; // For global data

const BudgetPlanner = () => {
  // Extracting budget-related information from ShopContext
  const { 
    isBudgetOpen, setIsBudgetOpen, income, setIncome, 
    cartTotal, remainingBudget, isOverBudget, exceededAmount, userBudget,
    isNotAdmin
  } = useContext(ShopContext);

  // --- RESPONSIVE LOGIC (Mobile check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;

  // If user is an admin or the budget planner is not open, return null
  if (!isNotAdmin || !isBudgetOpen) return null;

  return (
    <div style={modalOverlay}>
      <div style={{...modalContent, width: isMobile ? '90%' : '380px'}}>
        {/* Modal header */}
        <div style={modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={20} /> 
            <span style={{fontWeight: 'bold'}}>Budget Planner</span>
          </div>
          <X onClick={() => setIsBudgetOpen(false)} style={{ cursor: 'pointer' }} />
        </div>

        <div style={{ padding: isMobile ? '20px' : '25px' }}>
          {/* Input field for user's budget */}
          <div style={inputGroup}>
            <label style={labelStyle}>My Total Budget (Rs.)</label>
            <div style={inputWrapper}>
              <TrendingUp size={18} color="#10b981" />
              <input 
                type="number" 
                placeholder="Example: 10000" 
                style={cleanInput} 
                value={income} 
                onChange={(e) => setIncome(e.target.value)} 
              />
            </div>
          </div>
          
          {/* Section to display budget calculation results */}
          {userBudget > 0 && (
            <div style={{...resultCard, border: isOverBudget ? '2px solid #ef4444' : 'none', backgroundColor: isOverBudget ? '#fef2f2' : '#f9fafb'}}>
              <p style={{ margin: '0 0 10px 0', fontSize: isMobile ? '14px' : '15px', color: '#333' }}>
                You have spent <strong>Rs. {cartTotal}</strong>, <strong>Rs. {remainingBudget > 0 ? remainingBudget : 0}</strong> remaining.
              </p>
              
              {/* Display warning if the budget is exceeded */}
              {isOverBudget && (
                <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '0', fontSize: isMobile ? '13px' : '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  ⚠️ Budget exceeded by Rs. {exceededAmount}!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 };
const modalContent = { backgroundColor: '#fff', borderRadius: '24px', width: '380px', overflow: 'hidden' };
const modalHeader = { backgroundColor: '#111', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px', display: 'block' };
const inputWrapper = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px' };
const cleanInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', width: '100%' };
const resultCard = { padding: '20px', borderRadius: '16px', textAlign: 'center' };

export default BudgetPlanner;

import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';

const Cart = () => {
  // NOTE: 'income' yahan ShopContext se li ja rahi hai
  const { cart, user, removeFromCart, updateQuantity, loading, income } = useContext(ShopContext);
  const navigate = useNavigate();

  // --- MOBILE CHECK LOGIC ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  
  // --- SMART BUDGET LOGIC ---
  const userBudget = Number(income) || 0;
  const isOverBudget = userBudget > 0 && totalAmount > userBudget;
  const overBudgetAmount = totalAmount - userBudget;

  return (
    <div style={{ padding: isMobile ? '40px 5%' : '60px 10%', backgroundColor: '#fff', minHeight: '85vh' }}>
      <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '400', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        YOUR CART
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <h2 style={{ color: '#aaa', fontWeight: '300' }}>Cart is empty!</h2>
          <button 
            onClick={() => navigate('/all-products')} 
            style={{ marginTop: '20px', padding: '15px 40px', borderRadius: '50px', border: '1px solid #111', background: 'none', cursor: 'pointer' }}
          >
            GO SHOPPING
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map((item, index) => (
            <div key={index} style={{
              ...cartItemRow,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '15px' : '20px',
              border: isOverBudget ? '1px solid #ffcccc' : '1px solid #f0f0f0' // Over budget par item border halka red
            }}>
              
              {/* Product Info (Image + Name) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: isMobile ? '100%' : 'auto' }}>
                <img src={item.image} alt={item.name} style={productImg} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0' }}>{item.name}</h3>
                  <p style={{ color: '#ff5a5a', fontWeight: '700', marginTop: '5px' }}>Rs {item.price}</p>
                </div>
              </div>
              
              {/* Quantity controls & Price Section */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: isMobile ? '100%' : 'auto',
                gap: isMobile ? '0' : '40px'
              }}>
                <div style={qtyControls}>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={qtyBtn}><Minus size={14}/></button>
                  <span style={{ fontWeight: '700' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={qtyBtn}><Plus size={14}/></button>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Rs {(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => removeFromCart(item._id)} 
                    style={removeBtn}
                  >
                    <Trash2 size={16} style={{marginRight: '5px'}}/> {isMobile ? '' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Cart Summary Section */}
          <div style={{
            ...summaryContainer,
            minWidth: isMobile ? '100%' : '350px',
            boxSizing: 'border-box'
          }}>
            
            {/* SMART UX: Warning & Suggestion Box */}
            {isOverBudget && (
              <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #ffc107', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#856404', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <AlertTriangle size={18} /> Budget Alert!
                </h4>
                <p style={{ color: '#856404', margin: '0', fontSize: '14px' }}>
                  Aapka budget Rs. {userBudget} tha. Aap limit se <strong>Rs. {overBudgetAmount.toFixed(2)}</strong> aagay nikal gaye hain.
                </p>
                <p style={{ color: '#856404', margin: '10px 0 0 0', fontSize: '13px', fontWeight: '600' }}>
                  💡 Suggestion: Please kisi item ki quantity kam karein ya item remove karein.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3 style={{ margin: 0 }}>Total Amount</h3>
              <h3 style={{ margin: 0, color: isOverBudget ? '#ef4444' : '#111' }}>Rs {totalAmount.toFixed(2)}</h3>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')} 
              style={{...checkoutBtn, backgroundColor: isOverBudget ? '#ef4444' : '#111'}}
            >
              {isOverBudget ? 'CONTINUE ANYWAY' : 'PROCEED TO CHECKOUT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles (Same as yours) ---
const cartItemRow = { display: 'flex', justifyContent: 'space-between', padding: '20px', borderRadius: '20px', backgroundColor: '#fff' };
const productImg = { width: '80px', height: '80px', objectFit: 'cover', backgroundColor: '#f9f9f9', borderRadius: '12px' };
const qtyControls = { display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee', borderRadius: '50px', padding: '6px 15px', backgroundColor: '#fafafa' };
const qtyBtn = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' };
const removeBtn = { color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', float: 'right' };
const summaryContainer = { marginTop: '40px', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '25px', alignSelf: 'flex-end' };
const checkoutBtn = { width: '100%', color: '#fff', padding: '18px', borderRadius: '50px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '16px', transition: '0.3s' };

export default Cart;
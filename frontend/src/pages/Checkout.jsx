import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 

const Checkout = () => {
  // 'income' yahan bhi le rahe hain warning ke liye
  const { cart, setCart, income } = useContext(ShopContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const shipping = 12;
  const total = subtotal + shipping;

  // BUDGET LOGIC
  const userBudget = Number(income) || 0;
  const isOverBudget = userBudget > 0 && total > userBudget;

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      toast.error("Please enter address and phone number!");
      return;
    }

    const loadingToast = toast.loading("Placing your order...");

    try {
      const token = localStorage.getItem('token');
      
      const orderItemsMapped = cart.map(item => ({
        name: item.name,
        quantity: Number(item.quantity || 1),
        image: item.image,
        price: Number(item.price),
        product: item._id || item.id || (item.product && item.product._id)
      }));

      const orderData = {
        orderItems: orderItemsMapped,
        shippingAddress: address,
        phone: phone,
        totalPrice: Number(total)
      };

      const res = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Order Placed Successfully!", { id: loadingToast });
        setCart([]); 
        setTimeout(() => {
          navigate('/profile'); 
        }, 1500);
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Order Failed. Try again!";
      toast.error(errorMsg, { id: loadingToast });
    }
  };

  if (cart.length === 0) return (
    <div style={{padding: '100px', textAlign: 'center'}}>
      <Toaster />
      <h2>Your cart is empty!</h2>
      <button onClick={() => navigate('/')} style={emptyBtn}>Go Shopping</button>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', padding: '20px 5%' }}>
      <Toaster position="top-center" reverseOrder={false} />

      <div style={cardStyle}>
        <h4 style={{marginBottom: '15px', fontWeight:'700'}}>Delivery Details</h4>
        <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        <textarea placeholder="Full Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{...inputStyle, height: '100px', marginTop: '10px', paddingTop: '10px'}} />
      </div>

      <div style={cardStyle}>
        <h4 style={{marginBottom: '10px', fontWeight:'700'}}>Payment Method</h4>
        <div style={paymentMethodBox}>
          <input type="radio" checked readOnly style={{accentColor: '#e9b94d'}} />
          <span style={{fontSize: '14px', fontWeight: '600'}}>Cash on Delivery</span>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={summaryRow}><p>Subtotal</p><p>Rs {subtotal.toFixed(2)}</p></div>
        <div style={summaryRow}><p>Shipping Fee</p><p>Rs {shipping.toFixed(2)}</p></div>
        <hr style={{border: '0.5px solid #eee', margin: '15px 0'}} />
        <div style={{ ...summaryRow, marginTop: '10px' }}>
          <h3 style={{margin: 0, fontWeight:'700'}}>TOTAL</h3>
          <h3 style={{margin: 0, color: isOverBudget ? '#ef4444' : '#e9b94d', fontWeight:'800'}}>Rs {total.toFixed(2)}</h3>
        </div>

        {/* FINAL BUDGET WARNING BEFORE CHECKOUT */}
        {isOverBudget && (
           <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', marginTop: '15px' }}>
             <p style={{ margin: 0, color: '#ef4444', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
               ❌ Final Warning: You are exceeding your budget!
             </p>
           </div>
        )}

        <button onClick={handlePlaceOrder} style={{...placeOrderBtn, backgroundColor: isOverBudget ? '#ef4444' : '#111'}}>
          {isOverBudget ? 'PLACE ORDER (OVER BUDGET)' : 'PLACE ORDER'}
        </button>
      </div>
    </div>
  );
};

// Styles (Same as yours)
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', fontSize: '14px', backgroundColor: '#fafafa', boxSizing: 'border-box' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', margin: '10px 0', fontSize: '15px', color: '#555' };
const placeOrderBtn = { width: '100%', color: '#fff', border: 'none', padding: '18px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', marginTop: '25px', cursor: 'pointer', transition: '0.3s' };
const paymentMethodBox = {display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #e9b94d', borderRadius: '8px', backgroundColor: '#fffdf5'};
const emptyBtn = {marginTop: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius:'8px', border:'1px solid #111', background:'none'};

export default Checkout;
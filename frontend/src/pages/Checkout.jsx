import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 

// Safepay integration
const SAFEPAY_ENV = (import.meta.env.VITE_SAFEPAY_ENVIRONMENT || 'sandbox').trim();
const SAFEPAY_PUBLIC_KEY = (import.meta.env.VITE_SAFEPAY_PUBLIC_KEY || import.meta.env.VITE_SAFEPAY_API_KEY || '').trim();
const SAFEPAY_CHECKOUT_URL = SAFEPAY_ENV === 'sandbox' 
  ? 'https://sandbox.api.getsafepay.com/checkout/pay' 
  : 'https://api.getsafepay.com/checkout/pay';

const Checkout = () => {
  const { cart, setCart, income, user } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Safepay');

  // --- Verification States ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'loading', 'success', 'error'
  
  // --- New State for Errors ---
  const [fieldErrors, setFieldErrors] = useState({
    phone: '',
    streetAddress: '',
    city: '',
    postalCode: ''
  });

  const verificationStarted = React.useRef(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const shipping = 12;
  const total = subtotal + shipping;

  const userBudget = Number(income) || 0;
  const isOverBudget = userBudget > 0 && total > userBudget;

  useEffect(() => {
    if (verificationStarted.current) return;

    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(location.search);
    
    const tracker = queryParams.get('tracker') || queryParams.get('token');
    const orderId = queryParams.get('orderId') || queryParams.get('order_id');
    const sig = queryParams.get('sig');

    if (tracker && orderId) {
      verificationStarted.current = true;
      handleVerifyPayment(tracker, orderId, sig);
    }
  }, [location.search]); 

  const handleVerifyPayment = async (tracker, orderId, sig) => {
    if (isVerifying) return; 
    
    setIsVerifying(true);
    setVerificationStatus('loading');
    const loadingToast = toast.loading("Verifying Payment...");

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/orders/verify-payment', {
        tracker,
        orderId,
        sig,
        budgetExceeded: isOverBudget
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token 
        }
      });

      if (response.data.success) {
        toast.success("Payment Verified! Your order is being processed.", { id: loadingToast });
        setVerificationStatus('success');
        if (typeof setCart === 'function') setCart([]); 
        
        window.history.replaceState({}, document.title, "/checkout");

        const isAdmin = user && (user.role === 'admin' || user.isAdmin);
        const targetPath = isAdmin ? '/admin-dashboard' : '/dashboard';

        setTimeout(() => {
          window.location.replace(targetPath);
        }, 2000);
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment Verification Failed!", { id: loadingToast });
      setVerificationStatus('error');
      setIsVerifying(false);
    }
  };

  const validate = () => {
    let errors = {};
    const phoneRegex = /^03[0-9]{9}$/;
    if (!phone) errors.phone = "Phone number is required";
    else if (!phoneRegex.test(phone)) errors.phone = "Invalid format! Use 03xxxxxxxxx (11 digits)";
    if (!streetAddress.trim()) errors.streetAddress = "Street address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!postalCode.trim()) errors.postalCode = "Postal code is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before placing order");
      return;
    }

    // --- ADDED: Budget Confirmation Logic ---
    if (isOverBudget) {
      const confirmProceed = window.confirm(
        `You are over budget by PKR ${total - userBudget}. Do you want to see cheaper alternatives before paying?`
      );
      if (confirmProceed) {
        navigate('/cart'); // Redirect to cart for suggestions
        return;
      }
    }

    setIsPlacing(true);
    const fullAddress = `${streetAddress.trim()}, ${city.trim()}, ${postalCode.trim()}`;
    const loadingToast = toast.loading(paymentMethod === 'Safepay' ? "Redirecting to Safepay..." : "Placing your order...");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setIsPlacing(false);
        return;
      }

      const orderItemsMapped = cart.map(item => ({
        product: item._id || item.id, 
        name: item.name,
        quantity: parseInt(item.quantity || 1),
        price: parseFloat(item.price),
        image: item.image
      }));

      const orderData = {
        orderItems: orderItemsMapped,
        shippingAddress: fullAddress,
        phone: phone,
        totalPrice: parseFloat(total)
      };

      if (paymentMethod === 'Safepay') {
        const orderRes = await axios.post('http://localhost:5000/api/orders', {
          ...orderData,
          paymentMethod: 'Safepay'
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          }
        });

        if (orderRes.data && orderRes.data._id) {
          const orderId = orderRes.data._id;
          const successUrl = `${window.location.origin}/checkout?success=true&orderId=${orderId}&payment=safepay`;
          const cancelUrl = `${window.location.origin}/checkout?canceled=true`;

          const initRes = await axios.post('http://localhost:5000/api/orders/safepay-init', {
            amount: total,
            currency: 'PKR',
            redirect_url: successUrl,
            cancel_url: cancelUrl,
            orderId: orderId
          }, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'x-auth-token': token 
            }
          });

          if (!initRes.data || !initRes.data.tracker) {
            throw new Error("Failed to get Safepay tracker from server");
          }

          const tracker = initRes.data.tracker;
          const checkoutUrl = new URL(SAFEPAY_CHECKOUT_URL);
          checkoutUrl.searchParams.append('beacon', tracker);
          checkoutUrl.searchParams.append('env', SAFEPAY_ENV);
          checkoutUrl.searchParams.append('order_id', orderId);
          checkoutUrl.searchParams.append('source', 'custom'); 
          
          toast.success("Redirecting to Safepay...", { id: loadingToast });
          setTimeout(() => {
            window.location.href = checkoutUrl.toString();
          }, 500);
        }
      } else {
        // COD Logic
        const res = await axios.post('http://localhost:5000/api/orders', {
          ...orderData,
          paymentMethod: 'Cash on Delivery'
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token 
          }
        });

        if (res.status === 201 || res.status === 200) {
          toast.success("Order Placed Successfully!", { id: loadingToast });
          setCart([]); 
          setTimeout(() => {
            window.location.replace('/dashboard');
          }, 1500);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.msg || "Action Failed!";
      toast.error(errMsg, { id: loadingToast });
      setIsPlacing(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', padding: '20px 5%' }}>
      <Toaster position="top-center" />

      {isVerifying && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {verificationStatus === 'loading' && (
              <>
                <div className="spinner" style={spinnerStyle}></div>
                <h3 style={{ marginTop: '20px' }}>Processing Payment...</h3>
                <p>Please do not refresh or close this page.</p>
              </>
            )}
            {verificationStatus === 'success' && (
              <>
                <div style={{ fontSize: '100px', marginBottom: '10px' }}>✅</div>
                <h3 style={{ marginTop: '10px', fontSize: '24px', color: '#2ecc71' }}>Payment Successful!</h3>
                <p style={{ fontSize: '16px', color: '#666' }}>Your order has been verified successfully.</p>
                <button onClick={() => window.location.replace('/dashboard')} style={{marginTop: '20px', padding: '10px 25px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
                  Go to Dashboard Now
                </button>
              </>
            )}
            {verificationStatus === 'error' && (
              <>
                <div style={{ fontSize: '50px', color: '#F44336' }}>❌</div>
                <h3 style={{ marginTop: '10px' }}>Verification Failed</h3>
                <button onClick={() => { setIsVerifying(false); navigate('/checkout'); }} style={backBtnStyle}>
                  Go Back to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <h4 style={{marginBottom: '20px', fontWeight:'700'}}>Delivery Details</h4>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Phone Number</label>
          <input type="text" placeholder="03211234567" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); if(fieldErrors.phone) setFieldErrors({...fieldErrors, phone: ''}); }} style={{...inputStyle, borderColor: fieldErrors.phone ? '#ef4444' : '#eee'}} maxLength="11" />
          {fieldErrors.phone && <p style={errorTextStyle}>{fieldErrors.phone}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Street Address</label>
          <input type="text" placeholder="House#, Street#, Area" value={streetAddress} onChange={(e) => { setStreetAddress(e.target.value); if(fieldErrors.streetAddress) setFieldErrors({...fieldErrors, streetAddress: ''}); }} style={{...inputStyle, borderColor: fieldErrors.streetAddress ? '#ef4444' : '#eee'}} />
          {fieldErrors.streetAddress && <p style={errorTextStyle}>{fieldErrors.streetAddress}</p>}
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>City</label>
            <input type="text" placeholder="e.g. Lahore" value={city} onChange={(e) => { setCity(e.target.value); if(fieldErrors.city) setFieldErrors({...fieldErrors, city: ''}); }} style={{...inputStyle, borderColor: fieldErrors.city ? '#ef4444' : '#eee'}} />
            {fieldErrors.city && <p style={errorTextStyle}>{fieldErrors.city}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Postal Code</label>
            <input type="text" placeholder="e.g. 54000" value={postalCode} onChange={(e) => { setPostalCode(e.target.value); if(fieldErrors.postalCode) setFieldErrors({...fieldErrors, postalCode: ''}); }} style={{...inputStyle, borderColor: fieldErrors.postalCode ? '#ef4444' : '#eee'}} />
            {fieldErrors.postalCode && <p style={errorTextStyle}>{fieldErrors.postalCode}</p>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Payment Method</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <div onClick={() => setPaymentMethod('Safepay')} style={{ ...methodCard, borderColor: paymentMethod === 'Safepay' ? '#111' : '#eee', backgroundColor: paymentMethod === 'Safepay' ? '#f0f0f0' : '#fff' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>💳 Safepay</p>
            </div>
            <div onClick={() => setPaymentMethod('COD')} style={{ ...methodCard, borderColor: paymentMethod === 'COD' ? '#111' : '#eee', backgroundColor: paymentMethod === 'COD' ? '#f0f0f0' : '#fff' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>💵 COD</p>
            </div>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={summaryRow}><p>Subtotal</p><p>Rs {subtotal.toFixed(2)}</p></div>
        <div style={summaryRow}><p>Shipping</p><p>Rs {shipping.toFixed(2)}</p></div>
        <hr style={{border: '0.5px solid #eee', margin: '15px 0'}} />
        <div style={summaryRow}>
          <h3 style={{margin:0}}>TOTAL</h3>
          <h3 style={{margin:0, color: isOverBudget ? '#ef4444' : '#111'}}>Rs {total.toFixed(2)}</h3>
        </div>
        
        {isOverBudget && (
          <p style={{color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: '500'}}>
            ⚠️ This order exceeds your set budget of Rs {userBudget}.
          </p>
        )}

        <button 
          onClick={handlePlaceOrder} 
          disabled={isPlacing || cart.length === 0}
          style={{
            ...placeOrderBtn, 
            opacity: (isPlacing || cart.length === 0) ? 0.6 : 1,
            backgroundColor: isOverBudget ? '#ef4444' : '#111'
          }}
        >
          {isPlacing ? 'PROCESSING...' : paymentMethod === 'Safepay' ? 'PAY NOW' : 'PLACE ORDER'}
        </button>
      </div>
    </div>
  );
};

// --- Styles ---
const methodCard = { flex: 1, padding: '15px', borderRadius: '15px', border: '2px solid #eee', cursor: 'pointer', transition: '0.3s' };
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', fontSize: '14px', backgroundColor: '#fafafa', boxSizing: 'border-box', transition: '0.3s' };
const errorTextStyle = { color: '#ef4444', fontSize: '11px', marginTop: '5px', marginLeft: '5px', fontWeight: '500' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', margin: '10px 0' };
const placeOrderBtn = { width: '100%', color: '#fff', border: 'none', padding: '18px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', marginTop: '20px', cursor: 'pointer', transition: '0.3s' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', width: '90%' };
const spinnerStyle = { border: '4px solid #f3f3f3', borderTop: '4px solid #111', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' };
const backBtnStyle = { backgroundColor: '#111', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '50px', marginTop: '20px', cursor: 'pointer' };

const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default Checkout;
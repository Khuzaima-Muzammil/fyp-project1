import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { pakistanCities } from '../data/pakistanData';
import { Ticket, X, CheckCircle } from 'lucide-react';
import '../styles/Checkout.css';

// Safepay (Payment Gateway) settings
const SAFEPAY_ENV = (import.meta.env.VITE_SAFEPAY_ENVIRONMENT || 'sandbox').trim();
const SAFEPAY_CHECKOUT_URL = SAFEPAY_ENV === 'sandbox' 
  ? 'https://sandbox.api.getsafepay.com/checkout/pay' 
  : 'https://api.getsafepay.com/checkout/pay';

const Checkout = () => {
  // Extract cart, totals, and user information from ShopContext
  const { cart, clearCart, income, user, cartTotal: subtotal, shippingFee: shipping, finalTotal: total, isOverBudget, userBudget, settings, appliedCoupon, applyCoupon, removeCoupon, discountAmount } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  // States for form fields (phone, address, city etc)
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isStreetDropdownOpen, setIsStreetDropdownOpen] = useState(false);
  const [streetSearch, setStreetSearch] = useState('');
  const [apiSuggestions, setApiSuggestions] = useState([]); // Address suggestions
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // GPS location status
  const [city, setCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [availablePostalCodes, setAvailablePostalCodes] = useState([]);
  const [isPlacing, setIsPlacing] = useState(false); // Order placement status
  const [paymentMethod, setPaymentMethod] = useState('Safepay');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); 
  
  const [fieldErrors, setFieldErrors] = useState({});

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const cityDropdownRef = React.useRef(null);
  const streetDropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
      if (streetDropdownRef.current && !streetDropdownRef.current.contains(event.target)) {
        setIsStreetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-world address suggestions using Photon API
  useEffect(() => {
    if (streetSearch.trim().length < 3) {
      setApiSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Biased towards Pakistan (approx center: 30, 70) and restricted to Pakistan bounding box
        const response = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(streetSearch)}&limit=8&lat=30.3753&lon=69.3451&bbox=60.8722,23.6947,77.8375,37.0841`);
        if (response.data && response.data.features) {
          const suggestions = response.data.features.map(f => {
            const props = f.properties;
            const housenumber = props.housenumber || '';
            const street = props.street || '';
            const name = props.name || '';
            const city = props.city || props.state || '';
            
            // Build a more descriptive display name
            let displayName = '';
            if (housenumber && street) {
              displayName = `${housenumber} ${street}`;
            } else if (name) {
              displayName = name;
            } else if (street) {
              displayName = street;
            } else {
              displayName = city || 'Location';
            }

            // Avoid duplicating name if it's the same as street or house+street
            const addressParts = [
              housenumber,
              street,
              (name !== street && name !== city) ? name : '',
              props.district || props.suburb || '',
              city,
              props.country || ''
            ].filter(Boolean);

            // Remove duplicates from addressParts while preserving order
            const uniqueParts = [...new Set(addressParts)];

            return {
              name: displayName,
              street: street,
              housenumber: housenumber,
              district: props.district || props.suburb || '',
              city: city,
              country: props.country || '',
              full: uniqueParts.join(', ')
            };
          });
          setApiSuggestions(suggestions);
        }
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [streetSearch]);

  const verificationStarted = React.useRef(false);

  useEffect(() => {
    const handleSafepayMessage = (event) => {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) {}
      }

      // Automatically detects success before "Return to Merchant"
      if (data && data.MessageType === "profile.completed") {
        console.log("Safepay Message Received:", data);
        if (data.Status === true) {
          if (window.safepayPopup && !window.safepayPopup.closed) {
            window.safepayPopup.close(); // Force close
          }
          const orderId = localStorage.getItem('currentOrderId');
          const tracker = data.SessionId || 'sandbox_tracker';
          if (orderId) {
            handleVerifyPayment(tracker, orderId, '');
          }
        }
      }
    };

    window.addEventListener('message', handleSafepayMessage);
    
    // Cross-tab fallback
    const handleStorageChange = (e) => {
      if (e.key === 'safepay_status') {
        const tracker = localStorage.getItem('safepay_tracker');
        const orderId = localStorage.getItem('safepay_orderId');
        if (window.safepayPopup && !window.safepayPopup.closed) {
          window.safepayPopup.close();
        }
        if (tracker && orderId) {
          handleVerifyPayment(tracker, orderId, '');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('message', handleSafepayMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  useEffect(() => {
    if (verificationStarted.current) return;

    const queryParams = new URLSearchParams(location.search);
    const tracker = queryParams.get('tracker') || queryParams.get('token');
    const orderId = queryParams.get('orderId') || queryParams.get('order_id');
    const isPopup = queryParams.get('is_popup') === 'true';

    if (tracker && orderId) {
      verificationStarted.current = true;
      if (isPopup) {
         localStorage.setItem('safepay_tracker', tracker);
         localStorage.setItem('safepay_orderId', orderId);
         localStorage.setItem('safepay_status', Date.now().toString()); 
         window.close(); 
         document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;'><h2>Payment Successful! Closing window...</h2></div>";
         return;
      }
      handleVerifyPayment(tracker, orderId, '');
    }
  }, [location.search]); 

  // Function to verify payment
  const handleVerifyPayment = async (tracker, orderId, sig) => {
    if (isVerifying) return; 
    
    setIsVerifying(true);
    setVerificationStatus('loading');
    const loadingToast = toast.loading("Verifying payment...");

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5004/api/orders/verify-payment', {
        tracker, orderId, sig
      }, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });

      if (response.data.success) {
        toast.success("Payment successful! Order is being processed.", { id: loadingToast });
        setVerificationStatus('success');
        if (typeof clearCart === 'function') clearCart(); 
        window.history.replaceState({}, document.title, "/checkout");

        const isAdmin = user && (user.role === 'admin' || user.isAdmin);
        let targetPath = isAdmin ? '/admin-dashboard' : '/profile';
        
        // Removed the redirect to cart for over-budget orders during payment verification
        // as the payment is already successful and the order is placed.
        
        navigate(targetPath);
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment verification failed!", { id: loadingToast });
      setVerificationStatus('error');
      setIsVerifying(false);
    }
  };

  // Function to get current user location (GPS)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser does not support location");
      return;
    }

    setIsLocating(true);
    const loadingToast = toast.loading("Locating you...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // API to get address from Lat/Long
          const response = await axios.get(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
          if (response.data && response.data.features && response.data.features.length > 0) {
            const feature = response.data.features[0];
            const props = feature.properties;
            
            const housenumber = props.housenumber || '';
            const street = props.street || '';
            const name = props.name || '';
            const cityVal = props.city || props.state || '';
            const district = props.district || props.suburb || '';
            const country = props.country || '';

            const addressParts = [
              housenumber,
              street,
              (name !== street && name !== cityVal) ? name : '',
              district,
              cityVal,
              country
            ].filter(Boolean);

            const uniqueParts = [...new Set(addressParts)];
            const fullAddress = uniqueParts.join(', ');

            setStreetAddress(fullAddress);
            setStreetSearch(fullAddress);
            
            // Validate and clear errors
            const addrError = validateField('streetAddress', fullAddress);
            setFieldErrors(prev => ({ ...prev, streetAddress: addrError }));
            
            if (cityVal) {
              const foundCity = pakistanCities.find(c => 
                c.city.toLowerCase() === cityVal.toLowerCase() ||
                cityVal.toLowerCase().includes(c.city.toLowerCase())
              );
              if (foundCity) {
                handleCitySelect(foundCity.city);
              } else {
                setCity(cityVal);
                setCitySearch(cityVal);
                const cityError = validateField('city', cityVal);
                setFieldErrors(prev => ({ ...prev, city: cityError }));
              }
            }
            
            toast.success("Location found!", { id: loadingToast });
          } else {
            // Fallback: If no feature found, at least we have coordinates
            const fallbackAddr = `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setStreetAddress(fallbackAddr);
            setStreetSearch(fallbackAddr);
            toast.success("Location found! (Address not found)", { id: loadingToast });
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error("Problem finding address", { id: loadingToast });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not access location", { id: loadingToast });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateField = (field, value) => {
    let error = "";
    if (field === 'phone') {
      if (!value) error = "Phone number is required";
      else if (value.length !== 10) error = "Phone number must be 10 digits (3XXXXXXXXX)";
      else if (!value.startsWith('3')) error = "Phone number must start with 3";
    }
    if (field === 'streetAddress') {
      if (!value.trim()) error = "Full address is required";
      else if (value.trim().length < 15) error = "Address must be at least 15 characters";
    }
    if (field === 'city' && !value.trim()) error = "City is required";
    if (field === 'postalCode' && !value.trim()) error = "Postal code is required";
    return error;
  };

  const handleFieldChange = (field, value) => {
    if (field === 'phone') {
      let cleaned = value.replace(/\D/g, '');
      
      // If user types leading 0, remove it and don't let it be added
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }

      // Allow up to 10 digits (starting with 3)
      if (cleaned.length <= 10) {
        setPhone(cleaned);
        const error = validateField('phone', cleaned);
        setFieldErrors(prev => ({ ...prev, phone: error }));
      }
      return;
    }
    if (field === 'streetAddress') {
      setStreetAddress(value);
      setStreetSearch(value);
      setIsStreetDropdownOpen(true);
      const error = validateField('streetAddress', value);
      setFieldErrors(prev => ({ ...prev, streetAddress: error }));
    }
    if (field === 'city') {
      setCity(value);
      const cityData = pakistanCities.find(c => c.city === value);
      if (cityData) {
        setAvailablePostalCodes(cityData.codes);
        setPostalCode(cityData.codes[0]); // Auto-fill first code
      } else {
        setAvailablePostalCodes([]);
        setPostalCode('');
      }
      const error = validateField('city', value);
      setFieldErrors(prev => ({ ...prev, city: error }));
    }
    if (field === 'postalCode') {
      setPostalCode(value);
      const error = validateField('postalCode', value);
      setFieldErrors(prev => ({ ...prev, postalCode: error }));
    }
  };

  const filteredCities = pakistanCities.filter(c => 
    c.city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setCitySearch(cityName);
    setIsCityDropdownOpen(false);
    
    const cityData = pakistanCities.find(c => c.city === cityName);
    if (cityData) {
      setAvailablePostalCodes(cityData.codes);
      setPostalCode(cityData.codes[0]); // Auto-fill first code
    } else {
      setAvailablePostalCodes([]);
      setPostalCode('');
    }

    const error = validateField('city', cityName);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors.city = error;
      else delete newErrors.city;
      return newErrors;
    });
  };

  const handleAddressSelect = (suggestion) => {
    const mainAddress = suggestion.full;
    setStreetAddress(mainAddress);
    setStreetSearch(mainAddress);
    setIsStreetDropdownOpen(false);
    
    // Auto-fill city if found in suggestion
    if (suggestion.city) {
      const foundCity = pakistanCities.find(c => 
        c.city.toLowerCase() === suggestion.city.toLowerCase() ||
        suggestion.city.toLowerCase().includes(c.city.toLowerCase())
      );
      if (foundCity) {
        handleCitySelect(foundCity.city);
      } else {
        setCity(suggestion.city);
        setCitySearch(suggestion.city);
      }
    }
    
    const error = validateField('streetAddress', mainAddress);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors.streetAddress = error;
      else delete newErrors.streetAddress;
      return newErrors;
    });
  };

  const isFormValid = () => {
    const hasErrors = Object.values(fieldErrors).some(error => error !== "");
    return (
      phone && phone.length === 10 && phone.startsWith('3') &&
      streetAddress.trim().length >= 15 &&
      city.trim() &&
      postalCode.trim() &&
      !hasErrors
    );
  };

  const handlePlaceOrder = async () => {
    // Re-validate all fields before checking validity
    const errors = {
      phone: validateField('phone', phone),
      streetAddress: validateField('streetAddress', streetAddress),
      city: validateField('city', city),
      postalCode: validateField('postalCode', postalCode)
    };
    setFieldErrors(errors);

    const hasErrors = Object.values(errors).some(error => error !== "");
    if (hasErrors || !isFormValid()) {
      toast.error("Please fill in all information correctly to place the order");
      return;
    }
    if (isOverBudget) {
      const confirmProceed = window.confirm(`You are spending PKR ${total - userBudget} more than your budget. Would you like to see cheaper alternatives?`);
      if (confirmProceed) { navigate('/cart'); return; }
    }

    setIsPlacing(true);
    const fullAddress = `${streetAddress.trim()}, ${city.trim()}, ${postalCode.trim()}`;
    const loadingToast = toast.loading(paymentMethod === 'Safepay' ? "Redirecting to Safepay..." : "Placing order...");

    try {
      const token = localStorage.getItem('token');
      const orderItemsMapped = cart.map(item => ({
        product: item._id || item.id, 
        name: item.name, 
        quantity: parseInt(item.quantity || 1), 
        price: parseFloat(item.price), 
        image: item.image,
        category: item.category
      }));
      const orderData = {
        orderItems: orderItemsMapped, 
        shippingAddress: fullAddress, 
        phone: phone, 
        totalPrice: parseFloat(total),
        deliveryCost: parseFloat(shipping)
      };

      if (paymentMethod === 'Safepay') {
        const orderRes = await axios.post('http://localhost:5004/api/orders', {
          ...orderData, paymentMethod: 'Safepay'
        }, { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } });

        if (orderRes.data && orderRes.data._id) {
          const orderId = orderRes.data._id;
          localStorage.setItem('currentOrderId', orderId);
          
          const successUrl = `${window.location.origin}/checkout?success=true&orderId=${orderId}&payment=safepay`;
          const cancelUrl = `${window.location.origin}/checkout?canceled=true`;

          const initRes = await axios.post('http://localhost:5004/api/orders/safepay-init', {
            amount: total, currency: 'PKR', redirect_url: successUrl, cancel_url: cancelUrl, orderId: orderId
          }, { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } });

          if (!initRes.data || !initRes.data.tracker) throw new Error("Safepay tracker not found");

          const tracker = initRes.data.tracker;
          const finalSuccessUrl = `${successUrl}&tracker=${tracker}&is_popup=true`;
          
          const checkoutUrl = new URL(SAFEPAY_CHECKOUT_URL);
          checkoutUrl.searchParams.append('beacon', tracker);
          checkoutUrl.searchParams.append('env', SAFEPAY_ENV);
          checkoutUrl.searchParams.append('order_id', orderId);
          checkoutUrl.searchParams.append('redirect_url', finalSuccessUrl);
          checkoutUrl.searchParams.append('cancel_url', cancelUrl);
          checkoutUrl.searchParams.append('source', 'custom'); 
          
          toast.success("Opening Safepay...", { id: loadingToast });
          window.safepayPopup = window.open(checkoutUrl.toString(), 'SafepayCheckout', 'width=600,height=700');
          
          if (!window.safepayPopup) {
             toast.error("Please allow popups to complete the payment.", { id: loadingToast });
             setIsPlacing(false);
          } else {
             const checkClosed = setInterval(async () => {
                // Feature: Auto-polling the Safepay API from backend to detect instant success
                try {
                   const statusRes = await axios.get(`http://localhost:5004/api/orders/safepay-status/${tracker}`, {
                       headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
                   });
                   if (statusRes.data && statusRes.data.paid) {
                       clearInterval(checkClosed);
                       if (window.safepayPopup && !window.safepayPopup.closed) {
                           window.safepayPopup.close(); // INSTANT CLOSE MAGIC
                       }
                       handleVerifyPayment(tracker, orderId, '');
                       return;
                   }
                } catch (e) {
                   // Polling error, ignore
                }

                if (window.safepayPopup.closed) {
                   clearInterval(checkClosed);
                   setIsPlacing(false);
                }
             }, 2000);
          }
        }
      } else {
        const res = await axios.post('http://localhost:5004/api/orders', {
          ...orderData, paymentMethod: 'Cash on Delivery'
        }, { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } });

        if (res.status === 201 || res.status === 200) {
          toast.success("Order placed successfully!", { id: loadingToast });
          if (typeof clearCart === 'function') clearCart(); 
          setTimeout(() => { window.location.replace('/profile'); }, 1500);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed!", { id: loadingToast });
      setIsPlacing(false);
    }
  };

  return (
    <div className="checkout-container">
      <Toaster position="top-center" />
      {isVerifying && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            {verificationStatus === 'loading' && (
              <>
                <div className="checkout-spinner"></div>
                <h3 style={{ marginTop: '20px' }}>Processing payment...</h3>
              </>
            )}
            {verificationStatus === 'success' && (
              <>
                <div style={{ fontSize: '100px', marginBottom: '10px' }}>✅</div>
                <h3 style={{ marginTop: '10px', fontSize: '24px', color: '#2ecc71' }}>Payment Successful!</h3>
              </>
            )}
            {verificationStatus === 'error' && (
              <>
                <div style={{ fontSize: '50px', color: '#F44336' }}>❌</div>
                <h3 style={{ marginTop: '10px' }}>Verification Failed</h3>
                <button onClick={() => { setIsVerifying(false); navigate('/checkout'); }} className="checkout-back-btn">Go Back</button>
              </>
            )}
          </div>
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '20px',
        alignItems: 'flex-start'
      }}>
        {/* Left Side: Delivery Details */}
        <div style={{ 
          ...cardStyle, 
          flex: isMobile ? 'none' : '2', 
          width: '100%',
          padding: isMobile ? '20px 15px' : '25px' 
        }}>
          <h4 style={{marginBottom: '20px', fontWeight:'700'}}>Delivery Information</h4>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Phone Number</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#666',
                fontSize: '14px',
                fontWeight: '600',
                borderRight: '1px solid #ddd',
                paddingRight: '10px',
                height: '24px'
              }}>
                <span style={{ fontSize: '18px' }}>🇵🇰</span>
                <span>+92</span>
              </div>
              <input 
                type="tel" 
                placeholder="3XXXXXXXXX (10 digits)" 
                value={phone} 
                onChange={(e) => handleFieldChange('phone', e.target.value)} 
                style={{
                  ...inputStyle, 
                  paddingLeft: '95px',
                  borderColor: fieldErrors.phone ? '#ef4444' : '#eee'
                }} 
              />
            </div>
            {fieldErrors.phone && <p style={errorTextStyle}>{fieldErrors.phone}</p>}
          </div>
          <div style={{ marginBottom: '20px', position: 'relative' }} ref={streetDropdownRef}>
            <label style={labelStyle}>Full Address</label>
            <div style={{ position: 'relative' }}>
              <textarea 
                placeholder="House number, street, area, etc..."
                value={streetAddress} 
                onChange={(e) => handleFieldChange('streetAddress', e.target.value)}
                onFocus={() => setIsStreetDropdownOpen(true)}
                style={{
                  ...inputStyle, 
                  height: '80px',
                  padding: '15px 45px 15px 15px',
                  resize: 'none',
                  borderColor: fieldErrors.streetAddress ? '#ef4444' : '#eee'
                }} 
              />
              <div style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '12px', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center'
              }}>
                {isSearching && (
                  <div className="spinner-small" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #2ecc71',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  title="Use current location"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isLocating ? 'not-allowed' : 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: '0.2s',
                    color: isLocating ? '#888' : '#2ecc71',
                    fontSize: '18px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isLocating ? '⏳' : '🎯'}
                </button>
              </div>
              {isStreetDropdownOpen && apiSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  marginTop: '5px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 101,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                  {apiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleAddressSelect(suggestion)}
                      style={{
                        padding: '12px 15px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderBottom: '1px solid #f9f9f9',
                        transition: '0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '600', color: '#333' }}>
                        📍 {suggestion.name || suggestion.street || 'Location'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888' }}>
                        {suggestion.full}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.streetAddress && <p style={errorTextStyle}>{fieldErrors.streetAddress}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }} ref={cityDropdownRef}>
              <label style={labelStyle}>City</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Search city..."
                  value={citySearch}
                  onFocus={() => setIsCityDropdownOpen(true)}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setIsCityDropdownOpen(true);
                    if (city) setCity(''); // Clear selected city if user starts typing again
                  }}
                  style={{...inputStyle, borderColor: fieldErrors.city ? '#ef4444' : '#eee'}}
                />
                {isCityDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    marginTop: '5px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}>
                    {filteredCities.length > 0 ? (
                      filteredCities.map(c => (
                        <div 
                          key={c.city} 
                          onClick={() => handleCitySelect(c.city)}
                          style={{
                            padding: '12px 15px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            borderBottom: '1px solid #f9f9f9',
                            transition: '0.2s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          {c.city}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px 15px', color: '#888', fontSize: '14px', textAlign: 'left' }}>City not found</div>
                    )}
                  </div>
                )}
              </div>
              {fieldErrors.city && <p style={errorTextStyle}>{fieldErrors.city}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Postal Code</label>
              <select 
                value={postalCode} 
                onChange={(e) => handleFieldChange('postalCode', e.target.value)} 
                style={{...inputStyle, borderColor: fieldErrors.postalCode ? '#ef4444' : '#eee', cursor: 'pointer'}}
                disabled={!city}
              >
                <option value="">Select Code</option>
                {availablePostalCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              {fieldErrors.postalCode && <p style={errorTextStyle}>{fieldErrors.postalCode}</p>}
            </div>
          </div>
          <div style={{ marginTop: '30px' }}>
            <h4 style={{marginBottom: '20px', fontWeight:'700'}}>Payment Method</h4>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', marginTop: '10px' }}>
              <div onClick={() => setPaymentMethod('Safepay')} style={{ ...methodCard, borderColor: paymentMethod === 'Safepay' ? '#111' : '#eee', backgroundColor: paymentMethod === 'Safepay' ? '#f0f0f0' : '#fff' }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>💳 Safepay (Online Payment)</p>
              </div>
              <div onClick={() => setPaymentMethod('COD')} style={{ ...methodCard, borderColor: paymentMethod === 'COD' ? '#111' : '#eee', backgroundColor: paymentMethod === 'COD' ? '#f0f0f0' : '#fff' }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>💵 Cash on Delivery (COD)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div style={{ 
          ...cardStyle, 
          flex: isMobile ? 'none' : '1', 
          width: '100%', 
          position: isMobile ? 'static' : 'sticky', 
          top: '20px',
          padding: isMobile ? '20px 15px' : '25px'
        }}>
          <h4 style={{marginBottom: '20px', fontWeight:'700'}}>Order Summary</h4>

          {/* Coupon Section */}
          <div style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '15px', border: '1px dashed #ddd' }}>
            <label style={{ ...labelStyle, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Ticket size={16} /> Have a coupon?
            </label>
            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ ...inputStyle, padding: '10px', fontSize: '13px' }}
                />
                <button 
                  onClick={() => applyCoupon(couponCode)}
                  style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Apply
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fff4', padding: '10px', borderRadius: '10px', border: '1px solid #c6f6d5' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f855a', fontWeight: '700', fontSize: '13px' }}>
                    <CheckCircle size={16} /> {appliedCoupon.code} Applied!
                  </div>
                  <div style={{ fontSize: '11px', color: '#38a169', fontWeight: '600', marginLeft: '24px' }}>
                    {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountAmount}%` : `Rs. ${appliedCoupon.discountAmount}`} discount (Save Rs. {discountAmount.toFixed(0)})
                  </div>
                </div>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '5px' }}><X size={16} /></button>
              </div>
            )}
          </div>

          <div style={summaryRow}><p>Items Price</p><p>{settings?.currency?.symbol || 'Rs'} {subtotal.toFixed(2)}</p></div>
          <div style={summaryRow}><p>Shipping Fee</p><p>{settings?.currency?.symbol || 'Rs'} {shipping.toFixed(2)}</p></div>
          {discountAmount > 0 && (
            <div style={{ ...summaryRow, color: '#38a169', fontWeight: '700' }}>
              <p>Discount</p>
              <p>- {settings?.currency?.symbol || 'Rs'} {discountAmount.toFixed(2)}</p>
            </div>
          )}
          <hr style={{border: '0.5px solid #eee', margin: '15px 0'}} />
          <div style={summaryRow}>
            <h3 style={{margin:0}}>Total</h3>
            <h3 style={{margin:0, color: isOverBudget ? '#ef4444' : '#111'}}>{settings?.currency?.symbol || 'Rs'} {total.toFixed(2)}</h3>
          </div>
          {isOverBudget && (
            <p style={{color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: '500'}}>
              ⚠️ You are spending {settings?.currency?.code || 'PKR'} {(total - userBudget).toFixed(2)} more than your budget.
            </p>
          )}
          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePlaceOrder} disabled={isPlacing || cart.length === 0} style={{ ...placeOrderBtn, opacity: (isPlacing || cart.length === 0) ? 0.6 : 1, backgroundColor: isOverBudget ? '#ef4444' : '#111' }}>
              {isPlacing ? (
                paymentMethod === 'Safepay' ? 'Opening Safepay...' : 'Placing order...'
              ) : (
                paymentMethod === 'Safepay' ? 'Pay Now' : 'Place Order'
              )}
            </button>
          </div>
          <p style={{textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '15px'}}>
            By placing the order, you agree to our <a href="/privacy" style={{color: '#666', textDecoration: 'underline'}}>Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
};



const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '24px',
  padding: '25px',
  border: '1px solid #f0f0f0',
  boxShadow: '0 5px 15px rgba(0,0,0,0.02)',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#666',
  textTransform: 'uppercase',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  borderRadius: '12px',
  border: '1px solid #eee',
  outline: 'none',
  fontSize: '14px',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  transition: '0.2s'
};

const errorTextStyle = {
  color: '#ef4444',
  fontSize: '11px',
  marginTop: '5px',
  fontWeight: '600'
};

const methodCard = {
  flex: 1,
  padding: '15px',
  borderRadius: '15px',
  border: '2px solid #eee',
  cursor: 'pointer',
  transition: '0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center'
};

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
  fontSize: '14px',
  color: '#333'
};

const placeOrderBtn = {
  width: '100%',
  padding: '15px',
  borderRadius: '15px',
  border: 'none',
  color: '#fff',
  fontWeight: '700',
  fontSize: '16px',
  cursor: 'pointer',
  transition: '0.3s'
};

export default Checkout;
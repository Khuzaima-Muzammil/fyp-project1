// Importing React and necessary hooks
import React, { useContext, useState, useEffect, useRef } from 'react';
import { ShopContext } from '../../context/ShopContext'; // For global data
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation
import { User, Mail, Package, LogOut, Edit2, Save, X, Clock, Camera, ChevronRight, Trash2, Truck } from 'lucide-react'; // Icons
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // For alerts
import '../../styles/UserDashboard.css';

const UserDashboard = () => {
  // Extracting necessary functions and data from ShopContext
  const { user, logout, loading, setUser, setCart } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isSuccess = queryParams.get('success') === 'true';

    if (isSuccess) {
      toast.success("Order placed successfully!", { duration: 5000 });
      setCart([]); // Clearing cart
      // Removing parameters from URL
      window.history.replaceState({}, '', '/profile');
    }
  }, [location, setCart]);

  const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // --- RESPONSIVE LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // States for profile update
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', profilePic: '' });
  const [errors, setErrors] = useState({}); 
  const [preview, setPreview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  // Tracking Modal states
  const [trackingData, setTrackingData] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ 
        username: user.username || user.name || '', 
        email: user.email || '', 
        profilePic: user.profilePic || '' 
      });
    }
  }, [user]);

  // Function to fetch user orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5004/api/orders/myorders', {
        headers: { 'x-auth-token': token }
      });
      setOrders(res.data); 
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setFetchingOrders(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // Function to cancel order
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const loadingToast = toast.loading("Cancelling order...");
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5004/api/orders/${orderId}`, {
          headers: { 'x-auth-token': token }
        });
        
        toast.success("Order cancelled", { id: loadingToast });
        setOrders(orders.filter(order => order._id !== orderId));
      } catch (err) {
        toast.error(err.response?.data?.msg || "Could not cancel order", { id: loadingToast });
      }
    }
  };

  // Function to track order
  const handleTrackOrder = async (orderId) => {
    const loadingToast = toast.loading("Fetching tracking information...");
    try {
      const res = await axios.get(`http://localhost:5004/api/courier/track/${orderId}`);
      setTrackingData(res.data);
      toast.dismiss(loadingToast);
      setIsTrackingModalOpen(true);
    } catch (err) {
      toast.error("Tracking information not found", { id: loadingToast });
    }
  };

  // Function to validate form
  const validateUpdate = () => {
    let newErrors = {};
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|org|pk)$/;
    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else {
      const emailLower = formData.email.toLowerCase();
      if (!strictEmailRegex.test(emailLower)) {
        newErrors.email = "Please enter a valid email (e.g., name@gmail.com)";
      }
    }
    return newErrors;
  };

  // Function to save profile
  const handleSave = async () => {
    const newErrors = validateUpdate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the errors");
      return; 
    }
    const loadingToast = toast.loading("Updating profile...");
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5004/api/auth/update', formData, {
        headers: { 'x-auth-token': token }
      });
      setUser(prev => ({
        ...prev,
        username: formData.username,
        email: formData.email,
        profilePic: formData.profilePic
      }));
      setIsEditing(false);
      setPreview(null);
      toast.success('Profile updated successfully!', { id: loadingToast, duration: 1500 });
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.msg || 'Update failed.', { id: loadingToast });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    const updatedFormData = { ...formData, [name]: value };
    let newErrors = {};
    const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|org|pk)$/;
    if (!updatedFormData.username || updatedFormData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    }
    if (!updatedFormData.email) {
      newErrors.email = "Email is required";
    } else {
      const emailLower = updatedFormData.email.toLowerCase();
      if (!strictEmailRegex.test(emailLower)) {
        newErrors.email = "Please enter a valid email";
      }
    }
    setErrors(newErrors);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG and PNG images are allowed!');
        return;
      }
      if (file.size > 6 * 1024 * 1024) {
        toast.error('Image is too large! Please select a file smaller than 6MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'100px', fontWeight:'bold'}}>Loading dashboard...</div>;

  const currentPic = preview !== null ? preview : user?.profilePic;
  const displayPic = currentPic || defaultImage;

  return (
    <div className="user-dashboard-container">
      <Toaster position="top-center" />

      {/* Tracking Modal */}
      {isTrackingModalOpen && trackingData && (
        <div className="tracking-overlay">
          <div className="tracking-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '18px' : '20px' }}><Truck size={20} color="#3b82f6" /> Order Tracking</h3>
              <button onClick={() => setIsTrackingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Tracking ID: <b style={{ color: '#111' }}>{trackingData.trackingId}</b></p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Courier Service: <b style={{ color: '#111' }}>{trackingData.courier}</b></p>
              
              <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '10px', marginTop: '15px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#0369a1', fontWeight: 'bold', textTransform: 'uppercase' }}>Current Status</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0284c7' }}>{trackingData.status}</p>
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a', flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#b45309' }}>Expected Delivery</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#92400e' }}>
                    {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsTrackingModalOpen(false)} className="save-changes-btn" style={{ width: '100%', marginTop: '20px' }}>Close</button>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <div className="sidebar-container">
        <div className="profile-img-container">
          <img src={displayPic} alt="Profile" className="avatar-img" />
          {isEditing && (
            <>
              <button onClick={() => fileInputRef.current.click()} className="cam-btn">
                <Camera size={14} color="#fff" />
              </button>
              {currentPic && (
                <button 
                  onClick={() => { setPreview(''); setFormData(prev => ({ ...prev, profilePic: '' })); }} 
                  className="remove-pic-btn"
                  title="Remove picture"
                >
                  <X size={12} color="#fff" strokeWidth={3} />
                </button>
              )}
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" style={{display:'none'}} />
        </div>
        <h3 className="side-name">{user?.username || user?.name || 'User'}</h3>
        <span className="member-badge">Verified Member</span>

        <div style={{marginTop:'40px', display:'flex', flexDirection: isTablet ? 'row' : 'column', gap:'10px', justifyContent: isTablet ? 'center' : 'stretch'}}>
            <button onClick={() => navigate('/')} className="sidebar-menu-btn" style={{ width: isTablet ? 'auto' : '100%' }}><Package size={18}/> Back to Shop</button>
            <button onClick={logout} className="sidebar-menu-btn" style={{ color:'#ff4d4d', width: isTablet ? 'auto' : '100%' }}><LogOut size={18}/> Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <h2 style={{margin:0, fontSize: isMobile ? '20px' : '24px', fontWeight:'800'}}>Account Settings</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="edit-profile-btn" style={{ width: isMobile ? '100%' : 'auto' }}><Edit2 size={16}/> Edit Profile</button>
          ) : (
            <div style={{display:'flex', gap:'10px', width: isMobile ? '100%' : 'auto'}}>
                <button onClick={() => { setIsEditing(false); setPreview(null); setErrors({}); }} className="cancel-edit-btn" style={{ flex: isMobile ? 1 : 'none' }}><X size={16}/></button>
                <button 
                  onClick={handleSave} 
                  className="save-changes-btn"
                  style={{
                    flex: isMobile ? 2 : 'none',
                    opacity: Object.keys(errors).length > 0 ? 0.6 : 1,
                    cursor: Object.keys(errors).length > 0 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={Object.keys(errors).length > 0}
                >
                  <Save size={16}/> {isMobile ? 'Save' : 'Save Changes'}
                </button>
            </div>
          )}
        </div>

        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label"><User size={16}/> Username</span> 
            {isEditing ? (
              <div style={{ width: isMobile ? '100%' : '55%' }}>
                <input 
                  name="username"
                  className="settings-input"
                  style={{ width: '100%', border: errors.username ? '1px solid #ef4444' : '1px solid #ddd' }} 
                  value={formData.username} 
                  onChange={handleInputChange} 
                />
                {errors.username && <p style={{color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: 'bold'}}>{errors.username}</p>}
              </div>
            ) : <b style={{fontSize:'15px'}}>{user?.username || user?.name}</b>}
          </div>
          <div className="settings-row" style={{ borderBottom:'none' }}>
            <span className="settings-label"><Mail size={16}/> Email Address</span> 
            {isEditing ? (
              <div style={{ width: isMobile ? '100%' : '55%' }}>
                <input 
                  name="email"
                  className="settings-input"
                  style={{ width: '100%', border: errors.email ? '1px solid #ef4444' : '1px solid #ddd' }} 
                  value={formData.email} 
                  onChange={handleInputChange} 
                />
                {errors.email && <p style={{color: '#ef4444', fontSize: '11px', marginTop: '5px', fontWeight: 'bold'}}>{errors.email}</p>}
              </div>
            ) : <b style={{fontSize:'15px', wordBreak: 'break-all'}}>{user?.email}</b>}
          </div>
        </div>

        <div style={{marginTop:'40px'}}>
            <h3 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}><Clock size={22}/> Order History</h3>
            <div className="history-container">
              {fetchingOrders ? (
                <p style={{textAlign:'center', color:'#888'}}>Checking orders...</p>
              ) : orders.length > 0 ? (
                <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <span style={{ fontWeight: 'bold', color: '#555', fontSize: isMobile ? '13px' : '15px' }}>Payment: {order.paymentMethod === 'Safepay' ? 'Safepay (Online)' : 'Cash on Delivery'}</span>
                        <div style={{display:'flex', gap: isMobile ? '8px' : '10px', alignItems:'center', flexWrap: 'wrap'}}>
                          {/* TRACK BUTTON */}
                          <button 
                            onClick={() => handleTrackOrder(order._id)}
                            style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '12px' : '13px', fontWeight: 'bold', padding: 0 }}
                          >
                            <Truck size={14}/> Track
                          </button>
                          {/* CANCEL BUTTON */}
                          {order.status !== 'Delivered' && (
                            <button 
                              onClick={() => handleCancelOrder(order._id)}
                              style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: isMobile ? '12px' : '13px', fontWeight: 'bold', padding: 0 }}
                            >
                              <Trash2 size={14}/> Cancel
                            </button>
                          )}
                          <span style={{ padding: isMobile ? '3px 10px' : '5px 15px', borderRadius: '20px', fontSize: isMobile ? '10px' : '12px', fontWeight: 'bold', backgroundColor: order.status === 'Delivered' ? '#22c55e' : (order.status === 'Pending' ? '#eab308' : '#3b82f6'), color: '#fff' }}>{order.status || 'Pending'}</span>
                        </div>
                      </div>
                      <div className="order-id-date">
                        <div>
                          <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>Order ID: {order._id}</p>
                          <p style={{ margin: 0, fontWeight: '700', fontSize:'14px' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {order.orderItems && order.orderItems.map((item, index) => (
                        <div key={index} className="order-item-row">
                          <img src={item.image} alt="" className="order-item-img" />
                          <div style={{flex: 1}}>
                            <p style={{margin: 0, fontWeight: '600', fontSize: '14px'}}>{item.name}</p>
                            <p style={{margin: 0, fontSize: '12px', color: '#666'}}>Quantity: {item.quantity}</p>
                          </div>
                          <p style={{fontWeight: '700'}}>Rs {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                      
                      {/* Price Breakdown */}
                      <div className="price-breakdown-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#888', fontSize: '13px' }}>Items Subtotal:</span>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>Rs {(order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#888', fontSize: '13px' }}>Delivery Cost:</span>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>Rs {(order.deliveryCost || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                          <span style={{ color: '#111', fontSize: '14px', fontWeight: 'bold' }}>Total Amount:</span>
                          <span style={{ color: '#e9b94d', fontSize: '16px', fontWeight: '800' }}>Rs {(order.totalPrice || order.totalAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-history-box">
                    <Package size={40} color="#ddd" />
                    <p style={{color:'#999', marginTop:'10px'}}>No orders found.</p>
                    <button onClick={() => navigate('/')} style={{color:'#e9b94d', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>Start Shopping <ChevronRight size={14} /></button>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

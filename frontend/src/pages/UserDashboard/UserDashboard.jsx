import React, { useContext, useState, useEffect, useRef } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Package, LogOut, Edit2, Save, X, Clock, Camera, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logout, loading, setUser } = useContext(ShopContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const defaultImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // --- RESPONSIVE STATE ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;

  // Form & Orders states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', profilePic: '' });
  const [preview, setPreview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({ 
        username: user.username || user.name || '', 
        email: user.email || '', 
        profilePic: user.profilePic || '' 
      });
    }
  }, [user]);

  // --- FETCH ORDERS LOGIC ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/orders/myorders', {
          headers: { 'x-auth-token': token }
        });
        setOrders(res.data); 
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setFetchingOrders(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image too large! Please select under 2MB.');
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

  // --- YAHAN FIX KIYA GAYA HAI ---
  const handleSave = async () => {
    const loadingToast = toast.loading("Updating profile...");
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/update', formData, {
        headers: { 'x-auth-token': token }
      });
      
      // INSTANT UI UPDATE: Backend jo bhi bheje, hum apna frontend khud update kar lenge!
      setUser(prev => ({
        ...prev,
        username: formData.username,
        name: formData.username, // In case aapka backend 'name' use karta ho
        email: formData.email,
        profilePic: formData.profilePic || prev?.profilePic
      }));

      setIsEditing(false);
      setPreview(null);
      toast.success('Profile Updated Successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Update failed.', { id: loadingToast });
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'100px', fontWeight:'bold'}}>Loading Dashboard...</div>;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      padding: isMobile ? '15px' : '40px 8%',
      gap: '20px',
      backgroundColor: '#fcfcfc',
      minHeight: '100vh'
    }}>
      <Toaster position="top-center" />
      
      {/* Sidebar */}
      <div style={{ ...sidebar, width: isMobile ? '100%' : '300px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '100px', margin: '0 auto' }}>
          <img src={preview || user?.profilePic || defaultImage} alt="Profile" style={avatarImg} />
          {isEditing && (
            <button onClick={() => fileInputRef.current.click()} style={camBtn}>
              <Camera size={14} color="#fff" />
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" style={{display:'none'}} />
        </div>
        <h3 style={sideName}>{user?.username || user?.name || 'User'}</h3>
        <span style={badge}>Verified Member</span>

        <div style={{marginTop:'40px', display:'flex', flexDirection:'column', gap:'10px'}}>
            <button onClick={() => navigate('/')} style={menuBtn}><Package size={18}/> Back to Shop</button>
            <button onClick={logout} style={{...menuBtn, color:'#ff4d4d'}}><LogOut size={18}/> Logout Session</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ ...main, padding: isMobile ? '20px' : '40px' }}>
        <div style={header}>
          <h2 style={{margin:0, fontSize: isMobile ? '20px' : '24px', fontWeight:'800'}}>Account Settings</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={editBtn}><Edit2 size={16}/> {isMobile ? '' : 'Edit Profile'}</button>
          ) : (
            <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => { setIsEditing(false); setPreview(null); }} style={cancelBtn}><X size={16}/></button>
                <button onClick={handleSave} style={saveBtn}><Save size={16}/> Save</button>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{...row, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '10px' : '0'}}>
            <span style={lbl}><User size={16}/> Username</span> 
            {isEditing ? <input style={{...inp, width: isMobile ? '100%' : '55%'}} value={formData.username} onChange={e=>setFormData({...formData, username:e.target.value})} /> : <b style={{fontSize:'15px'}}>{user?.username || user?.name}</b>}
          </div>
          <div style={{...row, borderBottom:'none', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '10px' : '0'}}>
            <span style={lbl}><Mail size={16}/> Email Address</span> 
            {isEditing ? <input style={{...inp, width: isMobile ? '100%' : '55%'}} value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} /> : <b style={{fontSize:'15px', wordBreak: 'break-all'}}>{user?.email}</b>}
          </div>
        </div>

        {/* Order History Section */}
        <div style={{marginTop:'40px'}}>
            <h3 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}><Clock size={22}/> Order History</h3>
            
            <div style={scrollContainer}>
              {fetchingOrders ? (
                <p style={{textAlign:'center', color:'#888'}}>Checking orders...</p>
              ) : orders.length > 0 ? (
                <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                  {orders.map((order) => (
                    <div key={order._id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>
                          Payment: {order.paymentMethod || 'Cash on Delivery'}
                        </span>
                        <span style={{ 
                          padding: '5px 15px', 
                          borderRadius: '20px', 
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: order.status === 'Delivered' ? '#22c55e' : (order.status === 'Pending' ? '#eab308' : '#3b82f6'),
                          color: '#fff'
                        }}>
                          {order.status || 'Pending'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>Order ID: {order._id}</p>
                          <p style={{ margin: 0, fontWeight: '700', fontSize:'14px' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {order.orderItems && order.orderItems.map((item, index) => (
                        <div key={index} style={itemRow}>
                          <img src={item.image} alt="" style={itemImg} />
                          <div style={{flex: 1}}>
                            <p style={{margin: 0, fontWeight: '600', fontSize: '14px'}}>{item.name}</p>
                            <p style={{margin: 0, fontSize: '12px', color: '#666'}}>Qty: {item.quantity}</p>
                          </div>
                          <p style={{fontWeight: '700'}}>Rs {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}

                      <div style={orderTotal}>
                        <span style={{ color: '#888', fontSize: '14px' }}>Grand Total:</span>
                        <b style={{ fontSize: '18px', color: '#e9b94d' }}>Rs {(order.totalPrice || order.totalAmount || 0).toFixed(2)}</b>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={emptyHistory}>
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

// --- Styles ---
const sidebar = { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', height: 'fit-content', border: '1px solid #f0f0f0' };
const avatarImg = { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f9f9f9', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const camBtn = { position: 'absolute', bottom: '0', right: '5px', backgroundColor: '#111', borderRadius: '50%', padding: '8px', border: '2px solid #fff', cursor: 'pointer' };
const sideName = { marginTop: '15px', wordBreak: 'break-all', fontSize: '18px', fontWeight: '700' };
const badge = { fontSize: '10px', backgroundColor: '#f0fdf4', color: '#28a745', padding: '5px 14px', borderRadius: '20px', fontWeight: '800', textTransform:'uppercase' };
const main = { flex: 1, backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const card = { border: '1px solid #f5f5f5', borderRadius: '20px', padding: '5px 25px', backgroundColor: '#fafafa' };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #eeeeee' };
const lbl = { color: '#888', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' };
const inp = { padding: '10px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' };
const editBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '50px', border: '1px solid #eee', cursor: 'pointer', backgroundColor: '#fff', fontWeight: '600', fontSize: '14px' };
const saveBtn = { ...editBtn, backgroundColor: '#111', color: '#fff', border: 'none' };
const cancelBtn = { ...editBtn, backgroundColor: '#fff', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '10px' };
const menuBtn = { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', borderRadius: '12px' };
const itemRow = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' };
const itemImg = { width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#fff' };
const orderTotal = { borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const scrollContainer = { maxHeight: '520px', overflowY: 'auto', paddingRight: '8px' };
const emptyHistory = { textAlign: 'center', padding: '40px', border: '2px dashed #eee', borderRadius: '20px' };

export default UserDashboard;
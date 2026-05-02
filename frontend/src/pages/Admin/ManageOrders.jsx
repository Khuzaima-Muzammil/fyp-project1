// Importing React and necessary libraries
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/ManageOrders.css';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // --- DATA FETCHING (Fetching orders from backend) ---
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5004/api/orders', {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      }); 
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Orders fetching error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Function to handle order status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5004/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) { 
      alert("Could not update order status."); 
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2 className="header-title">Orders Management</h2>
        <p className="header-subtitle">Here you can view all orders and customer details.</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <h2 className="loading-text">Loading Orders...</h2>
        </div>
      ) : isMobile ? (
        <div className="mobile-orders-list">
          {orders.map((order) => {
            const customer = order.user || order.userId || {};
            const items = order.orderItems || order.products || [];
            const displayName = customer.name || customer.username || (customer.email ? customer.email.split('@')[0] : "Guest User");

            return (
              <div key={order._id} className="mobile-order-card">
                <div className="mobile-card-header">
                  <span className="order-id-badge">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="customer-info-brief">
                  <div className="customer-name">{displayName}</div>
                  <div className="customer-email">{customer.email}</div>
                </div>

                <div className="order-items-brief">
                  {items.map((item, idx) => (
                    <div key={idx} className="brief-item">
                      <img 
                        src={item.image || item.product?.image || 'https://via.placeholder.com/40'} 
                        alt="prod" 
                        className="brief-item-img" 
                      />
                      <div className="brief-item-details">
                        <span style={{ fontWeight: '600' }}>{item.name || item.product?.name}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mobile-card-footer">
                  <div className="total-price">Rs {order.totalPrice || order.totalAmount || 0}</div>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`status-select status-${order.status.toLowerCase()}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr className="thead-row">
                <th className="th-style">Order ID</th>
                <th className="th-style">Customer Details</th>
                <th className="th-style">Products</th>
                <th className="th-style">Shipping Info</th>
                <th className="th-style">Payment</th>
                <th className="th-style">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const customer = order.user || order.userId || {};
                const items = order.orderItems || order.products || [];

                // Name Resolver Logic
                const displayName = customer.name || 
                                    customer.username || 
                                    (customer.email ? customer.email.split('@')[0] : "Guest User");

                return (
                  <tr key={order._id} className="tr-style">
                    {/* 1. Order ID */}
                    <td className="td-style">
                      <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '13px' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* 2. Customer Details */}
                    <td className="td-style">
                      <div style={{ fontWeight: '600', color: '#1e293b', textTransform: 'capitalize', fontSize: '14px' }}>
                        {displayName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {customer.email || 'No email provided'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {order.phone || customer.phone || 'N/A'}
                      </div>
                    </td>

                    {/* 3. Products Section */}
                    <td className="td-style">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {items.map((item, idx) => (
                          <div key={idx} className="product-item">
                            <img 
                              src={item.image || item.product?.image || 'https://via.placeholder.com/40'} 
                              alt="prod" 
                              className="product-img" 
                            />
                            <div className="product-info-text">
                              <div style={{ fontWeight: '600' }}>{item.name || item.product?.name}</div>
                              <div style={{ color: '#94a3b8' }}>Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* 4. Shipping Info */}
                    <td className="td-style">
                      <div className="shipping-address-text">
                        {order.shippingAddress || order.address || 'Address not available'}
                      </div>
                    </td>

                    {/* 5. Payment */}
                    <td className="td-style">
                      <div className="total-price">
                        Rs {order.totalPrice || order.totalAmount || 0}
                      </div>
                    </td>

                    {/* 6. Status Action */}
                    <td className="td-style">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`status-select status-${order.status.toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;

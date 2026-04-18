import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-world: Admin Status update karta hai
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      
      // Screen par foran update karne ke liye
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Status update nahi ho saka.");
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Manage Orders</h1>
      <p style={{ color: '#666', marginTop: '10px', marginBottom: '30px' }}>
        Yahan se aap tamam orders ko manage aur unka status update kar sakte hain.
      </p>

      {loading ? (
        <h2>Loading Orders...</h2>
      ) : orders.length === 0 ? (
        <p>Abhi tak koi order nahi aaya.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Total Amount</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Action (Status)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              // Purane aur naye database fields dono ko handle karne ke liye
              const customerName = order.user?.name || order.userId?.name || 'Guest User';
              const total = order.totalAmount || order.totalPrice || 0;

              return (
                <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}><small>{order._id}</small></td>
                  <td style={tdStyle}>{customerName}</td>
                  <td style={tdStyle}><b>Rs {total}</b></td>
                  <td style={tdStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    {/* Real-world Status Update Dropdown */}
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        backgroundColor: order.status === 'Delivered' ? '#dcfce3' : order.status === 'Pending' ? '#fef08a' : '#e0e7ff',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
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
      )}
    </div>
  );
};

const thStyle = { padding: '15px', borderBottom: '2px solid #ddd', color: '#333' };
const tdStyle = { padding: '15px', color: '#555' };

export default ManageOrders;
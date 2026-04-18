import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Package, ShoppingCart, Users, TrendingUp, PlusCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { products } = useContext(ShopContext);
  const [apiStats, setApiStats] = useState({
    products: products?.length || 0,
    orders: 0,
    users: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } };

        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          axios.get('http://localhost:5000/api/orders', config),
          axios.get('http://localhost:5000/api/products'), 
          axios.get('http://localhost:5000/api/users', config) 
        ]);

        let totalOrders = 0, totalRevenue = 0, totalProducts = products?.length || 0, totalUsers = 0;

        if (ordersRes.status === 'fulfilled') {
          totalOrders = ordersRes.value.data.length;
          totalRevenue = ordersRes.value.data.reduce((total, order) => total + (order.totalPrice || order.totalAmount || 0), 0);
        }
        if (productsRes.status === 'fulfilled') totalProducts = productsRes.value.data.length;
        if (usersRes.status === 'fulfilled') totalUsers = usersRes.value.data.length;

        setApiStats({ orders: totalOrders, products: totalProducts, users: totalUsers, revenue: totalRevenue.toFixed(2) });
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchDashboardData();
  }, [products]);

  const stats = [
    { id: 1, title: 'Products', value: apiStats.products, icon: <Package size={20} />, color: '#3b82f6' },
    { id: 2, title: 'Orders', value: apiStats.orders, icon: <ShoppingCart size={20} />, color: '#10b981' },
    { id: 3, title: 'Users', value: apiStats.users, icon: <Users size={20} />, color: '#f59e0b' },
    { id: 4, title: 'Revenue', value: `Rs ${apiStats.revenue}`, icon: <TrendingUp size={20} />, color: '#8b5cf6' },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={statsGridStyle}>
        {stats.map((item) => (
          <div key={item.id} style={statCardStyle}>
            <div style={{ ...iconBoxStyle, backgroundColor: item.color + '15', color: item.color }}>
              {item.icon}
            </div>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{item.title}</p>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={tableContainerStyle}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/manage-products" style={actionButtonStyle}>
            <PlusCircle size={18} /> Add Product
          </Link>
          <Link to="/admin/manage-orders" style={secondaryActionButton}>
            <Eye size={18} /> Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

// Styles
const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '30px' };
const statCardStyle = { backgroundColor: '#fff', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9' };
const iconBoxStyle = { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tableContainerStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' };
const actionButtonStyle = { backgroundColor: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' };
const secondaryActionButton = { ...actionButtonStyle, backgroundColor: '#f1f5f9', color: '#475569' };

export default Dashboard;
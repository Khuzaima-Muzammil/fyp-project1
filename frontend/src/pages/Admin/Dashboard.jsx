// Importing React and necessary components
import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Package, ShoppingCart, Users, TrendingUp, PlusCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  // Extracting products from global context
  const { products } = useContext(ShopContext);
  
  // State for dashboard statistics
  const [apiStats, setApiStats] = useState({
    products: products?.length || 0,
    orders: 0,
    users: 0,
    revenue: 0
  });

  // --- RESPONSIVE LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // --- DATA FETCHING (Fetching dashboard data from the backend) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } };

        // Sending all three requests simultaneously
        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          axios.get('http://localhost:5004/api/orders', config), // Orders data
          axios.get('http://localhost:5004/api/products'),       // Products data
          axios.get('http://localhost:5004/api/users', config)   // Users data
        ]);

        let totalOrders = 0, totalRevenue = 0, totalProducts = products?.length || 0, totalUsers = 0;

        // Checking the results
        if (ordersRes.status === 'fulfilled') {
          totalOrders = ordersRes.value.data.length;
          totalRevenue = ordersRes.value.data.reduce((total, order) => total + (order.totalPrice || order.totalAmount || 0), 0);
        }
        if (productsRes.status === 'fulfilled') totalProducts = productsRes.value.data.length;
        if (usersRes.status === 'fulfilled') totalUsers = usersRes.value.data.length;

        setApiStats({ orders: totalOrders, products: totalProducts, users: totalUsers, revenue: totalRevenue.toFixed(2) });
      } catch (error) {
        console.error("Dashboard data error:", error);
      }
    };
    fetchDashboardData();
  }, [products]);

  // List of statistics cards
  const stats = [
    { id: 1, title: 'Total Products', value: apiStats.products, icon: <Package size={20} />, color: '#3b82f6' },
    { id: 2, title: 'Total Orders', value: apiStats.orders, icon: <ShoppingCart size={20} />, color: '#10b981' },
    { id: 3, title: 'Total Users', value: apiStats.users, icon: <Users size={20} />, color: '#f59e0b' },
    { id: 4, title: 'Total Revenue', value: `Rs ${apiStats.revenue}`, icon: <TrendingUp size={20} />, color: '#8b5cf6' },
  ];

  return (
    <div className="dashboard-container">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((item) => (
          <div key={item.id} className="stat-card">
            <div className="icon-box" style={{ backgroundColor: item.color + '15', color: item.color }}>
              {item.icon}
            </div>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: isMobile ? '10px' : '12px' }}>{item.title}</p>
              <h3 style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', fontWeight: '800' }}>{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="actions-container">
        <h3 style={{ marginBottom: '20px', fontSize: isMobile ? '14px' : '16px', fontWeight: '700' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row' }}>
          <Link to="/admin/manage-products" className="action-btn">
            <PlusCircle size={18} /> Add Product
          </Link>
          <Link to="/admin/manage-orders" className="secondary-action-btn">
            <Eye size={18} /> View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
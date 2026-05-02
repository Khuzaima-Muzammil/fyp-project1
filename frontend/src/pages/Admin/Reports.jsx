import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Download, TrendingUp, Package, DollarSign, FileText, ShoppingBag, 
  PieChart as PieChartIcon, AlertCircle, ShoppingCart, Activity, Users, ChevronRight
} from 'lucide-react';
import { ShopContext } from '../../context/ShopContext';
import toast from 'react-hot-toast';
import '../../styles/Reports.css';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllBestSellers, setShowAllBestSellers] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const { settings } = useContext(ShopContext);

  useEffect(() => {
    fetchAnalytics();
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5004/api/admin/analytics', {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      setData(data);
      if (isRefresh) toast.success('Analytics updated!');
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadCSV = () => {
    if (!data) return;
    
    let csvContent = "data:text/csv;charset=utf-8,Metric,Value\n";
    csvContent += `Total Inventory Value,${data.inventoryMetrics.totalInventoryValue}\n`;
    csvContent += `Potential Revenue,${data.inventoryMetrics.totalPotentialRevenue}\n`;
    csvContent += `Actual Revenue So Far,${data.inventoryMetrics.actualRevenueSoFar}\n`;
    csvContent += `Actual Profit So Far,${data.inventoryMetrics.actualProfitSoFar}\n`;
    csvContent += `Est. Potential Profit from Stock,${data.inventoryMetrics.estimatedPotentialProfit}\n`;
    csvContent += `Average Order Value,${data.inventoryMetrics.averageOrderValue}\n`;
    csvContent += `Total Orders,${data.inventoryMetrics.totalOrders}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `store_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded as CSV');
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Analyzing store performance...</p>
    </div>
  );

  if (!data) return <div className="no-data">No data available</div>;

  const COLORS = ['#111', '#4a5568', '#718096', '#a0aec0', '#cbd5e0'];

  const stats = [
    { label: 'Total Revenue', value: data.inventoryMetrics.actualRevenueSoFar, icon: <TrendingUp size={24} />, color: '#ebf8ff', iconColor: '#3182ce', sub: 'Actual sales' },
    { label: 'Real Profit', value: data.inventoryMetrics.actualProfitSoFar, icon: <DollarSign size={24} />, color: '#f0fff4', iconColor: '#38a169', sub: 'Earnings so far' },
    { label: 'Avg Order Value', value: data.inventoryMetrics.averageOrderValue, icon: <ShoppingCart size={24} />, color: '#fffaf0', iconColor: '#dd6b20', sub: 'Per checkout' },
    { label: 'Units Sold', value: data.inventoryMetrics.totalUnitsSold, icon: <Package size={24} />, color: '#faf5ff', iconColor: '#805ad5', sub: 'Total items sold' }
  ];

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2 className="header-title">Business Intelligence Dashboard</h2>
          <p className="header-subtitle">Real-time performance monitoring and stock analytics.</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => fetchAnalytics(true)} 
            disabled={refreshing}
            className={`action-btn refresh-btn ${refreshing ? 'refreshing' : ''}`}
          >
            <Activity size={isMobile ? 16 : 18} className={refreshing ? "animate-spin" : ""} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={downloadCSV} className="action-btn download-btn">
            <Download size={isMobile ? 16 : 18} /> Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color, color: stat.iconColor }}>
              {React.cloneElement(stat.icon, { size: isMobile ? 20 : 24 })}
            </div>
            <div style={{ flex: 1 }}>
              <p className="stat-label">{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <h3 className="stat-value">
                  {settings?.currency?.symbol || 'Rs'} {stat.value.toLocaleString()}
                </h3>
              </div>
              <p className="stat-sub">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Main Sales Chart */}
        <div className="card-style card-span-2">
          <div className="card-header">
            <h3 className="card-title"><Activity size={20} /> Sales Trend</h3>
            <span className="badge">Monthly Performance</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySales.map(m => ({ 
                name: `${m._id.month}/${m._id.year}`, 
                sales: m.totalSales 
              }))}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#111" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: isMobile ? 10 : 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: isMobile ? 10 : 12}} width={isMobile ? 35 : 60} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${settings?.currency?.symbol || 'Rs'} ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#111" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card-style">
          <div className="card-header">
            <h3 className="card-title"><AlertCircle size={20} color="#ef4444" /> Low Stock Alerts</h3>
            <span className="badge low-stock-badge">{data.lowStockProducts.length} items</span>
          </div>
          <div className="alert-list">
            {data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.slice(0, 6).map((item, idx) => (
                <div key={idx} className="alert-row">
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: isMobile ? '13px' : '14px', color: '#1e293b' }}>{item.name}</p>
                    <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#ef4444', fontWeight: '600' }}>Only {item.stock} units left</p>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(item.stock / 10) * 100}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>All stock levels are healthy.</p>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="card-style">
          <div className="card-header">
            <h3 className="card-title"><PieChartIcon size={20} /> Sales by Category</h3>
          </div>
          <div className="pie-chart-container">
            {data.categoryRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryRevenue}
                    dataKey="revenue"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 70 : 80}
                    paddingAngle={5}
                    label={({ _id, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${_id || 'Other'} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${settings?.currency?.symbol || 'Rs'} ${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                No category data available
              </div>
            )}
          </div>
          <div className="category-legend">
            {data.categoryRevenue.slice(0, 4).map((cat, i) => (
              <div key={i} className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="legend-label">{cat._id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="card-style card-span-2">
          <div className="card-header">
            <h3 className="card-title"><ShoppingBag size={20} /> Top Performing Products</h3>
            {data.bestSellers.length > 5 && (
              <button 
                onClick={() => setShowAllBestSellers(!showAllBestSellers)}
                className="view-all-btn"
              >
                {showAllBestSellers ? 'Show Less' : 'View All'} 
                <ChevronRight size={16} style={{ transform: showAllBestSellers ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
              </button>
            )}
          </div>
          <div className="best-sellers-table-container">
            {isMobile ? (
              <div className="best-sellers-mobile-list">
                {data.bestSellers.length > 0 ? (
                  (showAllBestSellers ? data.bestSellers : data.bestSellers.slice(0, 5)).map((product, index) => (
                    <div key={index} className="best-seller-mobile-card">
                      <div className="mobile-card-header">
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{product.name}</span>
                        <span className="high-trend-badge">
                          High
                        </span>
                      </div>
                      <div className="mobile-card-footer">
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Units Sold: {product.totalSold}</span>
                        <span style={{ fontWeight: '800', color: '#38a169', fontSize: '14px' }}>
                          {settings?.currency?.symbol || 'Rs'} {product.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No sales data available yet.</p>
                )}
              </div>
            ) : (
              <table className="best-sellers-table">
                <thead>
                  <tr>
                    <th className="table-th">Product Name</th>
                    <th className="table-th">Units Sold</th>
                    <th className="table-th">Revenue</th>
                    {!isMobile && <th className="table-th">Trend</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.bestSellers.length > 0 ? (
                    (showAllBestSellers ? data.bestSellers : data.bestSellers.slice(0, 5)).map((product, index) => (
                      <tr key={index} className="table-tr">
                        <td className="table-td" style={{ fontWeight: '700', color: '#0f172a' }}>{product.name}</td>
                        <td className="table-td">{product.totalSold} Units</td>
                        <td className="table-td" style={{ fontWeight: '800', color: '#38a169' }}>
                          {settings?.currency?.symbol || 'Rs'} {product.revenue.toLocaleString()}
                        </td>
                        {!isMobile && (
                          <td className="table-td">
                            <span className="high-trend-badge">
                              High
                            </span>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isMobile ? "3" : "4"} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No sales data available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Status */}
        <div className="card-style">
          <div className="card-header">
            <h3 className="card-title"><Activity size={20} /> Order Health</h3>
          </div>
          <div className="order-health-list">
            {data.orderStatusBreakdown.map((status, i) => (
              <div key={i}>
                <div className="order-health-item-header">
                  <span className="health-status-label">{status._id}</span>
                  <span className="health-status-count">{status.count}</span>
                </div>
                <div className="health-progress-bar">
                  <div className="health-progress-fill" style={{ backgroundColor: i === 0 ? '#111' : '#94a3b8', width: `${(status.count / (data.inventoryMetrics.totalOrders || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

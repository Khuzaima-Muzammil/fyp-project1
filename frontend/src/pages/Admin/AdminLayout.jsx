import React, { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useContext(ShopContext);
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLinkStyle = (path) => (location.pathname === path ? navLinkActive : navLinkStyle);

  return (
    <div style={containerStyle}>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div style={overlayStyle} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ 
        ...sidebarStyle, 
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        position: isMobile ? 'fixed' : 'sticky',
        zIndex: 1001 
      }}>
        <div style={sidebarLogoContainer}>
          <div style={logoCircle}>L</div>
          <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>ADMIN</h2>
          {isMobile && <X onClick={() => setIsSidebarOpen(false)} style={{marginLeft: 'auto', cursor:'pointer'}} />}
        </div>
        
        <nav style={navContainer}>
          <p style={sectionTitle}>MAIN MENU</p>
          <Link to="/admin-dashboard" style={getLinkStyle('/admin-dashboard')} onClick={() => isMobile && setIsSidebarOpen(false)}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/manage-products" style={getLinkStyle('/admin/manage-products')} onClick={() => isMobile && setIsSidebarOpen(false)}>
            <Package size={18} /> Products
          </Link>
          <Link to="/admin/manage-orders" style={getLinkStyle('/admin/manage-orders')} onClick={() => isMobile && setIsSidebarOpen(false)}>
            <ShoppingCart size={18} /> Orders
          </Link>
          
          <button onClick={logout} style={logoutBtnStyle}>
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ ...mainContentStyle, padding: isMobile ? '20px' : '40px' }}>
        {/* Header jo har page par rahega */}
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(true)} style={menuToggleBtn}>
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: '800', textTransform: 'capitalize' }}>
                {location.pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
          </div>
          <div style={userProfileBadge}>
            <span style={{fontWeight: '600', fontSize: '12px'}}>{isMobile ? 'Admin' : user?.username || 'Admin'}</span>
          </div>
        </header>

        {/* YAHAN AAPKE BAAQI PAGES (Dashboard, Orders, etc) RENDER HONGE */}
        <Outlet /> 

      </main>
    </div>
  );
};

// --- Styles (Wahi purane wale hain) ---
const containerStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', width: '100%' };
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 };
const sidebarStyle = { width: '260px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', transition: 'transform 0.3s ease', top: 0, left: 0 };
const menuToggleBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#111', display: 'flex', alignItems: 'center', padding: '5px' };
const sidebarLogoContainer = { padding: '25px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1e293b' };
const logoCircle = { width: '30px', height: '30px', backgroundColor: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const navContainer = { padding: '15px', flex: 1 };
const sectionTitle = { fontSize: '10px', fontWeight: '700', color: '#475569', letterSpacing: '1px', padding: '0 10px', marginBottom: '10px' };
const navLinkStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#94a3b8', textDecoration: 'none', fontSize: '14px', borderRadius: '8px', marginBottom: '4px' };
const navLinkActive = { ...navLinkStyle, color: '#fff', backgroundColor: '#1e293b' };
const logoutBtnStyle = { ...navLinkStyle, background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: '#f87171', marginTop: '20px' };
const mainContentStyle = { flex: 1, overflowY: 'auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const userProfileBadge = { backgroundColor: '#fff', padding: '6px 12px', borderRadius: '50px', border: '1px solid #e2e8f0' };

export default AdminLayout;
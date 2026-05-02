// Importing React and global context
import React, { useState, useContext, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Mail, LogOut, Menu, X, Settings, Ticket, BarChart3 } from 'lucide-react';
import '../../styles/AdminLayout.css';

const AdminLayout = () => {
  // Extracting user and logout functions from ShopContext
  const { user, logout } = useContext(ShopContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // --- RESPONSIVE LOGIC (To handle screen size) ---
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLinkStyle = (path) => ({
    ...(location.pathname === path ? activeLink : navLink),
    height: (isMobile || isTablet) ? '50px' : '80px',
    borderBottom: location.pathname === path ? '3px solid #3182ce' : 'none'
  });

  const getMobileLinkStyle = (path) => ({
    ...mobileNavLink,
    backgroundColor: location.pathname === path ? '#ebf4ff' : 'transparent',
    color: location.pathname === path ? '#3182ce' : '#2d3748',
    borderLeft: location.pathname === path ? '4px solid #3182ce' : 'none',
    paddingLeft: location.pathname === path ? 'calc(5% - 4px)' : '5%'
  });

  return (
    <div className="admin-layout-container">
      {/* --- Full Width Navbar --- */}
      <nav className="admin-navbar">
        <div className="admin-nav-content">
          
          {/* Logo Section */}
          <Link to="/" className="admin-logo-link">
            <div className="admin-logo-circle">L</div>
            <span className="admin-logo-text">LUMIERE {!isMobile && <small className="admin-badge">ADMIN</small>}</span>
          </Link>

          {/* Desktop Links (For large screens) */}
          {!isMobile && !isTablet && (
            <div className="admin-desktop-links">
              <Link to="/admin-dashboard" className={`admin-nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/admin/manage-products" className={`admin-nav-link ${location.pathname === '/admin/manage-products' ? 'active' : ''}`}>
                <Package size={18} /> Products
              </Link>
              <Link to="/admin/manage-orders" className={`admin-nav-link ${location.pathname === '/admin/manage-orders' ? 'active' : ''}`}>
                <ShoppingCart size={18} /> Orders
              </Link>
              <Link to="/admin/manage-users" className={`admin-nav-link ${location.pathname === '/admin/manage-users' ? 'active' : ''}`}>
                <Users size={18} /> Users
              </Link>
              <Link to="/admin/newsletter" className={`admin-nav-link ${location.pathname === '/admin/newsletter' ? 'active' : ''}`}>
                <Mail size={18} /> Newsletter
              </Link>
              <Link to="/admin/reports" className={`admin-nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
                <BarChart3 size={18} /> Reports
              </Link>
              <Link to="/admin/coupons" className={`admin-nav-link ${location.pathname === '/admin/coupons' ? 'active' : ''}`}>
                <Ticket size={18} /> Coupons
              </Link>
              <Link to="/admin/settings" className={`admin-nav-link ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
                <Settings size={18} /> Settings
              </Link>
            </div>
          )}

          {/* User Section (Username and logout) */}
          <div className="admin-user-section">
            {!isMobile && !isTablet && <span className="admin-username-desktop">{user?.username || 'Admin'}</span>}
            
            <button onClick={logout} className="admin-logout-btn" title="Logout">
              <LogOut size={isMobile ? 18 : 20} />
            </button>
            
            {/* Mobile/Tablet Toggle Button */}
            {(isMobile || isTablet) && (
              <div className="admin-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={isMobile ? 24 : 28} /> : <Menu size={isMobile ? 24 : 28} />}
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Menu (Side Drawer) */}
        {(isMobile || isTablet) && (
          <div className={`admin-mobile-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
            <div className={`admin-mobile-menu ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
              <div className="admin-mobile-header">
                <div className="admin-logo-circle">L</div>
                <span className="admin-logo-text">LUMIERE ADMIN</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="admin-mobile-links">
                <Link to="/admin-dashboard" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/admin/manage-products" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/manage-products' ? 'active' : ''}`}>
                  <Package size={18} /> Products
                </Link>
                <Link to="/admin/manage-orders" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/manage-orders' ? 'active' : ''}`}>
                  <ShoppingCart size={18} /> Orders
                </Link>
                <Link to="/admin/manage-users" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/manage-users' ? 'active' : ''}`}>
                  <Users size={18} /> Users
                </Link>
                <Link to="/admin/newsletter" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/newsletter' ? 'active' : ''}`}>
                  <Mail size={18} /> Newsletter
                </Link>
                <Link to="/admin/reports" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
                  <BarChart3 size={18} /> Reports
                </Link>
                <Link to="/admin/coupons" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/coupons' ? 'active' : ''}`}>
                  <Ticket size={18} /> Coupons
                </Link>
                <Link to="/admin/settings" onClick={() => setIsMenuOpen(false)} className={`admin-mobile-nav-link ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
                  <Settings size={18} /> Settings
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- Main Content Area --- */}
      <main className="admin-main-area">
        <div className="admin-content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
// Importing React and icons
import React, { useContext, useState, useEffect } from "react";
import { ShoppingCart, Search, LogOut, LayoutDashboard, Menu, X } from "lucide-react"; // Icons library
import { Link, useNavigate, useLocation } from "react-router-dom"; // Navigation
import { ShopContext } from "../context/ShopContext"; // Data access
import "../styles/Navbar.css"; // CSS styles

const Navbar = () => {
  // Accessing context data
  const { cart = [], user, logout, searchTerm, setSearchTerm } = useContext(ShopContext);
  const navigate = useNavigate(); // Navigation function
  const location = useLocation(); // Current location
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state

  // Determine screen width for responsive design
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Set mobile view if screen width is less than 768px
  const isMobile = width < 768;
  // Show search bar only on specific pages
  const showSearch = location.pathname === "/";
  const isProfilePage = location.pathname === "/profile";
  const isAdminPage = location.pathname.includes("admin");

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/all-products`); // Redirect to products page on search
    }
  };

  return (
    <nav className="navbar-container">
      {/* Website Logo */}
      <Link to="/" className="navbar-logo">
        <h1>LUMIERE</h1>
      </Link>

      {/* Search Bar (Conditional) */}
      {showSearch ? (
        <form onSubmit={handleSearch} className="search-bar-container">
          <Search size={isMobile ? 14 : 18} color="#9ca3af" />
          <input
            type="text"
            className="search-input"
            placeholder={isMobile ? "Search..." : "Search products..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </form>
      ) : (
        <div style={{ flex: 1 }}></div> 
      )}

      {/* Right side buttons (Cart, Profile, Login) */}
      <div className="nav-right-section">
        
        {/* Admin Panel button if user is admin */}
        {user && user.role === 'admin' && (
          <Link to="/admin-dashboard" className={isMobile ? "admin-icon-mobile" : "admin-btn-desktop"}>
            {isMobile ? <LayoutDashboard size={20} /> : "Admin Panel"}
          </Link>
        )}

        {/* Desktop menu links */}
        {!isMobile && (
          <>
            <Link to="/budget-optimizer" className="nav-link-item" style={{ color: '#EAB308' }}>
              Optimizer
            </Link>
            <Link to="/all-products" className="nav-link-item">
              Products
            </Link>
          </>
        )}

        <div className="nav-profile-group">
          {/* Shopping Cart icon */}
          <Link to="/cart" className="cart-icon-wrapper">
            <ShoppingCart size={isMobile ? 20 : 22} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </Link>

          {/* User profile or login button */}
          {user ? (
            <div className="profile-section">
              <div onClick={() => navigate("/profile")} className="avatar-circle">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="User" className="avatar-img" />
                ) : (
                  <span>
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </span>
                )}
              </div>
              
              {!isMobile && !isProfilePage && !isAdminPage && (
                <button onClick={logout} className="logout-btn" title="Logout">
                  <LogOut size={20} />
                </button>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn-styled">
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Menu Icon for Mobile */}
        {isMobile && (
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {isMobile && (
        <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
          <div className={`mobile-menu-content ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h2>LUMIERE</h2>
              <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
            </div>
            <div className="mobile-menu-links">
              <Link to="/" className="mobile-nav-link">Home</Link>
              <Link to="/all-products" className="mobile-nav-link">Products</Link>
              <Link to="/budget-optimizer" className="mobile-nav-link" style={{ color: '#eab308' }}>Budget Optimizer</Link>
              <Link to="/cart" className="mobile-nav-link">Cart ({cart.length})</Link>
              {user && user.role === 'admin' && (
                <Link to="/admin-dashboard" className="mobile-nav-link" style={{ color: '#ef4444' }}>Admin Panel</Link>
              )}
              {user ? (
                <>
                  <Link to="/profile" className="mobile-nav-link">My Profile</Link>
                  <button onClick={logout} className="mobile-logout-btn">
                    <LogOut size={18} style={{ marginRight: '10px' }} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-nav-link">Login</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
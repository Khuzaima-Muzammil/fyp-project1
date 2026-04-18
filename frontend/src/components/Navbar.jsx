import React, { useContext, useState, useEffect } from "react";
import { ShoppingCart, Search, LogOut, LayoutDashboard } from "lucide-react"; 
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  // --- ShopContext se searchTerm aur setSearchTerm nikala ---
  const { cart = [], user, logout, searchTerm, setSearchTerm } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  // --- MOBILE CHECK LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); //end pr [] is liye kai ye aik dfa hi chlai yani agr kuch hota hai component ya button change hota tu is ko dobara na chlae

  const isMobile = width < 768;

  const showSearch = location.pathname === "/" || location.pathname === "/all-products";
  const isProfilePage = location.pathname === "/profile";
  const isAdminPage = location.pathname.includes("admin");

  const handleSearch = (e) => {
    e.preventDefault();
    // Agar user Enter dabaye toh wo all-products page par chala jaye
    if (searchTerm.trim()) {
      navigate(`/all-products`);
    }
  };

  return (
    <nav style={{...navStyle, padding: isMobile ? "15px 4%" : "15px 7%"}}>
      <Link to="/" style={{ textDecoration: "none", color: "#111" }}>
        <h1 style={{...logoTextStyle, fontSize: isMobile ? "18px" : "24px"}}>LUMIERE</h1>
      </Link>

      {/* Responsive Search Bar */}
      {showSearch ? (
        <form onSubmit={handleSearch} style={{
          ...searchBarContainer, 
          width: isMobile ? "45%" : "30%", 
          padding: isMobile ? "8px 12px" : "10px 20px"
        }}>
          <Search size={isMobile ? 14 : 18} color="#9ca3af" />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search products..."}
            style={{...searchInput, fontSize: isMobile ? "12px" : "14px"}}
            // --- Local state ki jagah Global searchTerm use kiya ---
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </form>
      ) : (
        <div style={{ flex: 1 }}></div> 
      )}

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "25px" }}>
        
        {/* --- ADMIN PANEL LINK --- */}
        {user && user.role === 'admin' && (
          <Link to="/admin-dashboard" style={isMobile ? adminIconStyle : adminBtnStyle}>
            {isMobile ? <LayoutDashboard size={20} /> : "Admin Panel"}
          </Link>
        )}

        {!isMobile && (
          <Link to="/all-products" style={navLink}>
            Products
          </Link>
        )}

        <Link to="/cart" style={{ position: "relative", color: "#111" }}>
          <ShoppingCart size={isMobile ? 20 : 22} />
          {cart.length > 0 && <span style={cartCount}>{cart.length}</span>}
        </Link>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "15px" }}>
            <div onClick={() => navigate("/profile")} style={{
              ...avatarCircle, 
              width: isMobile ? "32px" : "38px", 
              height: isMobile ? "32px" : "38px"
            }}>
              {user.profilePic ? (
                <img src={user.profilePic} alt="User" style={avatarImg} />
              ) : (
                <span style={{ fontSize: isMobile ? "12px" : "14px" }}>
                  {user.username ? user.username[0].toUpperCase() : "U"}
                </span>
              )}
            </div>
            
            {!isProfilePage && !isAdminPage && (
              <button onClick={logout} style={logoutBtn} title="Logout">
                <LogOut size={20} />
              </button>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            ...loginBtn, 
            padding: isMobile ? "8px 15px" : "10px 25px",
            fontSize: isMobile ? "12px" : "14px"
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

// --- Styles (Same as before) ---
const adminBtnStyle = { textDecoration: "none", color: "#ef4444", fontWeight: "800", fontSize: "14px", border: "2px solid #ef4444", padding: "8px 15px", borderRadius: "50px", transition: "0.3s", backgroundColor: "transparent" };
const adminIconStyle = { color: "#ef4444", display: "flex", alignItems: "center" };
const navStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 1000 };
const logoTextStyle = { margin: 0, fontWeight: "900", letterSpacing: "-1.5px", textTransform: "uppercase" };
const searchBarContainer = { display: "flex", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: "50px" };
const searchInput = { border: "none", background: "none", outline: "none", marginLeft: "10px", width: "100%" };
const navLink = { textDecoration: "none", color: "#111", fontWeight: "700", fontSize: "15px" };
const cartCount = { position: "absolute", top: "-10px", right: "-10px", background: "#111", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" };
const avatarCircle = { cursor: "pointer", backgroundColor: "#111", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", overflow: "hidden", border: "1px solid #eee" };
const avatarImg = { width: "100%", height: "100%", objectFit: "cover" };
const logoutBtn = { border: "none", background: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center" };
const loginBtn = { textDecoration: "none", backgroundColor: "#111", color: "#fff", borderRadius: "50px", fontWeight: "700" };

export default Navbar;
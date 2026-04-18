import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Shipping from "./pages/Shipping";
import InstallApp from "./pages/InstallApp";

// Admin Pages 
import AdminDashboard from "./pages/Admin/Dashboard";
import ManageProducts from "./pages/Admin/ManageProducts";
import ManageOrders from "./pages/Admin/ManageOrders";
import AdminLayout from "./pages/Admin/AdminLayout"; // <-- YEH NAYA IMPORT HAI

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Context
import { ShopProvider, ShopContext } from "./context/ShopContext";

function AppContent() {
  const { user, loading } = useContext(ShopContext);

  if (loading) return <div style={loadingStyle}>Loading Application...</div>;

  // ==========================================
  // 1. ADMIN LAYOUT (Sirf Admin ko dikhega)
  // ==========================================
  if (user && user.role === "admin") {
    return (
      <Router>
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f7fe" }}>
          {/* Admin ke liye Layout set kiya gaya hai */}
          <Routes>
            {/* AdminLayout ab in sab pages ko wrap karega */}
            <Route element={<AdminLayout />}>    {/* admin sidebar */}
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/manage-products" element={<ManageProducts />} />
              <Route path="/admin/manage-orders" element={<ManageOrders />} />
              
              {/* Admin agar kisi bhi aur path par jaye, usay dashboard par bhej do */}
              <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
            </Route>
          </Routes>
        </div>
      </Router>
    );
  }

  // ==========================================
  // 2. USER LAYOUT (Normal Website View)
  // ==========================================
  return (
    <Router>
      <div style={appWrapperStyle}>
        <Navbar />

        <div style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/install-app" element={<InstallApp />} />

            {/* Auth Routes */}
            <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

            {/* Private User Routes */}
            <Route 
              path="/profile" 
              element={user ? <UserDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/checkout" 
              element={user ? <Checkout /> : <Navigate to="/login" />} 
            />

            {/* Agar koi user login ke baghair admin link khole toh login par bhej do */}
            <Route path="/admin-dashboard" element={<Navigate to="/login" />} />

            {/* 404 Redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

// --- Styles ---
const appWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#F7F8FA",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
};

const loadingStyle = {
  padding: '100px',
  textAlign: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#555'
};

export default App;
// Importing React and other necessary libraries
import React, { useContext, useState, useEffect } from 'react';
// Routing is used to navigate between pages
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Using toast library for notifications
import toast, { Toaster } from 'react-hot-toast';

// Website Pages
import Home from './pages/Home'; // Home page
import AllProducts from './pages/AllProducts'; // Page to show all products
import ProductDetails from './pages/ProductDetails'; // Product details page
import Cart from './pages/Cart'; // Shopping cart page
import Login from './pages/Login'; // Login page
import Register from './pages/Register'; // Registration page
import ForgotPassword from './pages/ForgotPassword'; // Forgot password page
import ResetPassword from './pages/ResetPassword'; // Reset password page
import UserDashboard from './pages/UserDashboard/UserDashboard'; // User profile area
import Checkout from './pages/Checkout'; // Checkout and payment page
import Contact from './pages/Contact'; // Contact page
import Privacy from './pages/Privacy'; // Privacy policy page
import Shipping from './pages/Shipping'; // Shipping details page
import InstallApp from './pages/InstallApp'; // App installation info
import BudgetOptimizer from './pages/BudgetOptimizer'; // Budget planning page
import VerifyEmail from './pages/VerifyEmail'; // Email verification page

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard'; // Admin dashboard
import ManageProducts from './pages/Admin/ManageProducts'; // Product management
import ManageOrders from './pages/Admin/ManageOrders'; // Order management
import ManageUsers from './pages/Admin/ManageUsers'; // User management
import NewsletterDashboard from './pages/Admin/NewsletterDashboard'; // Newsletter dashboard
import ManageCoupons from './pages/Admin/Coupons'; // Coupons management
import SystemSettings from './pages/Admin/Settings'; // System settings
import Reports from './pages/Admin/Reports'; // Reports & Analytics
import AdminLayout from './pages/Admin/AdminLayout'; // Admin design structure

// Components
import Navbar from './components/Navbar'; // Top navigation bar
import Footer from './components/Footer'; // Bottom footer bar
import ChatBot from './components/ChatBot'; // AI assistant
import BudgetPlanner from './components/BudgetPlanner'; // Budget planning tool
import NotificationToast from './components/NotificationToast'; // Notification component

// Context
import { ShopProvider, ShopContext } from './context/ShopContext';

function AppContent() {
  // Checking user and loading status
  const { user, loading } = useContext(ShopContext);
  const location = useLocation(); // Current page location
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // ==========================================
  // PWA INSTALLATION LOGIC
  // ==========================================
  useEffect(() => {
    // Don't show if already dismissed in this session
    const isDismissed = sessionStorage.getItem('pwaDismissed');
    if (isDismissed) return;
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Handle install button click
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };

  // Handle dismiss banner
  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwaDismissed', 'true');
  };

  // PWA Install Banner for Mobile/Desktop
  const pwaBanner = showInstallBanner && (
    <div style={installBannerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img src="/vite.svg" alt="Logo" style={{ width: '40px' }} />
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>Install Shopping App</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#ccc' }}>Install app for better shopping experience!</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleDismissBanner} style={bannerCloseBtn}>Not Now</button>
        <button onClick={handleInstallClick} style={bannerInstallBtn}>Install Now</button>
      </div>
    </div>
  );

  // Loading message
  if (loading) return <div style={loadingStyle}>Website is loading...</div>;

  // Check if current path is admin-related
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname === '/admin-dashboard';
  const isProfilePath = location.pathname === '/profile';
  const isSpecialPage = isAdminPath || isProfilePath;

  // ==========================================
  // 1. ADMIN LAYOUT
  // ==========================================
  if (user && user.role === "admin") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f7fe", width: '100%' }}>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-products" element={<ManageProducts />} />
            <Route path="/admin/manage-orders" element={<ManageOrders />} />
            <Route path="/admin/manage-users" element={<ManageUsers />} />
            <Route path="/admin/newsletter" element={<NewsletterDashboard />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/coupons" element={<ManageCoupons />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Route>
        </Routes>
        <NotificationToast />
      </div>
    );
  }

  // ==========================================
  // 2. USER LAYOUT
  // ==========================================
  return (
    <div style={appWrapperStyle}>
      {pwaBanner}
      <Navbar /> {/* Top Navigation Bar */}

      <div style={{ flex: 1 }}>
        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/install-app" element={<InstallApp />} />
          <Route path="/budget-optimizer" element={<BudgetOptimizer />} />

          {/* Auth routes */}
          <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/profile" /> : <ForgotPassword />} />
          <Route path="/reset-password/:token" element={user ? <Navigate to="/profile" /> : <ResetPassword />} />

          <Route path="/profile" element={user ? <UserDashboard /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Persistent components */}
      <ChatBot />
      <BudgetPlanner />
      <NotificationToast />

      {/* Hide footer on special pages */}
      {!isSpecialPage && <Footer />}
    </div>
  );
}

// Main App component
function App() {
  return (
    <ShopProvider> {/* Provider for shared state */}
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Toaster position="top-center" /> {/* Notifications setup */}
        <AppContent />
      </Router>
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

const installBannerStyle = {
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#111',
  color: '#fff',
  padding: '15px 25px',
  borderRadius: '15px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '90%',
  maxWidth: '500px',
  zIndex: 10000,
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  border: '1px solid #333'
};

const bannerInstallBtn = {
  backgroundColor: '#fff',
  color: '#111',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '13px'
};

const bannerCloseBtn = {
  backgroundColor: 'transparent',
  color: '#aaa',
  border: 'none',
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: '13px'
};

export default App;
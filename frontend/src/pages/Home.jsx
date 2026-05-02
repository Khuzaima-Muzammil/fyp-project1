// React and navigation libraries
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext'; // Data is coming from here
import { ArrowRight, Star, ShoppingCart } from 'lucide-react'; // Icons
import ProductCard from '../components/ProductCard'; // Import ProductCard component
import '../styles/Home.css';

const Home = () => {
  // Getting products and addToCart function from context
  const { products, addToCart, loading, user, settings } = useContext(ShopContext);
  const navigate = useNavigate();

  // --- RESPONSIVE SETTINGS ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    // Update width on resize
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // Cleanup on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if screen is mobile or tablet
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Loading screen
  if (loading) return <div className="loading-state">Loading product details...</div>;

  return (
    <div className="home-container">
      
      {/* --- BANNER SECTION --- */}
      <div className="banner-section">
        {/* Main Banner - New Collection */}
        <div className="banner-card main-banner">
          <div className="banner-content">
            <p className="banner-subtitle">New Collection</p>
            <h1 className="banner-title">Best Price</h1>
            <button onClick={() => navigate('/all-products')} className="shop-now-btn">Shop Now</button>
          </div>
          {/* Show image on desktop and tablet */}
          {products.length > 0 && !isMobile && (
            <img 
              src={products.find(p => p.category?.toLowerCase().includes('cap'))?.image || products[0]?.image} 
              className="banner-img"
              alt="Featured" 
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x400/F3F4F6/F3F4F6'; 
              }}
            />
          )}
        </div>
        
        {/* Sale Banner - Discount */}
        <div className="banner-card sale-banner">
          <p className="banner-subtitle">Limited Time</p>
          <h2 className="banner-title">Up to 70% Off</h2>
          <button onClick={() => navigate('/all-products')} className="grab-now-btn">
            Grab Now
          </button>
        </div>
      </div>

      {/* --- POPULAR ITEMS HEADER --- */}
      <div className="section-header">
        <h2 style={{fontWeight:'800', fontSize: isMobile ? '20px' : '24px'}}>Popular Products</h2>
        <button onClick={() => navigate('/all-products')} className="view-all-btn">
          View All <ArrowRight size={16}/>
        </button>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="product-grid">
        {/* Showing first 8 products using ProductCard component */}
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;
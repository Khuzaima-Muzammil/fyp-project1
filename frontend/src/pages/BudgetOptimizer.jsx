// Importing React and necessary components
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios'; // For making API requests
import { toast } from 'react-hot-toast'; // For showing notifications
import { Sparkles, Calculator, Search, ArrowRight, Wallet, TrendingUp, Star, Loader2, ShoppingCart, ShoppingBag, X } from 'lucide-react'; // For icons
import { ShopContext } from '../context/ShopContext'; // For global data (cart/user)
import { useNavigate } from 'react-router-dom'; // For navigating between pages

const BudgetOptimizer = () => {
  // Extracting necessary values from ShopContext
  const { addToCart, user } = useContext(ShopContext);
  const navigate = useNavigate();
  
  // State variables for the form (budget, category, loading, etc.)
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({}); // State for validation errors
  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState([]); // List of products/bundles found
  const [hasSearched, setHasSearched] = useState(false); // To check if a search has been performed

  // --- RESPONSIVE LOGIC (Mobile and Tablet screen check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // List of product categories
  const categories = [
    { en: "Caps", ur: "Caps" },
    { en: "T-Shirts", ur: "T-Shirts" },
    { en: "Shirts", ur: "Shirts" },
    { en: "Trousers", ur: "Trousers" },
    { en: "Jeans", ur: "Jeans" },
    { en: "Shorts", ur: "Shorts" },
    { en: "Sweaters", ur: "Sweaters" },
    { en: "Jackets", ur: "Jackets" },
    { en: "Hoodies", ur: "Hoodies" },
    { en: "Coats", ur: "Coats" }
  ];

  // Function to find products based on budget
  const handleOptimize = async (e) => {
    e.preventDefault();
    
    // Validation logic
    let newErrors = {};
    if (!budget || budget <= 0) {
      newErrors.budget = "Please enter a valid budget";
    }
    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill out the form correctly");
      return;
    }

    setErrors({});
    setLoading(true);
    setHasSearched(true);
    try {
      // Sending request to the backend
      const response = await axios.post('http://localhost:5004/api/products/budget-optimizer', {
        budget,
        category
      });
      
      if (response.data.success) {
        setBundles(response.data.bundles);
        if (response.data.bundles.length === 0) {
          toast.error("No products found within this budget.");
        } else {
          toast.success("Found the best bundles for you!");
          // To scroll down to the results
          setTimeout(() => {
            window.scrollTo({
              top: isMobile ? window.innerHeight * 0.8 : window.innerHeight * 0.7,
              behavior: 'smooth'
            });
          }, 100);
        }
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to find bundles.");
    } finally {
      setLoading(false);
    }
  };

  // Function to add a product to the cart
  const handleAddToCartClick = (item) => {
    if (!item || (!item._id && !item.id)) {
      toast.error("Product data is not correct.");
      return;
    }

    if (!addToCart) {
      toast.error("Cart system is not working right now.");
      return;
    }
    
    if (!user) {
      toast.error("Please login first!");
      navigate('/login');
      return;
    }

    const itemToCart = {
      ...item,
      name: item.name || "Bundle Item"
    };

    addToCart(itemToCart);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div style={{...containerStyle, padding: isMobile ? '60px 5%' : '80px 5%'}}>
      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div style={badgeStyle}>
          <TrendingUp size={isMobile ? 14 : 18} color="#4F46E5" />
          <span style={badgeTextStyle}>Advanced Algorithm Engine</span>
        </div>
        <h1 style={{ ...titleStyle, fontSize: isMobile ? '32px' : isTablet ? '48px' : '64px' }}>
          Budget <span style={gradientTextStyle}>Optimizer</span>
        </h1>
        <p style={{ ...subtitleStyle, fontSize: isMobile ? '15px' : '18px' }}>
          Use your money wisely. Find the best bundles instantly.
        </p>
      </div>

      {/* Input Form (Budget and Category form) */}
      <div style={formContainerStyle}>
        <form onSubmit={handleOptimize} style={{ 
          ...formStyle, 
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '20px' : '40px',
          borderRadius: isMobile ? '25px' : '40px',
          gap: isMobile ? '15px' : '24px'
        }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Maximum Budget (Rs.)</label>
            <div style={{
              ...inputWrapperStyle,
              border: errors.budget ? '2px solid #ef4444' : '2px solid transparent'
            }}>
              <Wallet size={20} color={errors.budget ? "#ef4444" : "#4F46E5"} />
              <input 
                type="number" 
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (errors.budget) setErrors(prev => ({ ...prev, budget: null }));
                }}
                placeholder="Example: 5000"
                style={inputStyle}
              />
            </div>
            {errors.budget && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>{errors.budget}</p>}
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Select Category</label>
            <div style={{
              ...inputWrapperStyle,
              border: errors.category ? '2px solid #ef4444' : '2px solid transparent'
            }}>
              <Search size={20} color={errors.category ? "#ef4444" : "#D946EF"} />
              <select 
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                }}
                style={selectStyle}
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c, i) => (
                  <option key={i} value={c.en}>{c.en}</option>
                ))}
              </select>
            </div>
            {errors.category && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>{errors.category}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              ...buttonStyle, 
              width: isMobile ? '100%' : 'auto',
              marginTop: isMobile ? '10px' : '0',
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {loading ? <div className="spinner" style={spinnerStyle}></div> : <Calculator size={20} />}
            {loading ? 'Searching...' : 'Check Now'}
          </button>
        </form>
      </div>

      <style>
        {`
          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .group-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            border-color: rgba(99, 102, 241, 0.2) !important;
          }
          .group-card:hover img {
            transform: scale(1.05);
          }
          .add-to-cart-btn:hover {
            background-color: #6366f1 !important;
            color: #fff !important;
            transform: rotate(15deg) scale(1.1);
          }
        `}
      </style>

      {/* Results Section (Found results) */}
      <div style={resultsContainerStyle}>
        {hasSearched && !loading && bundles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '30px' : '60px' }}>
            {bundles.map((bundle, idx) => (
              <div key={idx} style={{...bundleCardStyle, padding: isMobile ? '25px' : '50px', borderRadius: isMobile ? '30px' : '48px'}}>
                <div style={{...bundleHeaderStyle, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center'}}>
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <span style={bundleBadgeStyle}>Bundle {idx + 1}</span>
                      {idx === 0 && (
                        <span style={bestValueBadgeStyle}>
                          <Star size={12} fill="#92400E" /> Best Value
                        </span>
                      )}
                    </div>
                    <h3 style={{ ...bundleTitleStyle, fontSize: isMobile ? '22px' : '32px' }}>{bundle.name}</h3>
                    <p style={{...bundleDescStyle, fontSize: isMobile ? '14px' : '17px'}}>{bundle.description}</p>
                  </div>
                  
                  <div style={{
                    ...totalValueBoxStyle,
                    width: isMobile ? '100%' : 'auto',
                    marginTop: isMobile ? '20px' : '0',
                    padding: isMobile ? '15px 25px' : '24px 40px'
                  }}>
                    <span style={totalValueLabelStyle}>Total Price</span>
                    <span style={{...totalValueAmountStyle, fontSize: isMobile ? '28px' : '36px'}}>
                      <small style={{ fontSize: '0.5em', marginRight: '4px' }}>Rs.</small>
                      {bundle.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: isMobile ? '15px' : '25px'
                }}>
                  {bundle.items.map((item, i) => (
                    <div key={i} style={{...productCardStyle, cursor: 'pointer'}} className="group-card" onClick={() => navigate(`/product/${item._id || item.id}`)}>
                      <div style={imageContainerStyle}>
                        <img 
                          src={item.image || 'https://placehold.co/400x500/f8fafc/64748b?text=Product'} 
                          alt={item.name} 
                          style={imageStyle}
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x500/f8fafc/64748b?text=Not+Found';
                          }}
                        />
                        <div style={ratingTagStyle}>
                          <Star size={12} fill="#F59E0B" color="#F59E0B" />
                          <span>{item.rating || '0.0'}</span>
                        </div>
                      </div>
                      
                      <div style={{...productInfoStyle, padding: isMobile ? '18px' : '28px'}}>
                        <div style={productCategoryStyle}>{item.category}</div>
                        <h4 style={{...productNameStyle, fontSize: isMobile ? '16px' : '18px', marginBottom: isMobile ? '15px' : '24px'}}>{item.name}</h4>
                        <div style={productFooterStyle}>
                          <div>
                            <span style={priceLabelStyle}>Price</span>
                            <span style={{...priceAmountStyle, fontSize: isMobile ? '18px' : '22px'}}>Rs. {item.price.toLocaleString()}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Stop navigation when clicking add to cart
                              handleAddToCartClick(item);
                            }}
                            style={{...addToCartButtonStyle, width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px'}}
                            className="add-to-cart-btn"
                            title="Add to Cart"
                          >
                            <ShoppingBag size={isMobile ? 18 : 20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasSearched && !loading && bundles.length === 0 && (
          <div style={{...emptyStateStyle, padding: isMobile ? '60px 20px' : '100px 40px'}}>
            <Search size={isMobile ? 36 : 48} color="#94A3B8" />
            <h3 style={{...emptyTitleStyle, fontSize: isMobile ? '22px' : '28px'}}>Nothing Found</h3>
            <p style={{...emptyDescStyle, fontSize: isMobile ? '14px' : '17px'}}>No bundles found in your budget. Please try increasing your budget.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#fdfbff',
  padding: '80px 5%',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
};

const headerSectionStyle = {
  maxWidth: '900px',
  margin: '0 auto 80px',
  textAlign: 'center'
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 24px',
  backgroundColor: '#ffffff',
  borderRadius: '100px',
  marginBottom: '32px',
  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.08)',
  border: '1px solid rgba(79, 70, 229, 0.1)'
};

const badgeTextStyle = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#4F46E5',
  textTransform: 'uppercase',
  letterSpacing: '1.5px'
};

const titleStyle = {
  fontWeight: '900',
  color: '#1e293b',
  marginBottom: '24px',
  letterSpacing: '-1.5px',
  lineHeight: '1.1'
};

const gradientTextStyle = {
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const subtitleStyle = {
  color: '#64748b',
  lineHeight: '1.7',
  fontWeight: '500',
  maxWidth: '700px',
  margin: '0 auto'
};

const formContainerStyle = {
  maxWidth: '1100px',
  margin: '0 auto 100px'
};

const formStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '40px',
  boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-end',
  border: '1px solid rgba(241, 245, 249, 0.8)',
  transition: 'transform 0.3s ease'
};

const inputGroupStyle = {
  flex: 1,
  width: '100%'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '12px',
  marginLeft: '4px'
};

const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  backgroundColor: '#f8fafc',
  padding: '16px 22px',
  borderRadius: '20px',
  border: '2px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

const inputStyle = {
  border: 'none',
  background: 'transparent',
  outline: 'none',
  width: '100%',
  fontSize: '17px',
  fontWeight: '600',
  color: '#0f172a'
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none'
};

const buttonStyle = {
  backgroundColor: '#1e293b',
  color: '#ffffff',
  padding: '18px 45px',
  borderRadius: '20px',
  fontSize: '16px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 15px 30px rgba(30, 41, 59, 0.15)',
  cursor: 'pointer',
  border: 'none'
};

const resultsContainerStyle = {
  maxWidth: '1250px',
  margin: '0 auto'
};

const bundleCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '48px',
  padding: '50px',
  boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
  border: '1px solid rgba(241, 245, 249, 0.8)',
  marginBottom: '60px'
};

const bundleHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: '50px',
  paddingBottom: '30px',
  borderBottom: '1px solid #f1f5f9'
};

const bundleBadgeStyle = {
  padding: '8px 18px',
  backgroundColor: '#1e293b',
  color: '#ffffff',
  borderRadius: '100px',
  fontSize: '11px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '1.5px'
};

const bestValueBadgeStyle = {
  padding: '8px 18px',
  backgroundColor: '#fef3c7',
  color: '#92400e',
  borderRadius: '100px',
  fontSize: '11px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const bundleTitleStyle = {
  fontWeight: '900',
  color: '#0f172a',
  marginBottom: '12px',
  letterSpacing: '-0.5px'
};

const bundleDescStyle = {
  color: '#64748b',
  fontSize: '17px',
  fontWeight: '500',
  lineHeight: '1.6'
};

const totalValueBoxStyle = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  padding: '24px 40px',
  borderRadius: '30px',
  textAlign: 'center',
  border: '1px solid #f1f5f9'
};

const totalValueLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: '8px'
};

const totalValueAmountStyle = {
  fontSize: '36px',
  fontWeight: '900',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px'
};

const productCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '32px',
  overflow: 'hidden',
  border: '1px solid #f1f5f9',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative'
};

const imageContainerStyle = {
  position: 'relative',
  aspectRatio: '1/1',
  backgroundColor: '#f8fafc',
  overflow: 'hidden'
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.6s ease'
};

const ratingTagStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(4px)',
  padding: '6px 14px',
  borderRadius: '100px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: '800',
  color: '#1e293b',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
};

const productInfoStyle = {
  padding: '28px'
};

const productCategoryStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#6366f1',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: '10px'
};

const productNameStyle = {
  fontSize: '18px',
  fontWeight: '800',
  color: '#1e293b',
  marginBottom: '24px',
  lineHeight: '1.4'
};

const productFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end'
};

const priceLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: '#94a3b8',
  textTransform: 'uppercase',
  marginBottom: '4px'
};

const priceAmountStyle = {
  fontSize: '22px',
  fontWeight: '900',
  color: '#0f172a'
};

const addToCartButtonStyle = {
  width: '52px',
  height: '52px',
  borderRadius: '20px',
  backgroundColor: '#f8fafc',
  color: '#6366f1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
};

const spinnerStyle = {
  marginRight: '10px'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '100px 40px',
  backgroundColor: '#ffffff',
  borderRadius: '48px',
  maxWidth: '650px',
  margin: '40px auto',
  boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
  border: '1px solid #f1f5f9'
};

const emptyTitleStyle = {
  fontSize: '28px',
  fontWeight: '900',
  color: '#1e293b',
  marginTop: '24px',
  marginBottom: '12px'
};

const emptyDescStyle = {
  color: '#64748b',
  fontSize: '17px',
  lineHeight: '1.7'
};

export default BudgetOptimizer;

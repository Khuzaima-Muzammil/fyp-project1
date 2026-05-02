// React and context libraries
import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext'; // Data source
import { useNavigate } from 'react-router-dom'; // Navigation
import { Trash2, Plus, Minus, AlertTriangle, ArrowRight, Star, Loader2, Sparkles } from 'lucide-react'; // Icons
import toast from 'react-hot-toast'; // Notifications
import '../styles/Cart.css';

const Cart = () => {
  // Extracting cart, user, and budget information from context
  const { 
    cart, 
    user, 
    removeFromCart, 
    updateQuantity, 
    loading, 
    income, 
    addToCart, 
    products, 
    allProducts, 
    swapCartItem, 
    fetchProducts, 
    cartTotal: totalAmount, 
    shippingFee, 
    finalTotal, 
    isOverBudget, 
    exceededAmount: overBudgetAmount, 
    settings 
  } = useContext(ShopContext);
  
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]); // Budget-saving suggestions
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch products to enable swap suggestions
  useEffect(() => {
    if (fetchProducts) {
      fetchProducts();
    }
  }, []);

  // --- RESPONSIVE LOGIC (Mobile and Tablet) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024; // Tablet screen check

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const userBudget = Number(income) || 0;

  // --- SMART SWAP LOGIC (Replacing products to save budget) ---
  useEffect(() => {
    const generateLocalSuggestions = () => {
      const productsToUse = allProducts && allProducts.length > 0 ? allProducts : products;
      
      if (cart.length > 0 && productsToUse && productsToUse.length > 0) {
        setLoadingSuggestions(true);
        
        const timer = setTimeout(() => {
          let newSuggestions = [];
          // Sorting cart items from highest to lowest price
          const sortedCart = [...cart].sort((a, b) => (b.price * (b.quantity || 1)) - (a.price * (a.quantity || 1)));

          for (let item of sortedCart) {
            const itemId = (item._id || item.id);
            const itemPrice = Number(item.price);
            
            let fullProduct = allProducts?.find(p => (p._id || p.id) === itemId);
            const itemCategory = (item.category || fullProduct?.category || '').toLowerCase().trim();
            const itemCategoryWords = itemCategory.split(/\s+/).filter(w => w.length > 2);
            
            // Looking for cheaper alternatives
            const alternatives = productsToUse.filter(p => {
                const pCategory = (p.category || '').toLowerCase().trim();
                const pPrice = Number(p.price);
                const pId = (p._id || p.id);

                if (pId === itemId) return false;
                if (pPrice >= itemPrice) return false;
                if (cart.some(cartItem => (cartItem._id || cartItem.id) === pId)) return false;

                const isExactMatch = pCategory === itemCategory;
                const isFuzzyMatch = itemCategory.includes(pCategory) || pCategory.includes(itemCategory);
                const sharesWords = itemCategoryWords.some(word => pCategory.includes(word));
                
                const isGlobalRescue = isOverBudget && pPrice < (itemPrice * 0.5);

                return isExactMatch || isFuzzyMatch || sharesWords || isGlobalRescue;
            }).sort((a, b) => {
                if (isOverBudget) {
                    const diffA = Math.abs((itemPrice - a.price) - overBudgetAmount);
                    const diffB = Math.abs((itemPrice - b.price) - overBudgetAmount);
                    if (diffA !== diffB) return diffA - diffB;
                }
                return a.price - b.price;
            });

            const topAlternatives = alternatives.slice(0, 4);

            for (let alt of topAlternatives) {
                const isAlreadySuggested = newSuggestions.some(s => (s.suggestedProduct._id || s.suggestedProduct.id) === (alt._id || alt.id));
                
                if (!isAlreadySuggested) {
                  const savings = (itemPrice - alt.price) * (item.quantity || 1);
                  const solvesBudget = isOverBudget && (savings >= overBudgetAmount || savings > (overBudgetAmount * 0.6));
                  
                  newSuggestions.push({
                      type: 'swap',
                      originalProduct: item,
                      suggestedProduct: alt,
                      priceDifference: savings,
                      solvesBudget: solvesBudget,
                      reason: solvesBudget 
                        ? `Best Match! This change will fix your budget.`
                        : `Cheaper Item! This ${alt.category} can save you ${settings?.currency?.symbol || 'Rs'}. ${savings}.`,
                      priority: solvesBudget ? 0 : 1
                  });
                }
            }
          }

          // Suggestion to reduce quantity
          for (let item of sortedCart) {
            if (item.quantity > 1) {
                let reduceBy = 1;
                if (isOverBudget && item.price * item.quantity > overBudgetAmount) {
                    reduceBy = Math.min(item.quantity - 1, Math.ceil(overBudgetAmount / item.price));
                }
                const savings = item.price * reduceBy;
                newSuggestions.push({
                    type: 'quantity',
                    originalProduct: item,
                    suggestedProduct: item, 
                    newQuantity: item.quantity - reduceBy,
                    priceDifference: savings,
                    reason: `Reduce quantity by ${reduceBy} to save ${settings?.currency?.symbol || 'Rs'}. ${savings}.`,
                    priority: 2
                });
            }
          }
          
          newSuggestions.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.priceDifference - a.priceDifference;
          });
          
          setSuggestions(newSuggestions.slice(0, 10));
          setLoadingSuggestions(false);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setSuggestions([]);
        setLoadingSuggestions(false);
      }
    };

    generateLocalSuggestions();
  }, [cart, totalAmount, income, products, allProducts, overBudgetAmount, isOverBudget]);

  // Function to apply smart action
  const handleSmartAction = (suggestion) => {
    if (suggestion.type === 'quantity') {
      updateQuantity(suggestion.originalProduct._id || suggestion.originalProduct.id, suggestion.newQuantity);
      toast.success(`Quantity updated! You saved ${settings?.currency?.symbol || 'Rs'} ${suggestion.priceDifference}.`, {
        icon: '📉',
        style: { borderRadius: '10px', background: '#111', color: '#fff' }
      });
    } else if (suggestion.type === 'remove') {
      removeFromCart(suggestion.originalProduct._id || suggestion.originalProduct.id);
      toast.success(`Item removed! You saved ${settings?.currency?.symbol || 'Rs'} ${suggestion.priceDifference}.`, {
        icon: '🗑️',
        style: { borderRadius: '10px', background: '#111', color: '#fff' }
      });
    } else {
      swapCartItem(suggestion.originalProduct._id || suggestion.originalProduct.id, suggestion.suggestedProduct, suggestion.originalProduct.quantity || 1);
      toast.success(`Swap successful! You saved ${settings?.currency?.symbol || 'Rs'} ${suggestion.priceDifference}.`, {
          icon: '✨',
          style: { borderRadius: '10px', background: '#111', color: '#fff' }
      });
    }
  };

  if (loading) return <div className="loading-state">Loading cart...</div>;

  return (
    <div className="cart-container">
      <h1 className="cart-title">
        YOUR CART
      </h1>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2 className="empty-cart-title">Cart is empty!</h2>
          <button 
            onClick={() => navigate('/all-products')} 
            className="start-shopping-btn"
          >
            START SHOPPING
          </button>
        </div>
      ) : (
        <div className="cart-content">
          
          {/* Cart Items and Budget Information */}
          <div className="cart-items-section">
            {/* Alert for exceeding budget */}
            {isOverBudget && (
              <div className="ai-warning-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="pulse-icon">
                    <AlertTriangle size={24} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Budget Alert!</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                      You are exceeding your budget by <strong>{settings?.currency?.symbol || 'Rs'} {overBudgetAmount.toFixed(2)}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="cart-items-list" style={{ marginTop: isOverBudget ? '20px' : '0' }}>
              {cart.map((item, index) => (
                <div key={index} className={`cart-item-row ${isOverBudget ? 'over-budget' : ''}`}>
                  {/* Product Details (Image + Info) */}
                  <div className="product-item-group">
                    <div className="product-img-container" style={{ backgroundColor: item.bgColor || '#f8fafc' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="product-img"
                      />
                    </div>
                    <div className="product-text-info">
                      <h3 className="product-name">{item.name}</h3>
                      <p className="product-price-small">{settings?.currency?.symbol || 'Rs'} {item.price}</p>
                    </div>
                  </div>
                  
                  {/* Actions (Qty + Remove) */}
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)} className="qty-btn"><Minus size={14}/></button>
                      <span style={{ fontWeight: '700' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)} className="qty-btn"><Plus size={14}/></button>
                    </div>

                    <div className="item-total-section">
                      <p className="item-total-price">{settings?.currency?.symbol || 'Rs'} {(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item._id || item.id)} className="remove-btn">
                        <Trash2 size={14} style={{marginRight: '5px'}}/> {isMobile ? '' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BUDGET RESCUE - Savings suggestions */}
            {suggestions.length > 0 && (
              <div className={`suggestion-section ${isOverBudget ? 'over-budget' : ''}`} style={{ display: isOverBudget ? 'block' : 'none' }}>
                <div className="suggestion-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="sparkle-icon" style={{ background: isOverBudget ? '#ef4444' : '#111' }}>
                      <Sparkles size={20} color="#fff" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111' }}>
                        Savings Swaps
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>Suggestions to get back in budget!</p>
                    </div>
                  </div>
                </div>

                {!loadingSuggestions ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {suggestions.map((s, idx) => (
                      <div key={idx} className={`alt-card ${s.solvesBudget ? 'best-match' : ''}`}>
                        {s.solvesBudget && (
                          <div className="best-for-budget-badge">
                            BEST FOR BUDGET
                          </div>
                        )}
                        <div className="suggestion-type-label">
                          <span>{s.type === 'remove' ? 'Remove item:' : s.type === 'quantity' ? 'Reduce quantity:' : 'Replace expensive item:'} <strong>{s.originalProduct?.name}</strong></span>
                        </div>
                        
                        <div className="suggestion-item">
                          <div className="suggestion-info-side">
                            <img 
                              src={Array.isArray(s.suggestedProduct?.image) ? s.suggestedProduct.image[0] : (s.suggestedProduct?.image || 'https://via.placeholder.com/60')} 
                              alt="" 
                              className="suggestion-img"
                            />
                            <div className="suggestion-text">
                              <div className="suggestion-name">{s.suggestedProduct?.name}</div>
                              <p className="suggestion-reason">{s.reason}</p>
                            </div>
                          </div>
                          
                          <div className="suggestion-action-side">
                            <div className="suggestion-price">{settings?.currency?.symbol || 'Rs'} {s.suggestedProduct?.price}</div>
                            <button 
                              onClick={() => handleSmartAction(s)}
                              className={`swap-btn ${s.solvesBudget ? 'solves-budget' : ''}`}
                            >
                              {s.type === 'swap' ? 'Swap Now' : 'Update Now'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 15px' }} />
                    <p>Finding suggestions...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Summary (Expense details) */}
          <div className="summary-container">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>Order Summary</h3>
            
            {isOverBudget && (
              <div className="budget-warning-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
                  <AlertTriangle size={18} />
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>Over Budget!</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                  Your total is <strong>{settings?.currency?.symbol || 'Rs'}. {overBudgetAmount.toFixed(2)}</strong> over your budget.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#666' }}>Items Total</span>
              <span style={{ fontWeight: '600' }}>{settings?.currency?.symbol || 'Rs'} {totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#666' }}>Delivery Fee</span>
              <span style={{ fontWeight: '600' }}>{settings?.currency?.symbol || 'Rs'} {shippingFee.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>GRAND TOTAL</span>
              <span style={{ fontWeight: '800', fontSize: '20px' }}>{settings?.currency?.symbol || 'Rs'} {finalTotal.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="checkout-btn"
              style={{
                backgroundColor: isOverBudget ? '#ef4444' : '#111',
              }}
            >
              PLACE ORDER <ArrowRight size={18} />
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '15px' }}>
              Tax and delivery fees will be finalized at checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
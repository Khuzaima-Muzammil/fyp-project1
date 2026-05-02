// Importing React and other necessary libraries
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // To get ID from URL and navigate pages
import { ShopContext } from '../context/ShopContext'; // Data source
import { Star, ShoppingBag, ArrowLeft, Plus, Minus, MessageSquare, User } from 'lucide-react'; // Icons
import toast, { Toaster } from 'react-hot-toast'; // Notifications
import axios from 'axios';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams(); // Extracting product ID from URL
  const navigate = useNavigate(); 
  const { products, addToCart, loading, user, fetchProducts, settings } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // --- RESPONSIVE LOGIC (Mobile and Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Fetch reviews for this product
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5004/api/reviews/${productId}`);
      setReviews(data);
      
      // Check if current user has already reviewed
      if (user && data.length > 0) {
        const hasReviewed = data.some(rev => 
          (rev.user?._id || rev.user) === user._id || 
          (rev.user?._id || rev.user) === user.id
        );
        setUserHasReviewed(hasReviewed);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  // Finding product from context
  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(item => item._id === productId || item.id === productId);
      if (found) {
        setProduct(found);
        fetchReviews();
      }
    }
  }, [productId, products]);

  // Function to add product to cart
  const handleAddToCart = () => {
    if (product && addToCart) {
      addToCart(product, quantity);
      toast.success(`${product.name} added to cart!`);
      navigate('/cart'); 
    }
  };

  // Function to submit review
  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating first!');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment!');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5004/api/reviews`,
        { productId, rating, comment },
        { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } }
      );

      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      fetchReviews();
      if (fetchProducts) {
        await fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loader-container">Loading product details...</div>;
  
  if (!product) return (
    <div className="loader-container">
      <h3>Product not found!</h3>
      <button onClick={() => navigate('/all-products')} className="back-btn" style={{ margin: '20px auto' }}>Back to Shop</button>
    </div>
  );

  return (
    <div className="product-details-page">
      
      {/* Back button */}
      <Toaster position="bottom-right" />
      <button onClick={() => navigate(-1)} className="back-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', fontWeight: '600', color: '#111' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="details-grid">
        {/* Left Column: Image Gallery */}
        <div className="image-section">
          <div className="rating-badge">
            <Star size={14} fill="#FBBF24" color="#FBBF24" /> 
            {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} Reviews)
          </div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="main-product-img"
          />
        </div>

        {/* Right Column: Info & Actions */}
        <div className="info-section">
          <div className="category-tag">{product.category || 'PREMIUM COLLECTION'}</div>
          <h1 className="product-title">{product.name}</h1>
          
          <div className="details-rating" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', color: '#FBBF24' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={20} fill={star <= Math.round(product.rating || 0) ? "#FBBF24" : "none"} color="#FBBF24" />
              ))}
            </div>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>{product.rating?.toFixed(1) || '0.0'}</span>
            <span style={{ color: '#888', fontSize: '14px' }}>({product.numReviews || 0} reviews)</span>
          </div>

          <div className="product-price">{settings?.currency?.symbol || 'Rs'} {product.price}</div>
          
          <p className="product-desc" style={{ color: '#666', lineHeight: '1.8', marginBottom: '40px', fontSize: '15px' }}>
            {product.description || "Premium quality product designed for maximum comfort and style. A perfect addition to your wardrobe."}
          </p>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #eee', borderRadius: '50px', padding: '5px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'none', fontSize: '20px', border: 'none', cursor: 'pointer' }}>-</button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '18px' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'none', fontSize: '20px', border: 'none', cursor: 'pointer' }}>+</button>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              className="add-to-cart-btn" 
              style={{ flex: 1, padding: '18px', fontSize: '16px', borderRadius: '15px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', border: 'none', backgroundColor: '#111', color: '#fff' }}
            >
              <ShoppingBag size={20} /> ADD TO CART
            </button>
          </div>
          
          <div className="trust-badges" style={{ marginTop: '30px', display: 'flex', gap: '20px', color: '#10b981', fontWeight: '600', fontSize: '13px' }}>
             <span>✓ Free Delivery</span>
             <span>✓ 30 Days Return</span>
             <span>✓ Secure Payment</span>
          </div>
        </div>
      </div>

      {/* --- Customer Reviews --- */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2 className="reviews-title">Customer Reviews</h2>
          <div className="reviews-summary">
            <div className="rating-number">{product.rating?.toFixed(1) || '0.0'}</div>
            <div className="rating-info">
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill={star <= Math.round(product.rating || 0) ? "#FBBF24" : "none"} color="#FBBF24" />
                ))}
              </div>
              <div className="reviews-count">based on {product.numReviews || 0} reviews</div>
            </div>
          </div>
        </div>

        <div className="reviews-grid">
          {/* Left Column: Reviews List */}
          <div className="reviews-list">
            {reviews && reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="#888" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px' }}>{rev.user?.name || 'Anonymous'}</h4>
                        <div style={{ fontSize: '12px', color: '#888' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', color: '#FBBF24' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={star <= rev.rating ? "#FBBF24" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: '#444', lineHeight: '1.6' }}>{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="no-reviews-box">
                <MessageSquare size={48} />
                <p>No reviews yet. Be the first to write one!</p>
              </div>
            )}
          </div>

          {/* Right Column: Write a Review Form */}
          <div className="review-form-sticky">
            <div className="write-review-card">
              <h3 className="review-form-title">Write a Review</h3>
              
              {user ? (
                userHasReviewed ? (
                  <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '15px', border: '1px solid #10b981', textAlign: 'center' }}>
                    <h4 style={{ color: '#065f46', margin: '0 0 5px 0' }}>✓ You have already reviewed this product.</h4>
                    <p style={{ color: '#047857', fontSize: '14px', margin: 0 }}>Thank you for your feedback!</p>
                  </div>
                ) : (
                  <form onSubmit={submitReviewHandler}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Rating (Select Stars)</label>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={28} 
                            style={{ cursor: 'pointer' }}
                            fill={star <= rating ? "#FBBF24" : "none"} 
                            color="#FBBF24"
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Your Comment</label>
                      <textarea 
                        className="input-field"
                        style={{ height: '120px', resize: 'none' }}
                        placeholder="Tell us about the product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
                      {isSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                    </button>
                  </form>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ marginBottom: '15px', color: '#666' }}>Please login to write a review</p>
                  <button onClick={() => navigate('/login')} className="btn-primary">LOGIN NOW</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
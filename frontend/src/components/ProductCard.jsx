// Importing React and necessary libraries
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import { ShopContext } from '../context/ShopContext'; // For global data
import { ShoppingCart, Star } from 'lucide-react'; // For icons
import { toast } from 'react-hot-toast'; // For messages
import '../styles/ProductCard.css';

// This component displays a single product card
const ProductCard = ({ id, image, name, price, bgColor, rating, numReviews, product }) => { 
  const navigate = useNavigate();
  const { addToCart, user, settings } = useContext(ShopContext);

  // If product prop is passed, use it to extract values
  const displayId = id || product?._id || product?.id;
  const displayName = name || product?.name;
  const displayPrice = price || product?.price;
  const displayImage = image || product?.image;
  const displayBgColor = bgColor || product?.bgColor;
  const displayRating = rating || product?.rating;
  const displayNumReviews = numReviews || product?.numReviews;

  // Function to add product to cart
  const handleAddClick = (e) => {
    e.stopPropagation(); // Prevent navigating to detail page
    
    if (!user) {
      toast.error("Please login first!");
      navigate('/login');
      return;
    }

    // Sending product details to cart
    addToCart({ 
      _id: displayId, 
      id: displayId, 
      name: displayName, 
      price: displayPrice, 
      image: displayImage, 
      bgColor: displayBgColor,
      rating: displayRating,
      numReviews: displayNumReviews
    });
    toast.success(`${displayName} added to cart!`);
  };

  return (
    <div 
      onClick={() => navigate(`/product/${displayId}`)} 
      className="product-card"
    >
      {/* Product Image section */}
      <div className="img-container" style={{ backgroundColor: displayBgColor || '#f3f4f6' }}>
        {/* Rating badge */}
        <div className="rating-badge">
          <Star size={10} fill="#FBBF24" color="#FBBF24" />
          <span>{displayRating ? displayRating.toFixed(1) : '0.0'}</span>
        </div>
        <img 
          src={displayImage} 
          alt={displayName} 
          className="product-img" 
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x400/f3f4f6/f3f4f6'; // Clean placeholder
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Product Information (Name and Price) */}
      <div className="product-info">
        <h4 className="product-name">
          {displayName}
        </h4>
        <div className="product-footer">
          <span className="product-price">
            {settings?.currency?.symbol || 'Rs'} {displayPrice}
          </span>
          
          {/* Add to cart button */}
          <button 
            type="button"
            onClick={handleAddClick} 
            className="add-btn"
            style={{ 
              backgroundColor: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              padding: '0'
            }}
          >
            <div style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={20} color="#ffffff" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
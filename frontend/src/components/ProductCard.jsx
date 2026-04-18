import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ id, image, name, price, bgColor }) => { //ye allproduct sai data a arha hai all products parent hai wo apnai child productCard ko data dai rha hai
  const navigate = useNavigate();
  const { addToCart, user } = useContext(ShopContext);

  // --- RESPONSIVE LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;

  const handleAddClick = (e) => {
    e.stopPropagation(); // Navigate hone se rokega yani jb add to cart button click ho to product details page par na jaye, sirf cart me add ho jaye
    
    if (!user) {
      alert("Please login first!");
      navigate('/login');
      return;
    }

    addToCart({ 
      _id: id, 
      id: id, 
      name, 
      price, 
      image, 
      bgColor 
    });
  };

  return (
    <div 
      onClick={() => navigate(`/product/${id}`)} 
      style={cardStyle}
    >
      {/* Image Section */}
      <div style={{ 
        ...imgContainer, 
        height: isMobile ? '140px' : '180px', 
        padding: isMobile ? '10px' : '20px', 
        backgroundColor: bgColor || '#f3f4f6' 
      }}>
        <div style={{...ratingBadge, fontSize: isMobile ? '10px' : '11px'}}>
          <Star size={isMobile ? 10 : 12} fill="#FBBF24" color="#FBBF24" /> 4.9
        </div>
        <img src={image} alt={name} style={imgStyle} />
      </div>

      {/* Info Section */}
      <div style={{ padding: isMobile ? '10px' : '15px' }}>
        <h4 style={{
          ...nameStyle, 
          fontSize: isMobile ? '13px' : '14px', 
          height: isMobile ? '30px' : '34px'
        }}>
          {name}
        </h4>
        <div style={footerStyle}>
          <span style={{
            ...priceStyle, 
            fontSize: isMobile ? '16px' : '18px'
          }}>
            Rs {price}
          </span>
          
          <button 
            type="button"
            onClick={handleAddClick} 
            style={{ 
              ...addBtnStyle, 
              padding: isMobile ? '6px' : '8px',
              position: 'relative', 
              zIndex: '20' 
            }}
          >
            <ShoppingCart size={isMobile ? 14 : 16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Original kept, and overridden inline where needed) ---
const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '20px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
  border: '1px solid #f0f0f0'
};

const imgContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const imgStyle = {
  maxHeight: '100%',
  maxWidth: '100%',
  objectFit: 'contain'
};

const ratingBadge = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: '#fff',
  padding: '3px 8px',
  borderRadius: '12px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const nameStyle = {
  margin: '0 0 10px 0',
  fontWeight: '600',
  overflow: 'hidden',
  color: '#333'
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const priceStyle = {
  fontWeight: '800',
  color: '#111'
};

const addBtnStyle = {
  backgroundColor: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default ProductCard;
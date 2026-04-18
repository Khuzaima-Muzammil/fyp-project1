import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Star, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate(); 
  const { products, addToCart, loading } = useContext(ShopContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Filter Product from Context
  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(item => item._id === productId || item.id === productId);
      if (found) {
        setProduct(found);
      }
    }
  }, [productId, products]);

  const handleAddToCart = () => {
    if (product && addToCart) {
      addToCart(product, quantity);
      // Optional: User ko feedback dene ke liye
      alert(`${product.name} added to cart!`);
      navigate('/cart'); 
    }
  };

  if (loading) return <div style={loaderStyle}>Loading Product Details...</div>;
  
  if (!product) return (
    <div style={loaderStyle}>
      <h3>Product not found!</h3>
      <button onClick={() => navigate('/all-products')} style={backBtnStyle}>Back to Shop</button>
    </div>
  );

  return (
    <div style={{ padding: '40px 6%', backgroundColor: '#fff', minHeight: '90vh' }}>
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={backBtnStyle}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={containerStyle}>
        
        {/* --- Left: Image Section --- */}
        <div style={imageWrapper}>
          <div style={ratingBadge}><Star size={14} fill="#FBBF24" color="#FBBF24" /> 4.8 (120+ Reviews)</div>
          <img src={product.image} alt={product.name} style={mainImgStyle} />
        </div>

        {/* --- Right: Info Section --- */}
        <div style={infoSection}>
          <p style={categoryTag}>{product.category || 'PREMIUM COLLECTION'}</p>
          <h1 style={titleStyle}>{product.name}</h1>
          
          <div style={priceTag}>Rs {product.price}</div>

          <p style={descStyle}>
            This premium {product.name} is designed for durability and maximum comfort. 
            Made with high-quality materials to ensure a perfect fit for your lifestyle.
          </p>

          <hr style={{ border: '0.5px solid #eee', margin: '30px 0' }} />

          {/* Quantity & Controls */}
          <div style={controlsRow}>
            <div style={qtyBox}>
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} style={qtyBtn}><Minus size={16}/></button>
              <span style={{ fontWeight: '800', fontSize: '18px', minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={qtyBtn}><Plus size={16}/></button>
            </div>

            <div style={{flex: 1}}>
                <p style={{fontSize: '12px', color: '#888', margin: '0 0 5px 5px'}}>TOTAL PRICE</p>
                <b style={{fontSize: '24px'}}>Rs {product.price * quantity}</b>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
            <button onClick={handleAddToCart} style={addBtnStyle}>
              <ShoppingBag size={20} /> ADD TO CART
            </button>
          </div>

          <div style={trustBadges}>
            <span>✓ Free Delivery</span>
            <span>✓ 30 Days Return</span>
            <span>✓ Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CSS Styles ---
const loaderStyle = { padding: '100px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' };
const containerStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '20px' };
const imageWrapper = { backgroundColor: '#f9f9f9', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', border: '1px solid #f0f0f0' };
const mainImgStyle = { width: '100%', maxHeight: '450px', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))' };
const ratingBadge = { position: 'absolute', top: '25px', left: '25px', backgroundColor: '#fff', padding: '8px 15px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '6px' };

const infoSection = { padding: '10px 0' };
const categoryTag = { color: '#e9b94d', fontSize: '13px', letterSpacing: '2px', fontWeight: '800', marginBottom: '10px' };
const titleStyle = { fontSize: '42px', margin: '0 0 15px 0', fontWeight: '800', color: '#111', lineHeight: '1.1' };
const priceTag = { fontSize: '32px', color: '#111', fontWeight: '800', marginBottom: '20px' };
const descStyle = { color: '#666', lineHeight: '1.7', fontSize: '16px', maxWidth: '500px' };

const controlsRow = { display: 'flex', alignItems: 'center', gap: '40px' };
const qtyBox = { display: 'flex', alignItems: 'center', gap: '15px', border: '2px solid #f0f0f0', borderRadius: '50px', padding: '10px 20px' };
const qtyBtn = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#111' };

const addBtnStyle = { flex: 2, backgroundColor: '#111', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #eee', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', color: '#666' };
const trustBadges = { display: 'flex', gap: '20px', marginTop: '30px', fontSize: '12px', color: '#aaa', fontWeight: '600' };

export default ProductDetails;
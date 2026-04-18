import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';

const Home = () => {
  const { products, addToCart, loading, user } = useContext(ShopContext);
  const navigate = useNavigate();

  // --- RESPONSIVE STATE ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize); //Ye bohat aham line hai. Jab aapka ye component screen se hat jaye (jaise user kisi doosre page par chala jaye), to ye line us "Event Listener" ko khatam kar deti hai.Kyun? Taakay browser background mein fizool mein screen size check na karta rahay (isay Memory Leak se bachna kehte hain).
  }, []);

  const isMobile = width < 768;

  // --- LOGIC START ---
  const handleAddToCart = (e, product) => {
    e.stopPropagation(); 
    if (!user) {
      alert("Please login first!");
      navigate('/login');
      return;
    }
    addToCart({ ...product, _id: product._id || product.id });
  };

  if (loading) return <div style={{textAlign: 'center', padding: '100px', fontWeight: 'bold'}}>Loading Lumiere...</div>;

  return (
    <div style={{ 
      padding: isMobile ? '15px 4%' : '20px 6%', 
      backgroundColor: '#F7F8FA', 
      minHeight: '100vh',
      overflowX: 'hidden' // Side scroll ko rokne ke liye
    }}>
      
      {/* --- Responsive Banner Section (Column on Mobile) --- */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', // Mobile par ek ke niche ek
        gap: isMobile ? '15px' : '20px', 
        marginBottom: '40px',
        width: '100%'
      }}>
        {/* Main Banner */}
        <div style={{ 
          ...bannerCard, 
          backgroundColor: '#fff', 
          border:'1px solid #eee',
          width: isMobile ? '100%' : '60%', // Full width on mobile
          height: isMobile ? 'auto' : '240px',
          minHeight: isMobile ? '180px' : '240px',
          padding: isMobile ? '20px' : '40px',
          boxSizing: 'border-box'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ color: '#6b7280', margin: 0, fontWeight: '600', fontSize: isMobile ? '12px' : '16px' }}>New Collection</p>
            <h1 style={{ fontSize: isMobile ? '28px' : '42px', margin: '10px 0', fontWeight:'800' }}>Rs 45</h1>
            <button onClick={() => navigate('/all-products')} style={shopNowBtn}>Shop Now</button>
          </div>
          {products.length > 0 && !isMobile && ( // Mobile par image hide ki hai overlap se bachne ke liye
            <img src={products[0]?.image} style={bannerImg} alt="Featured" />
          )}
        </div>
        
        {/* Sale Banner */}
        <div style={{ 
          ...bannerCard, 
          backgroundColor: '#E9967A', 
          color: '#fff', 
          flexDirection: 'column', 
          alignItems:'flex-start', 
          justifyContent:'center',
          width: isMobile ? '100%' : '40%', // Full width on mobile
          height: isMobile ? 'auto' : '240px',
          minHeight: isMobile ? '120px' : '240px',
          padding: isMobile ? '20px' : '40px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{fontSize: isMobile ? '24px' : '28px', margin:0, fontWeight: '800'}}>70% OFF</h2>
          <p style={{fontWeight: '500', margin: '5px 0', fontSize: isMobile ? '14px' : '16px'}}>Flash Sale!</p>
          <button onClick={() => navigate('/all-products')} style={{background: 'white', color: '#E9967A', border: 'none', padding: '8px 15px', borderRadius: '50px', marginTop: '10px', fontWeight: 'bold', cursor: 'pointer'}}>Claim Now</button>
        </div>
      </div>

      {/* --- Section Header --- */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{fontWeight:'800', fontSize: isMobile ? '20px' : '24px'}}>Popular Items</h2>
        <button onClick={() => navigate('/all-products')} style={{background:'none', border:'none', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px', color: '#111'}}>
          View all <ArrowRight size={16}/>
        </button>
      </div>

      {/* --- Responsive Product Grid --- */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: isMobile ? '10px' : '25px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {products.slice(0, 8).map((product) => ( //yha bracket is liye kai ap html yani jsx kai andr javascript likh rhai hai
          <div key={product._id} style={cardStyle} onClick={() => navigate(`/product/${product._id}`)}>
            <div style={{ 
                backgroundColor: product.bgColor || '#f3f4f6', 
                padding: isMobile ? '15px' : '30px', 
                position: 'relative', 
                display: 'flex', 
                justifyContent: 'center', 
                height: isMobile ? '140px' : '200px'
            }}>
              <div style={{...ratingBadge, fontSize: isMobile ? '10px' : '12px', padding: isMobile ? '2px 6px' : '4px 10px'}}>
                <Star size={isMobile ? 10 : 12} fill="#FBBF24" color="#FBBF24" /> 4.9
              </div>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <div style={{ padding: isMobile ? '12px' : '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: isMobile ? '13px' : '15px', fontWeight: '700', height: isMobile ? '32px' : '40px', overflow: 'hidden' }}>
                {product.name}
              </h4>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                 <span style={{fontWeight: '800', fontSize: isMobile ? '15px' : '18px'}}>Rs {product.price}</span>
                 <button onClick={(e) => handleAddToCart(e, product)} style={{ ...buyBtn, padding: isMobile ? '6px 10px' : '8px 15px', fontSize: isMobile ? '11px' : '13px' }}>
                  <ShoppingCart size={isMobile ? 14 : 16} /> {isMobile ? '' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- CSS Styles ---
const bannerCard = { borderRadius: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' };
const bannerImg = { height: '120%', objectFit: 'contain', position: 'absolute', right: '20px', bottom: '-10px' };
const shopNowBtn = { padding: '12px 25px', borderRadius: '50px', backgroundColor: '#111', color:'#fff', border: 'none', cursor: 'pointer', marginTop:'15px', fontWeight: '600' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0', cursor: 'pointer' };
const ratingBadge = { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#fff', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const buyBtn = { backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight:'600' };

export default Home;
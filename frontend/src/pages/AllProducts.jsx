import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard'; 
import { X } from 'lucide-react'; // Clear icon ke liye

const AllProducts = () => {
  // ShopContext se searchTerm aur setSearchTerm nikala
  const { products, loading, searchTerm, setSearchTerm } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filterProducts, setFilterProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories generate karna
  const categories = ['All', ...new Set(products.map(item => item.category))]; // array me jo duplicates hai is ko remove kr do aur apnai manully category nhi dali like electronics balkai jb ap nai databse me koe electron name product dali tu khud ba khud filter btn pr show hoga

  useEffect(() => {
    if (products.length > 0) {
      let temp = [...products]; // products me jo data hai usko temp me copy karlo taki usko filter kr sako bina original products ko change kiye,React mein aik usool hai: Asal data (Original State) ko direct hath nahi lagana.

      // 1. Search Filter (Context wala searchTerm use ho raha hai)
      if (searchTerm) {
        temp = temp.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // 2. Category Pill Filter
      if (selectedCategory !== 'All') {
        temp = temp.filter(item => item.category === selectedCategory);
      }

      setFilterProducts(temp);
    }
  }, [searchTerm, products, selectedCategory]); // jab bhi searchTerm, products, ya tenu change ho to ye effect chalega aur filterProducts ko update karega

  if (loading) return <div style={{textAlign:'center', padding:'100px', fontWeight:'700'}}>Loading...</div>;

  return (
    <div style={{ padding: '40px 7%', backgroundColor: '#F7F8FA', minHeight: '100vh' }}>
      
      {/* 1. Category Pill Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap', 
        marginBottom: '40px',
        justifyContent: 'center' 
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '12px 28px',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              backgroundColor: selectedCategory === cat ? '#111827' : '#FFFFFF',
              color: selectedCategory === cat ? '#FFFFFF' : '#4B5563',
              boxShadow: selectedCategory === cat ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. Results Info & Context Search Info */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #E5E7EB', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontWeight: '900', fontSize: '24px', margin: 0, color: '#111' }}>
              {selectedCategory === 'All' ? 'ALL COLLECTIONS' : `${selectedCategory.toUpperCase()} COLLECTION`}
            </h2>
            <p style={{ color: '#9CA3AF', marginTop: '5px' }}>{filterProducts.length} items found</p>
          </div>

          {/* --- SEARCH INFO & CLEAR BUTTON ADDED HERE --- */}
          {searchTerm && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              backgroundColor: '#fff', 
              padding: '8px 15px', 
              borderRadius: '12px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                Results for: <strong>"{searchTerm}"</strong>
              </span>
              <button 
                onClick={() => setSearchTerm("")} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                <X size={14} /> CLEAR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '30px' 
      }}>
        {filterProducts.length > 0 ? (
          filterProducts.map((item) => (
            <ProductCard 
              key={item._id} 
              id={item._id} 
              image={item.image} 
              name={item.name} 
              price={item.price} 
              bgColor={item.bgColor} 
            />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
            <h3 style={{ color: '#374151' }}>No products found matching your search.</h3>
            <button 
              onClick={() => {setSelectedCategory('All'); setSearchTerm(""); navigate('/all-products')}} 
              style={{
                marginTop: '10px', 
                padding: '12px 25px', 
                borderRadius: '50px', 
                cursor: 'pointer',
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                fontWeight: '700'
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
// Importing React and other necessary things
import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Filter, Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import '../styles/AllProducts.css';

const AllProducts = () => {
  const { products, loading } = useContext(ShopContext);
  
  // States for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // --- RESPONSIVE LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Categories list
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // Filtering logic
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "low") return a.price - b.price;
      if (sortBy === "high") return b.price - a.price;
      return 0; // latest (default)
    });

  if (loading) return <div className="loading-state">Loading products...</div>;

  return (
    <div className="all-products-container">
      
      {/* Page Title - Removed as requested */}
      <div style={{ marginBottom: '40px' }}>
      </div>

      {/* Toolbar (Search, Filter, Sort) */}
      <div className="toolbar">
        
        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-actions">
          {/* Category Filter */}
          <div className="filter-item">
            <Filter size={16} color="#666" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-input"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>)}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="filter-item">
            <SlidersHorizontal size={16} color="#666" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="select-input"
            >
              <option value="latest">Latest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>

          {/* View Toggle (Desktop & Tablet Only) */}
          {!isMobile && (
            <div className="view-toggle">
              <button onClick={() => setViewMode("grid")} className="toggle-btn" style={{ backgroundColor: viewMode === "grid" ? "#000" : "#fff", color: viewMode === "grid" ? "#fff" : "#000" }}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode("list")} className="toggle-btn" style={{ backgroundColor: viewMode === "list" ? "#000" : "#fff", color: viewMode === "list" ? "#fff" : "#000" }}>
                <List size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="results-count">
        Showing {filteredProducts.length} results
      </p>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className={`products-grid ${viewMode === "grid" ? "grid-view" : "list-view"}`}>
          {filteredProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No products found!</h3>
          <p>Try changing your search or filter settings.</p>
        </div>
      )}

    </div>
  );
};

export default AllProducts;
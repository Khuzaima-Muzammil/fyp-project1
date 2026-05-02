// Import React and necessary dependencies
import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Trash2, Edit, Plus, X, Loader2, Dices } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../styles/ManageProducts.css';

// Product categories (English for backend)
const categories = ["Caps", "Hoodies", "Shirts", "Jackets", "Sneakers"];

const ManageProducts = () => {
  // Extract products and functions from global context
  const { products, deleteProduct, fetchProducts } = useContext(ShopContext);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // State for form data
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    costPrice: '',
    stock: '',
    description: '',
    image: '', 
    category: '' 
  });

  // --- RESPONSIVE LOGIC ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Input validation function
  const validateField = (name, value, currentFormData = formData) => {
    let errorMsg = '';
    
    if (name === 'name') {
      if (!value.trim()) {
        errorMsg = "Product name is required";
      } else if (value.trim().length < 3 || value.trim().length > 100) {
        errorMsg = "Product name must be between 3 and 100 characters";
      } else if (!/[a-zA-Z]/.test(value)) {
        errorMsg = "Product name must contain at least one alphabet character";
      }
    }
    
    if (name === 'costPrice') {
      const cost = Number(value);
      if (value === '' || isNaN(cost) || cost <= 0) {
        errorMsg = "Cost price must be a positive number greater than 0";
      } else if (currentFormData.price) {
        const selling = Number(currentFormData.price);
        if (!isNaN(selling) && selling <= cost) {
          // If editing costPrice causes the selling price to be invalid, trigger an error on price too,
          // or just warn about costPrice
          errorMsg = "Cost price cannot be greater than or equal to selling price";
        }
      }
    }
    
    if (name === 'price') {
      const selling = Number(value);
      const cost = Number(currentFormData.costPrice);
      if (value === '' || isNaN(selling) || selling <= 0) {
        errorMsg = "Selling price must be a positive number greater than 0";
      } else if (!isNaN(cost) && cost > 0 && selling <= cost) {
        errorMsg = "Selling price must be greater than cost price to ensure profit";
      }
    }
    
    if (name === 'stock') {
      const stockVal = Number(value);
      if (value === '' || isNaN(stockVal) || stockVal < 0 || !Number.isInteger(stockVal)) {
        errorMsg = "Stock must be 0 or a positive whole number";
      }
    }
    
    if (name === 'description') {
      if (!value.trim() || value.trim().length < 20) {
        errorMsg = "Description must be at least 20 characters long";
      } else if (/<script\b[^>]*>([\s\S]*?)<\/script>/gi.test(value)) {
        errorMsg = "Description contains invalid/malicious script tags";
      }
    }
    
    if (name === 'image') {
      if (!value.trim()) {
        errorMsg = "Image URL is required";
      } else if (!value.startsWith('http://') && !value.startsWith('https://')) {
        errorMsg = "Must be a valid URL starting with http:// or https://";
      } else if (!/\.(jpg|jpeg|png|webp)$/i.test(value.trim())) {
        errorMsg = "Image URL must end with .jpg, .jpeg, .png, or .webp";
      }
    }
    
    if (name === 'category' && !value) {
      errorMsg = "Please select a valid category";
    }
    
    return errorMsg;
  };

  const isFormValid = () => {
    const errs = {
      name: validateField('name', formData.name),
      price: validateField('price', formData.price),
      costPrice: validateField('costPrice', formData.costPrice),
      stock: validateField('stock', formData.stock),
      description: validateField('description', formData.description),
      image: validateField('image', formData.image),
      category: validateField('category', formData.category)
    };
    
    return !Object.values(errs).some(err => err !== '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Function to open modal
  const openModal = (product = null) => {
    setErrors({});
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        price: product.price, 
        costPrice: product.costPrice || 0,
        stock: product.stock || 0,
        description: product.description || '',
        image: product.image, 
        category: product.category || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', costPrice: '', stock: '', description: '', image: '', category: '' });
    }
    setShowModal(true);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5004/api/products/${editingProduct._id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
        });
      } else {
        await axios.post('http://localhost:5004/api/products', formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
        });
      }
      setShowModal(false);
      fetchProducts(); 
    } catch (err) {
      console.error("Product save error:", err);
      alert(err.response?.data?.message || err.response?.data?.msg || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // Function to randomize cost prices
  useEffect(() => {
    const autoFixCosts = async () => {
      const needsFix = products.some(p => !p.costPrice || p.costPrice === 0);
      if (needsFix) {
        const token = localStorage.getItem('token');
        try {
          await axios.post('http://localhost:5004/api/admin/randomize-costs', {}, {
            headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
          });
          fetchProducts();
        } catch (err) {
          console.error("Auto-fix costs error:", err);
        }
      }
    };
    if (products.length > 0) autoFixCosts();
  }, [products, fetchProducts]);

  return (
    <div className="products-container">
      <div className="products-header">
        <button onClick={() => openModal()} className="add-product-btn">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {isMobile ? (
        <div className="products-mobile-list">
          {products.map((p) => (
            <div key={p._id} className="product-mobile-card">
              <div className="product-mobile-info">
                <img src={p.image} alt="" className="product-img" />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{p.name}</h4>
                  <span className="category-badge">{p.category}</span>
                </div>
              </div>
              <div className="product-mobile-footer">
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Cost: Rs {p.costPrice?.toLocaleString()}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>Price: Rs {p.price.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => openModal(p)} className="icon-btn-edit" title="Edit"><Edit size={16} /></button>
                  <button onClick={() => { if(window.confirm("Are you sure you want to delete this product?")) deleteProduct(p._id) }} className="icon-btn-delete" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead className="products-thead">
              <tr>
                <th className="products-th">Image</th>
                <th className="products-th">Name</th>
                <th className="products-th">Category</th>
                <th className="products-th">Cost Price</th>
                <th className="products-th">Selling Price</th>
                <th className="products-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="products-tr">
                  <td><img src={p.image} alt="" className="product-img" /></td>
                  <td style={{fontWeight: '500'}}>{p.name}</td>
                  <td>
                      <span className="category-badge">{p.category}</span>
                  </td>
                  <td style={{color: '#666'}}>Rs {(p.costPrice || 0).toLocaleString()}</td>
                  <td style={{color: '#10b981', fontWeight: 'bold'}}>Rs {p.price.toLocaleString()}</td>
                  <td>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <button onClick={() => openModal(p)} className="icon-btn-edit" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => { if(window.confirm("Are you sure you want to delete this product?")) deleteProduct(p._id) }} className="icon-btn-delete" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{margin: 0}}>{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
              <X onClick={() => setShowModal(false)} style={{cursor:'pointer'}} />
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label className="form-label">Product Name *</label>
                <input 
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="form-label">Cost Price (Rs) *</label>
                  <input 
                    type="number"
                    name="costPrice"
                    className={`form-input ${errors.costPrice ? 'error' : ''}`}
                    value={formData.costPrice} 
                    onChange={handleInputChange} 
                  />
                  {errors.costPrice && <span className="error-message">{errors.costPrice}</span>}
                </div>

                <div className="input-group">
                  <label className="form-label">Selling Price (Rs) *</label>
                  <input 
                    type="number"
                    name="price"
                    className={`form-input ${errors.price ? 'error' : ''}`}
                    value={formData.price} 
                    onChange={handleInputChange} 
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="form-label">Stock *</label>
                  <input 
                    type="number"
                    name="stock"
                    className={`form-input ${errors.stock ? 'error' : ''}`}
                    value={formData.stock} 
                    onChange={handleInputChange} 
                  />
                  {errors.stock && <span className="error-message">{errors.stock}</span>}
                </div>

                <div className="input-group">
                  <label className="form-label">Category *</label>
                  <select 
                    name="category"
                    className={`form-select ${errors.category ? 'error' : ''}`}
                    style={{ textTransform: 'capitalize' }}
                    value={formData.category} 
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Description *</label>
                <textarea 
                  name="description"
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  style={{ minHeight: '80px' }}
                  value={formData.description} 
                  onChange={handleInputChange} 
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="input-group">
                <label className="form-label">Image URL *</label>
                <input 
                  name="image"
                  className={`form-input ${errors.image ? 'error' : ''}`}
                  value={formData.image} 
                  onChange={handleInputChange} 
                />
                {errors.image && <span className="error-message">{errors.image}</span>}
              </div>

              <button 
                type="submit" 
                disabled={loading || !isFormValid()} 
                className="submit-product-btn"
                style={{ opacity: (loading || !isFormValid()) ? 0.6 : 1 }}
              >
                {loading ? (
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </div>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
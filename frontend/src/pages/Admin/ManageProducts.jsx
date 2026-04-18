import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Trash2, Edit, Plus, X, Package, Upload } from 'lucide-react';
import axios from 'axios';

const ManageProducts = () => {
  const { products, deleteProduct, fetchProducts } = useContext(ShopContext);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', image: '', category: '', description: '' });

  // Add Product Logic
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      setShowModal(false);
      setFormData({ name: '', price: '', image: '', category: '', description: '' });
      fetchProducts(); // List refresh karein
      alert("Product Added!");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Manage Products</h1>
        <button onClick={() => setShowModal(true)} style={addBtnStyle}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* --- Table --- */}
      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th>Image</th><th>Name</th><th>Price</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={trStyle}>
                <td><img src={p.image} alt="" style={imgStyle} /></td>
                <td>{p.name}</td>
                <td style={{color: '#10b981'}}>{p.price}</td>
                <td>
                  {/* Delete button calls context logic directly */}
                  <button onClick={() => deleteProduct(p._id)} style={deleteIconBtn}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Add Product Modal --- */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>Add New Product</h3>
              <X onClick={() => setShowModal(false)} style={{cursor:'pointer'}} />
            </div>
            <form onSubmit={handleAddProduct} style={{padding: '20px'}}>
              <input style={inputStyle} placeholder="Product Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input style={inputStyle} type="number" placeholder="Price" onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              <input style={inputStyle} placeholder="Image URL" onChange={(e) => setFormData({...formData, image: e.target.value})} required />
              <input style={inputStyle} placeholder="Category" onChange={(e) => setFormData({...formData, category: e.target.value})} />
              <textarea style={{...inputStyle, height: '80px'}} placeholder="Description" onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <button type="submit" style={submitBtn}>Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContent = { backgroundColor: '#fff', width: '400px', borderRadius: '15px', overflow: 'hidden' };
const modalHeader = { padding: '15px 20px', backgroundColor: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' };
const submitBtn = { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const containerStyle = { padding: '30px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const addBtnStyle = { backgroundColor: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const tableWrapper = { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const trStyle = { borderBottom: '1px solid #eee' };
const imgStyle = { width: '40px', height: '40px', borderRadius: '5px', margin: '10px' };
const deleteIconBtn = { background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer' };
const theadStyle = { backgroundColor: '#f9fafb', textAlign: 'left' };

export default ManageProducts;
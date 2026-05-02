import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5004/api/products');
      setProducts(res.data || []);
    } catch (e) {
      console.log("Backend offline or error fetching products");
      toast.error("Backend server is offline. Please start the server.");
    }
  };

  const deleteProduct = async (id, showNotification) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5004/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      fetchProducts();
      if (showNotification) showNotification("Product deleted successfully!", "remove");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProductContext.Provider value={{ 
      products: filteredProducts, 
      allProducts: products, 
      setProducts, 
      searchTerm, 
      setSearchTerm, 
      fetchProducts, 
      deleteProduct 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

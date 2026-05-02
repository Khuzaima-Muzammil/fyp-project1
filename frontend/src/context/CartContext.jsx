import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastTimerRef = useRef(null);

  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [income, setIncome] = useState('');

  const [settings, setSettings] = useState({
    businessInfo: { address: '', phone: '', email: '', socialMedia: { facebook: '', instagram: '', twitter: '' } },
    shipping: { baseRate: 250, freeThreshold: 5000 },
    currency: { code: 'PKR', symbol: 'Rs.' }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // 0. Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5004/api/settings');
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings");
      }
    };
    fetchSettings();
  }, []);

  // 1. Sync cart from user object on login
  useEffect(() => {
    if (user && user.cart) {
      setCart(user.cart);
    } else if (!user) {
      setCart([]);
    }
  }, [user]);

  // 2. Local storage sync (optional, but keep for robustness)
  useEffect(() => {
    if (user) {
      localStorage.setItem('lumiere_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('lumiere_cart');
    }
  }, [cart, user]);

  const showNotification = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
  };

  const syncCartToBackend = async (newCart) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('http://localhost:5004/api/users/update-cart', { cart: newCart }, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
        });
      } catch (err) {
        console.error("Cart sync failed");
      }
    }
  };

  const addToCart = (product, qty = 1) => {
    if (!product) return;
    if (!user) { 
      showNotification("Please login to shop!", 'error'); 
      return; 
    }
    
    let newCart;
    const productId = product._id || product.id;
    const isItemInCart = cart.find((item) => (item._id || item.id) === productId);
    
    if (isItemInCart) {
      newCart = cart.map((item) => (item._id || item.id) === productId ? { ...item, quantity: item.quantity + qty } : item);
    } else {
      newCart = [...cart, { ...product, quantity: qty }];
    }

    setCart(newCart);
    syncCartToBackend(newCart);

    const newCartTotal = newCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const newShippingFee = newCartTotal > 0 ? (newCartTotal >= 5000 ? 0 : 250) : 0;
    const newFinalTotal = newCartTotal + newShippingFee;
    const userBudget = Number(income) || 0;
    
    if (userBudget > 0 && newFinalTotal > userBudget) {
      const amountExceeded = newFinalTotal - userBudget;
      showNotification(`Budget exceeded! You are Rs. ${amountExceeded} over your budget.`, 'error');
    } else {
      showNotification(`${product.name} added to cart!`, 'success');
    }
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => (item._id || item.id) !== id);
    setCart(updatedCart);
    syncCartToBackend(updatedCart);
    showNotification("Item removed from cart!", 'remove');
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) => (item._id || item.id) === id ? { ...item, quantity: newQuantity } : item);
    setCart(updatedCart);
    syncCartToBackend(updatedCart);
  };

  const swapCartItem = (oldId, newProduct, quantity) => {
    const updatedCart = cart.map((item) => 
      (item._id || item.id) === oldId 
      ? { ...newProduct, quantity: quantity } 
      : item
    );
    setCart(updatedCart);
    syncCartToBackend(updatedCart);
    showNotification(`Swapped with ${newProduct.name}!`, 'success');
  };

  const clearCart = () => {
    setCart([]);
    syncCartToBackend([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification("Please login to use coupons", 'error');
      return;
    }
    try {
      const { data } = await axios.post('http://localhost:5004/api/coupons/validate', 
        { code, cartTotal }, 
        { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } }
      );
      setAppliedCoupon(data);
      const discountMsg = data.discountType === 'percentage' 
        ? `${data.discountAmount}% discount applied!` 
        : `Rs. ${data.discountAmount} discount applied!`;
      showNotification(`Coupon ${data.code} applied: ${discountMsg}`, 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || "Invalid coupon", 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showNotification("Coupon removed", 'info');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = cartTotal > 0 ? (cartTotal >= settings.shipping.freeThreshold ? 0 : settings.shipping.baseRate) : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountValue : 0;
  const finalTotal = cartTotal + shippingFee - discountAmount;
  const userBudget = Number(income) || 0;
  const remainingBudget = userBudget - finalTotal;
  const isOverBudget = userBudget > 0 && finalTotal > userBudget;
  const exceededAmount = finalTotal - userBudget;

  return (
    <CartContext.Provider value={{
      cart, setCart, addToCart, removeFromCart, updateQuantity, swapCartItem, clearCart,
      cartTotal, shippingFee, finalTotal, userBudget, remainingBudget, isOverBudget, exceededAmount,
      income, setIncome, isBudgetOpen, setIsBudgetOpen,
      showToast, toastMsg, toastType, setShowToast, showNotification,
      settings, appliedCoupon, applyCoupon, removeCoupon, discountAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Calculator, MessageSquare, X, TrendingUp, ChevronRight, RotateCcw, CheckCircle, Trash2, AlertTriangle } from 'lucide-react'; 

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOCAL STORAGE ADDITION ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('lumiere_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  }, [cart]);
  
  // --- Notification (Toast) States ---
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // success, error, remove
  const toastTimerRef = useRef(null);
  
  // --- Budget Planner States ---
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [income, setIncome] = useState(''); 

  // --- Calculations ---
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const userBudget = Number(income) || 0;
  const remainingBudget = userBudget - cartTotal;
  const isOverBudget = userBudget > 0 && cartTotal > userBudget;
  const exceededAmount = cartTotal - userBudget; 

  const [searchTerm, setSearchTerm] = useState("");

  // --- Notification Helper Function ---
  const showNotification = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
  };

  // --- Smart Add To Cart Logic ---
  const addToCart = (product, qty = 1) => {
    if (!user) { 
      alert("Please login to shop!"); 
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

    const newCartTotal = newCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    if (userBudget > 0 && newCartTotal > userBudget) {
      const overAmount = newCartTotal - userBudget;
      showNotification(`Budget exceeded by Rs ${overAmount}!`, 'error');
    } else {
      showNotification(`${product.name} added to cart!`, 'success');
    }
  };

  // --- Remove From Cart Logic ---
  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => (item._id || item.id) !== id);
    setCart(updatedCart);
    showNotification("Item removed from cart!", 'remove');
  };

  // --- Update Quantity (+ / -) Logic ---
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) => 
      (item._id || item.id) === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  // --- In-Depth Roman Assistant ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Assalam o Alaikum! Main aapka Lumiere Assistant hoon. Main aapki kis tarah madad kar sakta hoon?' }
  ]);
  
  const assistantTree = {
    start: {
      text: "Main aapki kis tarah madad kar sakta hoon?",
      options: [
        { label: '📦 Order Information', next: 'order' },
        { label: '🚚 Delivery & Charges', next: 'delivery' },
        { label: '🔄 Returns & Refund', next: 'returns' },
        { label: '📞 Contact Support', next: 'contact' }
      ]
    },
    order: {
      text: "Order ke bare mein aap kya janna chahte hain?",
      options: [
        { label: 'Order Track kaise karein?', next: 'track_info' },
        { label: 'Order Cancel karna hai', next: 'cancel_info' },
        { label: '⬅️ Peechay jayein', next: 'start' }
      ]
    },
    delivery: {
      text: "Delivery ki maloomat hazir hain:",
      options: [
        { label: 'Shipping Charges kitne hain?', next: 'shipping_info' },
        { label: 'Delivery mein kitna waqt lagta hai?', next: 'time_info' },
        { label: '⬅️ Peechay jayein', next: 'start' }
      ]
    },
    returns: {
      text: "Hamari return policy bohat asaan hai. Mazeed tafseel:",
      options: [
        { label: 'Return kaise shuru karein?', next: 'return_process' },
        { label: 'Refund kab milega?', next: 'refund_info' },
        { label: '⬅️ Peechay jayein', next: 'start' }
      ]
    },
    track_info: { text: "Aap apne 'Profile' section mein 'My Orders' par ja kar har order ka status dekh sakte hain.", options: [{ label: 'Main Menu', next: 'start' }] },
    cancel_info: { text: "Agar order ship nahi hua, toh aap dashboard se cancel kar sakte hain. Shipped order cancel nahi ho sakta.", options: [{ label: 'Main Menu', next: 'start' }] },
    shipping_info: { text: "Puri dunya mein Rs. 250 charges hain. 5000 se upar ki shopping par free delivery hai!", options: [{ label: 'Main Menu', next: 'start' }] },
    time_info: { text: "Shehar ke andar 2-3 din, aur door daraz ilaqon mein 5-7 working days lagte hain.", options: [{ label: 'Main Menu', next: 'start' }] },
    return_process: { text: "7 dino ke andar product wapas ho sakta hai agar wo pack ho aur kharab na ho.", options: [{ label: 'Main Menu', next: 'start' }] },
    refund_info: { text: "Product wapas milne ke 48 ghanton ke andar aapke bank account ya wallet mein paise bhej diye jayenge.", options: [{ label: 'Main Menu', next: 'start' }] },
    contact: { text: "Aap support@lumiere.com par email karein ya hamare WhatsApp number +92 300 1234567 par rabta karein.", options: [{ label: 'Main Menu', next: 'start' }] }
  };

  const [currentStep, setCurrentStep] = useState('start');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOptionClick = (nextKey, label) => {
    setMessages(prev => [...prev, { role: 'user', text: label }]);
    setTimeout(() => {
      const nextData = assistantTree[nextKey];
      setMessages(prev => [...prev, { role: 'assistant', text: nextData.text }]);
      setCurrentStep(nextKey);
    }, 400);
  };

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setUser(null); setCart([]); setLoading(false); return; }
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } });
      setUser(res.data);
    } catch (err) { localStorage.removeItem('token'); setUser(null); }
    finally { setLoading(false); }
  }, []);
 
  //  products fetch 
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data || []);
    } catch (e) {
      console.log("Backend offline or error fetching products");
    }
  };

  // --- Delete Product Logic (NEWLY ADDED) ---
  const deleteProduct = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
      });
      fetchProducts(); // Refresh list after delete
      showNotification("Product deleted successfully!", "remove");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  useEffect(() => { 
    loadUser(); 
    fetchProducts();
  }, [loadUser]);

  const isNotAdmin = !user || (user.role !== 'admin' && !user.isAdmin);

  return (
    <ShopContext.Provider value={{  //value yani ye sari cheezein jo main apne app ke har kone me use krna chahta hoon wo yahan provide kr raha hoon
      products: products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), 
      user, setUser, loading, logout: () => { localStorage.removeItem('token'); window.location.href='/login'; },
      cart, setCart, addToCart, 
      removeFromCart, updateQuantity, income,
      searchTerm, setSearchTerm,
      fetchProducts,   // <--- Added to context
      deleteProduct    // <--- Added to context
    }}>
      {children}

      {isNotAdmin && (
        <>
          <div style={floatingContainer}>
            <button onClick={() => setIsBudgetOpen(true)} style={{ ...fabStyle, backgroundColor: isOverBudget ? '#ef4444' : '#4ade80' }} title="Budget Planner">
              <Calculator size={24} color="#fff" />
            </button>
            <button onClick={() => setIsChatOpen(!isChatOpen)} style={{ ...fabStyle, backgroundColor: '#111' }} title="AI Assistant">
              <MessageSquare size={24} color="#fff" />
            </button>
          </div>

          {isChatOpen && (
            <div style={chatWindow}>
              <div style={chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={onlineDot}></div>
                  <span>Lumiere Roman Assistant</span>
                </div>
                <X size={18} onClick={() => setIsChatOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              
              <div style={messageArea}>
                {messages.map((m, i) => (
                  <div key={i} style={{ ...msgBubble, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: m.role === 'user' ? '#111' : '#f0f0f0', color: m.role === 'user' ? '#fff' : '#111' }}>
                    {m.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div style={optionsContainerStyle}>
                <div style={buttonsWrapperStyle}>
                  {assistantTree[currentStep].options.map((opt, index) => (
                    <button key={index} onClick={() => handleOptionClick(opt.next, opt.label)} style={optionButtonStyle}>
                      {opt.label} <ChevronRight size={14} />
                    </button>
                  ))}
                  <button onClick={() => { setMessages([{ role:'assistant', text:'Aap reset kar chuke hain. Main kya madad karun?'}]); setCurrentStep('start'); }} style={resetBtnStyle}>
                    <RotateCcw size={14} /> Restart Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {isBudgetOpen && (
            <div style={modalOverlay}>
              <div style={modalContent}>
                <div style={modalHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calculator size={20} /> <span>Budget Planner</span></div>
                  <X onClick={() => setIsBudgetOpen(false)} style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ padding: '25px' }}>
                  <div style={inputGroup}>
                    <label style={labelStyle}>Mera Total Budget</label>
                    <div style={inputWrapper}>
                      <TrendingUp size={18} color="#10b981" />
                      <input 
                        type="number" 
                        placeholder="E.g. 10000" 
                        style={cleanInput} 
                        value={income} 
                        onChange={(e) => setIncome(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  {userBudget > 0 && (
                    <div style={{...resultCard, border: isOverBudget ? '2px solid #ef4444' : 'none', backgroundColor: isOverBudget ? '#fef2f2' : '#f9fafb'}}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#333' }}>
                        Aapka <strong>Rs. {cartTotal}</strong> use ho gaya, <strong>Rs. {remainingBudget > 0 ? remainingBudget : 0}</strong> baki hai
                      </p>
                      
                      {isOverBudget && (
                        <p style={{ color: '#ef4444', fontWeight: 'bold', margin: '0', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          ⚠️ Budget Rs. {exceededAmount} exceed ho gaya!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showToast && (
        <div style={{...toastContainer, backgroundColor: toastType === 'error' ? '#ef4444' : '#111'}}>
          {toastType === 'success' && <CheckCircle size={18} color="#4ade80" />}
          {toastType === 'remove' && <Trash2 size={18} color="#4ade80" />}
          {toastType === 'error' && <AlertTriangle size={18} color="#fff" />}
          <span>{toastMsg}</span>
        </div>
      )}

    </ShopContext.Provider>
  );
};

// --- CSS Styles ---
const floatingContainer = { position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1000 };
const fabStyle = { width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.3s' };
const chatWindow = { position: 'fixed', bottom: '100px', right: '30px', width: '330px', height: '520px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10002 };
const chatHeader = { padding: '15px', backgroundColor: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' };
const onlineDot = { width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%' };
const messageArea = { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
const msgBubble = { padding: '10px 14px', borderRadius: '15px', fontSize: '13px', maxWidth: '85%', lineHeight: '1.4' };
const optionsContainerStyle = { padding: '12px', backgroundColor: '#f9fafb', borderTop: '1px solid #eee' };
const buttonsWrapperStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const optionButtonStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '10px', color: '#111', fontSize: '12.5px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500' };
const resetBtnStyle = { background: 'none', border: 'none', color: '#999', fontSize: '11px', cursor: 'pointer', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 };
const modalContent = { backgroundColor: '#fff', borderRadius: '24px', width: '380px', overflow: 'hidden' };
const modalHeader = { backgroundColor: '#111', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px', display: 'block' };
const inputWrapper = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '12px' };
const cleanInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', width: '100%' };
const resultCard = { padding: '20px', borderRadius: '16px', textAlign: 'center', transition: 'all 0.3s' };
const toastContainer = { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', color: '#fff', padding: '12px 25px', borderRadius: '50px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.3s' };

export default ShopProvider;
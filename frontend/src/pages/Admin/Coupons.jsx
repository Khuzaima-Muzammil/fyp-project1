import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Plus, Trash2, Calendar, DollarSign, Percent, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/Coupons.css';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    minPurchase: '',
    expiryDate: ''
  });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5004/api/coupons', {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value, currentFormData = formData) => {
    let errorMsg = '';
    
    if (name === 'code') {
      if (!value.trim()) {
        errorMsg = "Coupon code is required";
      } else if (value.trim().length < 3 || value.trim().length > 15) {
        errorMsg = "Code must be between 3 and 15 characters";
      }
    }
    
    if (name === 'discountAmount') {
      const amount = Number(value);
      if (value === '' || isNaN(amount) || amount <= 0) {
        errorMsg = "Must be a positive number > 0";
      } else if (currentFormData.discountType === 'percentage' && amount > 100) {
        errorMsg = "Percentage cannot exceed 100%";
      } else if (currentFormData.discountType === 'fixed' && currentFormData.minPurchase) {
        const minPurch = Number(currentFormData.minPurchase);
        if (!isNaN(minPurch) && amount >= minPurch) {
          errorMsg = "Fixed discount must be less than min purchase";
        }
      }
    }
    
    if (name === 'minPurchase') {
      const minPurch = Number(value);
      if (value === '' || isNaN(minPurch) || minPurch < 0) {
        errorMsg = "Must be 0 or a positive number";
      } else if (currentFormData.discountType === 'fixed' && currentFormData.discountAmount) {
        const amount = Number(currentFormData.discountAmount);
        if (!isNaN(amount) && amount >= minPurch) {
          errorMsg = "Min purchase must be greater than fixed discount";
        }
      }
    }
    
    if (name === 'expiryDate') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!value || isNaN(selectedDate.getTime()) || selectedDate <= today) {
        errorMsg = "Expiry date must be a future date";
      }
    }
    
    return errorMsg;
  };

  const isFormValid = () => {
    const errs = {
      code: validateField('code', formData.code),
      discountAmount: validateField('discountAmount', formData.discountAmount),
      minPurchase: validateField('minPurchase', formData.minPurchase),
      expiryDate: validateField('expiryDate', formData.expiryDate)
    };
    return !Object.values(errs).some(err => err !== '');
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'code') value = value.toUpperCase();
    
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const fieldError = validateField(name, value, newFormData);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      // Re-validate linked fields
      if (name === 'discountType' || name === 'discountAmount' || name === 'minPurchase') {
        ['discountAmount', 'minPurchase'].forEach(linkedField => {
          if (linkedField !== name) {
            const linkedError = validateField(linkedField, newFormData[linkedField], newFormData);
            if (linkedError) {
              setErrors(prev => ({ ...prev, [linkedField]: linkedError }));
            } else {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[linkedField];
                return newErrors;
              });
            }
          }
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      // Force trigger validation to show errors if they just hit submit
      const errs = {
        code: validateField('code', formData.code),
        discountAmount: validateField('discountAmount', formData.discountAmount),
        minPurchase: validateField('minPurchase', formData.minPurchase),
        expiryDate: validateField('expiryDate', formData.expiryDate)
      };
      setErrors(errs);
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5004/api/coupons', formData, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      toast.success('Coupon created successfully!');
      setShowModal(false);
      setFormData({ code: '', discountType: 'percentage', discountAmount: '', minPurchase: '', expiryDate: '' });
      setErrors({});
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5004/api/coupons/${id}`, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  // Get tomorrow's date string for min attribute in date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="coupons-container">
      <div className="coupons-header">
        <h2 className="header-title">Manage Coupons</h2>
        <button onClick={() => setShowModal(true)} className="add-btn">
          <Plus size={18} /> Generate Coupon
        </button>
      </div>

      <div className="grid-container">
        {coupons.map(coupon => {
          const isActive = new Date() < new Date(coupon.expiryDate);
          return (
            <div key={coupon._id} className="coupon-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="code-badge">{coupon.code}</div>
                  <div className="discount-text">
                    {coupon.discountType === 'percentage' ? <><Percent size={14} /> {coupon.discountAmount}% OFF</> : <><DollarSign size={14} /> {coupon.discountAmount} OFF</>}
                  </div>
                </div>
                <button onClick={() => handleDelete(coupon._id)} className="delete-btn"><Trash2 size={18} /></button>
              </div>
              
              <div className="coupon-info">
                <div className="info-item"><Calendar size={14} /> Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                <div className="info-item"><DollarSign size={14} /> Min. Purchase: {coupon.minPurchase}</div>
              </div>
              
              <div className={`status-badge ${isActive ? 'active' : 'expired'}`}>
                {isActive ? 'Active' : 'Expired'}
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && <p className="no-coupons">No coupons generated yet.</p>}
      </div>

      {/* Generate Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: '800', fontSize: isMobile ? '18px' : '20px' }}>Generate New Coupon</h3>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="input-group">
                <label className="label-style">Coupon Code</label>
                <input 
                  type="text" 
                  name="code"
                  placeholder="e.g. SUMMER50" 
                  className="input-style"
                  style={{ borderColor: errors.code ? '#ef4444' : '' }}
                  value={formData.code}
                  onChange={handleInputChange}
                  minLength={3}
                  maxLength={15}
                  required
                />
                {errors.code && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.code}</span>}
              </div>
              <div className="form-row">
                <div style={{ flex: 1 }} className="input-group">
                  <label className="label-style">Discount Type</label>
                  <select 
                    name="discountType"
                    className="input-style"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div style={{ flex: 1 }} className="input-group">
                  <label className="label-style">Discount Value</label>
                  <input 
                    type="number" 
                    name="discountAmount"
                    className="input-style"
                    style={{ borderColor: errors.discountAmount ? '#ef4444' : '' }}
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    min="1"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    required
                  />
                  {errors.discountAmount && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.discountAmount}</span>}
                </div>
              </div>
              <div className="form-row">
                <div style={{ flex: 1 }} className="input-group">
                  <label className="label-style">Min. Purchase Required</label>
                  <input 
                    type="number" 
                    name="minPurchase"
                    className="input-style"
                    style={{ borderColor: errors.minPurchase ? '#ef4444' : '' }}
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                  {errors.minPurchase && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.minPurchase}</span>}
                </div>
                <div style={{ flex: 1 }} className="input-group">
                  <label className="label-style">Expiry Date</label>
                  <input 
                    type="date" 
                    name="expiryDate"
                    className="input-style"
                    style={{ borderColor: errors.expiryDate ? '#ef4444' : '' }}
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={minDateStr}
                    required
                  />
                  {errors.expiryDate && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiryDate}</span>}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={creating || !isFormValid()} 
                className="generate-btn"
                style={{ opacity: (creating || !isFormValid()) ? 0.6 : 1 }}
              >
                {creating ? 'GENERATING...' : 'GENERATE COUPON'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;

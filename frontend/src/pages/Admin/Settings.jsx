import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, Truck, Globe, MapPin, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/Settings.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    businessInfo: {
      address: '',
      phone: '',
      email: '',
      socialMedia: { facebook: '', instagram: '', twitter: '' }
    },
    shipping: { baseRate: 0, freeThreshold: 0 },
    currency: { code: 'PKR', symbol: 'Rs.' }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchSettings();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('http://localhost:5004/api/settings');
      setSettings(data);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (fieldPath, value) => {
    let errorMsg = '';
    
    switch (fieldPath) {
      case 'businessInfo.address':
        if (!value.trim()) errorMsg = 'Store address is required';
        else if (value.trim().length < 5) errorMsg = 'Address must be at least 5 characters long';
        break;
      case 'businessInfo.phone':
        if (!value.trim()) errorMsg = 'Phone number is required';
        else if (!/^[0-9+\-\s()]+$/.test(value)) errorMsg = 'Invalid phone number format';
        break;
      case 'businessInfo.email':
        if (!value.trim()) errorMsg = 'Support email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Invalid email address format';
        break;
      case 'businessInfo.socialMedia.facebook':
      case 'businessInfo.socialMedia.instagram':
      case 'businessInfo.socialMedia.twitter':
        if (value.trim() && !/^(https?:\/\/)?(www\.)?[\w-]+\.\w+/.test(value)) {
          errorMsg = 'Must be a valid URL';
        }
        break;
      case 'shipping.baseRate':
        if (value === '' || isNaN(Number(value)) || Number(value) < 0) {
          errorMsg = 'Base delivery charge must be 0 or a positive number';
        }
        break;
      case 'shipping.freeThreshold':
        if (value === '' || isNaN(Number(value)) || Number(value) < 0) {
          errorMsg = 'Free shipping threshold must be 0 or a positive number';
        }
        break;
      case 'currency.code':
        if (!value.trim()) errorMsg = 'Currency code is required';
        else if (!/^[A-Z]{3}$/.test(value)) errorMsg = 'Currency code must be exactly 3 uppercase letters (e.g., PKR)';
        break;
      case 'currency.symbol':
        if (!value.trim()) errorMsg = 'Currency symbol is required';
        break;
      default:
        break;
    }
    return errorMsg;
  };

  const isFormValid = () => {
    const errs = {
      'businessInfo.address': validateField('businessInfo.address', settings.businessInfo.address),
      'businessInfo.phone': validateField('businessInfo.phone', settings.businessInfo.phone),
      'businessInfo.email': validateField('businessInfo.email', settings.businessInfo.email),
      'businessInfo.socialMedia.facebook': validateField('businessInfo.socialMedia.facebook', settings.businessInfo.socialMedia.facebook),
      'businessInfo.socialMedia.instagram': validateField('businessInfo.socialMedia.instagram', settings.businessInfo.socialMedia.instagram),
      'businessInfo.socialMedia.twitter': validateField('businessInfo.socialMedia.twitter', settings.businessInfo.socialMedia.twitter),
      'shipping.baseRate': validateField('shipping.baseRate', settings.shipping.baseRate),
      'shipping.freeThreshold': validateField('shipping.freeThreshold', settings.shipping.freeThreshold),
      'currency.code': validateField('currency.code', settings.currency.code),
      'currency.symbol': validateField('currency.symbol', settings.currency.symbol)
    };
    return !Object.values(errs).some(err => err !== '');
  };

  const handleChange = (section, field, subfield, value) => {
    let newSettings = { ...settings };
    
    if (subfield) {
      newSettings[section][field][subfield] = value;
    } else {
      newSettings[section][field] = value;
    }
    setSettings(newSettings);

    const fieldPath = subfield ? `${section}.${field}.${subfield}` : `${section}.${field}`;
    const fieldError = validateField(fieldPath, value);
    
    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldPath]: fieldError }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      const errs = {
        'businessInfo.address': validateField('businessInfo.address', settings.businessInfo.address),
        'businessInfo.phone': validateField('businessInfo.phone', settings.businessInfo.phone),
        'businessInfo.email': validateField('businessInfo.email', settings.businessInfo.email),
        'businessInfo.socialMedia.facebook': validateField('businessInfo.socialMedia.facebook', settings.businessInfo.socialMedia.facebook),
        'businessInfo.socialMedia.instagram': validateField('businessInfo.socialMedia.instagram', settings.businessInfo.socialMedia.instagram),
        'businessInfo.socialMedia.twitter': validateField('businessInfo.socialMedia.twitter', settings.businessInfo.socialMedia.twitter),
        'shipping.baseRate': validateField('shipping.baseRate', settings.shipping.baseRate),
        'shipping.freeThreshold': validateField('shipping.freeThreshold', settings.shipping.freeThreshold),
        'currency.code': validateField('currency.code', settings.currency.code),
        'currency.symbol': validateField('currency.symbol', settings.currency.symbol)
      };
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5004/api/settings', settings, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      toast.success('Settings updated successfully!');
      setErrors({});
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="settings-container">
      <h2 className="settings-title">System Settings</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid-container">
          {/* Business Info Section */}
          <div className="card-style">
            <h3 className="card-title"><MapPin size={20} /> Business Information</h3>
            <div className="input-group">
              <label className="label-style">Store Address</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['businessInfo.address'] ? '#ef4444' : '' }}
                value={settings.businessInfo.address}
                onChange={(e) => handleChange('businessInfo', 'address', null, e.target.value)}
              />
              {errors['businessInfo.address'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['businessInfo.address']}</span>}
            </div>
            <div className="input-group">
              <label className="label-style">Phone Number</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['businessInfo.phone'] ? '#ef4444' : '' }}
                value={settings.businessInfo.phone}
                onChange={(e) => handleChange('businessInfo', 'phone', null, e.target.value)}
              />
              {errors['businessInfo.phone'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['businessInfo.phone']}</span>}
            </div>
            <div className="input-group">
              <label className="label-style">Support Email</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['businessInfo.email'] ? '#ef4444' : '' }}
                value={settings.businessInfo.email}
                onChange={(e) => handleChange('businessInfo', 'email', null, e.target.value)}
              />
              {errors['businessInfo.email'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['businessInfo.email']}</span>}
            </div>
          </div>

          {/* Social Media Section */}
          <div className="card-style">
            <h3 className="card-title"><Globe size={20} /> Social Media Links</h3>
            <div className="input-group">
              <label className="label-style"><Facebook size={16} /> Facebook</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['businessInfo.socialMedia.facebook'] ? '#ef4444' : '' }}
                value={settings.businessInfo.socialMedia.facebook}
                onChange={(e) => handleChange('businessInfo', 'socialMedia', 'facebook', e.target.value)}
              />
              {errors['businessInfo.socialMedia.facebook'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['businessInfo.socialMedia.facebook']}</span>}
            </div>
            <div className="input-group">
              <label className="label-style"><Instagram size={16} /> Instagram</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['businessInfo.socialMedia.instagram'] ? '#ef4444' : '' }}
                value={settings.businessInfo.socialMedia.instagram}
                onChange={(e) => handleChange('businessInfo', 'socialMedia', 'instagram', e.target.value)}
              />
              {errors['businessInfo.socialMedia.instagram'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['businessInfo.socialMedia.instagram']}</span>}
            </div>
            <div className="input-group">
              <label className="label-style"><Twitter size={16} /> Twitter</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['businessInfo.socialMedia.twitter'] ? '#ef4444' : '' }}
                value={settings.businessInfo.socialMedia.twitter}
                onChange={(e) => handleChange('businessInfo', 'socialMedia', 'twitter', e.target.value)}
              />
              {errors['businessInfo.socialMedia.twitter'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['businessInfo.socialMedia.twitter']}</span>}
            </div>
          </div>

          {/* Shipping Rates Section */}
          <div className="card-style">
            <h3 className="card-title"><Truck size={20} /> Shipping Rates</h3>
            <div className="input-group">
              <label className="label-style">Base Delivery Charge ({settings.currency.symbol})</label>
              <input 
                type="number" 
                className="input-style"
                style={{ borderColor: errors['shipping.baseRate'] ? '#ef4444' : '' }}
                value={settings.shipping.baseRate}
                onChange={(e) => handleChange('shipping', 'baseRate', null, e.target.value === '' ? '' : Number(e.target.value))}
              />
              {errors['shipping.baseRate'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['shipping.baseRate']}</span>}
            </div>
            <div className="input-group">
              <label className="label-style">Free Shipping Threshold ({settings.currency.symbol})</label>
              <input 
                type="number" 
                className="input-style"
                style={{ borderColor: errors['shipping.freeThreshold'] ? '#ef4444' : '' }}
                value={settings.shipping.freeThreshold}
                onChange={(e) => handleChange('shipping', 'freeThreshold', null, e.target.value === '' ? '' : Number(e.target.value))}
              />
              {errors['shipping.freeThreshold'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['shipping.freeThreshold']}</span>}
            </div>
          </div>

          {/* Currency Section */}
          <div className="card-style">
            <h3 className="card-title"><Globe size={20} /> Store Currency</h3>
            <div className="input-group">
              <label className="label-style">Currency Code (e.g. PKR, USD)</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['currency.code'] ? '#ef4444' : '' }}
                value={settings.currency.code}
                onChange={(e) => handleChange('currency', 'code', null, e.target.value.toUpperCase())}
                maxLength={3}
              />
              {errors['currency.code'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['currency.code']}</span>}
            </div>
            <div className="input-group">
              <label className="label-style">Currency Symbol (e.g. Rs., $)</label>
              <input 
                type="text" 
                className="input-style"
                style={{ borderColor: errors['currency.symbol'] ? '#ef4444' : '' }}
                value={settings.currency.symbol}
                onChange={(e) => handleChange('currency', 'symbol', null, e.target.value)}
              />
              {errors['currency.symbol'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['currency.symbol']}</span>}
            </div>
          </div>
        </div>

        <div className="save-actions">
          <button 
            type="submit" 
            disabled={saving || !isFormValid()}
            className="save-btn"
            style={{ opacity: (saving || !isFormValid()) ? 0.6 : 1 }}
          >
            {saving ? 'SAVING...' : <><Save size={20} /> SAVE ALL SETTINGS</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Calendar, UserCheck, Trash2, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/NewsletterDashboard.css';

const NewsletterDashboard = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [campaign, setCampaign] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5004/api/newsletter', {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      setSubscribers(data);
    } catch (error) {
      toast.error('Failed to fetch subscribers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    if (!campaign.subject || !campaign.message) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5004/api/newsletter/send-campaign', campaign, {
        headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` }
      });
      toast.success('Campaign sent successfully to all subscribers!');
      setShowModal(false);
      setCampaign({ subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="newsletter-container">
      <div className="newsletter-header">
        <h2 className="header-title">Newsletter Dashboard</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowModal(true)}
            className="campaign-btn"
          >
            <Send size={18} /> Send Campaign
          </button>
          <div className="stats-badge">
            <UserCheck size={18} /> {subscribers.length} Total Subscribers
          </div>
        </div>
      </div>

      {isMobile ? (
        <div className="mobile-sub-list">
          {subscribers.map(sub => (
            <div key={sub._id} className="mobile-sub-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div className="mail-icon-container"><Mail size={16} /></div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{sub.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '12px' }}>
                  <Calendar size={12} /> {new Date(sub.subscribedAt).toLocaleDateString()}
                </div>
                <span className="active-badge">Active</span>
              </div>
            </div>
          ))}
          {subscribers.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No subscribers found.</p>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="newsletter-table">
            <thead>
              <tr className="thead-row">
                <th className="th-style">Email Address</th>
                <th className="th-style">Subscription Date</th>
                <th className="th-style">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={sub._id} className="tr-style">
                  <td className="td-style">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="mail-icon-container"><Mail size={16} /></div>
                      <span style={{ fontSize: isMobile ? '13px' : '15px' }}>{sub.email}</span>
                    </div>
                  </td>
                  <td className="td-style">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: isMobile ? '13px' : '15px' }}>
                      <Calendar size={14} /> {new Date(sub.subscribedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="td-style">
                    <span className="active-badge">Active</span>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No newsletter subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaign Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: '800', fontSize: isMobile ? '18px' : '20px' }}>Send Email Campaign</h3>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendCampaign} style={{ marginTop: '20px' }}>
              <div className="input-group">
                <label className="label-style">Campaign Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g. New Summer Collection is here!" 
                  className="input-style"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="label-style">Message Content</label>
                <textarea 
                  rows={isMobile ? "6" : "8"} 
                  placeholder="Type your campaign message here..." 
                  className="textarea-style"
                  value={campaign.message}
                  onChange={(e) => setCampaign({ ...campaign, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <div style={{ marginTop: isMobile ? '20px' : '30px' }}>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="campaign-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    opacity: sending ? 0.7 : 1,
                    cursor: sending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sending ? 'SENDING CAMPAIGN...' : <><Send size={18} /> SEND TO ALL SUBSCRIBERS</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterDashboard;

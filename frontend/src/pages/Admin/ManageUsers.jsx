import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, MessageSquare, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RESPONSIVE LOGIC (Mobile & Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token, 'Authorization': `Bearer ${token}` };
        
        const [usersRes, reviewsRes] = await Promise.all([
          axios.get('http://localhost:5004/api/users', { headers }),
          axios.get('http://localhost:5004/api/reviews', { headers })
        ]);

        setUsers(usersRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="users-container">
      <h2 className="users-title">Users Management</h2>

      <div className="grid-container">
        
        {/* Customers Section */}
        <section>
          <h3 className="section-title">
            <User size={isMobile ? 20 : 24} color="#3182ce" /> Customers Information
          </h3>
          {isMobile ? (
            <div className="mobile-user-list">
              {users.map(user => (
                <div key={user._id} className="mobile-user-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>{user.username || user.name || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</div>
                    </div>
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                      {(user.role || (user.isAdmin ? 'admin' : 'user')).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    Joined: {new Date(user.createdAt || user.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr className="thead-row">
                    <th className="th-style">Name</th>
                    <th className="th-style">Email</th>
                    <th className="th-style">Role</th>
                    {!isMobile && <th className="th-style">Joined Date</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="tr-style">
                      <td className="td-style">{user.username || user.name || 'N/A'}</td>
                      <td className="td-style">{user.email}</td>
                      <td className="td-style">
                        <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                          {(user.role || (user.isAdmin ? 'admin' : 'user')).toUpperCase()}
                        </span>
                      </td>
                      {!isMobile && <td className="td-style">{new Date(user.createdAt || user.date).toLocaleDateString()}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section>
          <h3 className="section-title">
            <MessageSquare size={isMobile ? 20 : 24} color="#3182ce" /> Customer Reviews & Ratings
          </h3>
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review._id} className="review-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar">{review.user?.name?.[0] || 'U'}</div>
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: isMobile ? '14px' : '15px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.user?.name || 'Unknown User'}</b>
                      <div style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.user?.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', color: '#FBBF24', flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={isMobile ? 10 : 12} fill={star <= review.rating ? "#FBBF24" : "none"} />
                    ))}
                  </div>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#3182ce', fontWeight: '700' }}>Product: </span>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{review.product?.name || 'Deleted Product'}</span>
                </div>

                <p className="review-comment">{review.comment}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #edf2f7' }}>
                  <div style={{ fontSize: '11px', color: '#a0aec0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={12} /> {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p style={{ color: '#888' }}>No reviews found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageUsers;

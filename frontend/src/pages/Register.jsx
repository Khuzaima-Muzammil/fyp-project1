// Importing React and necessary hooks
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For API calls
import { useNavigate, Link } from 'react-router-dom'; // For navigation
import { AlertCircle, XCircle, Loader2 } from 'lucide-react'; // Icons
import toast, { Toaster } from 'react-hot-toast'; // For notifications
import '../styles/Register.css'; // Styling file

const Register = () => {
  // State for user data (Name, Email, Password)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // States for handling errors
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- RESPONSIVE LOGIC (Mobile & Tablet check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Validation logic (To check input fields)
  const validateField = (name, value) => {
    let errorMsg = '';
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (name === 'fullName' && (!value || value.trim().length < 3)) {
      errorMsg = "Name must be at least 3 characters";
    }
    if (name === 'email' && (!value || !gmailRegex.test(value))) {
      errorMsg = "Only valid Gmail addresses (name@gmail.com) are allowed";
    }
    if (name === 'password' && (!value || !passwordRegex.test(value))) {
      errorMsg = "8+ chars, 1 Uppercase, 1 Number and 1 Symbol required";
    }
    return errorMsg;
  };

  // This function runs when the user types something
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (serverError) {
      setServerError('');
    }
  };

  // Check if the entire form is correctly filled
  const isFormValid = () => {
    return (
      formData.fullName.trim().length >= 3 &&
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email) &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)
    );
  };

  // Function to submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setIsLoading(true);
      try {
        // Sending registration request to backend
        const res = await axios.post('http://localhost:5004/api/auth/register', {
          name: formData.fullName.trim(),
          email: formData.email.toLowerCase(),
          password: formData.password
        });
        
        if (res.data.token) {
          localStorage.setItem('token', res.data.token); // Save token
          toast.success("Account created successfully!");
          navigate('/'); // Redirect to home page
          window.location.reload();
        }
      } catch (err) {
        // Show error if registration fails
        if (err.response && err.response.data) {
          const { message, msg, errors: backendErrors } = err.response.data;
          setServerError(message || msg || "Registration failed");
          
          if (backendErrors && backendErrors.length > 0) {
            const newBackendErrors = {};
            backendErrors.forEach(e => {
              const field = e.path || e.param;
              if (field === 'name') newBackendErrors.fullName = e.msg;
              else newBackendErrors[field] = e.msg;
            });
            setErrors(prev => ({...prev, ...newBackendErrors}));
          }
        } else {
          setServerError("Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="register-container" style={{ margin: isMobile ? '40px auto' : isTablet ? '60px auto' : '80px auto', width: isMobile ? '90%' : isTablet ? '380px' : '400px', padding: isMobile ? '20px' : isTablet ? '25px' : '30px' }}>
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2 style={{fontSize: isMobile ? '24px' : isTablet ? '26px' : '28px'}}>Create Account</h2>

        {serverError && (
          <div className="error-box">
            <AlertCircle size={18} /> <span>{serverError}</span>
          </div>
        )}

        {/* Full Name Field */}
        <div className="input-group">
          <label style={{fontSize: '13px', fontWeight: '700', color: '#666'}}>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your name"
            className={errors.fullName ? 'input-error' : ''}
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className="field-error-msg"><XCircle size={14}/> {errors.fullName}</p>}
        </div>

        {/* Email Field */}
        <div className="input-group">
          <label style={{fontSize: '13px', fontWeight: '700', color: '#666'}}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="name@gmail.com"
            className={errors.email ? 'input-error' : ''}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="field-error-msg"><XCircle size={14}/> {errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="input-group">
          <label style={{fontSize: '13px', fontWeight: '700', color: '#666'}}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className={errors.password ? 'input-error' : ''}
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="field-error-msg"><XCircle size={14}/> {errors.password}</p>}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="signup-btn"
          disabled={!isFormValid() || isLoading}
          style={{ 
            opacity: (!isFormValid() || isLoading) ? 0.6 : 1, 
            cursor: (!isFormValid() || isLoading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        {/* Login Page Link */}
        <div className="login-link-container">
          <p>
            Already have an account? <Link to="/login" className="login-link">Sign In Here</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
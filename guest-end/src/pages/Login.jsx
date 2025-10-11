import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  // State for form data
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // State for UI feedback
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear global message when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setMessage('');
  setMessageType('');

  try {
    const response = await axios.post('http://localhost:5000/login', {
      username: formData.username,
      password: formData.password
    });

    console.log('Login response:', response.data);

    if (response.data.success) {
      setMessage(response.data.status || 'Login successful!');
      setMessageType('success');
      
      // Store authentication token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Redirect without the verification test
      setTimeout(() => {
        if (response.data.user && response.data.user.id) {
          window.location.href = `/guestdashboard?guest_id=${response.data.user.id}`;
        } else {
          window.location.href = '/guestdashboard';
        }
      }, 1500);
    } else {
      setMessage(response.data.status || 'Login failed');
      setMessageType('error');
    }
  } catch (error) {
    
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const serverMessage = error.response.data?.status || 
                             error.response.data?.message || 
                             'Login failed';
        setMessage(serverMessage);
        setMessageType('error');
        
        // Handle specific error codes
        if (error.response.status === 401) {
          setErrors({ 
            username: 'Invalid credentials', 
            password: 'Invalid credentials' 
          });
        }
      } else if (error.request) {
        // Network error
        setMessage('Network error. Please check your connection and try again.');
        setMessageType('error');
      } else {
        // Other error
        setMessage('An unexpected error occurred. Please try again.');
        setMessageType('error');
  } }finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2>Login</h2>
        
        {/* Global message display */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <div className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </div>
      </div>

      {/* Inline CSS for styling */}
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-form-wrapper {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 28px;
          font-weight: 600;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          margin-bottom: 8px;
          color: #555;
          fontWeight: 500;
          font-size: 14px;
        }

        input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          outline: none;
        }

        input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input.error {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }

        input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .error-text {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 5px;
          font-weight: 500;
        }

        .login-btn {
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-top: 10px;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .login-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .register-link {
          text-align: center;
          margin-top: 25px;
          color: #666;
          font-size: 14px;
        }

        .register-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .register-link a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .login-form-wrapper {
            padding: 30px 20px;
          }
          
          h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
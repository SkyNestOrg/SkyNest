import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GuestProfile() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    passport_number: '',
    country_of_residence: '',
    date_of_birth: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [guestId, setGuestId] = useState(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    // Get guest_id from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const guestIdFromUrl = urlParams.get('guest_id');
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const user = JSON.parse(userData);
      setGuestId(user.id);
      checkProfileExists(user.id);
    } else if (guestIdFromUrl) {
      setGuestId(guestIdFromUrl);
      checkProfileExists(guestIdFromUrl);
    } else {
      // Redirect to login if no guest_id found
      window.location.href = '/login';
    }
  }, []);

  const checkProfileExists = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/guest/profile/${id}`);
      if (response.data.exists) {
  setProfileExists(true);
  setFormData({
    ...response.data.profile,
    date_of_birth: response.data.profile.date_of_birth
      ? new Date(response.data.profile.date_of_birth).toISOString().split('T')[0]
      : ''
  });
  setMessage('Profile already exists. You can update it below.');
  setMessageType('info');
}

    } catch (error) {
      console.error('Error checking profile:', error);
      if (error.response?.status === 404) {
        setMessage('Please complete your profile information.');
        setMessageType('info');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.passport_number.trim()) newErrors.passport_number = 'Passport number is required';
    if (!formData.country_of_residence.trim()) newErrors.country_of_residence = 'Country is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
  const response = await axios.post('http://localhost:5000/guest/profile', {
    guest_id: guestId,
    ...formData,
    date_of_birth: formData.date_of_birth
      ? new Date(formData.date_of_birth).toISOString().split('T')[0]
      : null
  });


      setMessage(response.data.message);
      setMessageType('success');
      setProfileExists(true);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage(error.response?.data?.message || 'Error saving profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'Segoe UI, sans-serif'
    },
    header: {
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '2rem'
    },
    form: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#2c3e50'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e1e5e9',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease'
    },
    inputError: {
      borderColor: '#e74c3c'
    },
    errorText: {
      color: '#e74c3c',
      fontSize: '0.9rem',
      marginTop: '0.5rem'
    },
    submitButton: {
      width: '100%',
      padding: '1rem',
      backgroundColor: '#2c3e50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    submitButtonDisabled: {
      backgroundColor: '#95a5a6',
      cursor: 'not-allowed'
    },
    message: {
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
       border: '1px solid #f5c6cb',
    },
    info: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Guest Profile {profileExists ? 'Update' : 'Registration'}</h1>
      
      {message && (
        <div style={{...styles.message, ...styles[messageType]}}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              style={{...styles.input, ...(errors.first_name && styles.inputError)}}
              placeholder="Enter your first name"
            />
            {errors.first_name && <span style={styles.errorText}>{errors.first_name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              style={{...styles.input, ...(errors.last_name && styles.inputError)}}
              placeholder="Enter your last name"
            />
            {errors.last_name && <span style={styles.errorText}>{errors.last_name}</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{...styles.input, ...(errors.email && styles.inputError)}}
            placeholder="Enter your email address"
          />
          {errors.email && <span style={styles.errorText}>{errors.email}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Phone Number *</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            style={{...styles.input, ...(errors.phone_number && styles.inputError)}}
            placeholder="Enter your phone number"
          />
          {errors.phone_number && <span style={styles.errorText}>{errors.phone_number}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{...styles.input, ...(errors.address && styles.inputError)}}
            placeholder="Enter your complete address"
          />
          {errors.address && <span style={styles.errorText}>{errors.address}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Passport Number *</label>
          <input
            type="text"
            name="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
            style={{...styles.input, ...(errors.passport_number && styles.inputError)}}
            placeholder="Enter your passport number"
          />
          {errors.passport_number && <span style={styles.errorText}>{errors.passport_number}</span>}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Country of Residence *</label>
            <input
              type="text"
              name="country_of_residence"
              value={formData.country_of_residence}
              onChange={handleChange}
              style={{...styles.input, ...(errors.country_of_residence && styles.inputError)}}
              placeholder="Enter your country"
            />
            {errors.country_of_residence && <span style={styles.errorText}>{errors.country_of_residence}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              style={{...styles.input, ...(errors.date_of_birth && styles.inputError)}}
            />
            {errors.date_of_birth && <span style={styles.errorText}>{errors.date_of_birth}</span>}
          </div>
        </div>

        <button 
          type="submit" 
          style={{
            ...styles.submitButton,
            ...(loading && styles.submitButtonDisabled)
          }}
          disabled={loading}
        >
          {loading ? 'Saving...' : profileExists ? 'Update Profile' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default GuestProfile;
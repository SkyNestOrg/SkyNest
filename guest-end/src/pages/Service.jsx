import React, { useState, useEffect } from "react";
import axios from "axios";

const Service = () => {
  const [formData, setFormData] = useState({
    room_number: "",
    request_type: "",
    quantity: ""
  });
  
  const [serviceOptions, setServiceOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Verify token and get username
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('=== FRONTEND TOKEN DEBUG ===');
        console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');
        
        if (!token) {
          setMessage("Please log in to access this feature");
          setFetchingData(false);
          return;
        }

        console.log('Making request to verify token...');
        const response = await axios.get("http://localhost:5000/tokenauth/verify", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });

        if (response.data.success) {
          console.log('✅ Token verification successful:', response.data);
          setUsername(response.data.user.username);
          // Fetch guest data using the token
          await fetchGuestData(token);
        } else {
          console.log('❌ Token verification failed:', response.data);
          setMessage("Authentication failed. Please log in again.");
          setFetchingData(false);
        }
      } catch (error) {
        console.error("❌ Token verification error:", error);
        console.error('Response data:', error.response?.data);
        setMessage("Authentication error. Please log in again.");
        setFetchingData(false);
      }
    };

    // Fetch guest's available rooms and services
    const fetchGuestData = async (token) => {
      try {
        const config = {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        };
        
        // Fetch available rooms for this guest
        const roomsResponse = await axios.get(
          "http://localhost:5000/getrooms",
          config
        );
        setRoomOptions(roomsResponse.data);
        
        // Fetch services for the guest's branch
        const servicesResponse = await axios.get(
          "http://localhost:5000/getservices",
          config
        );
        setServiceOptions(servicesResponse.data);
        
        setFetchingData(false);
      } catch (error) {
        console.error("Error fetching guest data:", error);
        setMessage("Failed to load service options");
        setFetchingData(false);
      }
    };

    verifyToken();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { room_number, request_type, quantity } = formData;
    if (!room_number || !request_type || !quantity) {
      setMessage("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      };
      
      const response = await axios.post(
        "http://localhost:5000/guestservice",
        { room_number, request_type, quantity },
        config
      );

      if (response.data.success === false) {
        setMessage(response.data.message || "Failed to create service request.");
      } else {
        setMessage(`Service request created successfully! Booking ID: ${response.data.booking_id}`);
        setFormData({
          room_number: "",
          request_type: "",
          quantity: 1
        });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Error submitting service request.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="service-container">
        <div className="service-form-wrapper">
          <h2>Create Service Request</h2>
          <div className="message error">Please log in to access this feature.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-container">
      <div className="service-form-wrapper">
        <h2>Create Service Request</h2>
        <p className="welcome-text">Welcome, {username}</p>
        
        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="service-form">
          {/* Room Number Dropdown */}
          <div className="form-group">
            <label>Room Number</label>
            <select
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              required
              disabled={fetchingData}
            >
              <option value="">Select Your Room</option>
              {roomOptions.map((room, index) => (
                <option key={index} value={room.room_number}>
                  Room {room.room_number} (Check-out: {new Date(room.check_out).toLocaleDateString()})
                </option>
              ))}
            </select>
            {fetchingData && (
              <p className="loading-text">Loading your rooms...</p>
            )}
          </div>

          {/* Request Type Dropdown */}
          <div className="form-group">
            <label>Service Type</label>
            <select
              name="request_type"
              value={formData.request_type}
              onChange={handleChange}
              required
              disabled={fetchingData}
            >
              <option value="">Select a Service</option>
              {serviceOptions.map((service, index) => (
                <option key={index} value={service.service_type}>
                  {service.service_type} - LKR{parseFloat(service.unit_quantity_charges).toFixed(2)}
                </option>
              ))}
            </select>
            {fetchingData && (
              <p className="loading-text">Loading services...</p>
            )}
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || fetchingData}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* Inline CSS to match Book.jsx styling */}
      <style jsx>{`
        .service-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .service-form-wrapper {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 500px;
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 15px;
          font-size: 26px;
          font-weight: 600;
        }
        .welcome-text {
          text-align: center;
          color: #666;
          margin-bottom: 25px;
          font-size: 16px;
        }
        .service-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        label {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }
        input, select {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          outline: none;
        }
        input:focus, select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        input:disabled, select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .loading-text {
          font-size: 12px;
          color: #666;
          margin: 5px 0 0 0;
        }
        .submit-btn {
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
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }
        .submit-btn:disabled {
          background: #ccc;
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
        @media (max-width: 480px) {
          .service-form-wrapper {
            padding: 30px 20px;
          }
          h2 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default Service;
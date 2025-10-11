import React, { useState } from "react";
import axios from "axios";

const SearchGuestDetails = () => {
  const [searchData, setSearchData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    passport_number: ""
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
  e.preventDefault();
  
  // Check if at least one search field is filled
  if (!searchData.first_name && !searchData.last_name && !searchData.email && !searchData.passport_number) {
    setMessage("Please enter at least one search criteria.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    console.log("Sending search data:", searchData); // ADD THIS
    const response = await axios.post("http://localhost:5000/searchguestdetails", searchData);
    
    console.log("Search response:", response.data); // ADD THIS
    
    if (response.data.success) {
      setSearchResults(response.data.data);
      setMessage(response.data.message || `Found ${response.data.data.length} result(s)`);
    } else {
      setMessage(response.data.message || "Search failed.");
      setSearchResults([]);
    }
  } catch (error) {
    console.error("Search error:", error);
    console.error("Error response:", error.response?.data); // ADD THIS
    setMessage(error.response?.data?.message || "Search failed. Please try again.");
    setSearchResults([]);
  } finally {
    setLoading(false);
  }
};

  const clearSearch = () => {
    setSearchData({
      first_name: "",
      last_name: "",
      email: "",
      passport_number: ""
    });
    setSearchResults([]);
    setMessage("");
  };

  return (
    <div className="guest-details-container">
      <div className="guest-details-wrapper">
        <h2>Search Guest Details</h2>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-fields">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={searchData.first_name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={searchData.last_name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={searchData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="passport_number"
              placeholder="Passport Number"
              value={searchData.passport_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-buttons">
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? "Searching..." : "Search Guest"}
            </button>
            <button type="button" onClick={clearSearch} className="clear-btn">
              Clear
            </button>
          </div>
        </form>

        {message && (
          <div className={`message ${message.includes("Found") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="results-section">
            <h3>Search Results</h3>
            <div className="results-grid">
              {searchResults.map((guest, index) => (
                <div key={index} className="guest-card">
                  <div className="guest-info">
                    <h4>{guest.first_name} {guest.last_name}</h4>
                    <p><strong>Email:</strong> {guest.email}</p>
                    <p><strong>Phone:</strong> {guest.phone_number}</p>
                    <p><strong>Passport:</strong> {guest.passport_number}</p>
                    <p><strong>Address:</strong> {guest.address}</p>
                    <p><strong>Country:</strong> {guest.country_of_residence}</p>
                    <p><strong>Date of Birth:</strong> {guest.date_of_birth}</p>
                  </div>
                  
                  {guest.bookings && guest.bookings.length > 0 ? (
                    <div className="bookings-section">
                      <h5>Booking History:</h5>
                      {guest.bookings.map((booking, bookingIndex) => (
                        <div key={bookingIndex} className="booking-item">
                          <p><strong>Booking ID:</strong> {booking.booking_id}</p>
                          <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                          <p><strong>Branch:</strong> {booking.branch_name}</p>
                          <p><strong>Rooms:</strong> {booking.number_of_rooms}</p>
                          <p><strong>Guests:</strong> {booking.number_of_pax}</p>
                          <p><strong>Status:</strong> 
                            <span className={`status ${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </p>
                          <p><strong>Check-in:</strong> {booking.checkin_date}</p>
                          <p><strong>Check-out:</strong> {booking.checkout_date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-bookings">No booking history found.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .guest-details-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .guest-details-wrapper {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 1200px;
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 25px;
          font-size: 26px;
          font-weight: 600;
        }
        .search-form {
          margin-bottom: 30px;
        }
        .search-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          outline: none;
        }
        input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        .form-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        .search-btn, .clear-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }
        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .clear-btn {
          background: #f1f1f1;
          color: #333;
        }
        .clear-btn:hover {
          background: #ddd;
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
        .results-section h3 {
          color: #333;
          margin-bottom: 20px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }
        .results-grid {
          display: grid;
          gap: 20px;
        }
        .guest-card {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 20px;
          background: #f9f9f9;
        }
        .guest-info h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 20px;
        }
        .guest-info p {
          margin: 5px 0;
          color: #555;
        }
        .bookings-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .bookings-section h5 {
          margin: 0 0 15px 0;
          color: #333;
        }
        .booking-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 10px;
          border-left: 4px solid #667eea;
        }
        .booking-item p {
          margin: 3px 0;
          font-size: 14px;
        }
        .status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          margin-left: 8px;
        }
        .status.checkedin {
          background: #d4edda;
          color: #155724;
        }
        .status.checkedout {
          background: #e2e3e5;
          color: #383d41;
        }
        .status.cancelled {
          background: #f8d7da;
          color: #721c24;
        }
        .no-bookings {
          text-align: center;
          color: #666;
          font-style: italic;
          margin-top: 10px;
        }
        @media (max-width: 768px) {
          .guest-details-wrapper {
            padding: 20px;
          }
          .search-fields {
            grid-template-columns: 1fr;
          }
          .form-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchGuestDetails;
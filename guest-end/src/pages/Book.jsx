import React, { useState, useEffect } from "react";
import axios from "axios";

const Book = () => {
  const [formData, setFormData] = useState({
    branch_name: "",
    number_of_pax: "",
    checkin_date: "",
    checkout_date: "",
  });

  const [roomRequests, setRoomRequests] = useState([
    { room_type: "", quantity: 1 }
  ]);

  const [guestId, setGuestId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [message, setMessage] = useState("");

  const [userExists, setUserExists] = useState(false);
  const [userCheckLoading, setUserCheckLoading] = useState(true);


  // useEffect(() => {
  //   const userData = localStorage.getItem("user");
  //   if (userData) {
  //     const user = JSON.parse(userData);
  //     setGuestId(user.id);
  //   }

  //   axios.get("http://localhost:5000/getbranches")
  //     .then(res => setBranches(res.data.branches))
  //     .catch(err => console.error("Error fetching branches:", err));

  //   axios.get("http://localhost:5000/getroomtypes")
  //     .then(res => setRoomTypes(res.data.roomtypes))
  //     .catch(err => console.error("Error fetching room types:", err));
  // }, []);

    useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setGuestId(user.id);
      
      // ADD THIS BLOCK: Check if user exists in database
      axios.get(`http://localhost:5000/book/check-user/${user.id}`)
        .then(res => {
          if (res.data.exists) {
            setUserExists(true);
          } else {
            setMessage("User account not found. Please register first.");
          }
        })
        .catch(err => {
          console.error("Error checking user:", err);
          setMessage("Error verifying user account.");
        })
        .finally(() => {
          setUserCheckLoading(false);
        });
    } else {
      setUserCheckLoading(false);
    }

    axios.get("http://localhost:5000/getbranches")
      .then(res => setBranches(res.data.branches))
      .catch(err => console.error("Error fetching branches:", err));

    axios.get("http://localhost:5000/getroomtypes")
      .then(res => setRoomTypes(res.data.roomtypes))
      .catch(err => console.error("Error fetching room types:", err));
  }, []);







  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoomChange = (index, e) => {
    const updated = [...roomRequests];
    updated[index][e.target.name] = e.target.value;
    setRoomRequests(updated);
  };

  const addRoomRequest = () => {
    setRoomRequests([...roomRequests, { room_type: "", quantity: 1 }]);
  };

  const removeRoomRequest = (index) => {
    const updated = roomRequests.filter((_, i) => i !== index);
    setRoomRequests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guestId) {
      setMessage("You must be logged in to book a room.");
      return;
    }

    if (!formData.branch_name || !formData.number_of_pax || roomRequests.length === 0) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (new Date(formData.checkin_date) >= new Date(formData.checkout_date)) {
      setMessage("Check-out date must be after check-in date");
      return;
    }

    try {
      const payload = {
        guest_id: guestId,
        branch_name: formData.branch_name,
        number_of_pax: Number(formData.number_of_pax),
        checkin_date: formData.checkin_date,
        checkout_date: formData.checkout_date,
        room_requests: roomRequests.map(r => ({
          room_type: r.room_type,
          quantity: Number(r.quantity)
        }))
      };

      const response = await axios.post("http://localhost:5000/book", payload);

      if (response.data.success) {
        setMessage(response.data.message || `Booking successful! Booking ID: ${response.data.data.bookingId}`);
        setFormData({
          branch_name: "",
          number_of_pax: "",
          checkin_date: "",
          checkout_date: "",
        });
        setRoomRequests([{ room_type: "", quantity: 1 }]);
      } else {
        setMessage(response.data.message || "Booking failed.");
      }
    } catch (error) {
      console.error("Booking error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  return (
    <div className="book-container">
      <div className="book-form-wrapper">
        <h2>Book Rooms</h2>

        {/* {!guestId ? (
          <p className="message error">Please login to make a booking.</p>
        ) : (
          <form onSubmit={handleSubmit} className="book-form"> */}
        {!guestId ? (
          <p className="message error">Please login to make a booking.</p>
        ) : userCheckLoading ? (
          <p className="message">Verifying your account...</p>
        ) : !userExists ? (
          <p className="message error">User account not found. Please Fill your details in GUEST PROFILE page in your DASHBOARD.</p>
        ) : (
          <form onSubmit={handleSubmit} className="book-form">
            {/* Branch */}
            <select
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch}>{branch}</option>
              ))}
            </select>

            {/* Guests */}
            <input
              type="number"
              name="number_of_pax"
              placeholder="Number of Guests"
              value={formData.number_of_pax}
              onChange={handleChange}
              required
              min="1"
            />

            {/* Dates */}
            <input
              type={formData.checkin_date ? "date" : "text"}
              name="checkin_date"
              placeholder="Check-in Date"
              value={formData.checkin_date}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!formData.checkin_date) e.target.type = "text";
              }}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />

            <input
              type={formData.checkout_date ? "date" : "text"}
              name="checkout_date"
              placeholder="Check-out Date"
              value={formData.checkout_date}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!formData.checkout_date) e.target.type = "text";
              }}
              onChange={handleChange}
              required
              min={formData.checkin_date || new Date().toISOString().split("T")[0]}
            />

            {/* Room requests */}
            <div className="room-requests">
              {roomRequests.map((req, index) => (
                <div key={index} className="room-row">
                  <select
                    name="room_type"
                    value={req.room_type}
                    onChange={(e) => handleRoomChange(index, e)}
                    required
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map((room, i) => (
                      <option key={i} value={room}>{room}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="quantity"
                    value={req.quantity}
                    onChange={(e) => handleRoomChange(index, e)}
                    min="1"
                    required
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeRoomRequest(index)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRoomRequest}
                className="add-btn"
              >
                + Add Room Type
              </button>
            </div>

            <button type="submit" className="book-btn">Book Now</button>
          </form>
        )}

        {message && (
          <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>

      {/* Inline CSS */}
      <style jsx>{`
        .book-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .book-form-wrapper {
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
          margin-bottom: 25px;
          font-size: 26px;
          font-weight: 600;
        }
        .book-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
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
        .room-requests {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .room-row {
          display: flex;
          gap: 10px;
        }
        .room-row select, .room-row input {
          flex: 1;
        }
        .remove-btn {
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0 10px;
          cursor: pointer;
          font-weight: bold;
        }
        .add-btn {
          background: #f1f1f1;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s ease;
        }
        .add-btn:hover {
          background: #ddd;
        }
        .book-btn {
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
        .book-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }
        .message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 20px;
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
          .book-form-wrapper {
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

export default Book;

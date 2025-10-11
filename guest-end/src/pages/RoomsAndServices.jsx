import React, { useState, useEffect } from "react";

const RoomsAndServices = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/roomsandservices/room-types");

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.success) {
          setRoomTypes(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setError("Failed to fetch room types. " + err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  const getRoomImage = (roomType) => {
    const type = roomType.toLowerCase();
    
    if (type.includes('single')) return '/images/singleroom.jpg';
    if (type.includes('double')) return '/images/doubleroom.jpg';
    if (type.includes('deluxe')) return '/images/deluxeroom.jpeg';
    if (type.includes('suite')) return '/images/suite.jpeg';
    
    // Default image if no match found
    return '/images/default-room.jpeg';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading room types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Our Room Types</h1>
        <p>Choose the perfect room that fits your comfort and style.</p>
      </div>

      <div className="branches-container">
        {roomTypes.map((room) => (
          <div key={room.type_name} className="hotel-card">
            <div className="hotel-image">
              <img 
                src={getRoomImage(room.type_name)} 
                alt={room.type_name} 
                onError={(e) => {
                  e.target.src = '/images/default-room.jpg';
                }}
              />
            
              <div className="hotel-overlay">
                <h3>{room.type_name}</h3>
                <p>LKR {room.base_price.toLocaleString("en-LK")}/night</p>
              </div>
            </div>

            <div className="hotel-content">
              <div className="hotel-info">
                <h4>Amenities</h4>
                {room.amenities.split(", ").map((amenity, i) => (
                  <p key={i}>
                    <i className="fa fa-check"></i> {amenity}
                  </p>
                ))}
              </div>
              <div className="hotel-actions">
                <button className="btn-primary">Book Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scoped CSS */}
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .app-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 20px;
        }

        .app-header h1 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .app-header p {
          font-size: 1.1rem;
          color: #7f8c8d;
        }

        .branches-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .hotel-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .hotel-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .hotel-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .hotel-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .hotel-card:hover .hotel-image img {
          transform: scale(1.05);
        }

        .hotel-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          padding: 20px;
          color: white;
        }

        .hotel-overlay h3 {
          font-size: 1.5rem;
          margin: 0;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
        }

        .hotel-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .hotel-info {
          flex-grow: 1;
        }

        .hotel-info h4 {
          margin-bottom: 10px;
          color: #2c3e50;
        }

        .hotel-info p {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: #555;
        }

        .hotel-info i {
          margin-right: 8px;
          color: #27ae60;
          font-size: 14px;
        }

        .hotel-actions {
          display: flex;
          justify-content: center;
          margin-top: auto;
          padding-top: 15px;
        }

        .btn-primary {
          padding: 12px 25px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          background-color: #1e88e5;
          color: white;
          font-size: 1rem;
          box-shadow: 0 4px 6px rgba(30, 136, 229, 0.3);
          width: 100%;
          max-width: 200px;
        }

        .btn-primary:hover {
          background-color: #1565c0;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(30, 136, 229, 0.4);
        }

        .loading,
        .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default RoomsAndServices;
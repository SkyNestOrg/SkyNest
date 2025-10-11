import React, { useState, useEffect } from 'react';

// HotelCard component
const HotelCard = ({ branch }) => {
  // Map branch names to image filenames
  const getImageForBranch = (branchName) => {
    const imageMap = {
      'Coast': 'coastal-branch.jpg',
      'Hills': 'hills-branch.jpg',
      'Urban': 'urban-branch.jpg',
    };
    
    // Find a matching image or use default
    for (const [key, value] of Object.entries(imageMap)) {
      if (branchName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return imageMap.Default;
  };

  const imageName = getImageForBranch(branch.branch_name);
  const imageUrl = `/images/${imageName}`;

  return (
    <div className="hotel-card">
      <div className="hotel-image">
        <img src={imageUrl} alt={branch.branch_name} />
        <div className="hotel-overlay">
          <h3>{branch.branch_name}</h3>
        </div>
      </div>
      
      <div className="hotel-content">
        <div className="hotel-info">
          <p className="location">
            <i className="fas fa-map-marker-alt"></i>
            {branch.address}, {branch.city}
          </p>
          <p className="contact">
            <i className="fas fa-phone"></i>
            {branch.contact_number}
          </p>
        </div>
        
        <div className="hotel-actions">
          <button className="btn-book-now">Book Now</button>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('http://localhost:5000/branches');
        const data = await response.json();
        
        if (data.success) {
          setBranches(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch branches. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading branches...</p>
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
      <header className="app-header">
        <h1>Our Hotel Branches</h1>
        <p>Discover our luxurious accommodations across different locations</p>
      </header>
      
      <div className="branches-container">
        {branches.map(branch => (
          <HotelCard key={branch.branch_id} branch={branch} />
        ))}
      </div>
      
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
          color: #333;
          line-height: 1.6;
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
          justify-content: center;
        }
        
        .hotel-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hotel-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .hotel-image {
          position: relative;
          height: 200px;
          overflow: hidden;
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
        }
        
        .hotel-info {
          margin-bottom: 20px;
        }
        
        .hotel-info p {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #555;
        }
        
        .hotel-info i {
          margin-right: 10px;
          color: #3498db;
          width: 16px;
        }
        
        .hotel-actions {
          display: flex;
          justify-content: center;
        }
        
        .btn-book-now {
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
        }
        
        .btn-book-now:hover {
          background-color: #1565c0;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(30, 136, 229, 0.4);
        }
        
        .loading, .error {
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
          to { transform: rotate(360deg); }
        }
        
        .error button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .error button:hover {
          background-color: #2980b9;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .branches-container {
            grid-template-columns: 1fr;
          }
          
          .app-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
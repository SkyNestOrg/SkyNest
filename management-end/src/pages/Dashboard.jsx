import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const authToken = localStorage.getItem('token');
    
    if (userData && authToken) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/managementlogin';
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    window.location.href = '/managementlogin';
  };

  const handleMenuItemClick = (item) => {
    if (item === "Management Profile") {
      // Navigate to guest profile page with guest_id parameter
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        window.location.href = `/management-profile?username=${user.username}`;
      }
    } else if (item === "Room Occupancy Report") {
      navigate('/report1');
    } else if (item === "Guest Billing Summary") {
      navigate('/report2');
    } else if (item === "Service Usage Summary") {
      navigate('/report3');
    } else if (item === "Monthly Revenue Report") {
      navigate('/report4');
    } else if (item === "Top Used Services Summary") {
      navigate('/report5');
       // Add other menu item handlers here as needed
  };
  }
  const styles = {
    dashboard: {
      display: 'grid',
      gridTemplateAreas: `
        "header header"
        "sidebar content"
      `,
      gridTemplateColumns: '220px 1fr',
      gridTemplateRows: '70px 1fr',
      height: '100vh',
      fontFamily: 'Segoe UI, sans-serif',
    },
    header: {
      gridArea: 'header',
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '1.4rem',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '1rem',
    },
    logoutButton: {
      background: 'transparent',
      border: '1px solid white',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    sidebar: {
      gridArea: 'sidebar',
      backgroundColor: '#34495e',
      color: 'white',
      padding: '2rem 1rem',
      borderTopRightRadius: '12px',
      boxShadow: '2px 0 6px rgba(0,0,0,0.2)',
    },
    sidebarList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    sidebarItem: {
      margin: '1rem 0',
      cursor: 'pointer',
      padding: '0.6rem 1rem',
      borderRadius: '8px',
      transition: 'background 0.3s',
    },
    content: {
      gridArea: 'content',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f6f9fc, #dbe9f4)',
      borderTopLeftRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#2c3e50',
      fontWeight: 'bold',
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
    },
  };

  const menuItems = [
    "Room Occupancy Report",
    "Guest Billing Summary",
    "Service Usage Summary",
    "Monthly Revenue Report",
    "Top Used Services Summary"
    
  ];

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return <div style={styles.loading}>Redirecting to login...</div>;
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div> Management Dashboard</div>
        <div style={styles.userInfo}>
          <span>Welcome, {user.username}!</span>
          <button 
            style={styles.logoutButton} 
            onClick={handleLogout}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Logout
          </button>
        </div>
      </header>

      <nav style={styles.sidebar}>
        <ul style={styles.sidebarList}>
          {menuItems.map((item, index) => (
            <li
              key={index}
              style={styles.sidebarItem}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#1abc9c')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
              onClick={() => handleMenuItemClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      <main style={styles.content}>
        <div>Welcome to SkyNest HRGSMS Management Portal</div>
        <div style={{ fontSize: '1rem', marginTop: '1rem', fontWeight: 'normal' }}>
        Management User: {user.username}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
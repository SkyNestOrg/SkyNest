import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CurrentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentBookings();
  }, []);

  const fetchCurrentBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/currentbookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });

      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeStyle = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'checkedin':
        return styles.statusCheckedIn;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'checkedout':
        return styles.statusCheckedOut;
      default:
        return styles.statusDefault;
    }
  };

  const renderRoomDetails = (rooms) => {
    if (!rooms || rooms.length === 0) {
      return (
        <div style={styles.roomDetail}>
          <span style={styles.noRooms}>No rooms assigned yet</span>
        </div>
      );
    }

    return rooms.map((room, index) => (
      <div key={index} style={styles.roomDetail}>
        <div style={styles.roomHeader}>
          <span style={styles.roomNumber}>Room {room.room_number}</span>
          <span style={{...styles.roomStatus, ...getStatusBadgeStyle(room.room_status)}}>
            {room.room_status || 'Assigned'}
          </span>
        </div>
        <div style={styles.roomDates}>
          <span style={styles.dateLabel}>Check-in: </span>
          <span>{formatDate(room.check_in)}</span>
          <span style={{...styles.dateLabel, marginLeft: '10px'}}>Check-out: </span>
          <span>{formatDate(room.check_out)}</span>
        </div>
        {index < rooms.length - 1 && <hr style={styles.roomSeparator} />}
      </div>
    ));
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Current Bookings</h1>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Current Bookings</h1>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Current Bookings</h1>
      
      {bookings.length === 0 ? (
        <div style={styles.message}>
          <p>No current bookings found.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {bookings.map(booking => (
            <div 
              key={booking.booking_id} 
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.cardHover.transform;
                e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.card.boxShadow;
              }}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Booking #{booking.booking_id}</h3>
                <span style={{...styles.bookingStatus, ...getStatusBadgeStyle(booking.booking_status)}}>
                  {booking.booking_status}
                </span>
              </div>
              
              <div style={styles.cardBody}>
                {/* Booking Details */}
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>Booking Date:</span>
                  <span style={styles.detailValue}>{formatDate(booking.booking_date)}</span>
                </div>
                
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>Branch:</span>
                  <span style={styles.detailValue}>{booking.branch_name}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <div style={{...styles.detail, ...styles.lastDetail, flex: 1}}>
                    <span style={styles.detailLabel}>Total Rooms:</span>
                    <span style={styles.detailValue}>{booking.number_of_rooms}</span>
                  </div>
                  
                  <div style={{...styles.detail, ...styles.lastDetail, flex: 1}}>
                    <span style={styles.detailLabel}>Guests:</span>
                    <span style={styles.detailValue}>{booking.number_of_pax}</span>
                  </div>
                </div>

                {/* Rooms Section */}
                <div style={styles.roomsSection}>
                  <div style={styles.roomsHeader}>
                    <span style={styles.roomsTitle}>
                      Rooms ({booking.rooms ? booking.rooms.length : 0})
                    </span>
                  </div>
                  <div style={styles.roomsList}>
                    {renderRoomDetails(booking.rooms)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Inline Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f5f7f9',
    minHeight: '100vh'
  },
  header: {
    color: '#2c3e50',
    marginBottom: '30px',
    textAlign: 'center',
    fontSize: '2.2rem',
    fontWeight: '600',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  },
  cardTitle: {
    margin: '0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  bookingStatus: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  statusCheckedIn: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  statusConfirmed: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    border: '1px solid #bee5eb'
  },
  cardBody: {
    padding: '20px'
  },
  detail: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f0f0f0'
  },
  detailRow: {
    display: 'flex',
    gap: '20px'
  },
  detailLabel: {
    fontWeight: '600',
    color: '#555',
    fontSize: '14px'
  },
  detailValue: {
    color: '#333',
    textAlign: 'right',
    fontSize: '14px'
  },
  // Rooms Section Styles
  roomsSection: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  roomsHeader: {
    marginBottom: '10px'
  },
  roomsTitle: {
    fontWeight: '600',
    color: '#495057',
    fontSize: '14px'
  },
  roomsList: {
    fontSize: '13px'
  },
  roomDetail: {
    marginBottom: '8px'
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  roomNumber: {
    fontWeight: '600',
    color: '#333'
  },
  roomStatus: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600'
  },
  roomDates: {
    color: '#666',
    fontSize: '12px'
  },
  dateLabel: {
    fontWeight: '500'
  },
  roomSeparator: {
    border: 'none',
    borderTop: '1px dashed #ddd',
    margin: '8px 0'
  },
  noRooms: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: '12px'
  },
  // Other existing styles...
  message: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#7f8c8d'
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#e74c3c'
  },
  loadingSpinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  }
};

// Add CSS animation for the spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default CurrentBookings;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Check() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [searchBookingId, setSearchBookingId] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:5000/check', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setBookings(response.data.data);
                setFilteredBookings(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load bookings');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchBookingId.trim()) {
            // If search is empty, show all bookings
            setFilteredBookings(bookings);
            return;
        }

        try {
            setSearchLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `http://localhost:5000/check/search/${searchBookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setFilteredBookings([response.data.data]);
                setError('');
            } else {
                setError(response.data.message || 'Booking not found');
                setFilteredBookings([]);
            }
        } catch (error) {
            console.error('Error searching booking:', error);
            if (error.response?.status === 404) {
                setError('Booking not found or does not belong to your branch');
                setFilteredBookings([]);
            } else if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to search booking');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            return;
        }

        try {
            setUpdatingStatus(bookingId);
            const token = localStorage.getItem('token');
            
            const response = await axios.put(
                `http://localhost:5000/check/${bookingId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert('Booking status updated successfully!');
                
                // Update the local state
                const updatedBookings = bookings.map(booking =>
                    booking.booking_id === bookingId 
                        ? { ...booking, status: newStatus }
                        : booking
                );
                
                setBookings(updatedBookings);
                setFilteredBookings(updatedBookings.filter(booking => 
                    filteredBookings.some(fb => fb.booking_id === booking.booking_id)
                ));
            } else {
                alert(response.data.message || 'Failed to update booking status');
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert(error.response?.data?.message || 'Failed to update booking status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleClearSearch = () => {
        setSearchBookingId('');
        setFilteredBookings(bookings);
        setError('');
    };

    const getAvailableStatusOptions = (currentStatus) => {
        switch (currentStatus) {
            case 'Confirmed':
                return [
                    { value: 'Confirmed', label: 'Confirmed' },
                    { value: 'CheckedIn', label: 'Checked In' },
                    { value: 'Cancelled', label: 'Cancelled' }
                ];
            case 'CheckedIn':
                return [
                    { value: 'CheckedIn', label: 'Checked In' },
                    { value: 'CheckedOut', label: 'Checked Out' },
                    { value: 'Cancelled', label: 'Cancelled' }
                ];
            case 'CheckedOut':
            case 'Cancelled':
                return []; // No options for final statuses
            default:
                return [
                    { value: 'Confirmed', label: 'Confirmed' },
                    { value: 'CheckedIn', label: 'Checked In' },
                    { value: 'CheckedOut', label: 'Checked Out' },
                    { value: 'Cancelled', label: 'Cancelled' }
                ];
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed':
                return '#3498db';
            case 'CheckedIn':
                return '#27ae60';
            case 'CheckedOut':
                return '#95a5a6';
            case 'Cancelled':
                return '#e74c3c';
            default:
                return '#7f8c8d';
        }
    };

    const isFinalStatus = (status) => {
        return status === 'CheckedOut' || status === 'Cancelled';
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading bookings...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Manage Bookings - Branch {user?.branch_id}</h1>
                <button onClick={fetchBookings} style={styles.refreshBtn}>
                    Refresh
                </button>
            </div>

            {/* Search Section */}
            <div style={styles.searchSection}>
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by Booking ID..."
                        value={searchBookingId}
                        onChange={(e) => setSearchBookingId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        style={styles.searchInput}
                    />
                    <button 
                        onClick={handleSearch} 
                        style={styles.searchBtn}
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                    {searchBookingId && (
                        <button 
                            onClick={handleClearSearch} 
                            style={styles.clearBtn}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* Removed stats section */}

            {filteredBookings.length === 0 ? (
                <div style={styles.noBookings}>
                    <h3>No bookings found</h3>
                    <p>No bookings match your search criteria.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Booking ID</th>
                                <th style={styles.th}>Guest ID</th>
                                <th style={styles.th}>Booking Date</th>
                                <th style={styles.th}>Rooms</th>
                                <th style={styles.th}>Guests</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => {
                                const availableOptions = getAvailableStatusOptions(booking.status);
                                const isFinal = isFinalStatus(booking.status);
                                
                                return (
                                    <tr key={booking.booking_id} style={styles.tr}>
                                        <td style={styles.td}>#{booking.booking_id}</td>
                                        <td style={styles.td}>#{booking.guest_id}</td>
                                        <td style={{...styles.td, ...styles.datetime}}>
                                            {formatDateTime(booking.booking_date)}
                                        </td>
                                        <td style={{...styles.td, ...styles.center}}>{booking.number_of_rooms}</td>
                                        <td style={{...styles.td, ...styles.center}}>{booking.number_of_pax}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(booking.status)
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {!isFinal ? (
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking.booking_id, e.target.value)}
                                                    disabled={updatingStatus === booking.booking_id || availableOptions.length === 0}
                                                    style={{
                                                        ...styles.statusSelect,
                                                        borderColor: getStatusColor(booking.status),
                                                        opacity: updatingStatus === booking.booking_id ? 0.6 : 1
                                                    }}
                                                >
                                                    {availableOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span style={styles.finalStatusText}>
                                                    Final Status
                                                </span>
                                            )}
                                            {updatingStatus === booking.booking_id && (
                                                <span style={styles.updatingText}>Updating...</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e0e0e0',
    },
    refreshBtn: {
        background: '#3498db',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background 0.3s ease',
    },
    searchSection: {
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '8px',
    },
    searchContainer: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    searchInput: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        minWidth: '250px',
        flex: '1',
    },
    searchBtn: {
        background: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    clearBtn: {
        background: '#95a5a6',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    errorMessage: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #f5c6cb',
    },
    noBookings: {
        textAlign: 'center',
        padding: '3rem',
        background: '#f8f9fa',
        borderRadius: '10px',
        color: '#6c757d',
    },
    tableContainer: {
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        background: '#34495e',
        color: 'white',
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '0.9rem',
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #e0e0e0',
    },
    tr: {
        ':hover': {
            background: '#f8f9fa',
        },
    },
    datetime: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
    },
    center: {
        textAlign: 'center',
    },
    statusBadge: {
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'white',
        textTransform: 'uppercase',
    },
    statusSelect: {
        padding: '0.5rem',
        border: '2px solid',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        background: 'white',
    },
    finalStatusText: {
        color: '#7f8c8d',
        fontStyle: 'italic',
        fontSize: '0.9rem',
    },
    updatingText: {
        fontSize: '0.8rem',
        color: '#7f8c8d',
        marginLeft: '0.5rem',
        fontStyle: 'italic',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#7f8c8d',
    },
};

// Add hover effects
Object.assign(styles.refreshBtn, {
    ':hover': {
        background: '#2980b9',
    },
});

Object.assign(styles.searchBtn, {
    ':hover': {
        background: '#219653',
    },
});

Object.assign(styles.clearBtn, {
    ':hover': {
        background: '#7f8c8d',
    },
});

export default Check;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewPastServices() {
    const [pastServices, setPastServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [roomNumbers, setRoomNumbers] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        roomNumber: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchPastServices();
        fetchRoomNumbers();
    }, []);

    const fetchPastServices = async (filterParams = {}) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const params = new URLSearchParams();
            if (filterParams.startDate) params.append('startDate', filterParams.startDate);
            if (filterParams.endDate) params.append('endDate', filterParams.endDate);
            if (filterParams.roomNumber) params.append('roomNumber', filterParams.roomNumber);

            const response = await axios.get(`http://localhost:5000/viewpastservices?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setPastServices(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch past services');
            }
        } catch (error) {
            console.error('Error fetching past services:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load past services');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomNumbers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/viewpastservices/rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setRoomNumbers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching room numbers:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...filters,
            [key]: value
        };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        fetchPastServices(filters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            startDate: '',
            endDate: '',
            roomNumber: ''
        };
        setFilters(clearedFilters);
        fetchPastServices(clearedFilters);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading past services...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Past Services - Branch {user?.branch_id}</h1>
                <button onClick={() => fetchPastServices(filters)} style={styles.refreshBtn}>
                    Refresh
                </button>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div style={styles.content}>
                {/* Filters Sidebar */}
                <div style={styles.sidebar}>
                    <h3 style={styles.filterTitle}>Refine Results</h3>
                    
                    {/* Date Range Filter */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Date Range</label>
                        <div style={styles.dateInputs}>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                style={styles.dateInput}
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                style={styles.dateInput}
                                placeholder="End Date"
                            />
                        </div>
                    </div>

                    {/* Room Number Filter */}
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Room Number</label>
                        <select
                            value={filters.roomNumber}
                            onChange={(e) => handleFilterChange('roomNumber', e.target.value)}
                            style={styles.selectInput}
                        >
                            <option value="">All Rooms</option>
                            {roomNumbers.map(room => (
                                <option key={room} value={room}>
                                    Room {room}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Actions */}
                    <div style={styles.filterActions}>
                        <button onClick={applyFilters} style={styles.applyBtn}>
                            Apply Filters
                        </button>
                        <button onClick={clearFilters} style={styles.clearBtn}>
                            Clear Filters
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={styles.stats}>
                        <div style={styles.statCard}>
                            <h4>Total Services</h4>
                            <p style={styles.statNumber}>{pastServices.length}</p>
                        </div>
                        {filters.roomNumber && (
                            <div style={styles.statCard}>
                                <h4>Room {filters.roomNumber}</h4>
                                <p style={styles.statNumber}>
                                    {pastServices.filter(service => service.room_number === filters.roomNumber).length}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div style={styles.mainContent}>
                    {pastServices.length === 0 ? (
                        <div style={styles.noServices}>
                            <h3>No completed services found</h3>
                            <p>No services have been completed for your branch with the current filters.</p>
                        </div>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Service ID</th>
                                        <th style={styles.th}>Service Type</th>
                                        <th style={styles.th}>Room</th>
                                        <th style={styles.th}>Booking ID</th>
                                        <th style={styles.th}>Completed Date & Time</th>
                                        <th style={styles.th}>Quantity</th>
                                        <th style={styles.th}>Total Charge</th>
                                        <th style={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastServices.map((service) => (
                                        <tr key={service.service_request_id} style={styles.tr}>
                                            <td style={styles.td}>#{service.service_request_id}</td>
                                            <td style={{...styles.td, ...styles.serviceType}}>{service.request_type}</td>
                                            <td style={{...styles.td, ...styles.roomNumber}}>{service.room_number}</td>
                                            <td style={styles.td}>#{service.booking_id}</td>
                                            <td style={{...styles.td, ...styles.datetime}}>{formatDateTime(service.date_time)}</td>
                                            <td style={{...styles.td, ...styles.quantity}}>{service.quantity}</td>
                                            <td style={{...styles.td, ...styles.totalCharge}}>
                                                {formatCurrency(service.total_charge || 0)}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.statusCompleted}>
                                                    {service.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .container {
                        padding: 1rem !important;
                    }
                    
                    .header {
                        flex-direction: column !important;
                        gap: 1rem !important;
                        text-align: center !important;
                    }
                    
                    .content {
                        flex-direction: column !important;
                    }
                    
                    .sidebar {
                        width: 100% !important;
                        margin-right: 0 !important;
                        margin-bottom: 2rem !important;
                    }
                    
                    .tableContainer {
                        overflow-x: auto !important;
                    }
                    
                    .table {
                        min-width: 800px !important;
                    }
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
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
        ':hover': {
            background: '#2980b9',
        },
    },
    content: {
        display: 'flex',
        gap: '2rem',
    },
    sidebar: {
        width: '300px',
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '10px',
        height: 'fit-content',
    },
    filterTitle: {
        margin: '0 0 1.5rem 0',
        color: '#2c3e50',
        fontSize: '1.2rem',
    },
    filterGroup: {
        marginBottom: '1.5rem',
    },
    filterLabel: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#34495e',
        fontSize: '0.9rem',
    },
    dateInputs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    dateInput: {
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    selectInput: {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    filterActions: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
    },
    applyBtn: {
        flex: 1,
        background: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background 0.3s ease',
        ':hover': {
            background: '#219653',
        },
    },
    clearBtn: {
        flex: 1,
        background: '#95a5a6',
        color: 'white',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background 0.3s ease',
        ':hover': {
            background: '#7f8c8d',
        },
    },
    stats: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    statCard: {
        background: 'white',
        padding: '1rem',
        borderRadius: '6px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    statNumber: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0.5rem 0 0 0',
    },
    mainContent: {
        flex: 1,
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
    serviceType: {
        fontWeight: '600',
        color: '#2c3e50',
    },
    roomNumber: {
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    datetime: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
    },
    quantity: {
        textAlign: 'center',
        fontWeight: '600',
    },
    totalCharge: {
        textAlign: 'right',
        fontWeight: '600',
        color: '#27ae60',
    },
    statusCompleted: {
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        background: '#d1edff',
        color: '#004085',
    },
    noServices: {
        textAlign: 'center',
        padding: '3rem',
        background: '#f8f9fa',
        borderRadius: '10px',
        color: '#6c757d',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#7f8c8d',
    },
    errorMessage: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #f5c6cb',
    },
};

export default ViewPastServices;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewDueServices() {
    const [dueServices, setDueServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchDueServices();
    }, []);

    const fetchDueServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:5000/viewdueservices', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setDueServices(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch due services');
            }
        } catch (error) {
            console.error('Error fetching due services:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load due services');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteService = async (serviceId) => {
        if (!window.confirm('Are you sure you want to mark this service as completed?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.put(
                `http://localhost:5000/viewdueservices/${serviceId}/complete`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert('Service marked as completed successfully!');
                // Refresh the list
                fetchDueServices();
            } else {
                alert(response.data.message || 'Failed to complete service');
            }
        } catch (error) {
            console.error('Error completing service:', error);
            alert(error.response?.data?.message || 'Failed to complete service');
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

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading due services...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Due Services - Branch {user?.branch_id}</h1>
                <button onClick={fetchDueServices} style={styles.refreshBtn}>
                    Refresh
                </button>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <h3>Total Due Services</h3>
                    <p>{dueServices.length}</p>
                </div>
            </div>

            {dueServices.length === 0 ? (
                <div style={styles.noServices}>
                    <h3>No due services found</h3>
                    <p>All service requests are completed for your branch.</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Service ID</th>
                                <th style={styles.th}>Service Type</th>
                                <th style={styles.th}>Room Number</th>
                                <th style={styles.th}>Booking ID</th>
                                <th style={styles.th}>Request Date & Time</th>
                                <th style={styles.th}>Quantity</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dueServices.map((service) => (
                                <tr key={service.service_request_id} style={styles.tr}>
                                    <td style={styles.td}>#{service.service_request_id}</td>
                                    <td style={{...styles.td, ...styles.serviceType}}>{service.request_type}</td>
                                    <td style={{...styles.td, ...styles.roomNumber}}>{service.room_number}</td>
                                    <td style={styles.td}>#{service.booking_id}</td>
                                    <td style={{...styles.td, ...styles.datetime}}>{formatDateTime(service.date_time)}</td>
                                    <td style={{...styles.td, ...styles.quantity}}>{service.quantity}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            ...(service.status === 'Request Placed' ? styles.statusRequestPlaced : styles.statusCompleted)
                                        }}>
                                            {service.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => handleCompleteService(service.service_request_id)}
                                            style={styles.completeBtn}
                                            title="Mark as Completed"
                                        >
                                            Complete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                /* Responsive design */
                @media (max-width: 768px) {
                    .container {
                        padding: 1rem !important;
                    }
                    
                    .header {
                        flex-direction: column !important;
                        gap: 1rem !important;
                        text-align: center !important;
                    }
                    
                    .tableContainer {
                        overflow-x: auto !important;
                    }
                    
                    .table {
                        min-width: 600px !important;
                    }
                }
            `}</style>
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
    stats: {
        marginBottom: '2rem',
    },
    statCard: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '250px',
    },
    errorMessage: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #f5c6cb',
    },
    noServices: {
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
    statusBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusRequestPlaced: {
        background: '#fff3cd',
        color: '#856404',
    },
    statusCompleted: {
        background: '#d1edff',
        color: '#004085',
    },
    completeBtn: {
        background: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        transition: 'background 0.3s ease',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#7f8c8d',
    },
};

// Add hover effects using CSS-in-JS
const hoverEffects = {
    refreshBtn: {
        ':hover': {
            background: '#2980b9',
        },
    },
    completeBtn: {
        ':hover': {
            background: '#219653',
        },
    },
};

// Merge hover effects with main styles
Object.assign(styles.refreshBtn, hoverEffects.refreshBtn);
Object.assign(styles.completeBtn, hoverEffects.completeBtn);

export default ViewDueServices;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UpdateServiceTable() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [newService, setNewService] = useState({
        service_type: '',
        unit_quantity_charges: '',
        availability: 'Yes'
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:5000/updateservicetable', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setServices(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load services');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (service) => {
        setEditingService({ ...service });
        setSuccessMessage('');
    };

    const handleEditChange = (field, value) => {
        setEditingService(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateService = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.put(
                `http://localhost:5000/updateservicetable/${editingService.service_type}`,
                {
                    unit_quantity_charges: parseFloat(editingService.unit_quantity_charges),
                    availability: editingService.availability
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Service updated successfully!');
                setEditingService(null);
                fetchServices();
            } else {
                setError(response.data.message || 'Failed to update service');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            setError(error.response?.data?.message || 'Failed to update service');
        }
    };

    const handleNewServiceChange = (field, value) => {
        setNewService(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddService = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(
                'http://localhost:5000/updateservicetable',
                {
                    service_type: newService.service_type,
                    unit_quantity_charges: parseFloat(newService.unit_quantity_charges),
                    availability: newService.availability
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Service added successfully!');
                setNewService({
                    service_type: '',
                    unit_quantity_charges: '',
                    availability: 'Yes'
                });
                fetchServices();
            } else {
                setError(response.data.message || 'Failed to add service');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            setError(error.response?.data?.message || 'Failed to add service');
        }
    };

    const cancelEdit = () => {
        setEditingService(null);
        setSuccessMessage('');
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
                <div style={styles.loading}>Loading services...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Update Services - Branch {user?.branch_id}</h1>
                <button onClick={fetchServices} style={styles.refreshBtn}>
                    Refresh
                </button>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            {successMessage && (
                <div style={styles.successMessage}>
                    {successMessage}
                </div>
            )}

            {/* Add New Service Section */}
            <div style={styles.addSection}>
                <h2 style={styles.sectionTitle}>Add New Service</h2>
                <div style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Service Type</label>
                        <input
                            type="text"
                            value={newService.service_type}
                            onChange={(e) => handleNewServiceChange('service_type', e.target.value)}
                            style={styles.input}
                            placeholder="Enter service type (e.g., Spa Service)"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Unit Charge (Rs)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newService.unit_quantity_charges}
                            onChange={(e) => handleNewServiceChange('unit_quantity_charges', e.target.value)}
                            style={styles.input}
                            placeholder="Enter unit charge"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Availability</label>
                        <select
                            value={newService.availability}
                            onChange={(e) => handleNewServiceChange('availability', e.target.value)}
                            style={styles.selectInput}
                        >
                            <option value="Yes">Available</option>
                            <option value="No">Not Available</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleAddService}
                        style={styles.addBtn}
                        disabled={!newService.service_type || !newService.unit_quantity_charges}
                    >
                        Add Service
                    </button>
                </div>
            </div>

            {/* Existing Services Section */}
            <div style={styles.servicesSection}>
                <h2 style={styles.sectionTitle}>Existing Services</h2>
                
                {services.length === 0 ? (
                    <div style={styles.noServices}>
                        <h3>No services found</h3>
                        <p>Add your first service using the form above.</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Service Type</th>
                                    <th style={styles.th}>Unit Charge</th>
                                    <th style={styles.th}>Availability</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.service_type} style={styles.tr}>
                                        {editingService && editingService.service_type === service.service_type ? (
                                            // Edit Mode
                                            <>
                                                <td style={styles.td}>
                                                    <strong>{service.service_type}</strong>
                                                </td>
                                                <td style={styles.td}>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={editingService.unit_quantity_charges}
                                                        onChange={(e) => handleEditChange('unit_quantity_charges', e.target.value)}
                                                        style={styles.editInput}
                                                    />
                                                </td>
                                                <td style={styles.td}>
                                                    <select
                                                        value={editingService.availability}
                                                        onChange={(e) => handleEditChange('availability', e.target.value)}
                                                        style={styles.editSelect}
                                                    >
                                                        <option value="Yes">Available</option>
                                                        <option value="No">Not Available</option>
                                                    </select>
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={handleUpdateService}
                                                        style={styles.saveBtn}
                                                    >
                                                        Save
                                                    </button>
                                                    <button 
                                                        onClick={cancelEdit}
                                                        style={styles.cancelBtn}
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            // View Mode
                                            <>
                                                <td style={{...styles.td, ...styles.serviceType}}>
                                                    {service.service_type}
                                                </td>
                                                <td style={styles.td}>
                                                    {formatCurrency(service.unit_quantity_charges)}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.availabilityBadge,
                                                        ...(service.availability === 'Yes' ? styles.available : styles.notAvailable)
                                                    }}>
                                                        {service.availability}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => handleEditClick(service)}
                                                        style={styles.editBtn}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
                    
                    .form {
                        flex-direction: column !important;
                    }
                    
                    .formGroup {
                        margin-right: 0 !important;
                        margin-bottom: 1rem !important;
                    }
                    
                    .tableContainer {
                        overflow-x: auto !important;
                    }
                    
                    .table {
                        min-width: 500px !important;
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
        ':hover': {
            background: '#2980b9',
        },
    },
    addSection: {
        background: '#f8f9fa',
        padding: '2rem',
        borderRadius: '10px',
        marginBottom: '2rem',
    },
    servicesSection: {
        background: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        margin: '0 0 1.5rem 0',
        color: '#2c3e50',
        fontSize: '1.5rem',
    },
    form: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    formGroup: {
        flex: 1,
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#34495e',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    selectInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    addBtn: {
        background: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'background 0.3s ease',
        ':hover': {
            background: '#219653',
        },
        ':disabled': {
            background: '#95a5a6',
            cursor: 'not-allowed',
        },
    },
    tableContainer: {
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
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
    availabilityBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    available: {
        background: '#d4edda',
        color: '#155724',
    },
    notAvailable: {
        background: '#f8d7da',
        color: '#721c24',
    },
    editBtn: {
        background: '#f39c12',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        transition: 'background 0.3s ease',
        ':hover': {
            background: '#e67e22',
        },
    },
    editInput: {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    editSelect: {
        width: '100%',
        padding: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.9rem',
    },
    saveBtn: {
        background: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginRight: '0.5rem',
        transition: 'background 0.3s ease',
        ':hover': {
            background: '#219653',
        },
    },
    cancelBtn: {
        background: '#95a5a6',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '600',
        transition: 'background 0.3s ease',
        ':hover': {
            background: '#7f8c8d',
        },
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
    successMessage: {
        background: '#d4edda',
        color: '#155724',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #c3e6cb',
    },
};

export default UpdateServiceTable;
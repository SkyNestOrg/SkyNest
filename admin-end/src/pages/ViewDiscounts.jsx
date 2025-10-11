import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewDiscounts() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:5000/viewdiscounts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setDiscounts(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch discounts');
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/adminlogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load discounts');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDiscount = async (discountId) => {
        if (!window.confirm('Are you sure you want to delete this discount?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.delete(
                `http://localhost:5000/viewdiscounts/${discountId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert('Discount deleted successfully!');
                // Refresh the list
                fetchDiscounts();
            } else {
                alert(response.data.message || 'Failed to delete discount');
            }
        } catch (error) {
            console.error('Error deleting discount:', error);
            alert(error.response?.data?.message || 'Failed to delete discount');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isDiscountActive = (startDate, endDate) => {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return today >= start && today <= end;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading discounts...</div>
            </div>
        );
    }

    return (
        <div className="view-discounts-container">
            <div className="header">
                <h1>View Discounts</h1>
                <button onClick={fetchDiscounts} className="refresh-btn">
                    Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="stats">
                <div className="stat-card">
                    <h3>Total Discounts</h3>
                    <p>{discounts.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Discounts</h3>
                    <p>{discounts.filter(d => isDiscountActive(d.start_date, d.end_date)).length}</p>
                </div>
            </div>

            {discounts.length === 0 ? (
                <div className="no-discounts">
                    <h3>No discounts found</h3>
                    <p>There are no discounts configured in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="discounts-table">
                        <thead>
                            <tr>
                                <th>Discount ID</th>
                                <th>Discount %</th>
                                <th>Branch</th>
                                <th>Room Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((discount) => (
                                <tr key={discount.discount_id}>
                                    <td>#{discount.discount_id}</td>
                                    <td className="percentage">{discount.percentage}%</td>
                                    <td>
                                        {discount.branch_name ? 
                                            `${discount.branch_name} (${discount.branch_id})` : 
                                            `Branch ${discount.branch_id}`
                                        }
                                    </td>
                                    <td className="room-type">{discount.room_type}</td>
                                    <td className="date">{formatDate(discount.start_date)}</td>
                                    <td className="date">{formatDate(discount.end_date)}</td>
                                    <td>
                                        <span className={`status-badge ${
                                            isDiscountActive(discount.start_date, discount.end_date) ? 
                                            'active' : 'inactive'
                                        }`}>
                                            {isDiscountActive(discount.start_date, discount.end_date) ? 
                                            'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteDiscount(discount.discount_id)}
                                            className="delete-btn"
                                            title="Delete Discount"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .view-discounts-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid rgba(255,255,255,0.3);
                }

                .header h1 {
                    color: white;
                    margin: 0;
                }

                .refresh-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .refresh-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 1rem;
                    border-radius: 6px;
                    margin-bottom: 1rem;
                    border: 1px solid #f5c6cb;
                }

                .stats {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 10px;
                    text-align: center;
                    min-width: 150px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .stat-card h3 {
                    margin: 0 0 0.5rem 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .stat-card p {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: bold;
                    color: #333;
                }

                .no-discounts {
                    text-align: center;
                    padding: 3rem;
                    background: white;
                    border-radius: 10px;
                    color: #6c757d;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .table-container {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }

                .discounts-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .discounts-table th {
                    background: #34495e;
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .discounts-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .discounts-table tr:hover {
                    background: #f8f9fa;
                }

                .percentage {
                    font-weight: bold;
                    color: #27ae60;
                    font-size: 1.1rem;
                }

                .room-type {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .date {
                    color: #7f8c8d;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-badge.active {
                    background: #d4edda;
                    color: #155724;
                }

                .status-badge.inactive {
                    background: #f8d7da;
                    color: #721c24;
                }

                .delete-btn {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: background 0.3s ease;
                }

                .delete-btn:hover {
                    background: #c0392b;
                }

                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .loading {
                    color: white;
                    font-size: 1.2rem;
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .view-discounts-container {
                        padding: 1rem;
                    }
                    
                    .header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    
                    .stats {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .table-container {
                        overflow-x: auto;
                    }
                    
                    .discounts-table {
                        min-width: 800px;
                    }
                }
            `}</style>
        </div>
    );
}

export default ViewDiscounts;
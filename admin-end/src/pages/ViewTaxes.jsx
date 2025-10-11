import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewTaxes() {
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchTaxes();
    }, []);

    const fetchTaxes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:5000/viewtaxes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setTaxes(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch taxes');
            }
        } catch (error) {
            console.error('Error fetching taxes:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/adminlogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load taxes');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTax = async (revisionId) => {
        if (!window.confirm('Are you sure you want to delete this future tax revision?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            console.log('=== FRONTEND DELETE DEBUG ===');
            console.log('Deleting revision ID:', revisionId);
            
            // ✅ Simple - just send the revision_id
            const response = await axios.delete(
                `http://localhost:5000/viewtaxes/${revisionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('Backend response:', response.data);
            
            if (response.data.success) {
                alert('Future tax revision deleted successfully!');
                fetchTaxes();
            } else {
                alert(response.data.message || 'Failed to delete tax entry');
            }
        } catch (error) {
            console.error('Error deleting tax:', error);
            console.log('Error response:', error.response?.data);
            alert(error.response?.data?.message || 'Failed to delete tax entry');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTaxStatus = (revisionDate, index) => {
        const today = new Date();
        const revision = new Date(revisionDate);
        
        if (revision <= today) {
            // Only the most recent past/current date should be "Current"
            const pastTaxes = taxes.filter(tax => new Date(tax.revision_date) <= today);
            const isMostRecentPast = pastTaxes.length > 0 && 
                                   new Date(pastTaxes[0].revision_date).getTime() === revision.getTime();
            
            return isMostRecentPast ? 'Current' : 'Past';
        } else {
            return 'Future Revision';
        }
    };

    const getCurrentTax = () => {
        const today = new Date();
        const currentTax = taxes.find(tax => new Date(tax.revision_date) <= today);
        return currentTax || (taxes.length > 0 ? taxes[0] : null);
    };

    const currentTax = getCurrentTax();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading taxes...</div>
            </div>
        );
    }

    return (
        <div className="view-taxes-container">
            <div className="header">
                <h1>Taxes & Charges Management</h1>
                <button onClick={fetchTaxes} className="refresh-btn">
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
                    <h3>Total Tax Entries</h3>
                    <p>{taxes.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Current Tax Rate</h3>
                    <p>
                        {currentTax ? 
                            `${currentTax.latest_tax_percentage}%` : 
                            'N/A'
                        }
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Current Surcharge</h3>
                    <p>
                        {currentTax ? 
                            `${currentTax.latest_surcharge_percentage}%` : 
                            'N/A'
                        }
                    </p>
                </div>
            </div>

            {taxes.length === 0 ? (
                <div className="no-taxes">
                    <h3>No tax entries found</h3>
                    <p>There are no tax entries configured in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="taxes-table">
                        <thead>
                            <tr>
                                <th>Revision Date</th>
                                <th>Tax Percentage</th>
                                <th>Surcharge Percentage</th>
                                <th>Total Charge</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxes.map((tax, index) => {
                                const status = getTaxStatus(tax.revision_date, index);
                                const canDelete = status === 'Future Revision';
                                
                                return (
                                    <tr key={tax.revision_id}>
                                        <td className="revision-date">{formatDate(tax.revision_date)}</td>
                                        <td className="tax-percentage">{tax.latest_tax_percentage}%</td>
                                        <td className="surcharge-percentage">{tax.latest_surcharge_percentage}%</td>
                                        <td className="total-charge">
                                            {parseFloat(tax.latest_tax_percentage) + parseFloat(tax.latest_surcharge_percentage)}%
                                        </td>
                                        <td>
                                            <span className={`status-badge ${
                                                status === 'Current' ? 'current' : 
                                                status === 'Past' ? 'past' : 'future'
                                            }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            {canDelete ? (
                                                <button
                                                    onClick={() => handleDeleteTax(tax.revision_id)}
                                                    className="delete-btn"
                                                    title="Delete Future Revision"
                                                >
                                                    Delete
                                                </button>
                                            ) : (
                                                <span className="no-action">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CSS remains the same */}
            <style jsx>{`
                .view-taxes-container {
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
                    justify-content: center;
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

                .no-taxes {
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

                .taxes-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .taxes-table th {
                    background: #34495e;
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .taxes-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .taxes-table tr:hover {
                    background: #f8f9fa;
                }

                .revision-date {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .tax-percentage {
                    color: #e74c3c;
                    font-weight: bold;
                    font-size: 1.1rem;
                }

                .surcharge-percentage {
                    color: #e67e22;
                    font-weight: bold;
                    font-size: 1.1rem;
                }

                .total-charge {
                    color: #27ae60;
                    font-weight: bold;
                    font-size: 1.2rem;
                }

                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-badge.current {
                    background: #d4edda;
                    color: #155724;
                }

                .status-badge.past {
                    background: #e2e3e5;
                    color: #383d41;
                }

                .status-badge.future {
                    background: #fff3cd;
                    color: #856404;
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

                .no-action {
                    color: #6c757d;
                    font-style: italic;
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
                    .view-taxes-container {
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
                    
                    .taxes-table {
                        min-width: 700px;
                    }
                }
            `}</style>
        </div>
    );
}

export default ViewTaxes;
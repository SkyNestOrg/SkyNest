import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states
    const [filters, setFilters] = useState({
        date: '',
        startTime: '',
        endTime: '',
        username: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const params = new URLSearchParams(filters);

            const response = await axios.get(`http://localhost:5000/viewlogs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setLogs(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch staff logs');
            }
        } catch (error) {
            console.error('Error fetching staff logs:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/adminlogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to load staff logs');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleApplyFilters = () => {
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            date: '',
            startTime: '',
            endTime: '',
            username: ''
        });
    };

    const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (loading && logs.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading">Loading staff logs...</div>
            </div>
        );
    }

    return (
        <div className="staff-logs-container">
            <div className="header">
                <h1>Staff Activity Logs</h1>
                <button onClick={fetchLogs} className="refresh-btn">
                    Refresh
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Filters Section */}
            <div className="filters-section">
                <h3>Filter Logs</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Start Time</label>
                        <input
                            type="time"
                            value={filters.startTime}
                            onChange={(e) => handleFilterChange('startTime', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>End Time</label>
                        <input
                            type="time"
                            value={filters.endTime}
                            onChange={(e) => handleFilterChange('endTime', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={filters.username}
                            onChange={(e) => handleFilterChange('username', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-actions">
                    <button onClick={handleApplyFilters} className="apply-btn">
                        Apply Filters
                    </button>
                    <button onClick={handleClearFilters} className="clear-btn">
                        Clear Filters
                    </button>
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="no-logs">
                    <h3>No activity logs found</h3>
                    <p>There are no staff activity logs matching your criteria.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Username</th>
                                <th>Timestamp</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.log_id}>
                                    <td className="log-id">{log.log_id}</td>
                                    <td className="username">
                                        <span className="user-badge">{log.username}</span>
                                    </td>
                                    <td className="timestamp">{formatDateTime(log.timestamp)}</td>
                                    <td className="action">{log.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .staff-logs-container {
                    padding: 2rem;
                    max-width: 1400px;
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

                /* Filters Section */
                .filters-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 10px;
                    margin-bottom: 2rem;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }

                .filters-section h3 {
                    margin: 0 0 1rem 0;
                    color: #2c3e50;
                }

                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                }

                .filter-group label {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #34495e;
                }

                .filter-group input {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }

                .filter-actions {
                    display: flex;
                    gap: 1rem;
                }

                .apply-btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .apply-btn:hover {
                    background: #2980b9;
                }

                .clear-btn {
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .clear-btn:hover {
                    background: #7f8c8d;
                }

                .no-logs {
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

                .logs-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .logs-table th {
                    background: #34495e;
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .logs-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .logs-table tr:hover {
                    background: #f8f9fa;
                }

                .log-id {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .username .user-badge {
                    background: #3498db;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .timestamp {
                    color: #7f8c8d;
                    font-family: 'Courier New', monospace;
                }

                .action {
                    color: #27ae60;
                    font-weight: 500;
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
                    .staff-logs-container {
                        padding: 1rem;
                    }
                    
                    .header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    
                    .filters-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .filter-actions {
                        flex-direction: column;
                    }
                    
                    .table-container {
                        overflow-x: auto;
                    }
                    
                    .logs-table {
                        min-width: 600px;
                    }
                }
            `}</style>
        </div>
    );
}

export default ViewLogs;
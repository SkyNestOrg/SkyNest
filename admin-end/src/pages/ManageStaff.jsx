import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageStaff() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        official_role: '',
        branch_id: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get('http://localhost:5000/managestaff', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUsers(response.data.data);
                setError('');
            } else {
                setError(response.data.message || 'Failed to fetch staff users');
            }
        } catch (error) {
            console.error('Error fetching staff users:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError(error.response?.data?.message || 'Failed to load staff users');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post('http://localhost:5000/managestaff', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                alert('Staff user added successfully!');
                setShowAddModal(false);
                setFormData({ username: '', password: '', official_role: '', branch_id: '' });
                fetchUsers();
            } else {
                alert(response.data.message || 'Failed to add staff user');
            }
        } catch (error) {
            console.error('Error adding staff user:', error);
            alert(error.response?.data?.message || 'Failed to add staff user');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.put(
                `http://localhost:5000/managestaff/${currentUser.username}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert('Staff user updated successfully!');
                setShowEditModal(false);
                setFormData({ username: '', password: '', official_role: '', branch_id: '' });
                setCurrentUser(null);
                fetchUsers();
            } else {
                alert(response.data.message || 'Failed to update staff user');
            }
        } catch (error) {
            console.error('Error updating staff user:', error);
            alert(error.response?.data?.message || 'Failed to update staff user');
        }
    };

    const handleDeleteUser = async (username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.delete(`http://localhost:5000/managestaff/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                alert('Staff user deleted successfully!');
                fetchUsers();
            } else {
                alert(response.data.message || 'Failed to delete staff user');
            }
        } catch (error) {
            console.error('Error deleting staff user:', error);
            alert(error.response?.data?.message || 'Failed to delete staff user');
        }
    };

    const openAddModal = () => {
        setFormData({ username: '', password: '', official_role: '', branch_id: '' });
        setShowAddModal(true);
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setFormData({
            username: user.username,
            password: '', // Don't pre-fill password for security
            official_role: user.official_role,
            branch_id: user.branch_id
        });
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Loading staff users...</div>
            </div>
        );
    }

    return (
        <div className="staff-users-container">
            <div className="header">
                <h1>Staff Users Management</h1>
                <div className="header-actions">
                    <button onClick={fetchUsers} className="refresh-btn">
                        Refresh
                    </button>
                    <button onClick={openAddModal} className="add-btn">
                        Add New User
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {users.length === 0 ? (
                <div className="no-users">
                    <h3>No staff users found</h3>
                    <p>There are no staff users configured in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Branch ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.username}>
                                    <td className="username">{user.username}</td>
                                    <td className="role">
                                        <span className={`role-badge ${user.official_role}`}>
                                            {user.official_role.replace('-user', '')}
                                        </span>
                                    </td>
                                    <td className="branch-id">{user.branch_id}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="edit-btn"
                                            title="Edit User"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.username)}
                                            className="delete-btn"
                                            title="Delete User"
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

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add New Staff User</h2>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    name="official_role"
                                    value={formData.official_role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {/* ✅ REMOVED: admin-user option */}
                                    <option value="frontoffice-user">Front Office User</option>
                                    <option value="serviceoffice-user">Service Office User</option>
                                    <option value="management-user">Management User</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Branch ID *</label>
                                <input
                                    type="number"
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && currentUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Edit Staff User: {currentUser.username}</h2>
                        <form onSubmit={handleEditUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={currentUser.username}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    name="official_role"
                                    value={formData.official_role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    {/* ✅ REMOVED: admin-user option */}
                                    <option value="frontoffice-user">Front Office User</option>
                                    <option value="serviceoffice-user">Service Office User</option>
                                    <option value="management-user">Management User</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Branch ID *</label>
                                <input
                                    type="number"
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn">Update</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowEditModal(false)}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSS remains exactly the same as your original */}
            <style jsx>{`
                .staff-users-container {
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

                .header-actions {
                    display: flex;
                    gap: 1rem;
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

                .add-btn {
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .add-btn:hover {
                    background: #219a52;
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 1rem;
                    border-radius: 6px;
                    margin-bottom: 1rem;
                    border: 1px solid #f5c6cb;
                }

                .no-users {
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

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .users-table th {
                    background: #34495e;
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .users-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                }

                .users-table tr:hover {
                    background: #f8f9fa;
                }

                .username {
                    font-weight: 600;
                    color: #2c3e50;
                }

                .role-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: capitalize;
                }

                .role-badge.frontoffice-user {
                    background: #3498db;
                    color: white;
                }
                .role-badge.serviceoffice-user {
                    background: #34db74;
                    color: white;
                }

                .role-badge.management-user {
                    background: #9b59b6;
                    color: white;
                }

                .branch-id {
                    color: #7f8c8d;
                    font-weight: 600;
                }

                .actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .edit-btn {
                    background: #f39c12;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .edit-btn:hover {
                    background: #e67e22;
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
                }

                .delete-btn:hover {
                    background: #c0392b;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal {
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal h2 {
                    margin: 0 0 1.5rem 0;
                    color: #2c3e50;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #34495e;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                    box-sizing: border-box;
                }

                .disabled-input {
                    background: #f8f9fa;
                    color: #6c757d;
                    cursor: not-allowed;
                }

                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }

                .save-btn {
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .save-btn:hover {
                    background: #219a52;
                }

                .cancel-btn {
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .cancel-btn:hover {
                    background: #7f8c8d;
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
                    .staff-users-container {
                        padding: 1rem;
                    }
                    
                    .header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                    
                    .header-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    
                    .table-container {
                        overflow-x: auto;
                    }
                    
                    .users-table {
                        min-width: 600px;
                    }
                    
                    .actions {
                        flex-direction: column;
                    }
                    
                    .modal {
                        margin: 1rem;
                        width: calc(100% - 2rem);
                    }
                }
            `}</style>
        </div>
    );
}

export default ManageStaff;
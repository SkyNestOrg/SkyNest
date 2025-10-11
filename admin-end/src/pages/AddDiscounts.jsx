import React, { useState } from 'react';
import axios from 'axios';

function AddDiscounts() {
    const [formData, setFormData] = useState({
        discount_percentage: '',
        branch_id: '',
        room_type: '',
        start_date: '',
        end_date: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Clear message when user starts typing
        if (message) {
            setMessage('');
            setMessageType('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/adddiscounts', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage('Discount added successfully!');
                setMessageType('success');
                
                // Reset form
                setFormData({
                    discount_percentage: '',
                    branch_id: '',
                    room_type: '',
                    start_date: '',
                    end_date: ''
                });
            }
        } catch (error) {
            setMessage('Error adding discount');
            setMessageType('error');
            console.error('Add discount error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-discount-container">
            <div className="add-discount-form-wrapper">
                <h2>Add Discount</h2>
                
                {/* Global message display */}
                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="add-discount-form">
                    {/* Discount Percentage Field */}
                    <div className="form-group">
                        <label htmlFor="discount_percentage">Discount Percentage</label>
                        <input
                            type="number"
                            id="discount_percentage"
                            name="discount_percentage"
                            value={formData.discount_percentage}
                            onChange={handleChange}
                            placeholder="Enter discount percentage"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Branch ID Field */}
                    <div className="form-group">
                        <label htmlFor="branch_id">Branch ID</label>
                        <input
                            type="number"
                            id="branch_id"
                            name="branch_id"
                            value={formData.branch_id}
                            onChange={handleChange}
                            placeholder="Enter branch ID"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Room Type Field */}
                    <div className="form-group">
                        <label htmlFor="room_type">Room Type</label>
                        <input
                            type="text"
                            id="room_type"
                            name="room_type"
                            value={formData.room_type}
                            onChange={handleChange}
                            placeholder="Enter room type"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Start Date Field */}
                    <div className="form-group">
                        <label htmlFor="start_date">Start Date</label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* End Date Field */}
                    <div className="form-group">
                        <label htmlFor="end_date">End Date</label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Adding Discount...' : 'Add Discount'}
                    </button>
                </form>
            </div>

            {/* Inline CSS for styling - Matching login component */}
            <style jsx>{`
                .add-discount-container {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .add-discount-form-wrapper {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 450px;
                }

                h2 {
                    text-align: center;
                    color: #333;
                    margin-bottom: 30px;
                    font-size: 28px;
                    font-weight: 600;
                }

                .add-discount-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                label {
                    margin-bottom: 8px;
                    color: #555;
                    font-weight: 500;
                    font-size: 14px;
                }

                input {
                    padding: 12px 16px;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    outline: none;
                }

                input:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                input:disabled {
                    background-color: #f8f9fa;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .submit-btn {
                    padding: 14px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    margin-top: 10px;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                }

                .submit-btn:disabled {
                    background: #95a5a6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .message {
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-weight: 500;
                }

                .message.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .message.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                /* Responsive design */
                @media (max-width: 480px) {
                    .add-discount-form-wrapper {
                        padding: 30px 20px;
                    }
                    
                    h2 {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
}

export default AddDiscounts;
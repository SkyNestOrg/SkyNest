import React, { useState } from 'react';
import axios from 'axios';

function AddTaxes() {
    const [formData, setFormData] = useState({
        revision_date: '',
        latest_tax_percentage: '',
        latest_surcharge_percentage: ''
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
            const response = await axios.post('http://localhost:5000/addtaxes', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage('Taxes and charges added successfully!');
                setMessageType('success');
                
                // Reset form
                setFormData({
                    revision_date: '',
                    latest_tax_percentage: '',
                    latest_surcharge_percentage: ''
                });
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error adding taxes and charges');
            setMessageType('error');
            console.error('Add taxes error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-taxes-container">
            <div className="add-taxes-form-wrapper">
                <h2>Add Taxes & Charges</h2>
                
                {/* Global message display */}
                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="add-taxes-form">
                    {/* Revision Date Field */}
                    <div className="form-group">
                        <label htmlFor="revision_date">Revision Date</label>
                        <input
                            type="date"
                            id="revision_date"
                            name="revision_date"
                            value={formData.revision_date}
                            onChange={handleChange}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Tax Percentage Field */}
                    <div className="form-group">
                        <label htmlFor="latest_tax_percentage">Tax Percentage (%)</label>
                        <input
                            type="number"
                            id="latest_tax_percentage"
                            name="latest_tax_percentage"
                            value={formData.latest_tax_percentage}
                            onChange={handleChange}
                            placeholder="Enter tax percentage"
                            min="0"
                            max="100"
                            step="0.01"
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Surcharge Percentage Field */}
                    <div className="form-group">
                        <label htmlFor="latest_surcharge_percentage">Surcharge Percentage (%)</label>
                        <input
                            type="number"
                            id="latest_surcharge_percentage"
                            name="latest_surcharge_percentage"
                            value={formData.latest_surcharge_percentage}
                            onChange={handleChange}
                            placeholder="Enter surcharge percentage"
                            min="0"
                            max="100"
                            step="0.01"
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
                        {loading ? 'Adding Taxes...' : 'Add Taxes & Charges'}
                    </button>
                </form>
            </div>

            {/* Inline CSS for styling - Matching login component */}
            <style jsx>{`
                .add-taxes-container {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .add-taxes-form-wrapper {
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

                .add-taxes-form {
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
                    .add-taxes-form-wrapper {
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

export default AddTaxes;
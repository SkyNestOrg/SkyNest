import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payment() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Form state
    const [searchData, setSearchData] = useState({
        booking_id: ''
    });

    const [paymentData, setPaymentData] = useState({
        payment_method: 'Cash',
        paid_amount: ''
    });

    const [billDetails, setBillDetails] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchBillDetails = async () => {
        if (!searchData.booking_id) {
            setError('Please enter a Booking ID');
            return;
        }

        try {
            setSearchLoading(true);
            setError('');
            setMessage('');
            setBillDetails(null);
            setPaymentHistory([]);

            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/payment/bill/${searchData.booking_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setBillDetails(response.data.data);
                setPaymentHistory(response.data.data.payments || []);
                
                // Auto-fill payment amount with due amount
                setPaymentData(prev => ({
                    ...prev,
                    paid_amount: response.data.data.due_amount
                }));
            } else {
                setError(response.data.message || 'Failed to fetch bill details');
            }

        } catch (error) {
            console.error('Error fetching bill:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else if (error.response?.status === 404) {
                setError('No bill found for this Booking ID');
            } else {
                setError(error.response?.data?.message || 'Failed to fetch bill details');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        
        if (!billDetails) {
            setError('Please search for a bill first');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');

            // Validate payment data
            if (!paymentData.payment_method || !paymentData.paid_amount) {
                setError('Payment method and amount are required');
                return;
            }

            const paidAmount = parseFloat(paymentData.paid_amount);
            if (paidAmount <= 0) {
                setError('Payment amount must be greater than 0');
                return;
            }

            if (paidAmount > billDetails.due_amount) {
                setError(`Payment amount cannot exceed due amount of ${formatCurrency(billDetails.due_amount)}`);
                return;
            }

            const token = localStorage.getItem('token');
            const payload = {
                booking_id: searchData.booking_id,
                ...paymentData,
                paid_amount: paidAmount
            };

            const response = await axios.post('http://localhost:5000/payment/pay', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setMessage(response.data.message);
                
                // Refresh bill details to get updated due_amount
                fetchBillDetails();
                
                // Reset payment form
                setPaymentData({
                    payment_method: 'Cash',
                    paid_amount: ''
                });
            } else {
                setError(response.data.message || 'Failed to process payment');
            }

        } catch (error) {
            console.error('Error processing payment:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/serviceofficelogin';
                }, 2000);
            } else {
                setError(error.response?.data?.message || 'Failed to process payment');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleClearSearch = () => {
        setSearchData({ booking_id: '' });
        setBillDetails(null);
        setPaymentHistory([]);
        setError('');
        setMessage('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Payment Processing - Branch {user?.branch_id}</h1>
            </div>

            {message && (
                <div style={styles.successMessage}>
                    {message}
                </div>
            )}

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* Search Section */}
            <div style={styles.searchSection}>
                <h3 style={styles.sectionTitle}>Find Bill by Booking ID</h3>
                <div style={styles.searchRow}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Booking ID *
                            <input
                                type="text"
                                name="booking_id"
                                value={searchData.booking_id}
                                onChange={handleSearchChange}
                                onKeyPress={(e) => e.key === 'Enter' && fetchBillDetails()}
                                placeholder="Enter Booking ID"
                                style={styles.input}
                            />
                        </label>
                    </div>
                    <button 
                        onClick={fetchBillDetails} 
                        style={styles.searchBtn}
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Searching...' : 'Search Bill'}
                    </button>
                    {billDetails && (
                        <button 
                            onClick={handleClearSearch} 
                            style={styles.clearBtn}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Bill Details Section */}
            {billDetails && (
                <div style={styles.billSection}>
                    <h3 style={styles.sectionTitle}>Bill Details</h3>
                    <div style={styles.billCard}>
                        <div style={styles.billHeader}>
                            <div>
                                <strong>Bill ID:</strong> #{billDetails.bill_id}
                            </div>
                            <div>
                                <strong>Booking ID:</strong> #{billDetails.booking_id}
                            </div>
                            <div>
                                <strong>Guest:</strong> {billDetails.first_name} {billDetails.last_name}
                            </div>
                        </div>
                        
                        <div style={styles.billAmounts}>
                            <div style={styles.amountRow}>
                                <span>Room Total:</span>
                                <span>{formatCurrency(billDetails.room_total)}</span>
                            </div>
                            <div style={styles.amountRow}>
                                <span>Service Total:</span>
                                <span>{formatCurrency(billDetails.service_total)}</span>
                            </div>
                            <div style={styles.amountRow}>
                                <span>Sub Total:</span>
                                <span>{formatCurrency(billDetails.sub_total)}</span>
                            </div>
                            <div style={styles.amountRow}>
                                <span>Tax Amount:</span>
                                <span>{formatCurrency(billDetails.tax_amount)}</span>
                            </div>
                            <div style={{...styles.amountRow, ...styles.grandTotal}}>
                                <span><strong>Grand Total:</strong></span>
                                <span><strong>{formatCurrency(billDetails.grand_total)}</strong></span>
                            </div>
                            <div style={{...styles.amountRow, ...styles.dueAmount}}>
                                <span><strong>Due Amount:</strong></span>
                                <span><strong>{formatCurrency(billDetails.due_amount)}</strong></span>
                            </div>
                            <div style={styles.amountRow}>
                                <span>Status:</span>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: 
                                        billDetails.bill_status === 'Paid' ? '#27ae60' :
                                        billDetails.bill_status === 'Pending' ? '#f39c12' :
                                        '#e74c3c'
                                }}>
                                    {billDetails.bill_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    {billDetails.bill_status !== 'Paid' && (
                        <div style={styles.paymentFormSection}>
                            <h4 style={styles.subSectionTitle}>Process Payment</h4>
                            <form onSubmit={handlePaymentSubmit} style={styles.paymentForm}>
                                <div style={styles.paymentRow}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>
                                            Payment Method *
                                            <select
                                                name="payment_method"
                                                value={paymentData.payment_method}
                                                onChange={handlePaymentChange}
                                                style={styles.input}
                                                required
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Credit Card">Credit Card</option>
                                                <option value="Debit Card">Debit Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Digital Wallet">Digital Wallet</option>
                                            </select>
                                        </label>
                                    </div>
                                    
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>
                                            Amount to Pay *
                                            <input
                                                type="number"
                                                name="paid_amount"
                                                value={paymentData.paid_amount}
                                                onChange={handlePaymentChange}
                                                style={styles.input}
                                                min="0.01"
                                                max={billDetails.due_amount}
                                                step="0.01"
                                                required
                                            />
                                        </label>
                                    </div>
                                </div>
                                
                                <div style={styles.paymentButtonGroup}>
                                    <button 
                                        type="submit" 
                                        style={styles.payBtn}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : `Pay ${formatCurrency(paymentData.paid_amount || 0)}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Payment History */}
                    {paymentHistory.length > 0 && (
                        <div style={styles.historySection}>
                            <h4 style={styles.subSectionTitle}>Payment History</h4>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Reference #</th>
                                            <th style={styles.th}>Method</th>
                                            <th style={styles.th}>Amount</th>
                                            <th style={styles.th}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map((payment, index) => (
                                            <tr key={index} style={styles.tr}>
                                                <td style={styles.td}>#{payment.payment_reference}</td>
                                                <td style={styles.td}>{payment.payment_method}</td>
                                                <td style={styles.td}>{formatCurrency(payment.paid_amount)}</td>
                                                <td style={styles.td}>{formatDate(payment.payment_date)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e0e0e0',
    },
    searchSection: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    sectionTitle: {
        color: '#2c3e50',
        marginBottom: '1rem',
        fontSize: '1.2rem',
        fontWeight: '600',
    },
    subSectionTitle: {
        color: '#34495e',
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600',
    },
    searchRow: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#2c3e50',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    searchBtn: {
        background: '#3498db',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        height: 'fit-content',
    },
    clearBtn: {
        background: '#95a5a6',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        height: 'fit-content',
    },
    billSection: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    billCard: {
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    },
    billHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e0e0e0',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    billAmounts: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    amountRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    grandTotal: {
        paddingTop: '0.75rem',
        borderTop: '2px solid #bdc3c7',
        fontSize: '1.1rem',
    },
    dueAmount: {
        color: '#e74c3c',
        fontSize: '1.1rem',
    },
    statusBadge: {
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600',
    },
    paymentFormSection: {
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        background: '#f8f9fa',
    },
    paymentForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    paymentRow: {
        display: 'flex',
        gap: '1rem',
    },
    paymentButtonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1rem',
    },
    payBtn: {
        background: '#27ae60',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
    },
    historySection: {
        marginTop: '2rem',
    },
    tableContainer: {
        background: 'white',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        background: '#34495e',
        color: 'white',
        padding: '0.75rem',
        textAlign: 'left',
        fontWeight: '600',
    },
    td: {
        padding: '0.75rem',
        borderBottom: '1px solid #e0e0e0',
    },
    tr: {
        ':hover': {
            background: '#f8f9fa',
        },
    },
    successMessage: {
        background: '#d4edda',
        color: '#155724',
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: '1px solid #c3e6cb',
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

// Add hover effects
Object.assign(styles.searchBtn, {
    ':hover': {
        background: '#2980b9',
    },
    ':disabled': {
        background: '#95a5a6',
        cursor: 'not-allowed',
    },
});

Object.assign(styles.clearBtn, {
    ':hover': {
        background: '#7f8c8d',
    },
});

Object.assign(styles.payBtn, {
    ':hover': {
        background: '#219653',
    },
    ':disabled': {
        background: '#95a5a6',
        cursor: 'not-allowed',
    },
});

export default Payment;
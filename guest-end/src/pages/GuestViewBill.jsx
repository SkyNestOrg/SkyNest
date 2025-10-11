import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ViewBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/bill', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });

      if (response.data.success) {
        setBills(response.data.data);
      } else {
        setError('Failed to fetch bills');
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(err.response?.data?.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const getStatusBadgeStyle = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid & CheckedOut':
        return { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
      case 'pending':
        return { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
     
    }
  };

  if (loading) {
    return (
      <div className="bills-container">
        <div className="bills-form-wrapper">
          <h2>My Bills</h2>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
        <style jsx>{`
          .bills-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .bills-form-wrapper {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 1000px;
            text-align: center;
          }
          h2 {
            text-align: center;
            color: #333;
            margin-bottom: 25px;
            font-size: 26px;
            font-weight: 600;
          }
          .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100px;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bills-container">
        <div className="bills-form-wrapper">
          <h2>My Bills</h2>
          <div className="message error">{error}</div>
        </div>
        <style jsx>{`
          .bills-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .bills-form-wrapper {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 1000px;
          }
          h2 {
            text-align: center;
            color: #333;
            margin-bottom: 25px;
            font-size: 26px;
            font-weight: 600;
          }
          .message {
            padding: 12px 16px;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
          }
          .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bills-container">
      <div className="bills-form-wrapper">
        <h2>My Bills</h2>
        
        {bills.length === 0 ? (
          <div className="message">
            <p>No bills found.</p>
          </div>
        ) : (
          <div className="bills-grid">
            {bills.map(bill => (
              <div key={bill.bill_id} className="bill-card">
                <div className="card-header">
                  <h3 className="card-title">Bill #{bill.bill_id}</h3>
                  <span 
                    className="bill-status"
                    style={getStatusBadgeStyle(bill.bill_status)}
                  >
                    {bill.bill_status || 'Unknown'}
                  </span>
                </div>
                
                <div className="card-body">
                  <div className="detail">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">{bill.booking_id}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Bill Date:</span>
                    <span className="detail-value">{formatDate(bill.bill_date)}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Room Total:</span>
                    <span className="detail-value">{formatCurrency(bill.room_total)}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Service Total:</span>
                    <span className="detail-value">{formatCurrency(bill.service_total)}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Subtotal:</span>
                    <span className="detail-value">{formatCurrency(bill.sub_total)}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Tax Amount:</span>
                    <span className="detail-value">{formatCurrency(bill.tax_amount)}</span>
                  </div>
                  
                  <div className="detail total-amount">
                    <span className="detail-label">Grand Total:</span>
                    <span className="detail-value">{formatCurrency(bill.grand_total)}</span>
                  </div>
                  
                  <div className="detail">
                    <span className="detail-label">Due Amount:</span>
                    <span className="detail-value">{formatCurrency(bill.due_amount)}</span>
                  </div>

                  <Link to={`/bills/${bill.bill_id}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .bills-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .bills-form-wrapper {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 26px;
          font-weight: 600;
        }
        .message {
          text-align: center;
          padding: 30px;
          color: #666;
          font-size: 16px;
        }
        .bills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 25px;
        }
        .bill-card {
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #e1e5e9;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bill-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.2);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: white;
          border-bottom: 2px solid #e1e5e9;
        }
        .card-title {
          margin: 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }
        .bill-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .card-body {
          padding: 20px;
        }
        .detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          padding: 4px 0;
        }
        .total-amount {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #e1e5e9;
          font-weight: 600;
          font-size: 15px;
          color: #2c3e50;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
          min-width: 120px;
        }
        .detail-value {
          color: #333;
          text-align: right;
          flex: 1;
        }
        .view-details-btn {
          display: block;
          text-align: center;
          padding: 10px 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .view-details-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(102,126,234,0.3);
        }

        @media (max-width: 768px) {
          .bills-container {
            padding: 20px 15px;
          }
          .bills-form-wrapper {
            padding: 25px 20px;
          }
          .bills-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .card-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          .detail {
            flex-direction: column;
            gap: 4px;
          }
          .detail-label {
            min-width: auto;
          }
          .detail-value {
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .bills-container {
            padding: 15px 10px;
          }
          .bills-form-wrapper {
            padding: 20px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewBills;
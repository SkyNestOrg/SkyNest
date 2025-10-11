import React, { useState, useEffect } from "react";
import axios from "axios";

const Report2 = () => {
  const [reportData, setReportData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    fetchBranches();
    fetchReport();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report2/branches");
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch_id', selectedBranch);

      const response = await axios.get(`http://localhost:5000/report2/billing-summary?${params}`);
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        alert(response.data.message || "Error fetching billing summary");
      }
    } catch (error) {
      console.error("Error fetching billing summary:", error);
      alert(error.response?.data?.message || "Error fetching billing summary");
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const clearFilters = () => {
    setSelectedBranch("");
    setTimeout(() => fetchReport(), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return "#27ae60";
    if (progress >= 70) return "#f39c12";
    return "#e74c3c";
  };

  return (
    <div className="report2-container">
      <div className="report2-wrapper">
        <h2>Billing Summary Report</h2>
        <p className="report-subtitle">Financial overview for currently checked-in guests</p>

        {/* Filters */}
        <div className="filter-section">
          <h3>Report Filters</h3>
          <form onSubmit={handleSubmit} className="filters-form">
            <div className="filter-row">
              <div className="filter-group">
                <label>Branch (Optional)</label>
                <select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                >
                  <option value="">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                className="calculate-btn"
                disabled={loading}
              >
                {loading ? "Generating Report..." : "Generate Report"}
              </button>
              <button 
                type="button" 
                className="clear-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Report Display */}
        {reportData && (
          <div className="results-section">
            {/* Scope Info */}
            <div className="scope-info">
              <h3>{reportData.scope}</h3>
            </div>

            {/* Overall Statistics */}
            <div className="stats-section">
              <h4>Financial Summary</h4>
              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-value">
                    {formatCurrency(reportData.summary.totalGrandTotal)}
                  </div>
                  <div className="stat-label">Total Billed Amount</div>
                </div>
                <div className="stat-card paid">
                  <div className="stat-value">
                    {formatCurrency(reportData.summary.totalPaid)}
                  </div>
                  <div className="stat-label">Amount Paid</div>
                </div>
                <div className="stat-card due">
                  <div className="stat-value">
                    {formatCurrency(reportData.summary.totalDue)}
                  </div>
                  <div className="stat-label">Amount Due</div>
                </div>
                <div className="stat-card progress">
                  <div 
                    className="stat-value"
                    style={{ color: getProgressColor(reportData.summary.paymentProgress) }}
                  >
                    {reportData.summary.paymentProgress}%
                  </div>
                  <div className="stat-label">Payment Completion</div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="stats-section">
              <h4>Tax Summary</h4>
              <div className="stats-grid tax-grid">
                <div className="stat-card tax-billed">
                  <div className="stat-value">
                    {formatCurrency(reportData.summary.totalTax)}
                  </div>
                  <div className="stat-label">Total Tax Billed</div>
                </div>
                <div className="stat-card tax-percentage">
                  <div className="stat-value">
                    {reportData.summary.totalGrandTotal > 0 
                      ? ((reportData.summary.totalTax / reportData.summary.totalGrandTotal) * 100).toFixed(2) 
                      : '0.00'}%
                  </div>
                  <div className="stat-label">Tax Percentage</div>
                </div>
              </div>
            </div>

            {/* Branch-wise Breakdown */}
            {!selectedBranch && reportData.byBranch && reportData.byBranch.length > 0 && (
              <div className="branch-section">
                <h4>Branch-wise Breakdown</h4>
                <div className="branch-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Branch Name</th>
                        <th>Total Billed Value</th>
                        <th>Paid</th>
                        <th>Due</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byBranch.map(branch => (
                        <tr key={branch.branchId}>
                          <td className="branch-name">{branch.branchName}</td>
                          <td className="amount">{formatCurrency(branch.totalGrandTotal)}</td>
                          <td className="amount paid-amount">{formatCurrency(branch.totalPaid)}</td>
                          <td className="amount due-amount">{formatCurrency(branch.totalDue)}</td>
                          <td>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ 
                                  width: `${Math.min(branch.paymentProgress, 100)}%`,
                                  backgroundColor: getProgressColor(branch.paymentProgress)
                                }}
                              ></div>
                              <span className="progress-text">
                                {branch.paymentProgress}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="notes-section">
              <p><strong>Note:</strong> This report shows real-time billing information for all currently checked-in guests. 
              Collection rate indicates the percentage of total billing amount that has been paid by guests.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .report2-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .report2-wrapper {
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
          margin-bottom: 8px;
          font-size: 26px;
          font-weight: 600;
        }
        .report-subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
          font-size: 16px;
          font-style: italic;
        }
        .filter-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .filter-section h3 {
          color: #333;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: 600;
        }
        .filter-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        .filter-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        select {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.3s ease;
          outline: none;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        select:focus {
          border-color: #667eea;
        }
        .button-group {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        .calculate-btn, .clear-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .calculate-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .calculate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }
        .calculate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .clear-btn {
          background: #f1f1f1;
          color: #333;
        }
        .clear-btn:hover {
          background: #ddd;
        }
        .results-section {
          margin-top: 30px;
        }
        .scope-info h3 {
          color: #333;
          margin-bottom: 25px;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
        }
        .stats-section {
          margin-bottom: 40px;
        }
        .stats-section h4 {
          color: #333;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: 600;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .tax-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          max-width: 500px;
          margin: 0 auto;
        }
        .stat-card {
          padding: 25px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #e1e5e9;
          background: white;
        }
        .tax-grid .stat-card {
          padding: 20px;
        }
        .stat-card.total {
          border-color: #3498db;
        }
        .stat-card.paid {
          border-color: #27ae60;
        }
        .stat-card.due {
          border-color: #e74c3c;
        }
        .stat-card.progress {
          border-color: #f39c12;
        }
        .stat-card.tax-billed {
          border-color: #9b59b6;
        }
        .stat-card.tax-percentage {
          border-color: #1abc9c;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .tax-grid .stat-value {
          font-size: 22px;
        }
        .total .stat-value { color: #3498db; }
        .paid .stat-value { color: #27ae60; }
        .due .stat-value { color: #e74c3c; }
        .tax-billed .stat-value { color: #9b59b6; }
        .tax-percentage .stat-value { color: #1abc9c; }
        .stat-label {
          color: #666;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .branch-section {
          margin-bottom: 30px;
        }
        .branch-section h4 {
          color: #333;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: 600;
        }
        .branch-table-container {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .data-table th {
          background: #667eea;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 15px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .data-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e1e5e9;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .branch-name {
          font-weight: 600;
          color: #333;
        }
        .amount {
          text-align: right;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: #2c3e50;
        }
        .paid-amount {
          color: #27ae60;
        }
        .due-amount {
          color: #e74c3c;
        }
        .progress-bar {
          position: relative;
          background: #e1e5e9;
          border-radius: 20px;
          height: 25px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 20px;
          transition: width 0.3s ease;
        }
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 600;
          font-size: 11px;
          color: #2c3e50;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .notes-section {
          margin-top: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        .notes-section p {
          margin: 0;
          color: #666;
          font-size: 14px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        @media (max-width: 768px) {
          .report2-wrapper {
            padding: 20px;
          }
          .filter-row {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .tax-grid {
            grid-template-columns: 1fr;
            max-width: 100%;
          }
          .button-group {
            flex-direction: column;
          }
          .data-table th, .data-table td {
            padding: 12px 10px;
            font-size: 14px;
          }
          .amount {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Report2;
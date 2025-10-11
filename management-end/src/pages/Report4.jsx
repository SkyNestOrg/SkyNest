import React, { useState, useEffect } from "react";
import axios from "axios";

const Report4 = () => {
  const [reportData, setReportData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    branch_id: "",
    month: "",
    year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchBranches();
    fetchMonths();
    generateYears();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report4/branches");
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchMonths = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report4/months");
      if (response.data.success) {
        setMonths(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching months:", error);
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const yearsList = [];
    for (let year = currentYear; year >= 2020; year--) {
      yearsList.push(year.toString());
    }
    setYears(yearsList);
  };

  const fetchReport = async () => {
    if (!filters.branch_id || !filters.month || !filters.year) {
      alert("Please select branch, month, and year");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('branch_id', filters.branch_id);
      params.append('month', filters.month);
      params.append('year', filters.year);

      const response = await axios.get(`http://localhost:5000/report4/revenue-report?${params}`);
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        alert(response.data.message || "Error fetching revenue report");
      }
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      alert(error.response?.data?.message || "Error fetching revenue report");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const clearFilters = () => {
    setFilters({
      branch_id: "",
      month: "",
      year: new Date().getFullYear().toString()
    });
    setReportData(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  return (
    <div className="report4-container">
      <div className="report4-wrapper">
        <h2>Revenue Report</h2>
        <p className="report-subtitle">Monthly revenue breakdown by branch</p>

        {/* Filters */}
        <div className="filter-section">
          <h3>Report Filters</h3>
          <form onSubmit={handleSubmit} className="filters-form">
            <div className="filter-row">
              <div className="filter-group">
                <label>Branch *</label>
                <select
                  name="branch_id"
                  value={filters.branch_id}
                  onChange={handleFilterChange}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Month *</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  required
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Year *</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  required
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
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
            {/* Header Info */}
            <div className="scope-info">
              <h3>{reportData.branch.name} - {reportData.period.display}</h3>
              <p className="date-range">Revenue breakdown for the selected period</p>
            </div>

            {/* Revenue Summary */}
            <div className="stats-section">
              <h4>Revenue Summary</h4>
              <div className="stats-grid">
                <div className="stat-card room-revenue">
                  <div className="stat-value">
                    {formatCurrency(reportData.revenue.roomTotal)}
                  </div>
                  <div className="stat-label">Room Revenue</div>
                </div>
                <div className="stat-card service-revenue">
                  <div className="stat-value">
                    {formatCurrency(reportData.revenue.serviceTotal)}
                  </div>
                  <div className="stat-label">Service Revenue</div>
                </div>
                <div className="stat-card sub-total">
                  <div className="stat-value">
                    {formatCurrency(reportData.revenue.subTotal)}
                  </div>
                  <div className="stat-label">Sub Total</div>
                </div>
                <div className="stat-card grand-total">
                  <div className="stat-value">
                    {formatCurrency(reportData.revenue.grandTotal)}
                  </div>
                  <div className="stat-label">Grand Total</div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="stats-section">
              <h4>Tax Information</h4>
              <div className="stats-grid tax-grid">
                <div className="stat-card tax-amount">
                  <div className="stat-value">
                    {formatCurrency(reportData.revenue.taxAmount)}
                  </div>
                  <div className="stat-label">Tax Amount</div>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="stats-section">
              <h4>Revenue Breakdown</h4>
              <div className="breakdown-container">
                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">Room Revenue</span>
                    <span className="breakdown-percentage">
                      {formatNumber(reportData.breakdown.roomPercentage)}%
                    </span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill room-fill"
                      style={{ width: `${reportData.breakdown.roomPercentage}%` }}
                    ></div>
                  </div>
                  <div className="breakdown-amount">
                    {formatCurrency(reportData.revenue.roomTotal)}
                  </div>
                </div>
                
                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">Service Revenue</span>
                    <span className="breakdown-percentage">
                      {formatNumber(reportData.breakdown.servicePercentage)}%
                    </span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill service-fill"
                      style={{ width: `${reportData.breakdown.servicePercentage}%` }}
                    ></div>
                  </div>
                  <div className="breakdown-amount">
                    {formatCurrency(reportData.revenue.serviceTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="notes-section">
              <p><strong>Note:</strong> This report shows revenue generated from room bookings and additional services for the selected branch and period.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .report4-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .report4-wrapper {
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
          grid-template-columns: 1fr 1fr 1fr;
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
          margin-bottom: 8px;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
        }
        .date-range {
          text-align: center;
          color: #666;
          margin-bottom: 25px;
          font-style: italic;
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
          max-width: 300px;
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
        .stat-card.room-revenue {
          border-color: #3498db;
        }
        .stat-card.service-revenue {
          border-color: #e74c3c;
        }
        .stat-card.sub-total {
          border-color: #27ae60;
        }
        .stat-card.grand-total {
          border-color: #9b59b6;
        }
        .stat-card.tax-amount {
          border-color: #f39c12;
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
        .room-revenue .stat-value { color: #3498db; }
        .service-revenue .stat-value { color: #e74c3c; }
        .sub-total .stat-value { color: #27ae60; }
        .grand-total .stat-value { color: #9b59b6; }
        .tax-amount .stat-value { color: #f39c12; }
        .stat-label {
          color: #666;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .breakdown-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
          margin: 0 auto;
        }
        .breakdown-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .breakdown-label {
          font-weight: 600;
          color: #333;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .breakdown-percentage {
          font-weight: bold;
          color: #667eea;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .breakdown-bar {
          width: 100%;
          height: 12px;
          background: #e1e5e9;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .breakdown-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
        }
        .room-fill {
          background: #3498db;
        }
        .service-fill {
          background: #e74c3c;
        }
        .breakdown-amount {
          font-weight: 600;
          color: #666;
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
          .report4-wrapper {
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
          .breakdown-container {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Report4;
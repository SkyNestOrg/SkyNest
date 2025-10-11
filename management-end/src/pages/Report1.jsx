import React, { useState, useEffect } from "react";
import axios from "axios";

const Report1 = () => {
  const [reportData, setReportData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    branch_id: ""
  });

  useEffect(() => {
    fetchBranches();
    fetchReport(); // Load initial report
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report1/branches");
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
      
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.branch_id) params.append('branch_id', filters.branch_id);

      const response = await axios.get(`http://localhost:5000/report1/occupancy-report?${params}`);
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        alert(response.data.message || "Error fetching report");
      }
    } catch (error) {
      console.error("Error fetching occupancy report:", error);
      alert(error.response?.data?.message || "Error fetching report");
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
      start_date: "",
      end_date: "",
      branch_id: ""
    });
    // Reload report without filters after a short delay
    setTimeout(() => fetchReport(), 100);
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 80) return "#dc3545"; // High - Red
    if (rate >= 60) return "#ffc107"; // Medium - Yellow
    return "#28a745"; // Low - Green
  };

  return (
    <div className="report1-container">
      <div className="report1-wrapper">
        <h2>Room Occupancy Report</h2>
        <p className="report-subtitle">Track room utilization across all branches</p>

        {/* Filters */}
        <div className="filter-section">
          <h3>Report Filters</h3>
          <form onSubmit={handleSubmit} className="filters-form">
            <div className="filter-row">
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  min={filters.start_date}
                />
              </div>
              
              <div className="filter-group">
                <label>Branch (Optional)</label>
                <select
                  name="branch_id"
                  value={filters.branch_id}
                  onChange={handleFilterChange}
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
              <h3>
                {reportData.branchFilter ? `${reportData.branchFilter} - ` : ""}
                {reportData.period}
              </h3>
            </div>

            {/* Overall Statistics */}
            <div className="stats-section">
              <h4>Overall Summary</h4>
              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-value">{reportData.overall.totalRooms}</div>
                  <div className="stat-label">Total Rooms</div>
                </div>
                <div className="stat-card occupied">
                  <div className="stat-value">{reportData.overall.occupiedRooms}</div>
                  <div className="stat-label">Occupied Rooms</div>
                </div>
                <div className="stat-card available">
                  <div className="stat-value">{reportData.overall.availableRooms}</div>
                  <div className="stat-label">Available Rooms</div>
                </div>
                <div 
                  className="stat-card occupancy-rate"
                  style={{ borderColor: getOccupancyColor(reportData.overall.occupancyRate) }}
                >
                  <div 
                    className="stat-value"
                    style={{ color: getOccupancyColor(reportData.overall.occupancyRate) }}
                  >
                    {reportData.overall.occupancyRate}%
                  </div>
                  <div className="stat-label">Occupancy Rate</div>
                </div>
              </div>
            </div>

            {/* Branch-wise Breakdown */}
            {reportData.byBranch && reportData.byBranch.length > 0 && (
              <div className="branch-section">
                <h4>Branch-wise Breakdown</h4>
                <div className="branch-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Branch Name</th>
                        <th>Total Rooms</th>
                        <th>Occupied</th>
                        <th>Available</th>
                        <th>Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byBranch.map(branch => (
                        <tr key={branch.branchId}>
                          <td className="branch-name">{branch.branchName}</td>
                          <td className="amount">{branch.totalRooms}</td>
                          <td className="amount occupied-amount">{branch.occupiedRooms}</td>
                          <td className="amount available-amount">{branch.availableRooms}</td>
                          <td>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ 
                                  width: `${Math.min(branch.occupancyRate, 100)}%`,
                                  backgroundColor: getOccupancyColor(branch.occupancyRate)
                                }}
                              ></div>
                              <span className="progress-text">
                                {branch.occupancyRate}%
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
              <p><strong>Note:</strong> Reports show rooms that are occupied during the selected period. 
              Current snapshot shows real-time room status.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .report1-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .report1-wrapper {
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
        select, input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.3s ease;
          outline: none;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        select:focus, input:focus {
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
        .stat-card {
          padding: 25px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #e1e5e9;
          background: white;
        }
        .stat-card.total {
          border-color: #3498db;
        }
        .stat-card.occupied {
          border-color: #e74c3c;
        }
        .stat-card.available {
          border-color: #27ae60;
        }
        .stat-card.occupancy-rate {
          border-width: 3px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .total .stat-value { color: #3498db; }
        .occupied .stat-value { color: #e74c3c; }
        .available .stat-value { color: #27ae60; }
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
        .occupied-amount {
          color: #e74c3c;
        }
        .available-amount {
          color: #27ae60;
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
          .report1-wrapper {
            padding: 20px;
          }
          .filter-row {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
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

export default Report1;
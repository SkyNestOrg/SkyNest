import React, { useState, useEffect } from "react";
import axios from "axios";

const Report5 = () => {
  const [reportData, setReportData] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report5/service-types");
      if (response.data.success) {
        setServiceTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching service types:", error);
    }
  };

  const fetchReport = async () => {
    if (!filters.start_date || !filters.end_date) {
      alert("Please select both start date and end date");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('start_date', filters.start_date);
      params.append('end_date', filters.end_date);

      const response = await axios.get(`http://localhost:5000/report5/service-usage?${params}`);
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        alert(response.data.message || "Error fetching service usage report");
      }
    } catch (error) {
      console.error("Error fetching service usage report:", error);
      alert(error.response?.data?.message || "Error fetching service usage report");
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
      end_date: ""
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
    return new Intl.NumberFormat('en-LK').format(number);
  };

  const getUsageColor = (index) => {
    const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];
    return colors[index % colors.length];
  };

  return (
    <div className="report4-container">
      <div className="report4-wrapper">
        <h2>Service Usage Report</h2>
        <div className="report-subtitle">
          Analyze service usage patterns and revenue by date range
        </div>

        {/* Filters */}
        <div className="filter-section">
          <h3>Report Filters</h3>
          <form onSubmit={handleSubmit}>
            <div className="filter-row">
              <div className="filter-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  required
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                  }}
                />
              </div>
              
              <div className="filter-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  min={filters.start_date}
                  required
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    outline: 'none',
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                  }}
                />
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
            {/* Period Info */}
            <div className="scope-info">
              <h3>Service Usage Analysis</h3>
              <div className="date-range">{reportData.period.display}</div>
            </div>

            {/* Summary Statistics */}
            <div className="stats-section">
              <h4>Summary Overview</h4>
              <div className="stats-grid">
                <div className="stat-card room-revenue">
                  <div className="stat-value">
                    {formatNumber(reportData.summary.totalServices)}
                  </div>
                  <div className="stat-label">Services Used</div>
                </div>
                <div className="stat-card service-revenue">
                  <div className="stat-value">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card sub-total">
                  <div className="stat-value">
                    {reportData.summary.mostUsedService}
                  </div>
                  <div className="stat-label">Most Used Service</div>
                </div>
                <div className="stat-card grand-total">
                  <div className="stat-value">
                    {reportData.summary.highestRevenueService}
                  </div>
                  <div className="stat-label">Highest Revenue Service</div>
                </div>
              </div>
            </div>

            {/* Service Usage List */}
            <div className="stats-section">
              <h4>Service Usage Ranking</h4>
              <p style={{ color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
                Services sorted by usage count (descending order)
              </p>
              
              {reportData.services.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    background: 'white',
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                  }}>
                    <thead>
                      <tr>
                        <th style={{ 
                          background: '#34495e', 
                          color: 'white', 
                          padding: '15px', 
                          textAlign: 'left', 
                          fontWeight: '600' 
                        }}>Rank</th>
                        <th style={{ 
                          background: '#34495e', 
                          color: 'white', 
                          padding: '15px', 
                          textAlign: 'left', 
                          fontWeight: '600' 
                        }}>Service Type</th>
                        <th style={{ 
                          background: '#34495e', 
                          color: 'white', 
                          padding: '15px', 
                          textAlign: 'left', 
                          fontWeight: '600' 
                        }}>Usage Count</th>
                        <th style={{ 
                          background: '#34495e', 
                          color: 'white', 
                          padding: '15px', 
                          textAlign: 'left', 
                          fontWeight: '600' 
                        }}>Total Revenue</th>
                        <th style={{ 
                          background: '#34495e', 
                          color: 'white', 
                          padding: '15px', 
                          textAlign: 'left', 
                          fontWeight: '600' 
                        }}>Usage Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.services.map((service, index) => {
                        const totalUsage = reportData.services.reduce((sum, s) => sum + s.usageCount, 0);
                        const usagePercentage = totalUsage > 0 ? ((service.usageCount / totalUsage) * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={service.serviceType} style={{ borderBottom: '1px solid #ecf0f1' }}>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <div 
                                style={{ 
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  background: getUsageColor(index),
                                  color: 'white',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  minWidth: '40px',
                                  textAlign: 'center'
                                }}
                              >
                                #{index + 1}
                              </div>
                            </td>
                            <td style={{ padding: '15px', fontWeight: '600', color: '#2c3e50' }}>
                              {service.serviceType}
                            </td>
                            <td style={{ 
                              padding: '15px', 
                              fontWeight: '600',
                              fontFeatureSettings: '"tnum"',
                              fontVariantNumeric: 'tabular-nums',
                              color: '#3498db'
                            }}>
                              {formatNumber(service.usageCount)}
                            </td>
                            <td style={{ 
                              padding: '15px', 
                              fontWeight: '600',
                              fontFeatureSettings: '"tnum"',
                              fontVariantNumeric: 'tabular-nums',
                              color: '#27ae60'
                            }}>
                              {formatCurrency(service.totalRevenue)}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                  flex: 1,
                                  height: '10px',
                                  background: '#ecf0f1',
                                  borderRadius: '5px',
                                  overflow: 'hidden'
                                }}>
                                  <div 
                                    style={{ 
                                      height: '100%',
                                      borderRadius: '5px',
                                      width: `${usagePercentage}%`,
                                      background: getUsageColor(index),
                                      transition: 'width 0.3s ease'
                                    }}
                                  ></div>
                                </div>
                                <span style={{ 
                                  fontSize: '12px', 
                                  fontWeight: '600', 
                                  color: '#7f8c8d',
                                  minWidth: '40px',
                                  textAlign: 'right'
                                }}>
                                  {usagePercentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px', 
                  border: '2px dashed #e1e5e9' 
                }}>
                  <p style={{ margin: '10px 0', color: '#7f8c8d' }}>
                    No service usage data found for the selected period.
                  </p>
                  <p style={{ margin: '10px 0', color: '#7f8c8d' }}>
                    Available service types: {serviceTypes.map(st => st.service_type).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Revenue Breakdown */}
            {reportData.services.length > 0 && (
              <div className="stats-section">
                <h4>Revenue Distribution</h4>
                <div className="breakdown-container">
                  {reportData.services.slice(0, 5).map((service, index) => {
                    const revenuePercentage = reportData.summary.totalRevenue > 0 
                      ? ((service.totalRevenue / reportData.summary.totalRevenue) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <div key={service.serviceType} className="breakdown-item">
                        <div className="breakdown-header">
                          <span className="breakdown-label">
                            {service.serviceType}
                          </span>
                          <span className="breakdown-percentage">
                            {revenuePercentage}%
                          </span>
                        </div>
                        <div className="breakdown-bar">
                          <div 
                            className="breakdown-fill"
                            style={{ 
                              width: `${revenuePercentage}%`,
                              backgroundColor: getUsageColor(index)
                            }}
                          ></div>
                        </div>
                        <div className="breakdown-amount">
                          {formatCurrency(service.totalRevenue)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="notes-section">
              <p><strong>Note:</strong> This report shows completed service requests within the selected date range. 
              Services are ranked by usage count to help identify the most popular services.</p>
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
          max-width: 1200px;
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
          grid-template-columns: 1fr 1fr;
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

export default Report5;
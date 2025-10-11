import React, { useState, useEffect } from "react";
import axios from "axios";

const Report3 = () => {
  const [selectedRoom, setSelectedRoom] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRooms();
    fetchServices();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report3/get-all-rooms");
      if (response.data.success) {
        setRooms(response.data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setMessage("Error loading rooms");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report3/get-all-services");
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setMessage("Error loading services");
    }
  };

  const calculateServiceCharges = async () => {
    if (!selectedRoom || !startDate || !endDate) {
      setMessage("Please select room number and date range");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage("Start date must be before end date");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const charges = [];
      
      // Calculate charges for each service type
      for (const service of services) {
        const response = await axios.post("http://localhost:5000/report3/calculate-service-charges", {
          room_number: selectedRoom,
          service_type: service.service_type,
          start_date: startDate,
          end_date: endDate
        });

        if (response.data.success) {
          charges.push({
            service_type: service.service_type,
            total_charges: response.data.total_charges
          });
        }
      }

      setServiceCharges(charges);
      setMessage(`Service charges calculated for Room ${selectedRoom}`);
    } catch (error) {
      console.error("Error calculating service charges:", error);
      setMessage("Error calculating service charges");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSelectedRoom("");
    setStartDate("");
    setEndDate("");
    setServiceCharges([]);
    setMessage("");
  };

  const getTotalCharges = () => {
    return serviceCharges.reduce((total, service) => total + parseFloat(service.total_charges), 0);
  };

  return (
    <div className="report3-container">
      <div className="report3-wrapper">
        <h2>Service Charge Breakdown Report</h2>

        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Room Number:</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                required
              >
                <option value="">Select Room</option>
                {rooms.map((room, index) => (
                  <option key={index} value={room.room_number}>
                    {room.room_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={calculateServiceCharges}
              disabled={loading}
              className="calculate-btn"
            >
              {loading ? "Calculating..." : "Calculate Charges"}
            </button>
            <button onClick={clearForm} className="clear-btn">
              Clear
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        {serviceCharges.length > 0 && (
          <div className="results-section">
            <h3>Service Charge Breakdown for Room {selectedRoom}</h3>
            <p className="date-range">
              Period: {startDate} to {endDate}
            </p>

            <div className="charges-table">
              <table>
                <thead>
                  <tr>
                    <th>Service Type</th>
                    <th>Total Charges (LKR)</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCharges.map((service, index) => (
                    <tr key={index}>
                      <td className="service-type">{service.service_type}</td>
                      <td className="amount">
                        {parseFloat(service.total_charges).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="percentage">
                        {getTotalCharges() > 0 
                          ? `${((parseFloat(service.total_charges) / getTotalCharges()) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td className="service-type"><strong>Total</strong></td>
                    <td className="amount">
                      <strong>
                        {getTotalCharges().toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </strong>
                    </td>
                    <td className="percentage"><strong>100%</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .report3-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .report3-wrapper {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 900px;
        }
        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 26px;
          font-weight: 600;
        }
        .filter-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
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
        .message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 500;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
        .results-section {
          margin-top: 30px;
        }
        .results-section h3 {
          color: #333;
          margin-bottom: 10px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .date-range {
          color: #666;
          margin-bottom: 20px;
          font-style: italic;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .charges-table {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e1e5e9;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        th {
          background: #667eea;
          color: white;
          font-weight: 600;
          font-size: 15px;
        }
        .service-type {
          font-weight: 500;
          color: #333;
        }
        .amount, .percentage {
          text-align: right;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .amount {
          color: #2c3e50;
          font-size: 15px;
        }
        .percentage {
          color: #7f8c8d;
          font-size: 15px;
        }
        .total-row {
          background: #f8f9fa;
          font-weight: bold;
        }
        .total-row td {
          border-top: 2px solid #667eea;
          font-size: 16px;
        }
        .total-row .amount {
          color: #2c3e50;
        }
        .total-row .percentage {
          color: #2c3e50;
        }
        @media (max-width: 768px) {
          .report3-wrapper {
            padding: 20px;
          }
          .filter-row {
            grid-template-columns: 1fr;
          }
          .button-group {
            flex-direction: column;
          }
          th, td {
            padding: 12px 10px;
            font-size: 14px;
          }
          .amount, .percentage {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Report3;
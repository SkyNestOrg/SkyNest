import express from "express";
import db from "../../db.js";

const router = express.Router();

// Get service usage report by date range
router.get("/service-usage", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date and end date are required" 
      });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid date format" 
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date cannot be after end date" 
      });
    }

    // Get service usage data with correct JOIN
    const [serviceUsage] = await db.execute(
      `SELECT 
          sr.request_type as serviceType,
          COUNT(*) as usageCount,
          COALESCE(SUM(sr.quantity * s.unit_quantity_charges), 0) as totalRevenue,
          COALESCE(AVG(sr.quantity * s.unit_quantity_charges), 0) as averageRevenue
       FROM service_request sr
       INNER JOIN service s ON sr.branch_id = s.branch_id 
                          AND sr.request_type = s.service_type
       WHERE DATE(sr.date_time) BETWEEN ? AND ?
         AND sr.status = 'Completed'
         AND s.availability = 'Yes'
       GROUP BY sr.request_type
       ORDER BY usageCount DESC, totalRevenue DESC`,
      [start_date, end_date]
    );

    // Convert numeric values
    const processedData = serviceUsage.map(service => ({
      serviceType: service.serviceType,
      usageCount: parseInt(service.usageCount),
      totalRevenue: parseFloat(service.totalRevenue),
      averageRevenue: parseFloat(service.averageRevenue)
    }));

    // Calculate summary statistics
    const totalServices = processedData.length;
    const totalRevenue = processedData.reduce((sum, service) => sum + service.totalRevenue, 0);
    const mostUsedService = processedData.length > 0 ? processedData[0] : null;
    const highestRevenueService = processedData.length > 0 
      ? processedData.reduce((max, service) => service.totalRevenue > max.totalRevenue ? service : max, processedData[0])
      : null;

    const reportData = {
      period: {
        startDate: start_date,
        endDate: end_date,
        display: `${formatDate(start_date)} to ${formatDate(end_date)}`
      },
      services: processedData,
      summary: {
        totalServices: totalServices,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        mostUsedService: mostUsedService?.serviceType || 'N/A',
        highestRevenueService: highestRevenueService?.serviceType || 'N/A',
        highestRevenue: highestRevenueService?.totalRevenue || 0
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Error generating service usage report:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Get all service request types for reference
router.get("/service-types", async (req, res) => {
  try {
    const [serviceTypes] = await db.execute(
      `SELECT DISTINCT request_type as service_type 
       FROM service_request 
       WHERE status = 'Completed'
       ORDER BY request_type`
    );
    
    res.json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    console.error("Error fetching service types:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default router;
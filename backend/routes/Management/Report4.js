import express from "express";
import db from "../../db.js";

const router = express.Router();

// Get revenue report by branch and month
router.get("/revenue-report", async (req, res) => {
  try {
    const { branch_id, month, year } = req.query;

    if (!branch_id || !month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: "Branch, month, and year are required" 
      });
    }

    // Validate month and year
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ 
        success: false, 
        message: "Month must be between 1 and 12" 
      });
    }

    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ 
        success: false, 
        message: "Year must be between 2000 and 2100" 
      });
    }

    // Get branch name
    const [branchRows] = await db.execute(
      "SELECT branch_name FROM branch WHERE branch_id = ?",
      [branch_id]
    );

    if (branchRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    const branchName = branchRows[0].branch_name;

    // Get revenue data using the functions - handle null values
    const [[roomTotal]] = await db.execute(
      "SELECT GetRoomTotalByBranchAndMonth(?, ?, ?) as room_total",
      [branch_id, monthNum, yearNum]
    );

    const [[serviceTotal]] = await db.execute(
      "SELECT GetServiceTotalByBranchAndMonth(?, ?, ?) as service_total",
      [branch_id, monthNum, yearNum]
    );

    // Handle null values by converting to 0
    const roomTotalValue = parseFloat(roomTotal.room_total || 0);
    const serviceTotalValue = parseFloat(serviceTotal.service_total || 0);

    // Calculate other totals
    const subTotal = roomTotalValue + serviceTotalValue;

    // Get latest tax percentage from the view
    const [[taxRateResult]] = await db.execute(
      "SELECT latest_tax_percentage FROM latest_tax_percentage"
    );
    const taxRate = parseFloat(taxRateResult.latest_tax_percentage) / 100; // Convert percentage to decimal

    const taxAmount = subTotal * taxRate; 
    const grandTotal = subTotal + taxAmount;

    const reportData = {
      branch: {
        id: parseInt(branch_id),
        name: branchName
      },
      period: {
        month: monthNum,
        year: yearNum,
        display: `${getMonthName(monthNum)} ${yearNum}`
      },
      revenue: {
        roomTotal: parseFloat(roomTotalValue.toFixed(2)),
        serviceTotal: parseFloat(serviceTotalValue.toFixed(2)),
        subTotal: parseFloat(subTotal.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        taxRate: parseFloat((taxRate * 100).toFixed(2)) // Include tax rate in response for reference
      },
      breakdown: {
        roomPercentage: subTotal > 0 ? parseFloat(((roomTotalValue / subTotal) * 100).toFixed(2)) : 0,
        servicePercentage: subTotal > 0 ? parseFloat(((serviceTotalValue / subTotal) * 100).toFixed(2)) : 0
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Error generating revenue report:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Get all branches for dropdown
router.get("/branches", async (req, res) => {
  try {
    const [branches] = await db.execute(
      "SELECT branch_id, branch_name FROM branch ORDER BY branch_name"
    );
    
    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Get months for dropdown
router.get("/months", async (req, res) => {
  try {
    const months = [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];
    
    res.json({
      success: true,
      data: months
    });
  } catch (error) {
    console.error("Error fetching months:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Helper function to get month name
function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
}

export default router;
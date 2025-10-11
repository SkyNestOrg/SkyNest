import express from "express";
import db from "../../db.js";

const router = express.Router();

// Get room occupancy report
router.get("/occupancy-report", async (req, res) => {
  try {
    const { start_date, end_date, branch_id } = req.query;

    let reportData = {};

    // If no date range provided, use current snapshot
    if (!start_date && !end_date) {
      // Overall statistics
      const [[totalRooms]] = await db.execute("SELECT GetTotalRooms() as total");
      const [[occupiedRooms]] = await db.execute("SELECT GetOccupiedRoomsCount() as occupied");
      const [[availableRooms]] = await db.execute("SELECT GetAvailableRoomsCount() as available");

      reportData = {
        period: "Current Snapshot",
        overall: {
          totalRooms: totalRooms.total,
          occupiedRooms: occupiedRooms.occupied,
          availableRooms: availableRooms.available,
          occupancyRate: totalRooms.total > 0 ? ((occupiedRooms.occupied / totalRooms.total) * 100).toFixed(2) : 0
        },
        byBranch: []
      };

      // Get branch-wise data
      const [branches] = await db.execute("SELECT branch_id, branch_name FROM branch");
      
      for (const branch of branches) {
        const [[branchTotal]] = await db.execute(
          "SELECT GetTotalRoomsByBranch(?) as total",
          [branch.branch_id]
        );
        const [[branchOccupied]] = await db.execute(
          "SELECT GetOccupiedRoomsByBranch(?) as occupied",
          [branch.branch_id]
        );
        const [[branchAvailable]] = await db.execute(
          "SELECT GetAvailableRoomsByBranch(?) as available",
          [branch.branch_id]
        );

        reportData.byBranch.push({
          branchId: branch.branch_id,
          branchName: branch.branch_name,
          totalRooms: branchTotal.total,
          occupiedRooms: branchOccupied.occupied,
          availableRooms: branchAvailable.available,
          occupancyRate: branchTotal.total > 0 ? ((branchOccupied.occupied / branchTotal.total) * 100).toFixed(2) : 0
        });
      }

    } else if (start_date && end_date) {
      // Date range provided
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (startDate > endDate) {
        return res.status(400).json({ 
          success: false, 
          message: "Start date cannot be after end date" 
        });
      }

      let overallOccupied, overallAvailable;

      if (branch_id) {
        // Specific branch for date range
        [[overallOccupied]] = await db.execute(
          "SELECT GetOccupiedRoomsByDateRangeAndBranch(?, ?, ?) as occupied",
          [start_date, end_date, branch_id]
        );
        [[overallAvailable]] = await db.execute(
          "SELECT GetAvailableRoomsByDateRangeAndBranch(?, ?, ?) as available",
          [start_date, end_date, branch_id]
        );

        // Get branch details
        const [branchDetails] = await db.execute(
          "SELECT branch_name FROM branch WHERE branch_id = ?",
          [branch_id]
        );

        const totalRooms = overallOccupied.occupied + overallAvailable.available;

        reportData = {
          period: `${start_date} to ${end_date}`,
          branchFilter: branchDetails[0]?.branch_name || 'Unknown Branch',
          overall: {
            totalRooms: totalRooms,
            occupiedRooms: overallOccupied.occupied,
            availableRooms: overallAvailable.available,
            occupancyRate: totalRooms > 0 ? ((overallOccupied.occupied / totalRooms) * 100).toFixed(2) : 0
          },
          byBranch: []
        };

      } else {
        // All branches for date range
        [[overallOccupied]] = await db.execute(
          "SELECT GetOccupiedRoomsByDateRange(?, ?) as occupied",
          [start_date, end_date]
        );
        [[overallAvailable]] = await db.execute(
          "SELECT GetAvailableRoomsByDateRange(?, ?) as available",
          [start_date, end_date]
        );

        const totalRooms = overallOccupied.occupied + overallAvailable.available;

        reportData = {
          period: `${start_date} to ${end_date}`,
          overall: {
            totalRooms: totalRooms,
            occupiedRooms: overallOccupied.occupied,
            availableRooms: overallAvailable.available,
            occupancyRate: totalRooms > 0 ? ((overallOccupied.occupied / totalRooms) * 100).toFixed(2) : 0
          },
          byBranch: []
        };

        // Get branch-wise data for date range
        const [branches] = await db.execute("SELECT branch_id, branch_name FROM branch");
        
        for (const branch of branches) {
          const [[branchOccupied]] = await db.execute(
            "SELECT GetOccupiedRoomsByDateRangeAndBranch(?, ?, ?) as occupied",
            [start_date, end_date, branch.branch_id]
          );
          const [[branchAvailable]] = await db.execute(
            "SELECT GetAvailableRoomsByDateRangeAndBranch(?, ?, ?) as available",
            [start_date, end_date, branch.branch_id]
          );

          const branchTotal = branchOccupied.occupied + branchAvailable.available;

          reportData.byBranch.push({
            branchId: branch.branch_id,
            branchName: branch.branch_name,
            totalRooms: branchTotal,
            occupiedRooms: branchOccupied.occupied,
            availableRooms: branchAvailable.available,
            occupancyRate: branchTotal > 0 ? ((branchOccupied.occupied / branchTotal) * 100).toFixed(2) : 0
          });
        }
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Both start_date and end_date are required for date range reports" 
      });
    }

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error("Error generating occupancy report:", error);
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
    const [branches] = await db.execute("SELECT branch_id, branch_name FROM branch ORDER BY branch_name");
    
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

export default router;
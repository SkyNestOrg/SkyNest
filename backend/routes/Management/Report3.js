import express from "express";
import db from "../../db.js";

const router = express.Router();

// Get all rooms from view_all_rooms view
router.get("/get-all-rooms", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM view_all_rooms ORDER BY room_number");
    
    
    res.json({
      success: true,
      rooms: rows
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching rooms",
      error: error.message 
    });
  }
});

// Get all services from view_all_services view
router.get("/get-all-services", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM view_all_services ORDER BY service_type");
    

    
    res.json({
      success: true,
      services: rows
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching services",
      error: error.message 
    });
  }
});

// Calculate service charges for specific room and service type
router.post("/calculate-service-charges", async (req, res) => {
  try {
    const { room_number, service_type, start_date, end_date } = req.body;

    if (!room_number || !service_type || !start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required parameters" 
      });
    }

    const [result] = await db.execute(
      "SELECT CalculateServiceCharges(?, ?, ?, ?) AS total_charges",
      [room_number, service_type, start_date, end_date]
    );



    res.json({
      success: true,
      total_charges: result[0].total_charges || 0
    });

  } catch (error) {
    console.error("Error calculating service charges:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error calculating service charges",
      error: error.message 
    });
  }
});

export default router;
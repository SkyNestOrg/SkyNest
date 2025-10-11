// routes/Guest/GetRoomType.js
import express from "express";
import db from "../../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT type_name FROM roomtype ORDER BY type_name ASC"
    );

    const roomtypes = rows.map(r => r.type_name);

    
    res.json({
      success: true,
      roomtypes, // lowercase as expected by frontend
      message: "Room types fetched successfully"
    });


  } catch (error) {
    console.error("Error fetching room types:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

export default router;
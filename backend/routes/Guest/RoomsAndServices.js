import express from "express";
import db from "../../db.js"; // Your database connection

const router = express.Router();

// GET all room types
router.get("/room-types", async (req, res) => {
  try {
    const query = `
      SELECT type_name, base_price, amenities 
      FROM roomtype
      WHERE type_name IS NOT NULL
      ORDER BY base_price 
    `;

    const [rows] = await db.execute(query);

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: "No room types found",
      });
    }

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: "Room types fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching room types:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;



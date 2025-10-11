// routes/Guest/GetBranches.js
import express from "express";
import db from "../../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT branch_name FROM branch ORDER BY branch_name ASC"
    );
    
    const branches = rows.map(r => r.branch_name);
    
    res.json({
      success: true,
      branches, // lowercase as expected by frontend
      message: "Branches fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

export default router;
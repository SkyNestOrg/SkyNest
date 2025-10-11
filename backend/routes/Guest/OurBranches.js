// routes/branches.js
import express from "express";
import db from "../../db.js"; // make sure db.js also uses ESM export

const router = express.Router();

// GET all branches
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT branch_id, branch_name, address, city, contact_number 
      FROM branch
      WHERE branch_id IS NOT NULL 
      ORDER BY branch_id
    `;

    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message: "Branches fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET single branch by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT branch_id, branch_name, address, city, contact_number 
      FROM branch
      WHERE branch_id = ?
    `;

    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
      message: "Branch fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;


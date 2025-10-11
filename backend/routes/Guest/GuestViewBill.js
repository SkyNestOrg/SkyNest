import express from 'express';
import db from '../../db.js'; 
import { authenticateToken } from './middleware/authmiddleware.js';

const router = express.Router();

// Get all bills for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        b.bill_id,
        b.booking_id,
        b.bill_date,
        b.room_total,
        b.service_total,
        b.sub_total,
        b.tax_amount,
        b.grand_total,
        b.due_amount,
        b.bill_status
      FROM bill b
      JOIN booking bk ON b.booking_id = bk.booking_id
      JOIN guest g ON bk.guest_id = g.guest_id
      WHERE g.guest_id = ?
      ORDER BY b.bill_date DESC
    `;
    
    const [bills] = await db.execute(query, [req.user.userId]);
    
    res.json({
      success: true,
      data: bills,
      message: 'Bills retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


export default router;
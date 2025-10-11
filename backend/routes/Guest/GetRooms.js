import express from 'express';
import db from '../../db.js'; 
import { authenticateToken } from './middleware/authmiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const guestId = req.user.userId;
    
    const [rows] = await db.execute(`
      SELECT br.room_number, br.check_out
      FROM booking b JOIN booked_room br ON b.booking_id = br.booking_id 
      WHERE b.guest_id = ? 
        AND DATE(NOW()) BETWEEN br.check_in AND br.check_out
        AND br.status = 'CheckedIn'
      ORDER BY br.room_number
    `, [guestId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching guest rooms:', error);
    res.status(500).json({ error: 'Failed to fetch guest rooms' });
  }
});

export default router;


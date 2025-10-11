// guestservice.js
import express from 'express';
import db from '../../db.js'; 
import { authenticateToken } from './middleware/authmiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { room_number, request_type, quantity } = req.body;
    const guestId = req.user.userId;

    if (!room_number || !request_type || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required: room_number, request_type, quantity'
      });
    }

    // Verify the room belongs to this guest
    const [verificationRows] = await db.execute(
      `SELECT b.booking_id, b.branch_id, br.status 
       FROM booking b
       JOIN booked_room br ON b.booking_id = br.booking_id 
       WHERE br.room_number = ? 
         AND b.guest_id = ?
         AND DATE(NOW()) BETWEEN br.check_in AND br.check_out
       LIMIT 1`,
      [room_number, guestId]
    );

    if (!verificationRows.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this room'
      });
    }

    const { booking_id, branch_id, status } = verificationRows[0];

    // Check if room status is 'CheckedIn'
    if (status !== 'CheckedIn') {
      return res.status(400).json({
        success: false,
        message: "Please check in before requesting services",
      });
    }

    // Verify the service is available at this branch
    const [serviceRows] = await db.execute(
      `SELECT service_type, unit_quantity_charges 
       FROM service 
       WHERE branch_id = ? 
         AND service_type = ? 
         AND availability = 'Yes'`,
      [branch_id, request_type]
    );

    if (!serviceRows.length) {
      return res.status(400).json({
        success: false,
        message: "This service is not available at your location"
      });
    }

    // Insert service request
    await db.execute(
      `INSERT INTO service_request (booking_id, branch_id, room_number, request_type, quantity, date_time, status)
       VALUES (?, ?, ?, ?, ?, NOW(), 'Request Placed')`,
      [booking_id, branch_id, room_number, request_type, quantity]
    );

    res.status(201).json({
      success: true,
      booking_id,
      branch_id,
      message: 'Service request created successfully'
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;


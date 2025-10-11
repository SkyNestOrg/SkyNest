import express from 'express';
import db from '../../db.js'; 
import { authenticateToken } from './middleware/authmiddleware.js';

const router = express.Router();

// Get current bookings with all associated rooms
router.get('/', authenticateToken, async (req, res) => {
  try {
    // First get booking details
    const bookingQuery = `
      SELECT 
        b.booking_id,  
        b.booking_date,  
        b.number_of_rooms, 
        b.number_of_pax, 
        br.branch_name,
        b.guest_id,
        b.status as booking_status
      FROM booking b
      JOIN branch br ON b.branch_id = br.branch_id
      WHERE b.status IN ('Confirmed', 'CheckedIn') AND b.guest_id = ?  
      ORDER BY b.booking_date ASC
    `;
    
    const [bookings] = await db.execute(bookingQuery, [req.user.userId]);
    
    // Then get all room details for each booking
    const bookingsWithRooms = await Promise.all(
      bookings.map(async (booking) => {
        const roomQuery = `
          SELECT 
            room_number,
            check_in,
            check_out,
            status as room_status
          FROM booked_room 
          WHERE booking_id = ?
          ORDER BY room_number ASC
        `;
        
        const [rooms] = await db.execute(roomQuery, [booking.booking_id]);
        
        return {
          ...booking,
          rooms: rooms || [] // Array of all rooms for this booking
        };
      })
    );
    
    res.json({
      success: true,
      data: bookingsWithRooms,
      message: 'Current bookings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching current bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
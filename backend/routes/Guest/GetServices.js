import express from 'express';
import db from '../../db.js'; 
import { authenticateToken } from './middleware/authmiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const guestId = req.user.userId;
    console.log('=== GET SERVICES REQUEST ===');
    console.log('Guest ID:', guestId);
    console.log('Current time:', new Date());
    console.log('Querying for active booking...');

    // In your /getservices endpoint, modify the query:
    const [branchRows] = await db.execute(`
      SELECT b.branch_id, br.check_in, br.check_out, br.status
      FROM booking b
      JOIN booked_room br ON b.booking_id = br.booking_id 
      WHERE b.guest_id = ? 
        AND br.check_out >= DATE(NOW())  
        AND br.status IN ('CheckedIn')  
      LIMIT 1
    `, [guestId]);
    
    console.log('Branch query result:', branchRows);
    
    if (!branchRows.length) {
      console.log('❌ No active booking found for guest:', guestId);
      
      // Debug: Check what bookings actually exist for this guest
      const [allBookings] = await db.execute(`
        SELECT b.booking_id, b.guest_id, br.room_number, 
               br.check_in, br.check_out, br.status,NOW() as current_time_db
        FROM booking b
        JOIN booked_room br ON b.booking_id = br.booking_id 
        WHERE b.guest_id = ?
        ORDER BY br.check_in DESC
      `, [guestId]);
      
      console.log('All bookings for guest:', allBookings);
      
      return res.status(404).json({ 
        error: 'No active booking found for this guest',
        details: 'You need to have an active checked-in booking to access services'
      });
    }

    const { branch_id } = branchRows[0];
    console.log('✅ Found active booking. Branch ID:', branch_id);
    
    // Debug: Show the exact booking details
    console.log('Booking details:', {
      branch_id: branch_id,
      check_in: branchRows[0].check_in,
      check_out: branchRows[0].check_out,
      status: branchRows[0].status
    });

    // Then get services for that branch
    console.log('Querying services for branch:', branch_id);
    const [serviceRows] = await db.execute(`
      SELECT service_type, unit_quantity_charges 
      FROM service 
      WHERE branch_id = ? 
        AND availability = 'Yes'
      ORDER BY service_type
    `, [branch_id]);
    
    console.log('Services found:', serviceRows.length);
    console.log('Services details:', serviceRows);
    
    if (serviceRows.length === 0) {
      console.log('⚠️ No available services found for branch:', branch_id);
      
      // Debug: Check what services exist (even unavailable ones)
      const [allServices] = await db.execute(`
        SELECT service_type, unit_quantity_charges, availability
        FROM service 
        WHERE branch_id = ?
        ORDER BY service_type
      `, [branch_id]);
      
      console.log('All services in branch (including unavailable):', allServices);
    }
    
    res.json(serviceRows);
    
  } catch (error) {
    console.error('❌ Error fetching branch services:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to fetch services',
      details: error.message 
    });
  }
});

export default router;
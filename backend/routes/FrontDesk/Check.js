import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /check - Get bookings for the logged-in staff's branch
router.get('/', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify token and get branch_id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const branch_id = decoded.branch_id;

        console.log('Fetching bookings for branch:', branch_id);

        // Query to get bookings for this branch
        const [bookings] = await db.query(
            `SELECT 
                booking_id,
                guest_id,
                booking_date,
                branch_id,
                number_of_rooms,
                number_of_pax,
                status
             FROM booking 
             WHERE branch_id = ?
             ORDER BY booking_date DESC`,
            [branch_id]
        );

        console.log('Found bookings:', bookings.length);

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length,
            branch_id: branch_id
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching bookings',
            error: error.message 
        });
    }
});

// GET /check/search/:booking_id - Search booking by ID for the logged-in staff's branch
router.get('/search/:booking_id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const branch_id = decoded.branch_id;
        const booking_id = req.params.booking_id;

        console.log('Searching booking:', booking_id, 'for branch:', branch_id);

        // Query to get specific booking for this branch
        const [bookings] = await db.query(
            `SELECT 
                booking_id,
                guest_id,
                booking_date,
                branch_id,
                number_of_rooms,
                number_of_pax,
                status
             FROM booking 
             WHERE booking_id = ? AND branch_id = ?`,
            [booking_id, branch_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or does not belong to your branch'
            });
        }

        res.status(200).json({
            success: true,
            data: bookings[0],
            branch_id: branch_id
        });

    } catch (error) {
        console.error('Error searching booking:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while searching booking',
            error: error.message 
        });
    }
});

// PUT /check/:id/status - Update booking status
router.put('/:id/status', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const branch_id = decoded.branch_id;
        const booking_id = req.params.id;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: Confirmed, CheckedIn, CheckedOut, Cancelled'
            });
        }

        console.log('Updating booking status:', booking_id, 'to', status, 'for branch:', branch_id);

        // Update booking status
        const [result] = await db.query(
            'UPDATE booking SET status = ? WHERE booking_id = ? AND branch_id = ?',
            [status, booking_id, branch_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or does not belong to your branch'
            });
        }

        // Get updated booking data
        const [updatedBookings] = await db.query(
            'SELECT * FROM booking WHERE booking_id = ? AND branch_id = ?',
            [booking_id, branch_id]
        );

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBookings[0]
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating booking status',
            error: error.message 
        });
    }
});

export default router;
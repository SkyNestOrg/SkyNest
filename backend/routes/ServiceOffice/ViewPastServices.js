import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /viewpastservices - Get completed services for the logged-in staff's branch
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

        const { startDate, endDate, roomNumber } = req.query;

        console.log('Fetching past services for branch:', branch_id, 'Filters:', { startDate, endDate, roomNumber });

        let query = `
            SELECT 
                sr.service_request_id,
                sr.request_type,
                sr.date_time,
                sr.booking_id,
                sr.room_number,
                sr.status,
                sr.quantity,
                sr.branch_id,
                s.unit_quantity_charges,
                (sr.quantity * s.unit_quantity_charges) as total_charge
            FROM service_request sr
            LEFT JOIN service s ON sr.request_type = s.service_type AND sr.branch_id = s.branch_id
            WHERE sr.branch_id = ? AND sr.status = 'Completed'
        `;

        const params = [branch_id];

        // Add date filter if provided
        if (startDate && endDate) {
            query += ` AND DATE(sr.date_time) BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ` AND DATE(sr.date_time) >= ?`;
            params.push(startDate);
        } else if (endDate) {
            query += ` AND DATE(sr.date_time) <= ?`;
            params.push(endDate);
        }

        // Add room number filter if provided
        if (roomNumber) {
            query += ` AND sr.room_number = ?`;
            params.push(roomNumber);
        }

        query += ` ORDER BY sr.date_time DESC`;

        const [serviceRequests] = await db.query(query, params);

        console.log('Found past services:', serviceRequests.length);

        res.status(200).json({
            success: true,
            data: serviceRequests,
            count: serviceRequests.length,
            branch_id: branch_id
        });

    } catch (error) {
        console.error('Error fetching past services:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching past services',
            error: error.message 
        });
    }
});

// GET /viewpastservices/rooms - Get unique room numbers for filter dropdown
router.get('/rooms', async (req, res) => {
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

        const [rooms] = await db.query(
            `SELECT DISTINCT room_number 
             FROM service_request 
             WHERE branch_id = ? AND status = 'Completed'
             ORDER BY room_number ASC`,
            [branch_id]
        );

        res.status(200).json({
            success: true,
            data: rooms.map(room => room.room_number)
        });

    } catch (error) {
        console.error('Error fetching room numbers:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching room numbers',
            error: error.message 
        });
    }
});

export default router;
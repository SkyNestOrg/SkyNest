import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /viewdueservices - Get due services for the logged-in staff's branch
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

        console.log('Fetching due services for branch:', branch_id);

        // Query to get service requests with "Request Placed" status for this branch
        // const [serviceRequests] = await db.query(
        //     `SELECT 
        //         service_request.service_request_id,
        //         service_request.request_type,
        //         service_request.date_time,
        //         service_request.room_number,
        //         service_request.status,
        //         service_request.booking_id,
        //         service_request.quantity
        //      FROM service_request 
        //      LEFT JOIN service  ON service_request.request_type = service.service_type AND service_request.branch_id = service.branch_id
        //      WHERE service_request.branch_id = ? AND service_request.status = 'Request Placed'
        //      ORDER BY service_request.date_time ASC`,
        //     [branch_id]
        // );


        const [serviceRequests] = await db.query(
             'SELECT * FROM DueServicesView WHERE branch_id = ?',
               [branch_id]);

        console.log('Found due services:', serviceRequests.length);

        res.status(200).json({
            success: true,
            data: serviceRequests,
            count: serviceRequests.length,
            branch_id: branch_id
        });

    } catch (error) {
        console.error('Error fetching due services:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching due services',
            error: error.message 
        });
    }
});

// PUT /viewdueservices/:id/complete - Mark service as completed
router.put('/:id/complete', async (req, res) => {
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
        const service_request_id = req.params.id;

        console.log('Completing service request:', service_request_id, 'for branch:', branch_id);

        // Update service request status to "Completed"
        const [result] = await db.query(
            'UPDATE service_request SET status = ? WHERE service_request_id = ? AND branch_id = ?',
            ['Completed', service_request_id, branch_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found or does not belong to your branch'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service marked as completed successfully'
        });

    } catch (error) {
        console.error('Error completing service:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while completing service',
            error: error.message 
        });
    }
});

export default router;
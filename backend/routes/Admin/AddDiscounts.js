import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /adddiscounts - Add new discount
router.post('/', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { discount_percentage, branch_id, room_type, start_date, end_date } = req.body;

        console.log('POST /adddiscounts received:', req.body);

        // Basic validation
        if (!discount_percentage || !branch_id || !room_type || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check for overlapping discounts
        const [existingDiscounts] = await db.query(
            `SELECT * FROM discount 
             WHERE branch_id = ? AND room_type = ? 
             AND (
                 (start_date BETWEEN ? AND ?) OR 
                 (end_date BETWEEN ? AND ?) OR
                 (? BETWEEN start_date AND end_date) OR
                 (? BETWEEN start_date AND end_date)
             )`,
            [branch_id, room_type, start_date, end_date, start_date, end_date, start_date, end_date]
        );

        if (existingDiscounts.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A discount already exists for this branch and room type during the specified dates'
            });
        }

        // Insert new discount
        const [result] = await db.query(
            `INSERT INTO discount (percentage, branch_id, room_type, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?)`,
            [discount_percentage, branch_id, room_type, start_date, end_date]
        );

        console.log('Discount added successfully with ID:', result.insertId);

        res.status(200).json({
            success: true,
            message: 'Discount added successfully',
            discount_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding discount:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while adding discount',
            error: error.message 
        });
    }
});

export default router;
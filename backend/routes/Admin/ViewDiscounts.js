import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /viewdiscounts - Get all discounts
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

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('Fetching all discounts');

        const [discounts] = await db.query(
            `SELECT d.*, b.branch_id 
             FROM discount d
             LEFT JOIN branch b ON d.branch_id = b.branch_id
             ORDER BY d.start_date DESC`
        );

        console.log('Found discounts:', discounts.length);

        res.status(200).json({
            success: true,
            data: discounts,
            count: discounts.length
        });

    } catch (error) {
        console.error('Error fetching discounts:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching discounts',
            error: error.message 
        });
    }
});

// DELETE /viewdiscounts/:id - Delete discount
router.delete('/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const discountId = req.params.id;

        console.log('Deleting discount:', discountId);

        // Delete discount
        const [result] = await db.query(
            'DELETE FROM discount WHERE discount_id = ?',
            [discountId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Discount not found'
            });
        }

        console.log('Discount deleted successfully. ID:', discountId);

        res.status(200).json({
            success: true,
            message: 'Discount deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting discount:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting discount',
            error: error.message 
        });
    }
});

export default router;
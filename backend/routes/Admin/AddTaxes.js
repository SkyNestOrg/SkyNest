import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /addtaxes - Add new taxes and charges
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
        
        const { revision_date, latest_tax_percentage, latest_surcharge_percentage } = req.body;

        console.log('POST /addtaxes received:', req.body);

        // Basic validation
        if (!revision_date || !latest_tax_percentage || !latest_surcharge_percentage) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate percentages
        if (latest_tax_percentage < 0 || latest_tax_percentage > 100 || 
            latest_surcharge_percentage < 0 || latest_surcharge_percentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentages must be between 0 and 100'
            });
        }

        // Check if tax entry already exists for the same revision date
        const [existingTaxes] = await db.query(
            'SELECT * FROM taxes_and_charges WHERE revision_date = ?',
            [revision_date]
        );

        if (existingTaxes.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Tax entry already exists for this revision date'
            });
        }

        // Insert new tax entry
        const [result] = await db.query(
            `INSERT INTO taxes_and_charges (revision_date, latest_tax_percentage, latest_surcharge_percentage) 
             VALUES (?, ?, ?)`,
            [revision_date, latest_tax_percentage, latest_surcharge_percentage]
        );

        console.log('Taxes and charges added successfully with ID:', result.insertId);

        res.status(200).json({
            success: true,
            message: 'Taxes and charges added successfully',
            tax_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding taxes:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while adding taxes and charges',
            error: error.message 
        });
    }
});

export default router;
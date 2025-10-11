import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /viewtaxes - Get all taxes and charges
router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('Fetching all taxes and charges');

        const [taxes] = await db.query(
            `SELECT * FROM taxes_and_charges 
             ORDER BY revision_date DESC`
        );

        console.log('Found tax entries:', taxes.length);
        
        res.status(200).json({
            success: true,
            data: taxes,
            count: taxes.length
        });

    } catch (error) {
        console.error('Error fetching taxes:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching taxes',
            error: error.message 
        });
    }
});

// DELETE /viewtaxes/:revision_id - Delete tax entry by revision ID
router.delete('/:revision_id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const revision_id = req.params.revision_id;

        console.log('=== DELETE TAX DEBUG ===');
        console.log('Revision ID from params:', revision_id);

        // ✅ Check if tax entry exists
        const [existingTax] = await db.query(
            'SELECT * FROM taxes_and_charges WHERE revision_id = ?',
            [revision_id]
        );

        console.log('Existing tax entries found:', existingTax.length);
        
        if (existingTax.length === 0) {
            console.log('❌ TAX ENTRY NOT FOUND IN DATABASE');
            return res.status(404).json({
                success: false,
                message: `Tax entry not found`
            });
        }

        const taxEntry = existingTax[0];
        console.log('✅ Tax entry found:', taxEntry);

       
        const today = new Date();
        const revisionDate = new Date(taxEntry.revision_date);
        
        if (revisionDate <= today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete current or past tax entries. Only future revisions can be deleted.'
            });
        }

        // ✅ Delete by revision_id - clean and simple!
        const [result] = await db.query(
            'DELETE FROM taxes_and_charges WHERE revision_id = ?',
            [revision_id]
        );

        console.log('Database deletion result - affectedRows:', result.affectedRows);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tax entry not found'
            });
        }

      
        res.status(200).json({
            success: true,
            message: 'Tax entry deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting tax:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting tax entry',
            error: error.message 
        });
    }
});

export default router;
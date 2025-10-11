import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /updateservicetable - Get all services for the logged-in staff's branch
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
        const branch_id = decoded.branch_id;

        console.log('Fetching services for branch:', branch_id);

        const [services] = await db.query(
            `SELECT * FROM service WHERE branch_id = ? ORDER BY service_type ASC`,
            [branch_id]
        );

        res.status(200).json({
            success: true,
            data: services,
            count: services.length,
            branch_id: branch_id
        });

    } catch (error) {
        console.error('Error fetching services:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching services',
            error: error.message 
        });
    }
});

// PUT /updateservicetable/:service_type - Update existing service
router.put('/:service_type', async (req, res) => {
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
        const { service_type } = req.params;
        const { unit_quantity_charges, availability } = req.body;

        console.log('Updating service:', { service_type, branch_id, unit_quantity_charges, availability });

        // Validate input
        if (!unit_quantity_charges || !availability) {
            return res.status(400).json({
                success: false,
                message: 'Unit charges and availability are required'
            });
        }

        const [result] = await db.query(
            `UPDATE service 
             SET unit_quantity_charges = ?, availability = ?
             WHERE service_type = ? AND branch_id = ?`,
            [unit_quantity_charges, availability, service_type, branch_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or does not belong to your branch'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully'
        });

    } catch (error) {
        console.error('Error updating service:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating service',
            error: error.message 
        });
    }
});

// POST /updateservicetable - Add new service
router.post('/', async (req, res) => {
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
        const { service_type, unit_quantity_charges, availability } = req.body;

        console.log('Adding new service:', { service_type, branch_id, unit_quantity_charges, availability });

        // Validate input
        if (!service_type || !unit_quantity_charges || !availability) {
            return res.status(400).json({
                success: false,
                message: 'Service type, unit charges and availability are required'
            });
        }

        // Check if service already exists for this branch
        const [existing] = await db.query(
            `SELECT * FROM service WHERE service_type = ? AND branch_id = ?`,
            [service_type, branch_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Service already exists for this branch'
            });
        }

        // Insert new service
        await db.query(
            `INSERT INTO service (service_type, unit_quantity_charges, branch_id, availability)
             VALUES (?, ?, ?, ?)`,
            [service_type, unit_quantity_charges, branch_id, availability]
        );

        res.status(201).json({
            success: true,
            message: 'Service added successfully'
        });

    } catch (error) {
        console.error('Error adding service:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while adding service',
            error: error.message 
        });
    }
});

export default router;
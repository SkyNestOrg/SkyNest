import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// GET /managestaff - Get all staff users (excluding admin-user)
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

        console.log('Fetching all staff users (excluding admin)');

        const [users] = await db.query(`
            SELECT username, official_role, branch_id 
            FROM staff_user 
            WHERE official_role != 'admin-user'
            ORDER BY username
        `);

        console.log('Found staff users:', users.length);

        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Error fetching staff users:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching staff users',
            error: error.message 
        });
    }
});

// POST /managestaff - Add new staff user
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

        const { username, password, official_role, branch_id } = req.body;

        console.log('Adding new staff user:', { username, official_role, branch_id });

        // Validate required fields
        if (!username || !password || !official_role || !branch_id) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: username, password, official_role, branch_id'
            });
        }

        // ✅ FIX: Don't allow admin-user to be created
        if (official_role === 'admin-user') {
            return res.status(400).json({
                success: false,
                message: 'Cannot create admin users through this interface'
            });
        }

        // Check if user already exists
        const [existingUser] = await db.query(
            'SELECT username FROM staff_user WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO staff_user(username, password, official_role, branch_id) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, official_role, branch_id]
        );

        console.log('New staff user created with ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: 'Staff user created successfully',
            data: { username, official_role, branch_id }
        });

    } catch (error) {
        console.error('Error creating staff user:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while creating staff user',
            error: error.message 
        });
    }
});

// PUT /managestaff/:username - Update staff user
router.put('/:username', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const username = req.params.username;
        const { password, official_role, branch_id } = req.body;

        console.log('Updating staff user:', username);

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT username, official_role FROM staff_user WHERE username = ?',
            [username]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff user not found'
            });
        }

        // ✅ FIX: Prevent changing role to admin-user
        if (official_role === 'admin-user') {
            return res.status(400).json({
                success: false,
                message: 'Cannot change role to admin-user'
            });
        }

        let updateQuery = 'UPDATE staff_user SET official_role = ?, branch_id = ?';
        let queryParams = [official_role, branch_id];

        // Update password only if provided
        if (password) {
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateQuery += ', password = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE username = ?';
        queryParams.push(username);

        const [result] = await db.query(updateQuery, queryParams);

        console.log('Staff user updated:', username);

        res.status(200).json({
            success: true,
            message: 'Staff user updated successfully',
            data: { username, official_role, branch_id }
        });

    } catch (error) {
        console.error('Error updating staff user:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating staff user',
            error: error.message 
        });
    }
});

// DELETE /managestaff/:username - Delete staff user
router.delete('/:username', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const username = req.params.username;

        console.log('Deleting staff user:', username);

        // Check if user exists and get role
        const [existingUser] = await db.query(
            'SELECT username, official_role FROM staff_user WHERE username = ?',
            [username]
        );

        if (existingUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff user not found'
            });
        }

        // ✅ FIX: Prevent deleting admin users
        if (existingUser[0].official_role === 'admin-user') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        // Prevent deleting your own account
        if (decoded.username === username) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete user
        const [result] = await db.query(
            'DELETE FROM staff_user WHERE username = ?',
            [username]
        );

        console.log('Staff user deleted:', username);

        res.status(200).json({
            success: true,
            message: 'Staff user deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting staff user:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting staff user',
            error: error.message 
        });
    }
});

export default router;
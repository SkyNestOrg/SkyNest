import express from 'express';
import bcrypt from 'bcrypt';
import db from '../../db.js';

const router = express.Router();
router.use(express.json());

// POST /register
router.post('/', async (req, res) => {
    console.log('POST /register received:', req.body);
    
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ 
            status: 'All fields required', 
            success: false 
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ 
            status: 'Passwords do not match', 
            success: false 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            status: 'Password must be at least 6 characters', 
            success: false 
        });
    }

    try {
        // Check if username exists
        const [rows] = await db.query(
            'SELECT * FROM guest_user WHERE username = ?',
            [username]
        );
        
        if (rows.length > 0) {
            return res.status(409).json({ 
                status: 'Username already exists', 
                success: false 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into DB
        const [result] = await db.query(
            'INSERT INTO guest_user (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        console.log('Registration successful. Insert ID:', result.insertId);
        res.status(201).json({
            status: 'Guest registered successfully',
            success: true,
            guestId: result.insertId,
            username: username
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            status: 'Database error', 
            success: false, 
            error: err.message 
        });
    }
});

export default router;


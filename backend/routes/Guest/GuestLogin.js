import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // For generating authentication tokens
import db from '../../db.js';

const router = express.Router();
router.use(express.json());

// POST /login
router.post('/', async (req, res) => {
    console.log('POST /login received:', req.body);
    
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ 
            status: 'Username and password are required', 
            success: false 
        });
    }

    try {
        // Check if user exists
        const [rows] = await db.query(
            'SELECT * FROM guest_user WHERE username = ?',
            [username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ 
                status: 'Invalid credentials', 
                success: false 
            });
        }

        const user = rows[0];

        // Compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                status: 'Invalid credentials', 
                success: false 
            });
        }
        const secretkey = process.env.JWT_SECRET;
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.guest_id, 
                username: user.username , 
                role: 'Guest'
            }, 
            //process.env.JWT_SECRET || 'your-secret-key',
            secretkey, // SAME KEY IN BOTH FILES
            
            { expiresIn: '1h' }
        );

      
        console.log('Login successful for user:', username);
    
        

        res.status(200).json({
            status: 'Login successful',
            success: true,
            token: token,
            user: {
                id: user.guest_id, // Make sure this is the correct field name
                username: user.username
            }
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            status: 'Server error during login', 
            success: false, 
            error: err.message 
        });
    }
});

export default router;
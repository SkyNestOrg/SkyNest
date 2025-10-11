import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /stafflogs - Get all staff logs with filtering
router.get('/', async (req, res) => {
    try {
        console.log('=== STAFF LOGS REQUEST RECEIVED ===');
        
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verified for user:', decoded.username);
        } catch (jwtError) {
            console.log('❌ JWT Error:', jwtError.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }

        // Get query parameters for filtering
        const { date, startTime, endTime, username } = req.query;
        
        console.log('Filter parameters:', { date, startTime, endTime, username });

        // ✅ FIX: Filter out NULL values and handle potential issues
        let query = `
            SELECT log_id, username, timestamp, action 
            FROM staff_logs 
            WHERE username IS NOT NULL 
            AND timestamp IS NOT NULL 
            AND action IS NOT NULL
        `;
        let queryParams = [];

        // Filter by date
        if (date) {
            query += ' AND DATE(timestamp) = ?';
            queryParams.push(date);
            console.log('Adding date filter:', date);
        }

        // Filter by username
        if (username) {
            query += ' AND username LIKE ?';
            queryParams.push(`%${username}%`);
            console.log('Adding username filter:', username);
        }

        // Filter by time range
        if (startTime && endTime) {
            query += ' AND TIME(timestamp) BETWEEN ? AND ?';
            queryParams.push(startTime, endTime);
            console.log('Adding time range filter:', startTime, 'to', endTime);
        } else if (startTime) {
            query += ' AND TIME(timestamp) >= ?';
            queryParams.push(startTime);
            console.log('Adding start time filter:', startTime);
        } else if (endTime) {
            query += ' AND TIME(timestamp) <= ?';
            queryParams.push(endTime);
            console.log('Adding end time filter:', endTime);
        }

        // Add ordering
        query += ' ORDER BY timestamp DESC';
        console.log('Final query:', query);
        console.log('Query parameters:', queryParams);

        // Execute query
        const [logs] = await db.query(query, queryParams);

        console.log('✅ Found staff logs:', logs.length);
        if (logs.length > 0) {
            console.log('Sample log:', logs[0]);
        }

        res.status(200).json({
            success: true,
            data: logs
        });

    } catch (error) {
        console.error('❌ Error fetching staff logs:', error);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        // Check if it's a database error
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ 
                success: false, 
                message: 'Staff logs table does not exist in database'
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching staff logs',
            error: error.message 
        });
    }
});

export default router;
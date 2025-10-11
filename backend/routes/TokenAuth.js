import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authenticateToken } from './Guest/middleware/authmiddleware.js';
dotenv.config();

const secretkey = process.env.JWT_SECRET;
const router = express.Router();

// Middleware to parse cookies
router.use(cookieParser());

router.get('/', (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.json({
            success: false,
            message: 'Token not provided'
        });
        return;
    } else {
        jwt.verify(token, secretkey, (err, decoded) => {
            if (err) {
                res.json({
                    success: false,
                    message: 'Failed to authenticate token'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Token authenticated',
                    username: decoded.username
                });
            }
        });
    }
});



// Token verification endpoint using your existing middleware
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role
    }
  });
});


export default router;



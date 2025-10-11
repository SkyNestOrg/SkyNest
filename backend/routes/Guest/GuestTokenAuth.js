import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const secretkey = process.env.JWT_SECRET;


const router = express.Router();

// Middleware to parse cookies
router.use(cookieParser());

router.get('/', (req, res) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    res.json({
      success: false,
      message: 'Token not provided',
    });
    return;
  }

  jwt.verify(token, secretkey, (err, decoded) => {
    if (err) {
      res.json({
        success: false,
        message: 'Failed to authenticate token',
      });
    } else {
      res.json({
        success: true,
        message: 'Token authenticated',
        username: decoded.username,
      //  role: decoded.role,
      });
    }
  });
});

export default router;

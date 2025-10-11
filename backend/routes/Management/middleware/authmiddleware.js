// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretkey = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  // Check for token in multiple headers
  let token = req.headers['x-access-token'];
  
  // If not found in x-access-token, check Authorization header
  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
 
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token not provided'
    });
  }

  jwt.verify(token, secretkey, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message); // Add logging
      return res.status(403).json({
        success: false,
        message: 'Failed to authenticate token'
      });
    }
   
    req.user = {
      username: decoded.username,
      role: decoded.role,
      branch: decoded.branch  /////////////////think about
    };
   
    next();
  });
};
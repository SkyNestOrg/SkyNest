import express from 'express';
import db from '../../db.js';

const router = express.Router();
router.use(express.json());

// GET /guest/profile/:guest_id - Check if profile exists
router.get('/profile/:guest_id', async (req, res) => {
  try {
    const { guest_id } = req.params;
    
    const [rows] = await db.query(
      'SELECT * FROM guest WHERE guest_id = ?',
      [guest_id]
    );
    
    if (rows.length > 0) {
      res.json({
        exists: true,
        profile: rows[0]
      });
    } else {
      res.json({
        exists: false
      });
    }
  } catch (err) {
    console.error('Error checking profile:', err);
    res.status(500).json({
      message: 'Server error while checking profile',
      error: err.message
    });
  }
});

// POST /guest/profile - Create or update guest profile
router.post('/profile', async (req, res) => {
  try {
    const {
      guest_id,
      first_name,
      last_name,
      email,
      phone_number,
      address,
      passport_number,
      country_of_residence,
      date_of_birth
    } = req.body;

    // Convert date to proper MySQL format (YYYY-MM-DD)
    let formattedDateOfBirth = date_of_birth;
    if (date_of_birth) {
      // If it's a full ISO string, extract just the date part
      if (date_of_birth.includes('T')) {
        formattedDateOfBirth = date_of_birth.split('T')[0];
      }
      // Ensure it's in YYYY-MM-DD format
      const dateObj = new Date(formattedDateOfBirth);
      if (!isNaN(dateObj.getTime())) {
        formattedDateOfBirth = dateObj.toISOString().split('T')[0];
      }
    }

    // Check if profile already exists
    const [existingRows] = await db.query(
      'SELECT * FROM guest WHERE guest_id = ?',
      [guest_id]
    );

    if (existingRows.length > 0) {
      // Update existing profile
      await db.query(
        `UPDATE guest SET 
          first_name = ?, 
          last_name = ?, 
          email = ?, 
          phone_number = ?, 
          address = ?, 
          passport_number = ?, 
          country_of_residence = ?, 
          date_of_birth = ? 
        WHERE guest_id = ?`,
        [
          first_name,
          last_name,
          email,
          phone_number,
          address,
          passport_number,
          country_of_residence,
          formattedDateOfBirth,
          guest_id
        ]
      );
      
      res.json({
        message: 'Profile updated successfully',
        success: true
      });
    } else {
      // Create new profile
      await db.query(
        `INSERT INTO guest 
        (guest_id, first_name, last_name, email, phone_number, address, passport_number, country_of_residence, date_of_birth) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          guest_id,
          first_name,
          last_name,
          email,
          phone_number,
          address,
          passport_number,
          country_of_residence,
          formattedDateOfBirth
        ]
      );
      
      res.json({
        message: 'Profile created successfully',
        success: true
      });
    }
  } catch (err) {
    console.error('Error saving profile:', err);
    
    // Handle duplicate email or passport number
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage.includes('email')) {
        res.status(400).json({
          message: 'Email address already exists',
          success: false
        });
      } else if (err.sqlMessage.includes('passport_number')) {
        res.status(400).json({
          message: 'Passport number already exists',
          success: false
        });
      } else {
        res.status(400).json({
          message: 'Duplicate entry found',
          success: false
        });
      }
    } else {
      res.status(500).json({
        message: 'Server error while saving profile',
        success: false,
        error: err.message
      });
    }
  }
});

export default router;
import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /payment/bill/:booking_id - Get bill details by booking ID
router.get('/bill/:booking_id', async (req, res) => {
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
        const booking_id = req.params.booking_id;

        console.log('Fetching bill for booking:', booking_id, 'branch:', branch_id);

        // Get bill details with booking information
        const [bills] = await db.query(
            `SELECT 
                b.bill_id,
                b.bill_date,
                b.booking_id,
                b.room_total,
                b.service_total,
                b.sub_total,
                b.tax_amount,
                b.grand_total,
                b.due_amount,
                b.bill_status,
                bk.guest_id,
                g.first_name,
                g.last_name,
                g.email
             FROM bill b
             JOIN booking bk ON b.booking_id = bk.booking_id
             JOIN guest g ON bk.guest_id = g.guest_id
             WHERE b.booking_id = ? AND bk.branch_id = ?`,
            [booking_id, branch_id]
        );

        if (bills.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bill found for this booking ID or booking does not belong to your branch'
            });
        }

        const bill = bills[0];

        // Get payment history for this bill
        const [payments] = await db.query(
            `SELECT 
                payment_reference,
                bill_id,
                payment_method,
                paid_amount,
                payment_date
             FROM payment 
             WHERE bill_id = ?
             ORDER BY payment_date DESC`,
            [bill.bill_id]
        );

        res.status(200).json({
            success: true,
            data: {
                ...bill,
                payments: payments
            },
            branch_id: branch_id
        });

    } catch (error) {
        console.error('Error fetching bill:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching bill',
            error: error.message 
        });
    }
});

// POST /payment/pay - Process payment for a bill
router.post('/pay', async (req, res) => {
    let connection;
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

        const {
            booking_id,
            payment_method,
            paid_amount
        } = req.body;

        console.log('Processing payment for booking:', booking_id, 'branch:', branch_id);

        // Validate required fields
        if (!booking_id || !payment_method || !paid_amount) {
            return res.status(400).json({
                success: false,
                message: 'booking_id, payment_method, and paid_amount are required'
            });
        }

        if (paid_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Paid amount must be greater than 0'
            });
        }

        // Get connection for transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Get bill details with branch validation
            const [bills] = await connection.query(
                `SELECT 
                    b.bill_id,
                    b.due_amount,
                    b.grand_total,
                    b.bill_status
                 FROM bill b
                 JOIN booking bk ON b.booking_id = bk.booking_id
                 WHERE b.booking_id = ? AND bk.branch_id = ?
                 FOR UPDATE`,
                [booking_id, branch_id]
            );

            if (bills.length === 0) {
                throw new Error('No bill found for this booking ID or booking does not belong to your branch');
            }

            const bill = bills[0];

            // Check if bill is payable
            if (bill.bill_status === 'Paid') {
                throw new Error('This bill has already been fully paid');
            }

            if (bill.bill_status === 'Cancelled') {
                throw new Error('This bill has been cancelled');
            }

            // Validate payment amount
            if (paid_amount > bill.due_amount) {
                throw new Error(`Payment amount (${paid_amount}) exceeds due amount (${bill.due_amount})`);
            }

            // Insert payment record (payment_reference is auto-increment)
            const [paymentResult] = await connection.query(
                `INSERT INTO payment 
                 (bill_id, payment_method, paid_amount, payment_date)
                 VALUES (?, ?, ?, NOW())`,
                [bill.bill_id, payment_method, paid_amount]
            );

            const payment_id = paymentResult.insertId;

            // Calculate new due amount and update bill
            const new_due_amount = bill.due_amount - paid_amount;
            const new_bill_status = new_due_amount <= 0 ? 'Paid' : 'Pending';

            // Update bill due_amount
            await connection.query(
                `UPDATE bill 
                 SET due_amount = ?, bill_status = ?
                 WHERE bill_id = ?`,
                [new_due_amount, new_bill_status, bill.bill_id]
            );

            // Commit transaction
            await connection.commit();

            // Get updated bill details
            const [updatedBills] = await db.query(
                `SELECT 
                    b.bill_id,
                    b.bill_date,
                    b.booking_id,
                    b.room_total,
                    b.service_total,
                    b.sub_total,
                    b.tax_amount,
                    b.grand_total,
                    b.due_amount,
                    b.bill_status,
                    bk.guest_id,
                    g.first_name,
                    g.last_name
                 FROM bill b
                 JOIN booking bk ON b.booking_id = bk.booking_id
                 JOIN guest g ON bk.guest_id = g.guest_id
                 WHERE b.bill_id = ?`,
                [bill.bill_id]
            );

            // Get payment details with auto-generated payment_reference
            const [paymentDetails] = await db.query(
                `SELECT * FROM payment WHERE payment_reference = ?`,
                [payment_id]
            );

            res.status(201).json({
                success: true,
                message: `Payment processed successfully. ${new_bill_status === 'Paid' ? 'Bill fully paid.' : 'Partial payment received.'}`,
                data: {
                    bill: updatedBills[0],
                    payment: paymentDetails[0]
                },
                payment_id: payment_id,
                bill_id: bill.bill_id
            });

        } catch (error) {
            // Rollback transaction in case of error
            if (connection) {
                await connection.rollback();
            }
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }

    } catch (error) {
        console.error('Error processing payment:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error while processing payment',
            error: error.message 
        });
    }
});

// GET /payment/history/:bill_id - Get payment history for a bill
router.get('/history/:bill_id', async (req, res) => {
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
        const bill_id = req.params.bill_id;

        // Verify bill belongs to staff's branch
        const [bills] = await db.query(
            `SELECT b.bill_id 
             FROM bill b
             JOIN booking bk ON b.booking_id = bk.booking_id
             WHERE b.bill_id = ? AND bk.branch_id = ?`,
            [bill_id, branch_id]
        );

        if (bills.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found or does not belong to your branch'
            });
        }

        const [payments] = await db.query(
            `SELECT 
                payment_reference,
                bill_id,
                payment_method,
                paid_amount,
                payment_date
             FROM payment 
             WHERE bill_id = ?
             ORDER BY payment_date DESC`,
            [bill_id]
        );

        res.status(200).json({
            success: true,
            data: payments,
            count: payments.length
        });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching payment history',
            error: error.message 
        });
    }
});

export default router;
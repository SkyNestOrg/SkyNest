import express from "express";
import db from "../../db.js";

const router = express.Router();

// ADD THIS NEW ROUTE BEFORE YOUR EXISTING router.post("/", ...)
router.get("/check-user/:guest_id", async (req, res) => {
  try {
    const { guest_id } = req.params;

    if (!guest_id) {
      return res.status(400).json({ exists: false, message: "Guest ID is required" });
    }

    // Check if guest exists in the database
    const [rows] = await db.execute(
      "SELECT guest_id FROM guest WHERE guest_id = ?",
      [guest_id]
    );

    if (rows.length === 0) {
      return res.json({ exists: false, message: "User not found" });
    }

    res.json({ exists: true, message: "User exists" });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ exists: false, message: "Internal server error" });
  }
});



router.post("/", async (req, res) => {
  try {
    const {
      guest_id,
      branch_name,
      number_of_pax,
      checkin_date,
      checkout_date,
      room_requests
    } = req.body;

    if (!guest_id || !branch_name || !number_of_pax || !checkin_date || !checkout_date || !room_requests) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!Array.isArray(room_requests) || room_requests.length === 0) {
      return res.status(400).json({ success: false, message: "room_requests must be a non-empty array" });
    }

    const checkin = new Date(checkin_date);
    const checkout = new Date(checkout_date);

    if (checkin >= checkout) {
      return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
    }

    // Lookup branch_id
    const [branchRows] = await db.execute(
      "SELECT branch_id FROM branch WHERE branch_name = ? LIMIT 1",
      [branch_name]
    );
    if (branchRows.length === 0) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    const branch_id = branchRows[0].branch_id;

    // 🔹 Check total capacity
    let totalCapacity = 0;

    for (const reqRoom of room_requests) {
      const [rows] = await db.execute(
        "SELECT capacity FROM roomtype WHERE type_name = ? LIMIT 1",
        [reqRoom.room_type]
      );

      if (rows.length === 0) {
        return res.status(400).json({ success: false, message: `Invalid room type: ${reqRoom.room_type}` });
      }

      const roomCapacity = rows[0].capacity;
      totalCapacity += roomCapacity * reqRoom.quantity;
    }

    if (totalCapacity < number_of_pax) {
      return res.status(400).json({
        success: false,
        message: `Not enough room capacity. Max capacity: ${totalCapacity}, Guests entered: ${number_of_pax}`
      });
    }

    // --- If capacity is fine, proceed with stored procedure ---
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
    };

    const formattedCheckin = formatDate(checkin_date);
    const formattedCheckout = formatDate(checkout_date);
    const formattedBookingDate = formatDate(new Date());

    const callQuery = `
      SET @p_result_message = '';
      SET @p_booking_id = 0;
      CALL CreateBookingAtomic(?, ?, ?, ?, ?, ?, ?, @p_result_message, @p_booking_id);
      SELECT @p_result_message AS result_message, @p_booking_id AS booking_id;
    `;

    const inParams = [
      guest_id,
      formattedBookingDate,
      branch_id,
      number_of_pax,
      formattedCheckin,
      formattedCheckout,
      JSON.stringify(room_requests)
    ];

    const [results] = await db.query(callQuery, inParams);
    const outRow = results[results.length - 1][0];

    res.json({
      success: true,
      message: outRow.result_message || "Booking created successfully",
      data: {
        bookingId: outRow.booking_id,
        branch_name,
        checkin_date: formattedCheckin,
        checkout_date: formattedCheckout
      }
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

export default router;
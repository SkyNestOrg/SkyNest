-- function to calculate room_total for a given booking, return room_total

DELIMITER //

CREATE FUNCTION CalculateRoomTotal(p_booking_id INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_price DECIMAL(10,2);
    
    SELECT COALESCE(SUM(rt.base_price * DATEDIFF(br.check_out, br.check_in)), 0) INTO total_price
    FROM booking b
    INNER JOIN booked_room br ON b.booking_id = br.booking_id
    INNER JOIN room r ON br.room_number = r.room_number
    INNER JOIN roomtype rt ON r.room_type = rt.type_name
    WHERE b.booking_id = p_booking_id
    AND br.status != 'Cancelled';
    
    RETURN total_price;
END//

-- --------------------------------------------------------------------------------------------------------------
-- function returning net_room_total after discounts

CREATE FUNCTION CalculateNetRoomTotal(p_booking_id INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_room_total DECIMAL(10,2);
    DECLARE v_check_in DATE;
    DECLARE v_branch_id INT;
    DECLARE v_discount_percentage DECIMAL(5,2) DEFAULT 0;
    DECLARE v_tax_percentage DECIMAL(5,2) DEFAULT 0;
    DECLARE v_discounted_amount DECIMAL(10,2);
    
    -- Get room total, check_in date, and branch_id
    SELECT CalculateRoomTotal(p_booking_id), br.check_in, b.branch_id 
    INTO v_room_total, v_check_in, v_branch_id
    FROM booking b 
    JOIN booked_room br ON b.booking_id = br.booking_id
    WHERE b.booking_id = p_booking_id
    LIMIT 1;
    
    -- If no booking found, return 0
    IF v_check_in IS NULL THEN
        RETURN 0.00;
    END IF;
    
    -- Get applicable discount percentage
    SELECT COALESCE(MAX(d.percentage), 0) INTO v_discount_percentage
    FROM discount d
    WHERE d.branch_id = v_branch_id
    AND d.start_date <= v_check_in
    AND d.end_date >= v_check_in;
    
    -- Calculate discounted amount
    SET v_discounted_amount = v_room_total * (v_discount_percentage / 100);
    
    -- Return net room total (room total - discount)
    RETURN v_room_total - v_discounted_amount;
END//

-- ---------------------------------------------------------------------------------------------------------------
-- function returning tax_amount
CREATE FUNCTION CalculateTaxAmount(p_booking_id INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_net_room_total DECIMAL(10,2);
    DECLARE v_check_in DATE;
    DECLARE v_tax_percentage DECIMAL(5,2) DEFAULT 0;
    
    -- Get net room total and check_in date
    SELECT CalculateNetRoomTotal(p_booking_id), br.check_in INTO v_net_room_total, v_check_in
    FROM booking b 
    JOIN booked_room br ON b.booking_id = br.booking_id
    WHERE b.booking_id = p_booking_id
    LIMIT 1;
    
    -- If no booking found, return 0
    IF v_check_in IS NULL THEN
        RETURN 0.00;
    END IF;
    
    -- Get tax percentage
    SELECT COALESCE(tc.latest_tax_percentage, 0) INTO v_tax_percentage
    FROM taxes_and_charges tc
    WHERE tc.revision_date <= v_check_in
    ORDER BY tc.revision_date DESC
    LIMIT 1;
    
    -- Calculate tax amount
    RETURN v_net_room_total * (v_tax_percentage / 100);
END//


-- ---------------------------------------------------------------------------------------------------------------
-- functions required for report 1

CREATE FUNCTION GetTotalRooms() 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_count INT;
    SELECT COUNT(*) INTO total_count FROM room;
    RETURN total_count;
END//

CREATE FUNCTION GetTotalRoomsByBranch(branch_id_param INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_count INT;
    SELECT COUNT(*) INTO total_count FROM room WHERE branch_id = branch_id_param;
    RETURN total_count;
END//


CREATE FUNCTION GetOccupiedRoomsCount() 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE occupied_count INT;
    SELECT COUNT(*) INTO occupied_count FROM room WHERE current_status = 'Occupied';
    RETURN occupied_count;
END//



CREATE FUNCTION GetAvailableRoomsCount() 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE available_count INT;
    SELECT COUNT(*) INTO available_count FROM room WHERE current_status = 'Available';
    RETURN available_count;
END//






CREATE FUNCTION GetOccupiedRoomsByBranch(branch_id_param INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE occupied_count INT;
    SELECT COUNT(*) INTO occupied_count FROM room WHERE branch_id = branch_id_param AND current_status = 'Occupied';
    RETURN occupied_count;
END//



CREATE FUNCTION GetAvailableRoomsByBranch(branch_id_param INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE available_count INT;
    SELECT COUNT(*) INTO available_count FROM room WHERE branch_id = branch_id_param AND current_status = 'Available';
    RETURN available_count;
END//


CREATE FUNCTION GetOccupiedRoomsByDateRange(start_date DATE, end_date DATE) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE occupied_count INT;
    
    SELECT COUNT(DISTINCT room_number) INTO occupied_count
    FROM booked_room
    WHERE status != 'Cancelled'
    AND (
        (check_in BETWEEN start_date AND end_date) OR
        (check_out BETWEEN start_date AND end_date) OR
        (check_in <= start_date AND check_out >= end_date)
    );
    
    RETURN occupied_count;
END//



CREATE FUNCTION GetAvailableRoomsByDateRange(start_date DATE, end_date DATE) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE available_count INT;
    
    SELECT COUNT(*) INTO available_count
    FROM room r
    WHERE r.room_number NOT IN (
        SELECT DISTINCT br.room_number
        FROM booked_room br
        WHERE br.status != 'Cancelled'
        AND (
            (br.check_in BETWEEN start_date AND end_date) OR
            (br.check_out BETWEEN start_date AND end_date) OR
            (br.check_in <= start_date AND br.check_out >= end_date)
        )
    );
    
    RETURN available_count;
END//



CREATE FUNCTION GetOccupiedRoomsByDateRangeAndBranch(start_date DATE, end_date DATE, branch_id_param INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE occupied_count INT;
    
    SELECT COUNT(DISTINCT room_number) INTO occupied_count
    FROM booked_room
    WHERE branch_id = branch_id_param
    AND status != 'Cancelled'
    AND (
        (check_in BETWEEN start_date AND end_date) OR
        (check_out BETWEEN start_date AND end_date) OR
        (check_in <= start_date AND check_out >= end_date)
    );
    
    RETURN occupied_count;
END//



CREATE FUNCTION GetAvailableRoomsByDateRangeAndBranch(start_date DATE, end_date DATE, branch_id_param INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE available_count INT;
    
    SELECT COUNT(*) INTO available_count
    FROM room r
    WHERE r.branch_id = branch_id_param
    AND r.room_number NOT IN (
        SELECT DISTINCT br.room_number
        FROM booked_room br
        WHERE br.branch_id = branch_id_param
        AND br.status != 'Cancelled'
        AND (
            (br.check_in BETWEEN start_date AND end_date) OR
            (br.check_out BETWEEN start_date AND end_date) OR
            (br.check_in <= start_date AND br.check_out >= end_date)
        )
    );
    
    RETURN available_count;
END//


-- -----------------------------------------------------------------------------------------------------------------
-- functions required for report 2

CREATE FUNCTION GetTotalPaidForCheckedIn() 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_paid DECIMAL(10,2);
    SELECT SUM(grand_total - due_amount) INTO total_paid FROM bill WHERE bill_status = 'Pending';
    RETURN COALESCE(total_paid, 0.00);
END//



CREATE FUNCTION GetTotalDueForCheckedIn() 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_due DECIMAL(10,2);
    SELECT SUM(due_amount) INTO total_due FROM bill WHERE bill_status = 'Pending';
    RETURN COALESCE(total_due, 0.00);
END//



CREATE FUNCTION GetTotalTaxPaidForCheckedIn() 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_tax DECIMAL(10,2);
    SELECT SUM(tax_amount) INTO total_tax FROM bill WHERE bill_status = 'Pending';
    RETURN COALESCE(total_tax, 0.00);
END//



CREATE FUNCTION GetTotalPaidForCheckedInByBranch(branch_id_param INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_paid DECIMAL(10,2);
    
    SELECT SUM(b.grand_total - b.due_amount) INTO total_paid
    FROM bill b
    INNER JOIN booking bk ON b.booking_id = bk.booking_id
    WHERE b.bill_status = 'Pending'
    AND bk.branch_id = branch_id_param;
    
    RETURN COALESCE(total_paid, 0.00);
END//


CREATE FUNCTION GetTotalDueForCheckedInByBranch(branch_id_param INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_due DECIMAL(10,2);
    
    SELECT SUM(b.due_amount) INTO total_due
    FROM bill b
    INNER JOIN booking bk ON b.booking_id = bk.booking_id
    WHERE b.bill_status = 'Pending'
    AND bk.branch_id = branch_id_param;
    
    RETURN COALESCE(total_due, 0.00);
END//


CREATE FUNCTION GetTotalGrandTotalForCheckedInByBranch(branch_id_param INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_grand DECIMAL(10,2);
    
    SELECT SUM(b.grand_total) INTO total_grand
    FROM bill b
    INNER JOIN booking bk ON b.booking_id = bk.booking_id
    WHERE b.bill_status = 'Pending'
    AND bk.branch_id = branch_id_param;
    
    RETURN COALESCE(total_grand, 0.00);
END//



CREATE FUNCTION GetTotalTaxPaidForCheckedInByBranch(branch_id_param INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_tax DECIMAL(10,2);
    
    SELECT SUM(b.tax_amount) INTO total_tax
    FROM bill b
    INNER JOIN booking bk ON b.booking_id = bk.booking_id
    WHERE b.bill_status = 'Pending'
    AND bk.branch_id = branch_id_param;
    
    RETURN COALESCE(total_tax, 0.00);
END//



-- -----------------------------------------------------------------------------------------------------------
-- functions for report 3

CREATE FUNCTION CalculateServiceCharges(
    p_room_number VARCHAR(10),
    p_service_type VARCHAR(100),
    p_start_date DATE,
    p_end_date DATE
) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_charges DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(s.unit_quantity_charges * sr.quantity), 0)
    INTO total_charges
    FROM service_request sr
    JOIN service s ON sr.request_type = s.service_type 
                   AND sr.branch_id = s.branch_id
    JOIN booked_room br ON sr.booking_id = br.booking_id 
    JOIN room r ON br.room_number = r.room_number
    WHERE r.room_number = p_room_number
      AND sr.request_type = p_service_type
      AND DATE(sr.date_time) BETWEEN p_start_date AND p_end_date
      AND sr.status = 'Completed';
    
    RETURN total_charges;
END//



-- -------------------------------------------------------------------------------------------------------------
-- for report 4

CREATE FUNCTION GetRoomTotalByBranchAndMonth(branch_id_param INT, month_param INT, year_param INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_room DECIMAL(10,2);
    
    SELECT COALESCE(SUM(b.room_total), 0) INTO total_room
    FROM bill b
    INNER JOIN booking bk ON b.booking_id = bk.booking_id
    WHERE bk.branch_id = branch_id_param
    AND MONTH(b.bill_date) = month_param
    AND YEAR(b.bill_date) = year_param;
    
    RETURN total_room;
END//


CREATE FUNCTION GetServiceTotalByBranchAndMonth(branch_id_param INT, month_param INT, year_param INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_service DECIMAL(10,2);
    
    SELECT COALESCE(SUM(b.service_total), 0) INTO total_service
    FROM bill b
    INNER JOIN booking bk ON b.booking_id = bk.booking_id
    WHERE bk.branch_id = branch_id_param
    AND MONTH(b.bill_date) = month_param
    AND YEAR(b.bill_date) = year_param;
    
    RETURN total_service;
END//




DELIMITER ;

-- --------------------------------------------------------------------
-- --------------------------------------------------------------------

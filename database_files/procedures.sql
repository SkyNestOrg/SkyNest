-- procedure 1

DELIMITER //

CREATE PROCEDURE CreateBookingAtomic(
    IN p_guest_id INT,
    IN p_booking_date DATETIME,
    IN p_branch_id INT,
    IN p_number_of_pax INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_room_requests JSON,  -- JSON array: [{room_type, quantity}, ...]
    OUT p_result_message VARCHAR(255),
    OUT p_booking_id INT
)
proc_main: BEGIN
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_room_type VARCHAR(50);
    DECLARE v_quantity INT;
    DECLARE v_available INT;
    DECLARE v_total_rooms INT DEFAULT 0;

    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result_message = 'Unexpected database error';
        SET p_booking_id = NULL;
    END;

    START TRANSACTION;

    -- Count how many requests
    SET v_count = JSON_LENGTH(p_room_requests);

    IF v_count = 0 THEN
        ROLLBACK;
        SET p_result_message = 'No room requests provided';
        SET p_booking_id = NULL;
        LEAVE proc_main;
    END IF;

    -- Step 1: Check availability for all requests
    room_check_loop: WHILE v_index < v_count DO
        SET v_room_type = JSON_UNQUOTE(JSON_EXTRACT(p_room_requests, CONCAT('$[', v_index, '].room_type')));
        SET v_quantity  = JSON_UNQUOTE(JSON_EXTRACT(p_room_requests, CONCAT('$[', v_index, '].quantity')));

        SET v_total_rooms = v_total_rooms + v_quantity;

        SELECT COUNT(*) INTO v_available
        FROM room r
        WHERE r.branch_id = p_branch_id
          AND r.room_type = v_room_type
          AND r.current_status = 'Available'
          AND r.room_number NOT IN (
              SELECT br.room_number
              FROM booked_room br
              WHERE br.branch_id = p_branch_id
                AND br.status NOT IN ('Cancelled', 'CheckedOut')
                AND (p_check_in < br.check_out AND p_check_out > br.check_in)
          )
        FOR UPDATE;

        IF v_available < v_quantity THEN
            ROLLBACK;
            SET p_result_message = CONCAT('Not enough ', v_room_type,
                                          ' rooms. Required: ', v_quantity,
                                          ', Available: ', v_available);
            SET p_booking_id = NULL;
            LEAVE proc_main;
        END IF;

        SET v_index = v_index + 1;
    END WHILE;

    -- Step 2: Insert booking record
    INSERT INTO booking (guest_id, booking_date, branch_id, number_of_rooms, number_of_pax, status)
    VALUES (p_guest_id, p_booking_date, p_branch_id, v_total_rooms, p_number_of_pax, 'Confirmed');

    SET p_booking_id = LAST_INSERT_ID();

    -- Step 3: Assign rooms
    SET v_index = 0;
    room_assign_loop: WHILE v_index < v_count DO
        SET v_room_type = JSON_UNQUOTE(JSON_EXTRACT(p_room_requests, CONCAT('$[', v_index, '].room_type')));
        SET v_quantity  = JSON_UNQUOTE(JSON_EXTRACT(p_room_requests, CONCAT('$[', v_index, '].quantity')));

        INSERT INTO booked_room (room_number, booking_id, branch_id, check_in, check_out, status)
        SELECT r.room_number, p_booking_id, p_branch_id, p_check_in, p_check_out, 'Confirmed'
        FROM room r
        WHERE r.branch_id = p_branch_id
          AND r.room_type = v_room_type
          AND r.current_status = 'Available'
          AND r.room_number NOT IN (
              SELECT br.room_number
              FROM booked_room br
              WHERE br.branch_id = p_branch_id
                AND br.status NOT IN ('Cancelled', 'CheckedOut')
                AND (p_check_in < br.check_out AND p_check_out > br.check_in)
          )
        LIMIT v_quantity;

        -- UPDATE room r
        -- JOIN booked_room br ON r.room_number = br.room_number AND r.branch_id = br.branch_id
        -- SET r.current_status = 'Confirmed'
        -- WHERE br.booking_id = p_booking_id
        --   AND br.branch_id = p_branch_id;

        SET v_index = v_index + 1;
    END WHILE;

    COMMIT;
    SET p_result_message = CONCAT('Booking successful. Booking ID: ', p_booking_id);
END //

DELIMITER ;

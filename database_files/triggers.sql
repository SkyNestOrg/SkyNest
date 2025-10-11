-- Trigger 1: Update room status to 'Occupied' when booked_room status becomes 'CheckedIn'
DELIMITER $$

CREATE TRIGGER after_booked_room_checkedin
AFTER UPDATE ON booked_room
FOR EACH ROW
BEGIN
    IF NEW.status = 'CheckedIn' AND (OLD.status IS NULL OR OLD.status != 'CheckedIn') THEN
        UPDATE room 
        SET current_status = 'Occupied' 
        WHERE room_number = NEW.room_number AND branch_id = NEW.branch_id;
    END IF;
END$$

DELIMITER ;


-- Trigger 2/a: Update room status to 'Available' when booked_room status becomes 'CheckedOut'
DELIMITER $$

CREATE TRIGGER after_booked_room_checkedout
AFTER UPDATE ON booked_room
FOR EACH ROW
BEGIN
    IF NEW.status = 'CheckedOut' AND (OLD.status IS NULL OR OLD.status != 'CheckedOut') THEN
        UPDATE room 
        SET current_status = 'Available' 
        WHERE room_number = NEW.room_number AND branch_id = NEW.branch_id;
    END IF;
END$$

DELIMITER ;


-- Trigger 2/b: Update room status to 'Available' when booked_room status becomes 'Cancelled'
DELIMITER $$

CREATE TRIGGER after_booked_room_checkedout
AFTER UPDATE ON booked_room
FOR EACH ROW
BEGIN
    IF NEW.status = 'CheckedOut' AND (OLD.status IS NULL OR OLD.status != 'CheckedOut') THEN
        UPDATE room 
        SET current_status = 'Available' 
        WHERE room_number = NEW.room_number AND branch_id = NEW.branch_id;
    END IF;
END$$

DELIMITER ;



--Trigger 3: When booking status = 'Cancelled' Booked_rooms also change to cancelled state.

DELIMITER //

CREATE TRIGGER after_booking_cancelled
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
        UPDATE booked_room 
        SET status = 'Cancelled'
        WHERE booking_id = NEW.booking_id;
    END IF;
END;
//

DELIMITER ;

--Trigger 4: When booking status = 'Checkedin' Booked_rooms also change to checked in state.

DELIMITER //

CREATE TRIGGER after_booking_checkedin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.status = 'CheckedIn' AND OLD.status != 'CheckedIn' THEN
        UPDATE booked_room 
        SET status = 'CheckedIn'
        WHERE booking_id = NEW.booking_id;
    END IF;
END;
//

DELIMITER ;

--Trigger 5: When booking status = 'Checkedout' Booked_rooms also change to checkedout state.
DELIMITER //

CREATE TRIGGER after_booking_checkedout
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.status = 'CheckedOut' AND OLD.status != 'CheckedOut' THEN
        UPDATE booked_room 
        SET status = 'CheckedOut'
        WHERE booking_id = NEW.booking_id;
    END IF;
END;
//

DELIMITER ;

-- Trigger 6: Create Bill when booking status = 'CheckedIn'
DELIMITER //

CREATE TRIGGER initialize_bill_on_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.status = 'CheckedIn' AND OLD.status != 'CheckedIn' THEN
        -- Insert a new bill record when booking is confirmed
        INSERT INTO Bill (bill_date, booking_id,room_total, service_total,tax_amount,due_amount ,bill_status)
        VALUES (DATE(NOW()), NEW.booking_id, 0.00,0.00,0.00,0.00, 'Pending');
    END IF;
END;
//

DELIMITER ;
-----------------------------------------------
-- Trigger 6: Create Bill when booking status = 'CheckedIn' - more sophisticated
DELIMITER //

CREATE TRIGGER initialize_bill_on_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE v_room_total DECIMAL(10,2);
    DECLARE v_tax_amount DECIMAL(10,2);
    DECLARE v_grand_total DECIMAL(10,2);
    
    IF NEW.status = 'CheckedIn' AND OLD.status != 'CheckedIn' THEN
        -- Calculate room total and tax amount using your functions
        SET v_room_total = CalculateNetRoomTotal(NEW.booking_id);
        SET v_tax_amount = CalculateTaxAmount(NEW.booking_id);
        SET v_grand_total = v_room_total + v_tax_amount;
        
        -- Insert a new bill record with calculated amounts
        INSERT INTO Bill (
            bill_date, 
            booking_id,
            room_total, 
            service_total,
            tax_amount,
            due_amount,
            bill_status
        )
        VALUES (
            DATE(NOW()), 
            NEW.booking_id, 
            v_room_total,
            0.00,
            v_tax_amount,
            v_grand_total,  -- due_amount = grand_total initially
            'Pending'
        );
    END IF;
END;
//

DELIMITER ;

-------------------------------------------------

DELIMITER //

CREATE TRIGGER update_bill_service_total 
AFTER UPDATE ON service_request
FOR EACH ROW
BEGIN
    DECLARE service_charge DECIMAL(10,2);
    DECLARE current_service_total DECIMAL(10,2);
    
    -- Check if status changed to 'Completed'
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        
        -- Calculate the service charge for this completed service
        SELECT unit_quantity_charges INTO service_charge, booking_id
        FROM service join on service.service_type  = service_request.request_type
        join on bill.booking_id = service_request.booking_id
        WHERE service_type = NEW.request_type 
        AND branch_id = NEW.branch_id;
        
        -- If service charge found, update the bill
        IF service_charge IS NOT NULL THEN
            -- Get current service_total from bill
            SELECT service_total INTO current_service_total
            FROM bill 
            WHERE booking_id = NEW.booking_id;
            
            -- If bill exists, update it
            IF current_service_total IS NOT NULL THEN
                UPDATE bill 
                SET service_total = service_total + (service_charge * NEW.quantity),
                    sub_total = room_total + (service_total + (service_charge * NEW.quantity)),
                    grand_total = sub_total + tax_amount,
                    
                WHERE booking_id = NEW.booking_id;
            END IF;
        END IF;
    END IF;
END//

DELIMITER ;


------------------------------------------------------------------------
--error handling in bill status = (paid with >0 due_amount)

DELIMITER //

CREATE TRIGGER update_bill_status_on_due_amount
BEFORE UPDATE ON bill
FOR EACH ROW
BEGIN
    -- Check if due_amount is being updated and becomes greater than 0
    IF NEW.due_amount > 0 AND (OLD.due_amount <= 0 OR OLD.due_amount IS NULL) THEN
        SET NEW.bill_status = 'Pending';
    END IF;
END//

DELIMITER ;


-- Database Schema for Hotel Management System - CORRECTED VERSION

CREATE TABLE `Branch` (
  `branch_id` INT AUTO_INCREMENT,
  `branch_name` VARCHAR(25) NOT NULL,
  `address` VARCHAR(75) NOT NULL,
  `city` VARCHAR(25) NOT NULL,
  `contact_number` CHAR(10) NOT NULL,
  PRIMARY KEY (`branch_id`)
);

CREATE TABLE `Staff_User` (
  `username` VARCHAR(20),
  `password` VARCHAR(255),
  `official_role` VARCHAR(20) NOT NULL,
  `branch_id` INT NOT NULL,
  PRIMARY KEY (`username`),
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`branch_id`)
);

CREATE TABLE `staff_logs` (
  `log_id` INT AUTO_INCREMENT,
  `username` VARCHAR(20) NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(50),
  PRIMARY KEY (`log_id`),
  FOREIGN KEY (`username`) REFERENCES `Staff_User`(`username`)
);

CREATE TABLE `Guest` (
  `guest_id` INT AUTO_INCREMENT,
  `first_name` VARCHAR(20) NOT NULL,
  `last_name` VARCHAR(20) NOT NULL,
  `email` VARCHAR(50) UNIQUE NOT NULL,
  `phone_number` VARCHAR(15),
  `address` VARCHAR(75),
  `passport_number` VARCHAR(25) UNIQUE,
  `country_of_residence` VARCHAR(25),
  `date_of_birth` DATE,
  PRIMARY KEY (`guest_id`)
);

CREATE TABLE Guest_User (
    `guest_id` INT AUTO_INCREMENT,
    `username` VARCHAR(20) UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`guest_id`)
);

CREATE TABLE `RoomType` (
  `type_name` VARCHAR(20),
  `base_price` NUMERIC(9,2) NOT NULL,
  `amenities` TEXT,
  `capacity` INT NOT NULL,
  PRIMARY KEY (`type_name`)
);

CREATE TABLE `Room` (
  `room_number` INT,
  `current_status` VARCHAR(20) DEFAULT 'Available',
  `room_type` VARCHAR(20) NOT NULL,
  `branch_id` INT NOT NULL,
  PRIMARY KEY (`room_number`),
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`branch_id`),
  FOREIGN KEY (`room_type`) REFERENCES `RoomType`(`type_name`),
  -- ADDED: Unique constraint for the composite foreign key
  UNIQUE KEY `unique_room_branch` (`room_number`, `branch_id`)
);

CREATE TABLE `Booking` (
  `booking_id` INT AUTO_INCREMENT,
  `guest_id` INT NOT NULL,
  `booking_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `branch_id` INT NOT NULL,
  `number_of_rooms` INT NOT NULL,
  `number_of_pax` INT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Confirmed',
  PRIMARY KEY (`booking_id`),
  FOREIGN KEY (`guest_id`) REFERENCES `Guest`(`guest_id`),
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`branch_id`)
);

CREATE TABLE `Booked_Room` (
  `room_number` INT,
  `booking_id` INT,
  `branch_id` INT NOT NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Booked',
  PRIMARY KEY (`room_number`, `booking_id`),
  FOREIGN KEY (`room_number`) REFERENCES `Room`(`room_number`),
  FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`),
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`branch_id`),
  -- CORRECTED: Now references the unique constraint
  FOREIGN KEY (`room_number`, `branch_id`) REFERENCES `Room`(`room_number`, `branch_id`),
  CONSTRAINT chk_checkout_after_checkin CHECK (`check_out` > `check_in`)
);

CREATE TABLE `Bill` (
  `bill_id` INT AUTO_INCREMENT,
  `bill_date` DATE DEFAULT (CURRENT_DATE),
  `booking_id` INT NOT NULL,
  `room_total` NUMERIC(11,2) DEFAULT 0,
  `service_total` NUMERIC(11,2) DEFAULT 0,
  `sub_total` NUMERIC(11,2) GENERATED ALWAYS AS (`room_total` + `service_total`) STORED,
  `tax_amount` NUMERIC(11,2) DEFAULT 0,
  `grand_total` NUMERIC(11,2) GENERATED ALWAYS AS (`sub_total` + `tax_amount`) STORED,
  `due_amount` NUMERIC(11,2) DEFAULT 0,
  `bill_status` VARCHAR(10) DEFAULT 'Pending',
  PRIMARY KEY (`bill_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`)
);

CREATE TABLE `Payment` (
  `payment_reference` INT AUTO_INCREMENT,
  `bill_id` INT NOT NULL,
  `payment_method` VARCHAR(20),
  `paid_amount` NUMERIC(11,2) NOT NULL,
  `payment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_reference`),
  FOREIGN KEY (`bill_id`) REFERENCES `Bill`(`bill_id`)
);

CREATE TABLE `Service` (
  `service_type` VARCHAR(40),
  `unit_quantity_charges` NUMERIC(7,2) NOT NULL,
  `branch_id` INT NOT NULL,
  `availability` VARCHAR(10) DEFAULT 'Available',
  PRIMARY KEY (`service_type`, `branch_id`),
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`branch_id`)
);

CREATE TABLE `Service_Request` (
  `service_request_id` INT AUTO_INCREMENT,
  `request_type` VARCHAR(40) NOT NULL,
  `date_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `booking_id` INT NOT NULL,
  `room_number` INT NOT NULL,
  `status` VARCHAR(15) DEFAULT 'Pending',
  `quantity` INT DEFAULT 1,
  `branch_id` INT NOT NULL,
  PRIMARY KEY (`service_request_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`),
  FOREIGN KEY (`room_number`) REFERENCES `Room`(`room_number`),
  FOREIGN KEY (`request_type`, `branch_id`) REFERENCES `Service`(`service_type`, `branch_id`)
);

CREATE TABLE `Discount` (
  `discount_id` INT AUTO_INCREMENT,
  `percentage` INT NOT NULL,
  `branch_id` INT NOT NULL,
  `room_type` VARCHAR(20),
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  PRIMARY KEY (`discount_id`),
  FOREIGN KEY (`branch_id`) REFERENCES `Branch`(`branch_id`),
  FOREIGN KEY (`room_type`) REFERENCES `RoomType`(`type_name`),
  CONSTRAINT chk_discount_dates CHECK (`end_date` > `start_date`),
  CONSTRAINT chk_percentage CHECK (`percentage` BETWEEN 1 AND 100)
);

CREATE TABLE `Taxes_and_Charges` ( 
  `revision_id` INT NOT NULL AUTO_INCREMENT,
  `revision_date` DATE NOT NULL unique,
  `latest_tax_percentage` INT NOT NULL,
  `latest_surcharge_percentage` INT NOT NULL,
  PRIMARY KEY (`revision_id`),
  CONSTRAINT chk_tax CHECK (`latest_tax_percentage` BETWEEN 0 AND 100),
  CONSTRAINT chk_surcharge CHECK (`latest_surcharge_percentage` BETWEEN 0 AND 100)
);

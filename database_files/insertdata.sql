-- insert data for tables


-- insert the required RoomType data
INSERT INTO roomtype (type_name, base_price, amenities, capacity) VALUES
('Budget', 13500.00, 'Family Bed, WiFi, Air Conditioning, TV (50°), Mini-Fridge, Desk, Wardrobe, In-room Safe, Free Toiletries', 5),
('Deluxe', 12000.00, 'King Bed, High-Speed WiFi, Air Conditioning, Smart TV (55°) with Streaming, Private Bathroom with Bathtub and Shower, Premium Mini-Bar, Espresso Machine, Sitting Area, Wardrobe, In-room Safe, Robe, Slippers, Premium Toiletries, Hair Dryer, Iron, Ironing Board', 4),
('Double', 7500.00, 'Double Bed, WiFi, Air Conditioning, TV (43°), Private Bathroom with Bathtub/Shower, Mini-Fridge, Desk, Wardrobe, In-room Safe, Free Toiletries, Hair Dryer', 2),
('Single', 5000.00, 'Single Bed, WiFi, Air Conditioning, TV (32°), Private Bathroom with Shower, Desk, Wardrobe, Free Toiletries', 1),
('Suite', 20000.00, 'King Bed, Ultra High-Speed WiFi, Climate Control AC, Smart TV (65°) + Second TV, Private Bathroom with Jacuzzi and Rain Shower, Separate Living Room, Kitchenette (sink, microwave, Nespresso machine), Dining Table, Stocked Premium Mini-Bar, Work Office Area', 4);



-- branches
INSERT INTO `Branch` (`branch_id`, `branch_name`, `address`, `city`, `contact_number`) VALUES
(1, 'SkyNest Urban', '123 Galle Face', 'Colombo 01', '0112345678'),
(2, 'SkyNest Coast', '456 Galle Road', 'Galle', '0912345679'),
(3, 'SkyNest Hills', '789 Colombo Road', 'Kandy', '0812345680');




-- services
INSERT INTO service(service_type, unit_quantity_charges, branch_id, availability) VALUES
-- Branch 1
('Airport Drop', 9700.00, 1, 'No'),
('In-Room Entertainment', 6000.00, 1, 'Yes'),
('Laundry - extra', 4800.00, 1, 'No'),
('Laundry - regular', 2500.00, 1, 'Yes'),
('minibar - extra', 6500.00, 1, 'No'),
('minibar - premium', 9500.00, 1, 'Yes'),
('minibar - regular', 3800.00, 1, 'Yes'),
('Room Service - Premium', 8500.00, 1, 'Yes'),
('Room Service - regular', 4500.00, 1, 'Yes'),
('spa and wellness - extra', 18000.00, 1, 'Yes'),
('spa and wellness - regular', 12000.00, 1, 'Yes'),
('wifi - upgrade', 3500.00, 1, 'Yes'),

-- Branch 2
('In-Room Entertainment', 6500.00, 2, 'Yes'),
('Laundry - extra', 5200.00, 2, 'Yes'),
('Laundry - regular', 2700.00, 2, 'Yes'),
('minibar - extra', 6800.00, 2, 'Yes'),
('minibar - premium', 9800.00, 2, 'No'),
('minibar - regular', 4000.00, 2, 'Yes'),
('Room Service - Premium', 9000.00, 2, 'No'),
('Room Service - regular', 4800.00, 2, 'Yes'),
('spa and wellness - extra', 18500.00, 2, 'No'),
('spa and wellness - regular', 12500.00, 2, 'Yes'),
('wifi - upgrade', 3800.00, 2, 'Yes'),

-- Branch 3
('In-Room Entertainment', 6200.00, 3, 'Yes'),
('Laundry - extra', 5000.00, 3, 'Yes'),
('Laundry - regular', 2600.00, 3, 'No'),
('minibar - extra', 6700.00, 3, 'Yes'),
('minibar - premium', 9700.00, 3, 'Yes'),
('minibar - regular', 3900.00, 3, 'Yes'),
('Room Service - Premium', 8800.00, 3, 'Yes'),
('Room Service - regular', 4600.00, 3, 'Yes'),
('spa and wellness - extra', 18200.00, 3, 'Yes'),
('spa and wellness - regular', 12200.00, 3, 'Yes'),
('wifi - upgrade', 3700.00, 3, 'No');


-- initial staff-users


INSERT INTO staff_user (username, password, official_role, branch_id) VALUES
('AD001', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'admin-user', 1),
('FO001', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'frontoffice-user', 1),
('FO002', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'frontoffice-user', 2),
('FO003', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'frontoffice-user', 3),
('MN001', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'management-user', 1),
('SO001', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'serviceoffice-user', 1),
('SO002', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'serviceoffice-user', 2),
('SO003', '$2a$12$wO7zUDW2gFRu34poUSa.q.5T2eqgAOVQxkFik59aSz.kqV9vIL2h.', 'serviceoffice-user', 3);

-- note that all these hashed passwords =  123456.


-- Insert Room data
INSERT INTO `Room` (`room_number`, `current_status`, `room_type`, `branch_id`) VALUES
-- Branch 1 Rooms
(101, 'Available', 'Single', 1),
(102, 'Available', 'Single', 1),
(103, 'Available', 'Double', 1),
(104, 'Available', 'Double', 1),
(105, 'Available', 'Deluxe', 1),
(106, 'Available', 'Deluxe', 1),
(107, 'Available', 'Suite', 1),
(108, 'Available', 'Suite', 1),
(109, 'Available', 'Budget', 1),
(110, 'Available', 'Budget', 1),

-- Branch 2 Rooms
(201, 'Available', 'Single', 2),
(202, 'Available', 'Single', 2),
(203, 'Available', 'Double', 2),
(204, 'Available', 'Double', 2),
(205, 'Available', 'Deluxe', 2),
(206, 'Available', 'Deluxe', 2),
(207, 'Available', 'Suite', 2),
(208, 'Available', 'Suite', 2),
(209, 'Available', 'Budget', 2),
(210, 'Available', 'Budget', 2),

-- Branch 3 Rooms
(301, 'Available', 'Single', 3),
(302, 'Available', 'Single', 3),
(303, 'Available', 'Double', 3),
(304, 'Available', 'Double', 3),
(305, 'Available', 'Deluxe', 3),
(306, 'Available', 'Deluxe', 3),
(307, 'Available', 'Suite', 3),
(308, 'Available', 'Suite', 3),
(309, 'Available', 'Budget', 3),
(310, 'Available', 'Budget', 3);







-- initial tax and charges

INSERT INTO taxes_and_charges(revision_id, revision_date, latest_tax_percentage, latest_surcharge_percentage) VALUES
(1, '2025-10-06', 15, 5),
(2, '2025-10-01', 25, 5);


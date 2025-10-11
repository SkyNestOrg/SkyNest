--this view used in ViewDueServices.js in Service Office End

CREATE VIEW DueServicesView AS
SELECT 
    sr.service_request_id,
    sr.request_type,
    sr.date_time,
    sr.room_number,
    sr.status,
    sr.booking_id,
    sr.quantity,
    sr.branch_id
FROM service_request sr
LEFT JOIN service s ON sr.request_type = s.service_type AND sr.branch_id = s.branch_id
WHERE sr.status = 'Request Placed'
ORDER BY sr.date_time ASC;

---------------------------------------

CREATE VIEW view_all_rooms AS
SELECT 
    r.room_number
FROM room r;

---------------------------------------

CREATE VIEW view_all_services AS
SELECT distinct s.service_type
FROM service s;

---------------------------------------

CREATE VIEW view_all_branches AS
SELECT distinct b.branch_name 
FROM branch b;
-- 1. Booking creation performance
CREATE INDEX idx_room_branch_type_status ON room(branch_id, room_type, current_status);
CREATE INDEX idx_booked_room_branch_dates_status ON booked_room(branch_id, check_in, check_out, status);


CREATE INDEX idx_booked_room_dates_status ON booked_room(check_in, check_out, status);
CREATE INDEX idx_bill_status ON bill(bill_status);
CREATE INDEX idx_bill_date ON bill(bill_date);

CREATE INDEX idx_service_request_comprehensive ON service_request(request_type, date_time, status);
CREATE INDEX idx_booked_room_booking ON booked_room(booking_id);
CREATE INDEX idx_bill_booking ON bill(booking_id);


CREATE INDEX idx_roomtype_name ON roomtype(type_name);
CREATE INDEX idx_discount_branch_type_dates ON discount(branch_id, room_type, start_date, end_date);
CREATE INDEX idx_service_branch_type ON service(service_type, branch_id, availability);
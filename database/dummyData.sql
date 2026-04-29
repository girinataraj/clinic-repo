-- Dummy Data for Clinic Management System

-- 1. Insert Users (Staff)
INSERT INTO users (id, display_id, role, name, email) VALUES
('11111111-1111-1111-1111-111111111111', 'DOC-001', 'doctor', 'Dr. Gregory House', 'house@clinic.com'),
('22222222-2222-2222-2222-222222222222', 'DOC-002', 'doctor', 'Dr. Lisa Cuddy', 'cuddy@clinic.com'),
('33333333-3333-3333-3333-333333333333', 'NUR-001', 'nurse', 'Nurse Jackie', 'jackie@clinic.com'),
('44444444-4444-4444-4444-444444444444', 'ADM-001', 'admin', 'Admin Alice', 'admin@clinic.com');

-- 2. Insert Patients
INSERT INTO patients (id, display_id, name, age, gender, phone, city, file_number, condition, status, priority) VALUES
('55555555-5555-5555-5555-555555555551', 'SAAI-2026-001', 'John Doe', 45, 'Male', '+919876543210', 'Chennai', 'FN-1001', 'Lower Back Pain', 'waiting', 'medium'),
('55555555-5555-5555-5555-555555555552', 'SAAI-2026-002', 'Jane Smith', 32, 'Female', '+919876543211', 'Bangalore', 'FN-1002', 'Post-Op Knee Rehab', 'in-session', 'high'),
('55555555-5555-5555-5555-555555555553', 'SAAI-2026-003', 'Robert Baratheon', 50, 'Male', '+919876543212', 'Mumbai', 'FN-1003', 'Shoulder Impingement', 'completed', 'low');

-- 3. Insert Evaluations
INSERT INTO evaluations (id, display_id, patient_id, status, bp, pr, spo2, temperature, ef, diagnosis, plan, management, chief_complaints, associated_symptoms, referred_by, created_by) VALUES
('66666666-6666-6666-6666-666666666661', 'EVAL-2026-001', '55555555-5555-5555-5555-555555555551', 'submitted', '120/80', 72, 98, 98.6, 55, 'Lumbar Spondylosis', '10 sessions of physiotherapy', 'Avoid lifting heavy weights', 'Severe lower back pain for 2 weeks', ARRAY['Stiffness', 'Radiating pain to left leg'], 'Dr. Smith (Ortho)', '11111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666662', 'EVAL-2026-002', '55555555-5555-5555-5555-555555555552', 'draft', '130/85', 80, 99, 99.1, NULL, 'ACL Tear Rehab', 'Strengthening exercises', 'Use knee brace while walking', 'Pain in right knee', ARRAY['Swelling', 'Instability'], 'Self', '22222222-2222-2222-2222-222222222222');

-- 4. Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, datetime, status, reason, notes) VALUES
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '2026-05-01 10:00:00+00', 'confirmed', 'Initial Consultation', 'Patient is bringing old MRI reports'),
('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', '2026-05-01 11:30:00+00', 'pending', 'Follow-up Rehab', 'Check range of motion'),
('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', '2026-04-28 14:00:00+00', 'completed', 'Therapy Session 1', 'Patient responded well to ultrasound therapy');

-- 5. Insert Package Details
INSERT INTO package_details (patient_id, service_type, total_visits, visited, remaining_visits, per_session_charge, package_valid_upto) VALUES
('55555555-5555-5555-5555-555555555551', 'Physiotherapy 10-Pack', 10, 2, 8, 500.00, '2026-08-01 23:59:59+00'),
('55555555-5555-5555-5555-555555555552', 'Post-Op Knee Care', 15, 5, 10, 600.00, '2026-09-15 23:59:59+00');

-- 6. Insert Payment Details
INSERT INTO payment_details (id, patient_id, total_amount, discount, paid, remaining_amount) VALUES
('77777777-7777-7777-7777-777777777771', '55555555-5555-5555-5555-555555555551', 5000.00, 500.00, 2000.00, 2500.00),
('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555552', 9000.00, 0.00, 9000.00, 0.00);

-- 7. Insert Payment Visits (Installments/Transactions)
INSERT INTO payment_visits (payment_detail_id, visit_no, visit_date, total_amount, discount, paid_amount, mode, entry_by, remarks, paid_at) VALUES
('77777777-7777-7777-7777-777777777771', 1, '2026-04-20 10:00:00+00', 5000.00, 500.00, 1000.00, 'UPI', 'Admin Alice', 'First installment via GPay', '2026-04-20 10:05:00+00'),
('77777777-7777-7777-7777-777777777771', 2, '2026-04-25 11:00:00+00', 5000.00, 500.00, 1000.00, 'Cash', 'Admin Alice', 'Second installment in cash', '2026-04-25 11:15:00+00'),
('77777777-7777-7777-7777-777777777772', 1, '2026-04-10 09:00:00+00', 9000.00, 0.00, 9000.00, 'Card', 'Admin Alice', 'Paid in full upfront', '2026-04-10 09:10:00+00');

-- Dummy Data for NEW Clinic Management System Schema

-- To use crypt(), pgcrypto extension must be enabled, which is done in the schema.

-- 1. Insert Users (Staff & Patients)
INSERT INTO users (id, display_id, role, name, email, password_hash, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'DOC-001', 'doctor', 'Dr. Gregory House', 'house@clinic.com', crypt('Password@123', gen_salt('bf')), true),
('22222222-2222-2222-2222-222222222222', 'NUR-001', 'nurse', 'Nurse Jackie', 'jackie@clinic.com', crypt('Password@123', gen_salt('bf')), true),
('33333333-3333-3333-3333-333333333333', 'ADM-001', 'admin', 'Admin Alice', 'admin@clinic.com', crypt('Password@123', gen_salt('bf')), true);

-- 2. Insert Patients
INSERT INTO patients (id, display_id, name, age, gender, phone, city, file_number, condition, status, priority) VALUES
('55555555-5555-5555-5555-555555555551', 'SAAI-2026-001', 'John Doe', 45, 'Male', '+919876543210', 'Chennai', 'FN-1001', 'Lower Back Pain', 'waiting', 'medium'),
('55555555-5555-5555-5555-555555555552', 'SAAI-2026-002', 'Jane Smith', 32, 'Female', '+919876543211', 'Bangalore', 'FN-1002', 'Post-Op Knee Rehab', 'in-session', 'high');

-- 3. Link Patients back to Users (Patient Portals)
INSERT INTO users (id, display_id, role, name, email, password_hash, patient_id, is_active) VALUES
('44444444-4444-4444-4444-444444444441', 'PAT-001', 'patient', 'John Doe', 'john@patient.com', crypt('Password@123', gen_salt('bf')), '55555555-5555-5555-5555-555555555551', true),
('44444444-4444-4444-4444-444444444442', 'PAT-002', 'patient', 'Jane Smith', 'jane@patient.com', crypt('Password@123', gen_salt('bf')), '55555555-5555-5555-5555-555555555552', true);

-- 4. Insert Evaluations (Now with pain_level and functional_scores)
INSERT INTO evaluations (id, display_id, patient_id, status, bp, pr, spo2, temperature, pain_level, functional_scores, diagnosis, plan, created_by) VALUES
('66666666-6666-6666-6666-666666666661', 'EVAL-2026-001', '55555555-5555-5555-5555-555555555551', 'submitted', '120/80', 72, 98, 98.6, 7, '{"oswestry_disability_index": 45, "vas_score": 7}'::jsonb, 'Lumbar Spondylosis', '10 sessions of physiotherapy', '11111111-1111-1111-1111-111111111111'),
('66666666-6666-6666-6666-666666666662', 'EVAL-2026-002', '55555555-5555-5555-5555-555555555552', 'draft', '130/85', 80, 99, 99.1, 5, '{"koos_score": 60}'::jsonb, 'ACL Tear Rehab', 'Strengthening exercises', '11111111-1111-1111-1111-111111111111');

-- 5. Insert Exercise Plans
INSERT INTO exercise_plans (id, patient_id, created_by, title, notes, status) VALUES
('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'Core Strengthening Level 1', 'Perform daily in the morning', 'active'),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', 'Knee Post-Op Protocol Week 2', 'Stop if pain exceeds 6/10', 'active');

-- 6. Insert Exercise Items
INSERT INTO exercise_items (plan_id, name, sets, reps, duration, instructions, category, difficulty, order_index) VALUES
('99999999-9999-9999-9999-999999999991', 'Pelvic Tilts', 3, 15, NULL, 'Lie on back, flatten lower back to floor', 'Core', 'Easy', 1),
('99999999-9999-9999-9999-999999999991', 'Bird Dog', 3, 10, NULL, 'On all fours, extend opposite arm and leg', 'Core', 'Medium', 2),
('99999999-9999-9999-9999-999999999992', 'Heel Slides', 3, 15, NULL, 'Slide heel towards buttocks while lying down', 'Knee', 'Easy', 1),
('99999999-9999-9999-9999-999999999992', 'Static Quads', NULL, NULL, '30 secs x 5', 'Press back of knee into a rolled towel', 'Knee', 'Easy', 2);

-- 7. Insert Reports
INSERT INTO reports (evaluation_id, patient_id, doctor_id, title, report_type, status) VALUES
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'Initial Back Pain Assessment', 'Assessment', 'Final');

-- 8. Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, datetime, status, reason) VALUES
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '2026-05-01 10:00:00+00', 'confirmed', 'Follow-up for Back Pain'),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '2026-05-01 11:30:00+00', 'pending', 'Rehab Session');

-- 9. Insert Payment Details & Visits
INSERT INTO payment_details (id, patient_id, total_amount, discount, paid, remaining_amount) VALUES
('77777777-7777-7777-7777-777777777771', '55555555-5555-5555-5555-555555555551', 5000.00, 500.00, 2000.00, 2500.00);

INSERT INTO payment_visits (payment_detail_id, visit_no, visit_date, total_amount, discount, paid_amount, mode, entry_by, remarks, paid_at) VALUES
('77777777-7777-7777-7777-777777777771', 1, '2026-04-20 10:00:00+00', 5000.00, 500.00, 1000.00, 'UPI', 'Admin Alice', 'First installment via GPay', '2026-04-20 10:05:00+00'),
('77777777-7777-7777-7777-777777777771', 2, '2026-04-25 11:00:00+00', 5000.00, 500.00, 1000.00, 'Cash', 'Admin Alice', 'Second installment in cash', '2026-04-25 11:15:00+00');

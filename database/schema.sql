1  -- PostgreSQL schema for SAAI Clinic backend

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role AS ENUM ('doctor', 'nurse', 'patient', 'admin');
CREATE TYPE patient_status AS ENUM ('waiting', 'in-session', 'completed');
CREATE TYPE patient_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE evaluation_status AS ENUM ('draft', 'submitted', 'reviewed');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no-show');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');

-- Sequences
CREATE SEQUENCE IF NOT EXISTS user_display_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS patient_display_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS evaluation_display_id_seq START 1;

-- Patients
CREATE TABLE patients (
  mobile VARCHAR(20) PRIMARY KEY,
  display_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  gender gender_type NOT NULL,
  city VARCHAR(100),
  file_number VARCHAR(50),
  condition TEXT,
  status patient_status NOT NULL DEFAULT 'waiting',
  priority patient_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id VARCHAR(50) UNIQUE NOT NULL,
  role user_role NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  patient_id VARCHAR(20) REFERENCES patients(mobile) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id VARCHAR(50) NOT NULL,
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(mobile) ON DELETE CASCADE,
  status evaluation_status NOT NULL DEFAULT 'draft',

  bp VARCHAR(20),
  pr INT,
  spo2 INT,
  temperature DECIMAL(5,2),
  ef INT,
  pain_level INT CHECK (pain_level BETWEEN 0 AND 10),
  functional_scores JSONB,

  diagnosis TEXT,
  plan TEXT,
  management TEXT,
  chief_complaints TEXT,
  associated_symptoms TEXT[],
  referred_by VARCHAR(255),

  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Versioning & Complete Assessment columns
  version INT NOT NULL DEFAULT 1,
  answers JSONB,
  score DECIMAL(10,2),
  notes TEXT,
  uploaded_files TEXT[],

  -- Patient History & clinical report columns
  family_history TEXT,
  lifestyle_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  previous_medications TEXT,
  lab_reports TEXT,
  radiology_reports TEXT,
  prescriptions TEXT,
  procedures TEXT,
  follow_up_plan TEXT,
  mental_status_examination TEXT,
  clinical_findings TEXT,
  therapy_notes TEXT,
  progress_notes TEXT,
  doctor_remarks TEXT,
  therapist_remarks TEXT,
  final_clinical_summary TEXT
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(mobile) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercise Plans
CREATE TABLE exercise_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(mobile) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercise_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES exercise_plans(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets INT,
  reps INT,
  duration VARCHAR(100),
  instructions TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(50),
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(mobile) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL DEFAULT 'Assessment',
  status VARCHAR(50) NOT NULL DEFAULT 'Final',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Package Details
CREATE TABLE package_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(mobile) ON DELETE CASCADE,
  service_type VARCHAR(255) NOT NULL,
  total_visits INT,
  visited INT NOT NULL DEFAULT 0,
  remaining_visits INT,
  per_session_charge DECIMAL(10,2),
  package_valid_upto TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Details
CREATE TABLE payment_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(mobile) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Visits
CREATE TABLE payment_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_detail_id UUID NOT NULL REFERENCES payment_details(id) ON DELETE CASCADE,
  visit_no INT NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(10,2) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  entry_by VARCHAR(255) NOT NULL,
  remarks TEXT,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by_ip INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_status_priority ON patients(status, priority);
CREATE INDEX idx_evaluations_patient_created ON evaluations(patient_id, created_at DESC);
CREATE INDEX idx_appointments_patient_datetime ON appointments(patient_id, datetime DESC);
CREATE INDEX idx_appointments_doctor_datetime ON appointments(doctor_id, datetime DESC);
CREATE INDEX idx_reports_patient_issued ON reports(patient_id, issued_at DESC);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, expires_at DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_evaluations_modtime BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_exercise_plans_modtime BEFORE UPDATE ON exercise_plans FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_package_details_modtime BEFORE UPDATE ON package_details FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_payment_details_modtime BEFORE UPDATE ON payment_details FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Sample Data
WITH new_patient AS (
  INSERT INTO patients (
    mobile, display_id, name, age, gender, city, file_number, condition, status, priority
  ) VALUES (
    '+91 9876543210', 'SAAI-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('patient_display_id_seq')::text, 3, '0'),
    'Rahul Verma', 45, 'Male', 'Erode', 'FILE-001',
    'Post-op Knee', 'waiting', 'high'
  )
  RETURNING mobile AS id
),
new_doctor AS (
  INSERT INTO users (
    display_id, role, name, email, password_hash
  ) VALUES (
    'USR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('user_display_id_seq')::text, 3, '0'),
    'doctor', 'Dr. SV. Sathish Kumar', 'sathish@saai.com', crypt('spcerd@611', gen_salt('bf'))
  )
  RETURNING id
),
new_nurse AS (
  INSERT INTO users (
    display_id, role, name, email, password_hash
  ) VALUES (
    'USR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('user_display_id_seq')::text, 3, '0'),
    'nurse', 'Yokesh', 'yokesh@saai.com', crypt('Password@123', gen_salt('bf'))
  )
  RETURNING id
),
new_nurse_2 AS (
  INSERT INTO users (
    display_id, role, name, email, password_hash
  ) VALUES (
    'USR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('user_display_id_seq')::text, 3, '0'),
    'nurse', 'Rahul', 'rahul@saai.com', crypt('Password@123', gen_salt('bf'))
  )
  RETURNING id
),
new_patient_user AS (
  INSERT INTO users (
    display_id, role, name, email, password_hash, patient_id
  ) VALUES (
    'USR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('user_display_id_seq')::text, 3, '0'),
    'patient', 'Priya Sharma', 'patient@saai.com', crypt('Password@123', gen_salt('bf')),
    (SELECT id FROM new_patient)
  )
  RETURNING id
)
INSERT INTO appointments (patient_id, doctor_id, datetime, status, reason)
VALUES (
  (SELECT id FROM new_patient),
  (SELECT id FROM new_doctor),
  now() + interval '1 day',
  'confirmed',
  'Initial Consultation'
);

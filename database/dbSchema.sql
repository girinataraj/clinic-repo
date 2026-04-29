-- PostgreSQL Database Schema for Clinic Management System
-- Generated based on TypeScript interfaces

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('doctor', 'nurse', 'patient', 'admin');
CREATE TYPE patient_status AS ENUM ('waiting', 'in-session', 'completed');
CREATE TYPE patient_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE evaluation_status AS ENUM ('draft', 'submitted', 'reviewed');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no-show');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_id VARCHAR(50) UNIQUE NOT NULL,
    role user_role NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., SAAI-2026-001
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender gender_type NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    file_number VARCHAR(50),
    condition TEXT,
    status patient_status NOT NULL DEFAULT 'waiting',
    priority patient_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Evaluations Table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., EVAL-2026-001
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    status evaluation_status NOT NULL DEFAULT 'draft',
    
    -- Vitals
    bp VARCHAR(20),
    pr INT,
    spo2 INT,
    temperature DECIMAL(5,2),
    ef INT,
    
    -- Clinical Details
    diagnosis TEXT,
    plan TEXT,           -- maps to "Treatment Detail"
    management TEXT,     -- maps to "Remarks"
    chief_complaints TEXT,
    associated_symptoms TEXT[],
    referred_by VARCHAR(255),
    
    -- Audit fields
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id),
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Package Details Table
CREATE TABLE package_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    service_type VARCHAR(255) NOT NULL,
    total_visits INT,
    visited INT NOT NULL DEFAULT 0,
    remaining_visits INT,
    per_session_charge DECIMAL(10,2),
    package_valid_upto TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payment Details Table
CREATE TABLE payment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payment Visits Table
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

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_patients_modtime BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_evaluations_modtime BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_appointments_modtime BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_package_details_modtime BEFORE UPDATE ON package_details FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_payment_details_modtime BEFORE UPDATE ON payment_details FOR EACH ROW EXECUTE FUNCTION update_modified_column();

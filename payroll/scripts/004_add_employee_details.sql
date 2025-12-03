-- Migration: Add personal details to employees table
-- Run this script to add new fields for expanded employee information

-- Add personal detail columns to employees table (one by one to handle errors gracefully)
-- Add personal details columns
ALTER TABLE employees ADD COLUMN date_of_birth DATE;
ALTER TABLE employees ADD COLUMN gender VARCHAR(10);
ALTER TABLE employees ADD COLUMN marital_status VARCHAR(20);
ALTER TABLE employees ADD COLUMN national_id VARCHAR(50);
ALTER TABLE employees ADD COLUMN tax_id VARCHAR(50);
ALTER TABLE employees ADD COLUMN address TEXT;

-- Add emergency contact columns
ALTER TABLE employees ADD COLUMN emergency_contact_name VARCHAR(255);
ALTER TABLE employees ADD COLUMN emergency_contact_phone VARCHAR(20);

-- Add employment details column
ALTER TABLE employees ADD COLUMN employment_type VARCHAR(50);

-- Add indexes for commonly searched fields
CREATE INDEX idx_employees_gender ON employees(gender);
CREATE INDEX idx_employees_employment_type ON employees(employment_type);
CREATE INDEX idx_employees_national_id ON employees(national_id);

-- Add comments for documentation
ALTER TABLE employees 
COMMENT = 'Employee information with personal details, contact information, and employment data';

-- Show the updated table structure
DESCRIBE employees;
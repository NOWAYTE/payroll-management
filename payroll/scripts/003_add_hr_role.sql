-- Migration to add 'hr' role to users table
-- Update the role enum to include 'hr'

ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'finance', 'employee', 'hr') NOT NULL DEFAULT 'employee';

-- Add some indexes for better performance on role-based queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_employees_department ON employees(department);
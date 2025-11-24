-- Add demo users and employees
-- Note: Password hashes need to be generated properly in production

-- Insert admin user (you'll need to register through the app for proper password hashing)
-- Or use the registration endpoint: POST http://localhost:5000/api/auth/register

-- Sample employees (you can add these through the web interface once you have an admin account)
INSERT INTO employees (name, email, employee_id, department, position, phone, hire_date) VALUES
('John Doe', 'john.doe@company.com', 'EMP001', 'Engineering', 'Software Engineer', '555-0101', '2022-01-15'),
('Jane Smith', 'jane.smith@company.com', 'EMP002', 'Engineering', 'Senior Engineer', '555-0102', '2021-06-01'),
('Bob Johnson', 'bob.johnson@company.com', 'EMP003', 'Sales', 'Sales Manager', '555-0103', '2022-03-10'),
('Alice Williams', 'alice.williams@company.com', 'EMP004', 'HR', 'HR Manager', '555-0104', '2021-09-20');
# Seed script for demo data
# Run after database initialization

MYSQL_USER=${1:-root}
MYSQL_PASSWORD=${2:-password}
MYSQL_HOST=${3:-localhost}
MYSQL_DB=${4:-payroll_db}

mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -h $MYSQL_HOST $MYSQL_DB << 'EOF'

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, role) VALUES (
  'admin@payroll.com',
  'scrypt:32768:8:1$xxx$xxx',
  'admin'
);

-- Insert finance manager (password: finance123)
INSERT INTO users (email, password_hash, role) VALUES (
  'finance@payroll.com',
  'scrypt:32768:8:1$yyy$yyy',
  'finance'
);

-- Insert sample employees
INSERT INTO employees (user_id, name, email, employee_id, department, position, phone, hire_date) VALUES
(NULL, 'John Doe', 'john.doe@company.com', 'EMP001', 'Engineering', 'Software Engineer', '555-0101', '2022-01-15'),
(NULL, 'Jane Smith', 'jane.smith@company.com', 'EMP002', 'Engineering', 'Senior Engineer', '555-0102', '2021-06-01'),
(NULL, 'Bob Johnson', 'bob.johnson@company.com', 'EMP003', 'Sales', 'Sales Manager', '555-0103', '2022-03-10'),
(NULL, 'Alice Williams', 'alice.williams@company.com', 'EMP004', 'HR', 'HR Manager', '555-0104', '2021-09-20');

-- Insert salary records
INSERT INTO salaries (employee_id, basic_salary, start_date, currency) VALUES
(1, 5000, '2024-01-01', 'USD'),
(2, 7000, '2024-01-01', 'USD'),
(3, 6000, '2024-01-01', 'USD'),
(4, 5500, '2024-01-01', 'USD');

-- Insert allowances
INSERT INTO allowances (employee_id, allowance_type, amount, is_fixed, start_date) VALUES
(1, 'Housing', 500, 1, '2024-01-01'),
(1, 'Transport', 200, 1, '2024-01-01'),
(2, 'Housing', 600, 1, '2024-01-01'),
(3, 'Housing', 550, 1, '2024-01-01');

-- Insert deductions
INSERT INTO deductions (employee_id, deduction_type, amount, is_fixed, start_date) VALUES
(1, 'Health Insurance', 150, 1, '2024-01-01'),
(1, 'Pension', 300, 1, '2024-01-01'),
(2, 'Health Insurance', 150, 1, '2024-01-01'),
(2, 'Pension', 400, 1, '2024-01-01');

EOF

echo "Demo data seeded successfully!"

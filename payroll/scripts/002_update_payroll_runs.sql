-- Migration to update payroll_runs table structure
-- Add new columns for employee-specific payroll

ALTER TABLE payroll_runs ADD COLUMN employee_id INT;
ALTER TABLE payroll_runs ADD COLUMN basic_salary DECIMAL(10,2);
ALTER TABLE payroll_runs ADD COLUMN deductions DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE payroll_runs ADD COLUMN net_salary DECIMAL(10,2);

-- Add foreign key constraint
ALTER TABLE payroll_runs ADD CONSTRAINT fk_payroll_runs_employee 
FOREIGN KEY (employee_id) REFERENCES employees(id);

-- Add index for better performance
CREATE INDEX idx_payroll_runs_employee ON payroll_runs(employee_id);
CREATE INDEX idx_payroll_runs_month_year ON payroll_runs(month, year);

-- Add unique constraint to prevent duplicate payroll runs for same employee/month/year
ALTER TABLE payroll_runs ADD CONSTRAINT uk_payroll_runs_employee_month_year 
UNIQUE (employee_id, month, year);
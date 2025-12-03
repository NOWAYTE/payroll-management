-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'finance', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  position VARCHAR(100),
  bank_account VARCHAR(50),
  bank_name VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  hire_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Personal Details
  date_of_birth DATE,
  gender VARCHAR(10),
  marital_status VARCHAR(20),
  national_id VARCHAR(50),
  tax_id VARCHAR(50),
  address TEXT,
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  -- Employment Details
  employment_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_department (department),
  INDEX idx_gender (gender),
  INDEX idx_employment_type (employment_type),
  INDEX idx_national_id (national_id)
);

-- Salaries table (basic salary and statutory fields)
CREATE TABLE IF NOT EXISTS salaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  basic_salary DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_active_salary (employee_id, end_date)
);

-- Allowances table
CREATE TABLE IF NOT EXISTS allowances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  allowance_type VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  is_fixed BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Deductions table
CREATE TABLE IF NOT EXISTS deductions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  deduction_type VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  is_fixed BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Payroll runs (represents a payroll processing cycle)
CREATE TABLE IF NOT EXISTS payroll_runs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  month INT NOT NULL,
  year INT NOT NULL,
  status ENUM('draft', 'processed', 'finalized', 'paid') NOT NULL DEFAULT 'draft',
  total_payroll DECIMAL(15, 2),
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_payroll_month (month, year)
);

-- Payslips table
CREATE TABLE IF NOT EXISTS payslips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payroll_run_id INT NOT NULL,
  employee_id INT NOT NULL,
  basic_salary DECIMAL(12, 2) NOT NULL,
  total_allowances DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0,
  gross_salary DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(12, 2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_payroll (payroll_run_id, employee_id)
);

-- Payslip details table (for detailed breakdown of allowances and deductions)
CREATE TABLE IF NOT EXISTS payslip_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payslip_id INT NOT NULL,
  detail_type ENUM('allowance', 'deduction') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payslip_id) REFERENCES payslips(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_salaries_employee_id ON salaries(employee_id);
CREATE INDEX idx_allowances_employee_id ON allowances(employee_id);
CREATE INDEX idx_deductions_employee_id ON deductions(employee_id);
CREATE INDEX idx_payroll_runs_month_year ON payroll_runs(month, year);
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_payroll_run_id ON payslips(payroll_run_id);
CREATE INDEX idx_payslip_details_payslip_id ON payslip_details(payslip_id);

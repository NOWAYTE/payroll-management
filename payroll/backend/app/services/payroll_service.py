from datetime import datetime, date
from app import db
from app.models import Salary, Allowance, Deduction, Payslip, PayslipDetail, Employee

class PayrollService:
    """Service for payroll calculations and processing"""
    
    @staticmethod
    def calculate_payroll(employee_id, month, year):
        """Calculate payroll for an employee for a specific month"""
        print(f"DEBUG: Calculating payroll for employee {employee_id}, month {month}, year {year}")
        
        employee = Employee.query.get(employee_id)
        if not employee:
            print(f"DEBUG: Employee {employee_id} not found")
            return {'error': 'Employee not found'}
        
        print(f"DEBUG: Found employee {employee.name}")
        
        # Get active salary on the specified month/year
        salary = PayrollService._get_active_salary(employee_id, month, year)
        if not salary:
            print(f"DEBUG: No salary found for employee {employee_id}")
            return {'error': f'No salary found for employee {employee.name}'}
        
        print(f"DEBUG: Found salary {salary.basic_salary}")
        basic_salary = salary.basic_salary
        
        # Calculate allowances
        allowances = Allowance.query.filter(
            Allowance.employee_id == employee_id,
            Allowance.start_date <= date(year, month, 28),
            db.or_(Allowance.end_date.is_(None), Allowance.end_date >= date(year, month, 1))
        ).all()
        
        total_allowances = sum(a.amount for a in allowances)
        
        # Calculate deductions
        deductions = Deduction.query.filter(
            Deduction.employee_id == employee_id,
            Deduction.start_date <= date(year, month, 28),
            db.or_(Deduction.end_date.is_(None), Deduction.end_date >= date(year, month, 1))
        ).all()
        
        total_deductions = sum(d.amount for d in deductions)
        
        # Calculate gross salary
        gross_salary = basic_salary + total_allowances
        
        # Calculate tax (simple flat percentage - customize as needed)
        tax = PayrollService._calculate_tax(gross_salary)
        
        # Calculate net salary
        net_salary = gross_salary - total_deductions - tax
        
        return {
            'employee_id': employee_id,
            'basic_salary': basic_salary,
            'total_allowances': total_allowances,
            'total_deductions': total_deductions,
            'gross_salary': gross_salary,
            'tax': tax,
            'net_salary': net_salary,
            'allowances_detail': [{'type': a.allowance_type, 'amount': a.amount} for a in allowances],
            'deductions_detail': [{'type': d.deduction_type, 'amount': d.amount} for d in deductions]
        }
    
    @staticmethod
    def _get_active_salary(employee_id, month, year):
        """Get active salary for employee on specific month/year"""
        target_date = date(year, month, 1)
        print(f"DEBUG: Looking for salary for employee {employee_id} on {target_date}")
        
        # First, check all salaries for this employee
        all_salaries = Salary.query.filter(Salary.employee_id == employee_id).all()
        print(f"DEBUG: Found {len(all_salaries)} total salaries for employee {employee_id}")
        for s in all_salaries:
            print(f"DEBUG: Salary {s.id}: {s.basic_salary}, start: {s.start_date}, end: {s.end_date}")
        
        salary = Salary.query.filter(
            Salary.employee_id == employee_id,
            Salary.start_date <= target_date,
            db.or_(Salary.end_date.is_(None), Salary.end_date >= target_date)
        ).order_by(Salary.start_date.desc()).first()
        
        if salary:
            print(f"DEBUG: Selected salary {salary.id}: {salary.basic_salary}")
        else:
            print(f"DEBUG: No active salary found for employee {employee_id} on {target_date}")
            
        return salary
    
    @staticmethod
    def _calculate_tax(gross_salary):
        """Calculate tax based on gross salary"""
        # Simple tax bracket system - customize as needed
        if gross_salary <= 1000:
            return 0
        elif gross_salary <= 3000:
            return (gross_salary - 1000) * 0.1
        elif gross_salary <= 5000:
            return 200 + (gross_salary - 3000) * 0.15
        else:
            return 500 + (gross_salary - 5000) * 0.2

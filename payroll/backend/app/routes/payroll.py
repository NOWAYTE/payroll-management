from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import PayrollRun, User, Employee, Salary
from datetime import date
from sqlalchemy import extract

payroll_bp = Blueprint('payroll', __name__, url_prefix='/api/payroll')

@payroll_bp.route('/runs', methods=['GET'])
@jwt_required()
def get_payroll_runs():
    """Get payroll runs with optional filters"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    employee_id = request.args.get('employee_id', type=int)
    
    query = PayrollRun.query
    
    if month:
        query = query.filter(PayrollRun.month == month)
    if year:
        query = query.filter(PayrollRun.year == year)
    if employee_id:
        query = query.filter(PayrollRun.employee_id == employee_id)
    
    runs = query.order_by(PayrollRun.year.desc(), PayrollRun.month.desc()).paginate(
        page=page, per_page=per_page
    )
    
    return {
        'payroll_runs': [run.to_dict() for run in runs.items],
        'total': runs.total,
        'pages': runs.pages,
        'current_page': page
    }, 200

@payroll_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees_for_payroll():
    """Get active employees for payroll creation"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.can_process_payroll():
        return {'error': 'Unauthorized'}, 401
    
    employees = Employee.query.filter_by(is_active=True).order_by(Employee.name).all()
    
    # Include current salary for each employee
    result = []
    for emp in employees:
        emp_data = emp.to_dict()
        # Get current salary
        current_salary = Salary.query.filter(
            Salary.employee_id == emp.id,
            db.or_(Salary.end_date.is_(None), Salary.end_date >= date.today())
        ).first()
        emp_data['current_salary'] = float(current_salary.basic_salary) if current_salary else 0
        result.append(emp_data)
    
    return {'employees': result}, 200

@payroll_bp.route('/runs', methods=['POST'])
@jwt_required()
def create_payroll_run():
    """Create new payroll run for a specific employee"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.can_process_payroll():
        return {'error': 'Unauthorized'}, 401
    
    data = request.get_json()
    employee_id = data.get('employee_id')
    month = data.get('month')
    year = data.get('year')
    deductions = float(data.get('deductions', 0))
    
    if not employee_id or not month or not year:
        return {'error': 'Missing employee_id, month, or year'}, 400
    
    # Check if employee exists and is active
    employee = Employee.query.filter_by(id=employee_id, is_active=True).first()
    if not employee:
        return {'error': 'Employee not found or inactive'}, 404
    
    # Check if payroll run already exists for this employee/month/year
    existing = PayrollRun.query.filter_by(
        employee_id=employee_id, 
        month=month, 
        year=year
    ).first()
    if existing:
        return {'error': 'Payroll run already exists for this employee/month/year'}, 400
    
    # Get current salary
    current_salary = Salary.query.filter(
        Salary.employee_id == employee_id,
        db.or_(Salary.end_date.is_(None), Salary.end_date >= date.today())
    ).first()
    
    if not current_salary:
        return {'error': 'No salary found for this employee'}, 400
    
    basic_salary = current_salary.basic_salary
    net_salary = basic_salary - deductions
    
    payroll_run = PayrollRun(
        employee_id=employee_id,
        month=month,
        year=year,
        basic_salary=basic_salary,
        deductions=deductions,
        net_salary=net_salary,
        created_by=current_user_id
    )
    
    db.session.add(payroll_run)
    db.session.commit()
    
    return {'message': 'Payroll run created', 'payroll_run': payroll_run.to_dict()}, 201

@payroll_bp.route('/runs/bulk', methods=['POST'])
@jwt_required()
def create_bulk_payroll_runs():
    """Create payroll runs for all employees for a specific month/year"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.can_process_payroll():
        return {'error': 'Unauthorized'}, 401
    
    data = request.get_json()
    month = data.get('month')
    year = data.get('year')
    default_deductions = float(data.get('default_deductions', 0))
    
    if not month or not year:
        return {'error': 'Missing month or year'}, 400
    
    # Get all active employees
    employees = Employee.query.filter_by(is_active=True).all()
    
    success_count = 0
    error_count = 0
    errors = []
    
    for employee in employees:
        try:
            # Check if payroll run already exists for this employee/month/year
            existing = PayrollRun.query.filter_by(
                employee_id=employee.id, 
                month=month, 
                year=year
            ).first()
            if existing:
                continue  # Skip if already exists
            
            # Get current salary
            current_salary = Salary.query.filter(
                Salary.employee_id == employee.id,
                db.or_(Salary.end_date.is_(None), Salary.end_date >= date.today())
            ).first()
            
            if not current_salary:
                errors.append(f"No salary found for {employee.name}")
                error_count += 1
                continue
            
            basic_salary = current_salary.basic_salary
            net_salary = basic_salary - default_deductions
            
            payroll_run = PayrollRun(
                employee_id=employee.id,
                month=month,
                year=year,
                basic_salary=basic_salary,
                deductions=default_deductions,
                net_salary=net_salary,
                created_by=current_user_id
            )
            
            db.session.add(payroll_run)
            success_count += 1
            
        except Exception as e:
            errors.append(f"Error for {employee.name}: {str(e)}")
            error_count += 1
    
    try:
        db.session.commit()
        return {
            'message': f'Created {success_count} payroll runs',
            'success_count': success_count,
            'error_count': error_count,
            'errors': errors
        }, 201
    except Exception as e:
        db.session.rollback()
        return {'error': f'Database error: {str(e)}'}, 500

@payroll_bp.route('/runs/<int:payroll_run_id>/process', methods=['POST'])
@jwt_required()
def process_payroll(payroll_run_id):
    """Mark payroll run as processed and generate payslip"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.can_process_payroll():
        return {'error': 'Unauthorized'}, 401
    
    payroll_run = PayrollRun.query.get(payroll_run_id)
    
    if not payroll_run:
        return {'error': 'Payroll run not found'}, 404
    
    if payroll_run.status != 'draft':
        return {'error': 'Payroll run is not in draft status'}, 400
    
    try:
        # Import here to avoid circular imports
        from app.services.payroll_service import PayrollService
        from app.models import Payslip, PayslipDetail, Allowance, Deduction
        
        # Use the salary already stored in the payroll run instead of recalculating
        basic_salary = payroll_run.basic_salary
        
        # Calculate allowances for the payroll period
        allowances = Allowance.query.filter(
            Allowance.employee_id == payroll_run.employee_id,
            Allowance.start_date <= date(payroll_run.year, payroll_run.month, 28),
            db.or_(Allowance.end_date.is_(None), Allowance.end_date >= date(payroll_run.year, payroll_run.month, 1))
        ).all()
        
        total_allowances = sum(a.amount for a in allowances)
        
        # Calculate deductions for the payroll period
        deductions_records = Deduction.query.filter(
            Deduction.employee_id == payroll_run.employee_id,
            Deduction.start_date <= date(payroll_run.year, payroll_run.month, 28),
            db.or_(Deduction.end_date.is_(None), Deduction.end_date >= date(payroll_run.year, payroll_run.month, 1))
        ).all()
        
        total_deductions = sum(d.amount for d in deductions_records) + payroll_run.deductions
        
        # Calculate gross salary
        gross_salary = basic_salary + total_allowances
        
        # Calculate tax
        tax = PayrollService._calculate_tax(gross_salary)
        
        # Calculate net salary
        net_salary = gross_salary - total_deductions - tax
        
        # Prepare payroll calculation data
        payroll_calc = {
            'basic_salary': basic_salary,
            'total_allowances': total_allowances,
            'total_deductions': total_deductions,
            'gross_salary': gross_salary,
            'tax': tax,
            'net_salary': net_salary,
            'allowances_detail': [{'type': a.allowance_type, 'amount': a.amount} for a in allowances],
            'deductions_detail': [{'type': d.deduction_type, 'amount': d.amount} for d in deductions_records]
        }
        
        # Check if payslip already exists
        existing_payslip = Payslip.query.filter_by(payroll_run_id=payroll_run_id).first()
        if not existing_payslip:
            # Create payslip
            payslip = Payslip(
                payroll_run_id=payroll_run_id,
                employee_id=payroll_run.employee_id,
                basic_salary=payroll_calc['basic_salary'],
                total_allowances=payroll_calc['total_allowances'],
                total_deductions=payroll_calc['total_deductions'],
                gross_salary=payroll_calc['gross_salary'],
                tax=payroll_calc['tax'],
                net_salary=payroll_calc['net_salary']
            )
            db.session.add(payslip)
            db.session.flush()  # To get payslip ID
            
            # Create payslip details for allowances
            for allowance in payroll_calc['allowances_detail']:
                detail = PayslipDetail(
                    payslip_id=payslip.id,
                    detail_type='allowance',
                    description=allowance['type'],
                    amount=allowance['amount']
                )
                db.session.add(detail)
            
            # Create payslip details for deductions
            for deduction in payroll_calc['deductions_detail']:
                detail = PayslipDetail(
                    payslip_id=payslip.id,
                    detail_type='deduction',
                    description=deduction['type'],
                    amount=deduction['amount']
                )
                db.session.add(detail)
            
            # Add tax detail if applicable
            if payroll_calc['tax'] > 0:
                tax_detail = PayslipDetail(
                    payslip_id=payslip.id,
                    detail_type='deduction',
                    description='Income Tax',
                    amount=payroll_calc['tax']
                )
                db.session.add(tax_detail)
        
        # Mark payroll as processed
        payroll_run.status = 'processed'
        
        db.session.commit()
        
        return {
            'message': 'Payroll processed and payslip generated',
            'payroll_run': payroll_run.to_dict()
        }, 200
        
    except Exception as e:
        db.session.rollback()
        return {'error': f'Failed to process payroll: {str(e)}'}, 500

@payroll_bp.route('/runs/<int:payroll_run_id>', methods=['PUT'])
@jwt_required()
def update_payroll_run(payroll_run_id):
    """Update payroll run deductions"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.can_process_payroll():
        return {'error': 'Unauthorized'}, 401
    
    payroll_run = PayrollRun.query.get(payroll_run_id)
    
    if not payroll_run:
        return {'error': 'Payroll run not found'}, 404
    
    if payroll_run.status != 'draft':
        return {'error': 'Can only update draft payroll runs'}, 400
    
    data = request.get_json()
    if 'deductions' in data:
        payroll_run.deductions = float(data['deductions'])
        payroll_run.net_salary = payroll_run.basic_salary - payroll_run.deductions
    
    db.session.commit()
    
    return {'message': 'Payroll run updated', 'payroll_run': payroll_run.to_dict()}, 200

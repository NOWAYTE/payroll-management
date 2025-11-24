from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models import Employee, User, Salary, Allowance, Deduction
from datetime import date

employee_bp = Blueprint('employees', __name__, url_prefix='/api/employees')

@employee_bp.route('', methods=['GET'])
@jwt_required()
def get_employees():
    """Get all employees with pagination and search"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.can_manage_employees():
        return {'error': 'Unauthorized'}, 401
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int
        print(f"DEBUG GET: Current user ID: {current_user_id}")  # Debug
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        department = request.args.get('department', '', type=str)
        
        query = Employee.query.filter_by(is_active=True)  # Only active employees
        
        if search:
            query = query.filter(db.or_(
                Employee.name.ilike(f'%{search}%'),
                Employee.email.ilike(f'%{search}%'),
                Employee.employee_id.ilike(f'%{search}%')
            ))
        
        if department:
            query = query.filter_by(department=department)
        
        employees = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'employees': [emp.to_dict() for emp in employees.items],
            'total': employees.total,
            'pages': employees.pages,
            'current_page': page
        }, 200
    
    except Exception as e:
        print(f"DEBUG GET: Error in get_employees: {e}")  # Debug
        return {'error': f'Failed to fetch employees: {str(e)}'}, 500

@employee_bp.route('/<int:employee_id>', methods=['GET'])
@jwt_required()
def get_employee(employee_id):
    """Get employee details"""
    employee = Employee.query.get(employee_id)
    
    if not employee:
        return {'error': 'Employee not found'}, 404
    
    data = employee.to_dict()
    
    # Get current salary
    current_salary = Salary.query.filter(
        Salary.employee_id == employee_id,
        db.or_(Salary.end_date.is_(None), Salary.end_date >= date.today())
    ).first()
    
    data['salary'] = current_salary.to_dict() if current_salary else None
    
    # Get active allowances
    allowances = Allowance.query.filter(
        Allowance.employee_id == employee_id,
        db.or_(Allowance.end_date.is_(None), Allowance.end_date >= date.today())
    ).all()
    
    data['allowances'] = [a.to_dict() for a in allowances]
    
    # Get active deductions
    deductions = Deduction.query.filter(
        Deduction.employee_id == employee_id,
        db.or_(Deduction.end_date.is_(None), Deduction.end_date >= date.today())
    ).all()
    
    data['deductions'] = [d.to_dict() for d in deductions]
    
    return data, 200

@employee_bp.route('', methods=['POST'])
@jwt_required()
def create_employee():
    """Create new employee"""
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int
        print(f"DEBUG POST: Current user ID: {current_user_id}")  # Debug
        
        user = User.query.get(current_user_id)
        print(f"DEBUG POST: User found: {user}, Role: {user.role if user else 'None'}")  # Debug
        
        if not user or user.role not in ['admin', 'finance']:
            print(f"DEBUG POST: Unauthorized - User role: {user.role if user else 'None'}")  # Debug
            return {'error': 'Unauthorized'}, 401
        
        data = request.get_json()
        print(f"DEBUG POST: Received employee data: {data}")  # Debug
        
        if not data or not data.get('name') or not data.get('email') or not data.get('employee_id'):
            print(f"DEBUG POST: Missing required fields - Name: {data.get('name') if data else 'None'}, Email: {data.get('email') if data else 'None'}, Employee ID: {data.get('employee_id') if data else 'None'}")  # Debug
            return {'error': 'Missing required fields'}, 400
        
        if Employee.query.filter_by(email=data['email']).first():
            print(f"DEBUG POST: Email already exists: {data['email']}")  # Debug
            return {'error': 'Email already exists'}, 400
        
        if Employee.query.filter_by(employee_id=data['employee_id']).first():
            print(f"DEBUG POST: Employee ID already exists: {data['employee_id']}")  # Debug
            return {'error': 'Employee ID already exists'}, 400
        
        employee = Employee(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            department=data.get('department'),
            position=data.get('position'),
            bank_account=data.get('bank_account'),
            bank_name=data.get('bank_name'),
            employee_id=data['employee_id'],
            hire_date=date.fromisoformat(data['hire_date']) if data.get('hire_date') else None
        )
        
        db.session.add(employee)
        db.session.flush()  # To get the employee ID
        
        # Create salary record if basic_salary is provided
        if data.get('basic_salary'):
            salary = Salary(
                employee_id=employee.id,
                basic_salary=float(data['basic_salary']),
                start_date=date.today()
            )
            db.session.add(salary)
        
        db.session.commit()
        
        print(f"DEBUG POST: Employee created successfully: {employee.to_dict()}")  # Debug
        return {'message': 'Employee created', 'employee': employee.to_dict()}, 201
    
    except Exception as e:
        print(f"DEBUG POST: Error creating employee: {e}")  # Debug
        import traceback
        traceback.print_exc()  # Print full traceback
        db.session.rollback()
        return {'error': f'Database error: {str(e)}'}, 422

@employee_bp.route('/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    """Update employee"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['admin', 'finance']:
        return {'error': 'Unauthorized'}, 401
    
    employee = Employee.query.get(employee_id)
    
    if not employee:
        return {'error': 'Employee not found'}, 404
    
    data = request.get_json()
    
    employee.name = data.get('name', employee.name)
    employee.phone = data.get('phone', employee.phone)
    employee.department = data.get('department', employee.department)
    employee.position = data.get('position', employee.position)
    employee.bank_account = data.get('bank_account', employee.bank_account)
    employee.bank_name = data.get('bank_name', employee.bank_name)
    
    # Update salary if provided
    if data.get('basic_salary') is not None:
        # End current salary if exists
        current_salary = Salary.query.filter(
            Salary.employee_id == employee_id,
            Salary.end_date.is_(None)
        ).first()
        
        if current_salary:
            if float(data['basic_salary']) != current_salary.basic_salary:
                # End current salary and create new one
                current_salary.end_date = date.today()
                new_salary = Salary(
                    employee_id=employee_id,
                    basic_salary=float(data['basic_salary']),
                    start_date=date.today()
                )
                db.session.add(new_salary)
        else:
            # Create new salary record
            new_salary = Salary(
                employee_id=employee_id,
                basic_salary=float(data['basic_salary']),
                start_date=date.today()
            )
            db.session.add(new_salary)
    
    db.session.commit()
    
    return {'message': 'Employee updated', 'employee': employee.to_dict()}, 200

@employee_bp.route('/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    """Soft delete employee"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['admin', 'finance']:
        return {'error': 'Unauthorized'}, 401
    
    employee = Employee.query.get(employee_id)
    
    if not employee:
        return {'error': 'Employee not found'}, 404
    
    employee.is_active = False
    db.session.commit()
    
    return {'message': 'Employee deleted'}, 200

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Employee

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return {'error': 'Missing email or password'}, 400
    
    if User.query.filter_by(email=data['email']).first():
        return {'error': 'Email already exists'}, 400
    
    # Determine role based on registration type
    role = data.get('role', 'employee')
    employee_id = data.get('employee_id')  # Required for employee/hr registration
    
    # Validate employee registration
    if role in ['employee', 'hr'] and employee_id:
        # Check if employee exists and doesn't already have an account
        employee = Employee.query.filter_by(employee_id=employee_id, email=data['email']).first()
        if not employee:
            return {'error': 'Employee not found or email mismatch'}, 400
        
        if employee.user_id:
            return {'error': 'Employee already has an account'}, 400
        
        # For HR role, check if employee is in Human Resource department
        if role == 'hr' and employee.department != 'Human Resource':
            return {'error': 'Only Human Resource department employees can register as HR'}, 400
    
    user = User(
        email=data['email'],
        role=role
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.flush()  # To get user ID
    
    # Link employee to user if employee_id provided
    if employee_id and role in ['employee', 'hr']:
        employee = Employee.query.filter_by(employee_id=employee_id).first()
        if employee:
            employee.user_id = user.id
    
    db.session.commit()
    
    return {'message': 'User created successfully', 'user': user.to_dict()}, 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    print(f"DEBUG: Received login data: {data}")  # Debug line
    
    if not data or not data.get('email') or not data.get('password'):
        print("DEBUG: Missing email or password")  # Debug line
        return {'error': 'Missing email or password'}, 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        print(f"DEBUG: User not found for email: {data['email']}")  # Debug line
        return {'error': 'Invalid email or password'}, 401
    
    if not user.check_password(data['password']):
        print(f"DEBUG: Password check failed for user: {data['email']}")  # Debug line
        return {'error': 'Invalid email or password'}, 401
    
    access_token = create_access_token(identity=str(user.id))  # Convert to string
    
    print(f"DEBUG: Login successful for user: {data['email']}, token created with identity: {str(user.id)}")  # Debug line
    
    # Include employee information if user is linked to an employee
    employee_data = None
    if user.role in ['employee', 'hr']:
        employee = Employee.query.filter_by(user_id=user.id).first()
        if employee:
            employee_data = employee.to_dict()
    
    return {
        'access_token': access_token,
        'user': user.to_dict(),
        'employee': employee_data
    }, 200

@auth_bp.route('/test', methods=['GET'])
@jwt_required()
def test_jwt():
    """Test JWT token"""
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int
        user = User.query.get(current_user_id)
        
        return {
            'message': 'JWT token is valid',
            'user_id': current_user_id,
            'user': user.to_dict() if user else None
        }, 200
    except Exception as e:
        return {'error': f'JWT error: {str(e)}'}, 401

@auth_bp.route('/validate-employee', methods=['POST'])
def validate_employee():
    """Validate employee for registration"""
    data = request.get_json()
    employee_id = data.get('employee_id')
    email = data.get('email')
    role = data.get('role')
    
    if not employee_id or not email:
        return {'error': 'Missing employee_id or email'}, 400
    
    # Find employee by ID and email
    employee = Employee.query.filter_by(employee_id=employee_id, email=email).first()
    if not employee:
        return {'error': 'Employee not found or email mismatch'}, 400
    
    # Check if employee already has an account
    if employee.user_id:
        return {'error': 'Employee already has an account'}, 400
    
    # For HR role, validate department
    if role == 'hr' and employee.department != 'Human Resource':
        return {'error': 'Only Human Resource department employees can register as HR'}, 400
    
    return {
        'valid': True,
        'employee': employee.to_dict()
    }, 200
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    user = User.query.get(current_user_id)
    
    if not user:
        return {'error': 'User not found'}, 404
    
    # Include employee information if user is linked to an employee
    employee_data = None
    if user.role in ['employee', 'hr']:
        employee = Employee.query.filter_by(user_id=user.id).first()
        if employee:
            employee_data = employee.to_dict()
    
    return {
        'user': user.to_dict(),
        'employee': employee_data
    }, 200

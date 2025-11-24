from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Payslip, User, PayrollRun, Employee
from sqlalchemy import func, extract

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Get overall payroll summary"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.can_view_analytics():
        return {'error': 'Unauthorized'}, 401
    
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    query = Payslip.query
    
    if year and month:
        query = query.join(PayrollRun).filter(
            PayrollRun.year == year,
            PayrollRun.month == month
        )
    
    total_payroll = db.session.query(func.sum(Payslip.net_salary)).select_from(query).scalar() or 0
    total_employees = Employee.query.filter_by(is_active=True).count()
    total_payslips = query.count()
    
    return {
        'total_payroll': float(total_payroll),
        'total_employees': total_employees,
        'total_payslips': total_payslips,
        'average_salary': float(total_payroll / total_employees) if total_employees > 0 else 0
    }, 200

@analytics_bp.route('/department-distribution', methods=['GET'])
@jwt_required()
def get_department_distribution():
    """Get salary distribution by department"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.can_view_analytics():
        return {'error': 'Unauthorized'}, 401
    
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    query = db.session.query(
        Employee.department,
        func.count(Payslip.id).label('count'),
        func.sum(Payslip.net_salary).label('total')
    ).join(Payslip).join(PayrollRun)
    
    if year and month:
        query = query.filter(
            PayrollRun.year == year,
            PayrollRun.month == month
        )
    
    results = query.group_by(Employee.department).all()
    
    return {
        'departments': [
            {
                'department': r[0] or 'Unassigned',
                'employee_count': r[1],
                'total_salary': float(r[2])
            }
            for r in results
        ]
    }, 200

@analytics_bp.route('/monthly-trend', methods=['GET'])
@jwt_required()
def get_monthly_trend():
    """Get monthly payroll trends"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.can_view_analytics():
        return {'error': 'Unauthorized'}, 401
    
    results = db.session.query(
        PayrollRun.year,
        PayrollRun.month,
        func.sum(Payslip.net_salary).label('total'),
        func.count(Payslip.id).label('count')
    ).join(Payslip).group_by(
        PayrollRun.year, PayrollRun.month
    ).order_by(PayrollRun.year, PayrollRun.month).all()
    
    return {
        'trends': [
            {
                'year': r[0],
                'month': r[1],
                'total_payroll': float(r[2]),
                'employee_count': r[3]
            }
            for r in results
        ]
    }, 200

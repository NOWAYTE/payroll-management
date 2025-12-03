from .auth import auth_bp
from .employees import employee_bp
from .payroll import payroll_bp
from .payslips import payslip_bp
from .analytics import analytics_bp

__all__ = ['auth_bp', 'employee_bp', 'payroll_bp', 'payslip_bp', 'analytics_bp']

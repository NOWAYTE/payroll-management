from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='employee', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Relationships
    employee = db.relationship('Employee', back_populates='user', uselist=False)
    payroll_runs = db.relationship('PayrollRun', back_populates='created_by_user')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_hr(self):
        return self.role == 'hr'
    
    def is_employee(self):
        return self.role == 'employee'
    
    def can_manage_employees(self):
        return self.role in ['admin']
    
    def can_process_payroll(self):
        return self.role in ['admin', 'hr']
    
    def can_view_analytics(self):
        return self.role in ['admin']
    
    def can_view_payslips(self):
        return True  # All roles can view payslips (with access control)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

from app import db

class PayrollRun(db.Model):
    __tablename__ = 'payroll_runs'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    basic_salary = db.Column(db.Float, nullable=False)
    deductions = db.Column(db.Float, default=0.0)
    net_salary = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='draft', nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Add unique constraint for one payroll per employee per month
    __table_args__ = (
        db.UniqueConstraint('employee_id', 'month', 'year', name='uk_payroll_runs_employee_month_year'),
    )
    
    # Relationships
    employee = db.relationship('Employee', back_populates='payroll_runs')
    created_by_user = db.relationship('User', back_populates='payroll_runs')
    payslips = db.relationship('Payslip', back_populates='payroll_run', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.name if self.employee else None,
            'month': self.month,
            'year': self.year,
            'basic_salary': float(self.basic_salary) if self.basic_salary is not None else 0.0,
            'deductions': float(self.deductions) if self.deductions is not None else 0.0,
            'net_salary': float(self.net_salary) if self.net_salary is not None else 0.0,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

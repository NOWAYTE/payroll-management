from app import db

class Payslip(db.Model):
    __tablename__ = 'payslips'
    
    id = db.Column(db.Integer, primary_key=True)
    payroll_run_id = db.Column(db.Integer, db.ForeignKey('payroll_runs.id'), nullable=False, index=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False, index=True)
    basic_salary = db.Column(db.Float, nullable=False)
    total_allowances = db.Column(db.Float, default=0)
    total_deductions = db.Column(db.Float, default=0)
    gross_salary = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, default=0)
    net_salary = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), default='pending')
    payment_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Relationships
    payroll_run = db.relationship('PayrollRun', back_populates='payslips')
    employee = db.relationship('Employee', back_populates='payslips')
    details = db.relationship('PayslipDetail', back_populates='payslip', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'payroll_run_id': self.payroll_run_id,
            'employee_id': self.employee_id,
            'basic_salary': float(self.basic_salary),
            'total_allowances': float(self.total_allowances),
            'total_deductions': float(self.total_deductions),
            'gross_salary': float(self.gross_salary),
            'tax': float(self.tax),
            'net_salary': float(self.net_salary),
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

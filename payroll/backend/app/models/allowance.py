from app import db

class Allowance(db.Model):
    __tablename__ = 'allowances'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False, index=True)
    allowance_type = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    is_fixed = db.Column(db.Boolean, default=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # Relationships
    employee = db.relationship('Employee', back_populates='allowances')
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'allowance_type': self.allowance_type,
            'amount': float(self.amount),
            'is_fixed': self.is_fixed,
            'start_date': self.start_date.isoformat()
        }

from app import db

class PayslipDetail(db.Model):
    __tablename__ = 'payslip_details'
    
    id = db.Column(db.Integer, primary_key=True)
    payslip_id = db.Column(db.Integer, db.ForeignKey('payslips.id'), nullable=False, index=True)
    detail_type = db.Column(db.String(20), nullable=False)  # 'allowance' or 'deduction'
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    payslip = db.relationship('Payslip', back_populates='details')
    
    def to_dict(self):
        return {
            'id': self.id,
            'detail_type': self.detail_type,
            'description': self.description,
            'amount': float(self.amount)
        }

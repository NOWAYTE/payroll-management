from flask import Blueprint, jsonify, request
from .. import db
from ..models import Employee, Payslip

payslips_bp = Blueprint("payslips", __name__)

@payslips_bp.route("/generate/<int:emp_id>", methods=["POST"])
def generate_payslip(emp_id):
    emp = Employee.query.get_or_404(emp_id)
    gross = emp.base_salary
    deductions = round(0.10 * gross, 2)
    net = round(gross - deductions, 2)
    month = request.json.get("month") if request.json else None
    if not month:
        from datetime import datetime
        month = datetime.utcnow().strftime("%B %Y")

    payslip = Payslip(employee_id=emp.id, month=month, gross_salary=gross, deductions=deductions, net_salary=net)
    db.session.add(payslip)
    db.session.commit()
    return jsonify({"message": "Payslip generated", "payslip_id": payslip.id, "net": net}), 201

@payslips_bp.route("/employee/<int:emp_id>", methods=["GET"])
def list_payslips_for_employee(emp_id):
    payslips = Payslip.query.filter_by(employee_id=emp_id).all()
    data = [{"id": p.id, "month": p.month, "gross": p.gross_salary, "deductions": p.deductions, "net": p.net_salary} for p in payslips]
    return jsonify(data), 200

@payslips_bp.route("/<int:payslip_id>", methods=["GET"])
def get_payslip(payslip_id):
    p = Payslip.query.get_or_404(payslip_id)
    return jsonify({
        "id": p.id,
        "employee_id": p.employee_id,
        "month": p.month,
        "gross": p.gross_salary,
        "deductions": p.deductions,
        "net": p.net_salary,
        "date_generated": p.date_generated.isoformat() if hasattr(p, "date_generated") and p.date_generated else None,
    }), 200

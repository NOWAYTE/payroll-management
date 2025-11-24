from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class PDFService:
    """Service for generating PDF payslips"""
    
    @staticmethod
    def generate_payslip_pdf(payslip, employee, payroll_run):
        """Generate PDF for a payslip"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=12
        )
        
        # Title
        elements.append(Paragraph("PAYSLIP", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Employee information
        emp_info = [
            ['Employee Name:', employee.name],
            ['Employee ID:', employee.employee_id],
            ['Department:', employee.department or 'N/A'],
            ['Position:', employee.position or 'N/A'],
        ]
        
        emp_table = Table(emp_info, colWidths=[2*inch, 4*inch])
        emp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        
        elements.append(emp_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Payroll period
        period_info = [
            ['Month:', f"{payroll_run.month}/{payroll_run.year}"],
            ['Generated:', datetime.now().strftime('%Y-%m-%d')],
        ]
        
        period_table = Table(period_info, colWidths=[2*inch, 4*inch])
        period_table.setStyle(TableStyle([
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(period_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Salary details
        salary_data = [
            ['Description', 'Amount'],
            ['Basic Salary', f"${payslip.basic_salary:.2f}"],
            ['Total Allowances', f"${payslip.total_allowances:.2f}"],
            ['Gross Salary', f"${payslip.gross_salary:.2f}"],
            ['Total Deductions', f"${payslip.total_deductions:.2f}"],
            ['Tax', f"${payslip.tax:.2f}"],
            ['Net Salary', f"${payslip.net_salary:.2f}"],
        ]
        
        salary_table = Table(salary_data, colWidths=[3*inch, 3*inch])
        salary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e0f2fe')),
        ]))
        
        elements.append(salary_table)
        
        doc.build(elements)
        buffer.seek(0)
        return buffer

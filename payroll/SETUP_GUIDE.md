# Payroll Management System - Setup Guide

## Quick Start (Development)

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### Step 1: Backend Setup

\`\`\`bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env
# Example: DATABASE_URL=mysql+pymysql://root:password@localhost:3306/payroll_db

# Create MySQL database
mysql -u root -p -e "CREATE DATABASE payroll_db;"

# Initialize database schema
mysql -u root -p payroll_db < scripts/001_init_database.sql

# (Optional) Seed demo data
bash seed_data.sh root password localhost payroll_db

# Run Flask server
python run.py
\`\`\`

Backend runs on `http://localhost:5000`

### Step 2: Frontend Setup

\`\`\`bash
# In a new terminal, navigate to frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run Next.js development server
npm run dev
\`\`\`

Frontend runs on `http://localhost:3000`

### Step 3: Access the Application

1. Open `http://localhost:3000/login`
2. Default credentials (from seed data):
   - Admin: `admin@payroll.com` / `admin123`
   - Finance: `finance@payroll.com` / `finance123`

## API Documentation

### Authentication
\`\`\`bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123","role":"employee"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@payroll.com","password":"admin123"}'

# Response includes access_token - use in Authorization header
\`\`\`

### Using JWT Token
\`\`\`bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`

## Key Features to Test

1. **Login** - Test authentication with admin account
2. **Employee Management** - Create, edit, and delete employees
3. **Salary Setup** - Add allowances and deductions
4. **Payroll Processing** - Create and process monthly payroll
5. **Payslip Download** - Generate PDF payslips
6. **Analytics** - View payroll trends and department distribution

## Troubleshooting

### MySQL Connection Error
\`\`\`
Check: 
- MySQL server is running
- Database URL is correct
- User has necessary permissions
\`\`\`

### CORS Error
\`\`\`
Ensure CORS_ORIGINS in backend .env includes frontend URL
\`\`\`

### JWT Token Invalid
\`\`\`
- Login again to get fresh token
- Check JWT_SECRET_KEY is set
\`\`\`

## Production Deployment

1. **Backend**:
   - Set `FLASK_ENV=production`
   - Use production database (AWS RDS, Azure, etc.)
   - Deploy to Heroku, AWS, or similar
   - Set secure JWT_SECRET_KEY

2. **Frontend**:
   - Run `npm run build`
   - Deploy to Vercel, Netlify, or similar
   - Update `NEXT_PUBLIC_API_URL` to production API

3. **Database**:
   - Use managed MySQL service
   - Enable backups
   - Configure secure connection

## Support

For issues:
1. Check error logs in terminal
2. Verify all prerequisites are installed
3. Ensure ports 3000, 5000 are available
4. Check database connectivity

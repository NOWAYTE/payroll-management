# Payroll Management System

A complete payroll management platform built with Flask (backend), MySQL (database), and Next.js (frontend).

## Features

- **Employee Management**: CRUD operations with department and position tracking
- **Salary Management**: Configure basic salary, allowances, and deductions
- **Payroll Processing**: Monthly payroll calculation with automatic tax computation
- **Payslip Generation**: Generate and download payslips as PDF
- **Role-Based Access**: Admin, Finance Manager, and Employee roles
- **Analytics Dashboard**: View payroll trends and departmental salary distribution
- **JWT Authentication**: Secure API endpoints with JWT tokens

## Project Structure

\`\`\`
payroll-system/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # SQLAlchemy models
│   │   ├── services/        # Business logic
│   │   └── __init__.py      # Flask app factory
│   ├── migrations/          # Database migrations
│   ├── scripts/
│   │   └── 001_init_database.sql
│   ├── config.py            # Configuration
│   ├── requirements.txt     # Python dependencies
│   ├── run.py              # Flask entry point
│   └── .env.example        # Environment template
├── frontend/               # Next.js app
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── payroll/
│   │   ├── payslips/
│   │   └── analytics/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── middleware.ts
└── package.json           # Frontend dependencies
\`\`\`

## Backend Setup

### Prerequisites

- Python 3.9+
- MySQL 8.0+
- pip

### Installation

1. Navigate to backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Create virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. Create `.env` file from `.env.example`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

5. Configure database URL in `.env`:
   \`\`\`
   DATABASE_URL=mysql+pymysql://username:password@localhost:3306/payroll_db
   \`\`\`

6. Create database:
   \`\`\`bash
   mysql -u root -p -e "CREATE DATABASE payroll_db;"
   \`\`\`

7. Run database initialization script:
   \`\`\`bash
   mysql -u root -p payroll_db < scripts/001_init_database.sql
   \`\`\`

8. Run Flask app:
   \`\`\`bash
   python run.py
   \`\`\`

The API will be available at `http://localhost:5000`

## Frontend Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:5000
   \`\`\`

3. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (JWT required)

### Employees

- `GET /api/employees` - Get employees (with pagination and search)
- `GET /api/employees/<id>` - Get employee details
- `POST /api/employees` - Create new employee (Finance/Admin only)
- `PUT /api/employees/<id>` - Update employee
- `DELETE /api/employees/<id>` - Soft delete employee

### Payroll

- `GET /api/payroll/runs` - Get payroll runs
- `POST /api/payroll/runs` - Create payroll run
- `POST /api/payroll/runs/<id>/process` - Process payroll for all employees
- `POST /api/payroll/runs/<id>/finalize` - Finalize payroll run

### Payslips

- `GET /api/payslips` - Get payslips (filtered by employee if employee user)
- `GET /api/payslips/<id>` - Get payslip details
- `GET /api/payslips/<id>/pdf` - Download payslip as PDF

### Analytics

- `GET /api/analytics/summary` - Get overall payroll summary
- `GET /api/analytics/department-distribution` - Get salary distribution by department
- `GET /api/analytics/monthly-trend` - Get monthly payroll trends

## User Roles

### Admin
- Full access to all features
- Create and manage employees
- Process payroll
- View analytics
- Generate reports

### Finance Manager
- Create and manage employees
- Process payroll
- View analytics
- Generate reports

### Employee
- View own profile
- Download own payslips
- View own payslip details

## Database Schema

### Users Table
- Stores login credentials and role information
- Supports email/password authentication

### Employees Table
- Employee information (name, contact, position)
- Links to user account
- Department and hire date tracking

### Salaries Table
- Basic salary configuration
- Date-based salary records (supports salary changes)

### Allowances & Deductions
- Fixed and variable compensation components
- Date ranges for active/inactive components

### Payroll Runs & Payslips
- Monthly payroll cycles
- Immutable payslip records
- Detailed breakdown of salary components

## Configuration

### Environment Variables

#### Backend (.env)
\`\`\`
FLASK_ENV=development
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/payroll_db
JWT_SECRET_KEY=your-secret-key-change-in-production
\`\`\`

#### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

## Development

### Running Tests

For backend testing:
\`\`\`bash
cd backend
pytest
\`\`\`

### Code Style

Python: PEP 8
TypeScript/React: ESLint + Prettier

## Production Deployment

1. **Backend**: Deploy Flask app to Heroku, AWS, or similar
2. **Frontend**: Deploy Next.js to Vercel or similar
3. **Database**: Use managed MySQL service (AWS RDS, Azure Database, etc.)
4. **Environment Variables**: Set production values in deployment platform

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in DATABASE_URL
- Ensure database exists

### Login Issues
- Clear browser localStorage
- Check JWT_SECRET_KEY is set
- Verify user exists in database

### API Connection Issues
- Ensure Flask backend is running on port 5000
- Check CORS settings in Flask app
- Verify NEXT_PUBLIC_API_URL in frontend

## License

MIT License - feel free to use this project for commercial or personal use.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

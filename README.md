# Employee Management System (EMS)

A full-stack Employee Management System built with **FastAPI** (backend) and **React + TypeScript** (frontend), designed to streamline core HR operations — employee records, attendance, leave management, and payroll — through a single, role-based platform.

## Features

- **Role-based access control** — Admin, HR, Manager, and Staff each get a tailored experience with permissions scoped to their responsibilities
- **Authentication** — secure JWT-based login with bcrypt password hashing
- **Employee management** — full CRUD for employee records, linked to departments
- **Department management** — organizational structure management
- **Attendance tracking** — daily check-in/check-out logging and history
- **Leave management** — leave types, leave requests (apply/approve/reject), and leave balance tracking
- **Payroll** — monthly payroll generation with automatic net salary calculation
- **Dependents tracking** — manage employee dependents for benefits/insurance purposes
- **Audit & approval logs** — system-wide activity tracking for accountability

## Tech Stack

**Backend**
- FastAPI (Python, async)
- PostgreSQL + SQLAlchemy (async ORM)
- Alembic (database migrations)
- Pydantic (data validation)
- JWT (python-jose) + bcrypt for authentication
- Repository + Service layered architecture (SOLID principles, Singleton, Factory, Repository patterns)

**Frontend**
- React + TypeScript
- Vite
- React Router
- Axios

## Architecture

The backend follows a strict layered architecture:

```
Route → Service → Repository → Model → Database
```

- **Routes** (`api/v1/endpoints/`) — handle HTTP concerns only (request/response, status codes)
- **Services** (`services/`) — business logic and rules
- **Repositories** (`repositories/`) — the only layer that queries the database
- **Models** (`models/`) — SQLAlchemy ORM definitions mapping to database tables
- **Schemas** (`schemas/`) — Pydantic models validating API request/response shapes

## Project Structure

```
Internship/
├── app/
│   ├── api/v1/endpoints/       # Route handlers, one file per entity
│   ├── core/                   # Config, database connection, security, exceptions
│   ├── models/                 # SQLAlchemy models
│   ├── repositories/           # Data access layer
│   ├── schemas/                # Pydantic validation schemas
│   ├── services/                # Business logic layer
│   └── main.py                  # FastAPI app entrypoint
├── alembic/                     # Database migrations
├── ems_frontend/                 # React frontend
├── .env                          # Environment variables (not committed)
└── alembic.ini
```

## Database Schema

Core entities: `Employee`, `Department`, `Attendance`, `LeaveType`, `LeaveRequest`, `LeaveBalance`, `Payroll`, `ApprovalLog`, `AuditLog`, `Dependent`.

Role hierarchy (Admin/HR/Manager/Staff) is implemented via a discriminator column (`role`) on the `Employee` table rather than separate tables, avoiding unnecessary joins while preserving the conceptual ISA relationship from the ERD.

## Getting Started

### Backend Setup

```bash
# Navigate to project root
cd Internship

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
source .venv/bin/activate         # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# DATABASE_URL=postgresql+asyncpg://<user>:<password>@localhost:5432/ems_db
# SECRET_KEY=<your-secret-key>

# Create the database
# CREATE DATABASE ems_db;

# Run migrations
alembic upgrade head

# Start the server
python -m uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000` — interactive API docs available at `http://127.0.0.1:8000/docs`.

### Frontend Setup

```bash
cd ems_frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Documentation

Once the backend is running, full interactive API documentation (Swagger UI) is available at:

```
http://127.0.0.1:8000/docs
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Secret key used to sign JWT tokens |

## License

This project was developed as part of an internship program.

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, employees, departments, attendance, leave, payroll, audit, dependents
)
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(leave.router, prefix="/leave", tags=["Leave"])
api_router.include_router(payroll.router, prefix="/payroll", tags=["Payroll"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_router.include_router(dependents.router, prefix="/dependents", tags=["Dependents"])
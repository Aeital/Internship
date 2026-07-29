from datetime import date
from pydantic import BaseModel, EmailStr
from app.models.models import RoleEnum


class EmployeeBase(BaseModel):
    emp_name: str
    dob: date
    phone: str | None = None
    hire_date: date
    email: EmailStr
    role: RoleEnum
    dept_id: int
    manager_id: int | None = None
    staff_grade: str | None = None


class EmployeeCreate(EmployeeBase):
    password: str


class EmployeeUpdate(BaseModel):
    emp_name: str | None = None
    phone: str | None = None
    dept_id: int | None = None
    manager_id: int | None = None
    staff_grade: str | None = None


class EmployeeResponse(EmployeeBase):
    emp_id: int

    class Config:
        from_attributes = True
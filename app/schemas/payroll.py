from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class PayrollBase(BaseModel):
    emp_id: int
    month: str  # format "YYYY-MM"
    basic_salary: Decimal
    deductions: Decimal = Decimal("0")


class PayrollCreate(PayrollBase):
    pass


class PayrollUpdate(BaseModel):
    basic_salary: Decimal | None = None
    deductions: Decimal | None = None


class PayrollResponse(PayrollBase):
    payroll_id: int
    generated_at: datetime
    net_salary: float

    class Config:
        from_attributes = True
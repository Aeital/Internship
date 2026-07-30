from datetime import date
from pydantic import BaseModel
from app.models.models import LeaveStatus


# --- LeaveType ---
class LeaveTypeBase(BaseModel):
    type_name: str
    annual_allowance: int


class LeaveTypeCreate(LeaveTypeBase):
    pass


class LeaveTypeUpdate(BaseModel):
    type_name: str | None = None
    annual_allowance: int | None = None


class LeaveTypeResponse(LeaveTypeBase):
    type_id: int

    class Config:
        from_attributes = True


# --- LeaveRequest ---
class LeaveRequestBase(BaseModel):
    emp_id: int
    type_id: int
    start_date: date
    end_date: date


class LeaveRequestCreate(LeaveRequestBase):
    pass


class LeaveRequestUpdate(BaseModel):
    leave_status: LeaveStatus | None = None
    approved_by: int | None = None


class LeaveRequestResponse(LeaveRequestBase):
    leave_id: int
    leave_status: LeaveStatus
    approved_by: int | None = None

    class Config:
        from_attributes = True


# --- LeaveBalance ---
class LeaveBalanceBase(BaseModel):
    emp_id: int
    type_id: int
    balance_days: int


class LeaveBalanceCreate(LeaveBalanceBase):
    pass


class LeaveBalanceUpdate(BaseModel):
    balance_days: int | None = None


class LeaveBalanceResponse(LeaveBalanceBase):
    balance_id: int

    class Config:
        from_attributes = True
from datetime import date, time
from pydantic import BaseModel
from app.models.models import AttendanceStatus, LeaveStatus


class AttendanceBase(BaseModel):
    emp_id: int
    att_date: date
    check_in: time | None = None
    check_out: time | None = None
    att_status: AttendanceStatus = AttendanceStatus.PRESENT


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    check_in: time | None = None
    check_out: time | None = None
    att_status: AttendanceStatus | None = None
class AttendanceResponse(AttendanceBase):
    att_id: int
    approval_status: LeaveStatus  # NEW

    class Config:
        from_attributes = True
from datetime import datetime
from pydantic import BaseModel


# --- ApprovalLog ---
class ApprovalLogBase(BaseModel):
    leave_id: int
    action: str
    approved_by: int | None = None
    remarks: str | None = None


class ApprovalLogCreate(ApprovalLogBase):
    pass


class ApprovalLogResponse(ApprovalLogBase):
    log_id: int
    approved_on: datetime

    class Config:
        from_attributes = True


# --- AuditLog ---
class AuditLogCreate(BaseModel):
    emp_id: int
    action_type: str
    table_affected: str
    record_id: int | None = None
    old_value: str | None = None
    new_value: str | None = None


class AuditLogResponse(AuditLogCreate):
    audit_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
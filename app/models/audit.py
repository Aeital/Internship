from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    leave_id = Column(Integer, ForeignKey("leave_requests.leave_id"), nullable=False)
    approved_on = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(String(255), nullable=True)

    leave_request = relationship("LeaveRequest", backref="approval_logs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)

    action_type = Column(String(20), nullable=False)   # CREATE, UPDATE, DELETE, APPROVE, LOGIN
    table_affected = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=True)          # which row was affected
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", backref="audit_logs")
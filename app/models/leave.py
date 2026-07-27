import enum
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class LeaveType(Base):
    __tablename__ = "leave_types"

    type_id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(50), nullable=False, unique=True)
    annual_allowance = Column(Integer, nullable=False)


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    leave_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)
    type_id = Column(Integer, ForeignKey("leave_types.type_id"), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    leave_status = Column(Enum(LeaveStatus), nullable=False, default=LeaveStatus.PENDING)

    # Manager who approved/rejected — per ERD, only Manager subtype approves
    approved_by = Column(Integer, ForeignKey("employees.emp_id"), nullable=True)

    employee = relationship("Employee", foreign_keys=[emp_id], backref="leave_requests")
    approver = relationship("Employee", foreign_keys=[approved_by])
    leave_type = relationship("LeaveType")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    balance_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)
    type_id = Column(Integer, ForeignKey("leave_types.type_id"), nullable=False)

    balance_days = Column(Integer, nullable=False)

    employee = relationship("Employee", backref="leave_balances")
    leave_type = relationship("LeaveType")
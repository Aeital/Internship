import enum
from sqlalchemy import Column, Integer, String, Text, Date, Time, DateTime, Enum, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
class RoleEnum(str, enum.Enum):
    """
    ISA hierarchy implemented as a discriminator column (standard practice 
    for disjoint specialization in relational databases).
    """
    ADMIN = "admin"
    HR = "hr"
    MANAGER = "manager"
    STAFF = "staff"
class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    HALF_DAY = "half_day"
    LATE = "late"
class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(100), nullable=False, unique=True)
    dept_description = Column(String(255), nullable=True)

    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"
    
    emp_id = Column(Integer, primary_key=True, index=True)
    emp_name = Column(String(100), nullable=False)
    dob = Column(Date, nullable=False)
    phone = Column(String(20), nullable=True)
    hire_date = Column(Date, nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.STAFF)

    # Role-specific attributes
    staff_grade = Column(String(20), nullable=True) 

    # Relationships
    dept_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=False)
    department = relationship("Department", back_populates="employees")

    # Self-referencing FK for managers
    manager_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=True)
    manager = relationship("Employee", remote_side=[emp_id], backref="team_members")

    @property
    def mgr_team_size(self) -> int:
        """Derived attribute: computed dynamically, not stored in the database."""
        return len(self.team_members) if self.role == RoleEnum.MANAGER else 0


class Dependent(Base):
    __tablename__ = "dependents"

    dep_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)
    dep_name = Column(String(100), nullable=False)
    relationship_type = Column(String(30), nullable=False) 

    employee = relationship("Employee", backref="dependents")


class Attendance(Base):
    __tablename__ = "attendance"
    
    att_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)
    att_date = Column(Date, nullable=False)
    check_in = Column(Time, nullable=True)
    check_out = Column(Time, nullable=True)
    att_status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.PRESENT)
    
    employee = relationship("Employee", backref="attendance_records")


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


class Payroll(Base):
    __tablename__ = "payroll"

    payroll_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)

    month = Column(String(7), nullable=False)  # format "YYYY-MM"
    basic_salary = Column(Numeric(10, 2), nullable=False)
    deductions = Column(Numeric(10, 2), nullable=False, default=0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", backref="payroll_records")

    @property
    def net_salary(self) -> float:
        """
        Derived attribute (per ERD, dashed ellipse) — always computed
        from basic_salary - deductions, never stored directly to avoid
        data drift between salary/deductions and the net figure.
        """
        return float(self.basic_salary) - float(self.deductions)


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
    action_type = Column(String(20), nullable=False) 
    table_affected = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=True) 
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", backref="audit_logs")

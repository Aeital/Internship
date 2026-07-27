import enum
from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
class RoleEnum(str, enum.Enum):
    """
    ISA hierarchy (Employee -> Admin/HR/Manager/Staff) is implemented
    as a discriminator column, not separate tables — standard practice
    for disjoint specialization in relational DBs.
    """
    ADMIN = "admin"
    HR = "hr"
    MANAGER = "manager"
    STAFF = "staff"


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

    # Role-specific attributes (only relevant depending on `role`)
    staff_grade = Column(String(20), nullable=True)   # used when role == STAFF
    # mgr_team_size is a DERIVED attribute (per ERD) — not stored,
    # computed via a property/query (count of employees managed), see below

    dept_id = Column(Integer, ForeignKey("departments.dept_id"), nullable=False)
    department = relationship("Department", back_populates="employees")

    # Self-referencing FK: an employee's manager is also an Employee
    manager_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=True)
    manager = relationship("Employee", remote_side=[emp_id], backref="team_members")

    @property
    def mgr_team_size(self) -> int:
        """
        Derived attribute (per ERD, dashed ellipse = not stored).
        Only meaningful when role == MANAGER.
        """
        return len(self.team_members) if self.role == RoleEnum.MANAGER else 0
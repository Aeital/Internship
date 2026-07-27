from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


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
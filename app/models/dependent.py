from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
class Dependent(Base):
    __tablename__ = "dependents"

    # Weak entity per ERD — identifying relationship with Employee
    dep_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)

    dep_name = Column(String(100), nullable=False)
    relationship_type = Column(String(30), nullable=False)  # e.g. spouse, child, parent

    employee = relationship("Employee", backref="dependents")
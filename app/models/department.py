from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base
class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(100), nullable=False, unique=True)
    dept_description = Column(String(255), nullable=True)

    employees = relationship("Employee", back_populates="department")
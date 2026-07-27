import enum
from sqlalchemy import Column, Integer, Date, Time, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    HALF_DAY = "half_day"
    LATE = "late"
class Attendance(Base):
    __tablename__ = "attendance"

    att_id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(Integer, ForeignKey("employees.emp_id"), nullable=False)

    att_date = Column(Date, nullable=False)
    check_in = Column(Time, nullable=True)
    check_out = Column(Time, nullable=True)
    att_status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.PRESENT)

    employee = relationship("Employee", backref="attendance_records")
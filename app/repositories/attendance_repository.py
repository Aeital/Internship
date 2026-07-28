from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.attendance import Attendance
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: AsyncSession):
        super().__init__(Attendance, db)

    async def get_by_employee(self, emp_id: int) -> list[Attendance]:
        result = await self.db.execute(select(Attendance).where(Attendance.emp_id == emp_id))
        return list(result.scalars().all())

    async def get_by_employee_and_date(self, emp_id: int, att_date: date) -> Attendance | None:
        result = await self.db.execute(
            select(Attendance).where(Attendance.emp_id == emp_id, Attendance.att_date == att_date)
        )
        return result.scalar_one_or_none()
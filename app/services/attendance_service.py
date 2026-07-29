from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.attendance_repository import AttendanceRepository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate


class AttendanceService:
    def __init__(self, db: AsyncSession):
        self.repo = AttendanceRepository(db)

    async def mark_attendance(self, data: AttendanceCreate):
        return await self.repo.create(data.model_dump())

    async def get_attendance(self, att_id: int):
        return await self.repo.get_by_id(att_id)

    async def list_attendance(self):
        return await self.repo.get_all()

    async def get_by_employee(self, emp_id: int):
        return await self.repo.get_by_employee(emp_id)

    async def update_attendance(self, att_id: int, data: AttendanceUpdate):
        payload = data.model_dump(exclude_unset=True)
        return await self.repo.update(att_id, payload)

    async def delete_attendance(self, att_id: int):
        return await self.repo.delete(att_id)
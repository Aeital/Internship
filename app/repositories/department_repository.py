from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.department import Department
from app.repositories.base import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self, db: AsyncSession):
        super().__init__(Department, db)

    async def get_by_name(self, name: str) -> Department | None:
        result = await self.db.execute(select(Department).where(Department.dept_name == name))
        return result.scalar_one_or_none()
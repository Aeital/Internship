from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Employee, RoleEnum
from app.repositories.base import BaseRepository


class EmployeeRepository(BaseRepository[Employee]):
    def __init__(self, db: AsyncSession):
        super().__init__(Employee, db)

    async def get_by_email(self, email: str) -> Employee | None:
        result = await self.db.execute(select(Employee).where(Employee.email == email))
        return result.scalar_one_or_none()

    async def get_by_department(self, dept_id: int) -> list[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.dept_id == dept_id))
        return list(result.scalars().all())

    async def get_team_members(self, manager_id: int) -> list[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.manager_id == manager_id))
        return list(result.scalars().all())

    async def get_by_role(self, role: RoleEnum) -> list[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.role == role))
        return list(result.scalars().all())
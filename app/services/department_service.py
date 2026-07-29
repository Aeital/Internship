from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.department_repository import DepartmentRepository
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    def __init__(self, db: AsyncSession):
        self.repo = DepartmentRepository(db)

    async def create_department(self, data: DepartmentCreate):
        return await self.repo.create(data.model_dump())

    async def get_department(self, dept_id: int):
        return await self.repo.get_by_id(dept_id)

    async def list_departments(self):
        return await self.repo.get_all()

    async def update_department(self, dept_id: int, data: DepartmentUpdate):
        payload = data.model_dump(exclude_unset=True)
        return await self.repo.update(dept_id, payload)

    async def delete_department(self, dept_id: int):
        return await self.repo.delete(dept_id)
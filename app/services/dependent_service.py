from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.dependent_repository import DependentRepository
from app.schemas.dependent import DependentCreate, DependentUpdate


class DependentService:
    def __init__(self, db: AsyncSession):
        self.repo = DependentRepository(db)

    async def create(self, data: DependentCreate):
        return await self.repo.create(data.model_dump())

    async def get(self, dep_id: int):
        return await self.repo.get_by_id(dep_id)

    async def get_by_employee(self, emp_id: int):
        return await self.repo.get_by_employee(emp_id)

    async def update(self, dep_id: int, data: DependentUpdate):
        return await self.repo.update(dep_id, data.model_dump(exclude_unset=True))

    async def delete(self, dep_id: int):
        return await self.repo.delete(dep_id)
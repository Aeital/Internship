from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Dependent
from app.repositories.base import BaseRepository


class DependentRepository(BaseRepository[Dependent]):
    def __init__(self, db: AsyncSession):
        super().__init__(Dependent, db)

    async def get_by_employee(self, emp_id: int) -> list[Dependent]:
        result = await self.db.execute(select(Dependent).where(Dependent.emp_id == emp_id))
        return list(result.scalars().all())
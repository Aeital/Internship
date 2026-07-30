from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import LeaveType
from app.repositories.base import BaseRepository


class LeaveTypeRepository(BaseRepository[LeaveType]):
    def __init__(self, db: AsyncSession):
        super().__init__(LeaveType, db)

    async def get_by_name(self, name: str) -> LeaveType | None:
        result = await self.db.execute(select(LeaveType).where(LeaveType.type_name == name))
        return result.scalar_one_or_none()
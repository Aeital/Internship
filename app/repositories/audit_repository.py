from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import ApprovalLog, AuditLog
from app.repositories.base import BaseRepository


class ApprovalLogRepository(BaseRepository[ApprovalLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(ApprovalLog, db)

    async def get_by_leave_request(self, leave_id: int) -> list[ApprovalLog]:
        result = await self.db.execute(select(ApprovalLog).where(ApprovalLog.leave_id == leave_id))
        return list(result.scalars().all())


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(AuditLog, db)

    async def get_by_employee(self, emp_id: int) -> list[AuditLog]:
        result = await self.db.execute(select(AuditLog).where(AuditLog.emp_id == emp_id))
        return list(result.scalars().all())
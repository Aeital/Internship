from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.audit_repository import ApprovalLogRepository, AuditLogRepository
from app.schemas.audit import ApprovalLogCreate, AuditLogCreate


class ApprovalLogService:
    def __init__(self, db: AsyncSession):
        self.repo = ApprovalLogRepository(db)

    async def create(self, data: ApprovalLogCreate):
        return await self.repo.create(data.model_dump())

    async def get_by_leave_request(self, leave_id: int):
        return await self.repo.get_by_leave_request(leave_id)

    async def list_all(self):
        return await self.repo.get_all()


class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.repo = AuditLogRepository(db)

    async def create(self, data: AuditLogCreate):
        return await self.repo.create(data.model_dump())

    async def get_by_employee(self, emp_id: int):
        return await self.repo.get_by_employee(emp_id)

    async def list_all(self):
        return await self.repo.get_all()
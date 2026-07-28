from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import LeaveRequest, LeaveBalance, LeaveStatus, Employee 
from app.repositories.base import BaseRepository


class LeaveRepository(BaseRepository[LeaveRequest]):
    def __init__(self, db: AsyncSession):
        super().__init__(LeaveRequest, db)

    async def get_by_employee(self, emp_id: int) -> list[LeaveRequest]:
        result = await self.db.execute(select(LeaveRequest).where(LeaveRequest.emp_id == emp_id))
        return list(result.scalars().all())

    async def get_pending_for_approval(self, manager_id: int) -> list[LeaveRequest]:
        result = await self.db.execute(
            select(LeaveRequest)
            .join(Employee, Employee.emp_id == LeaveRequest.emp_id)
            .where(Employee.manager_id == manager_id, LeaveRequest.leave_status == LeaveStatus.PENDING)
        )
        return list(result.scalars().all())

    async def get_balance(self, emp_id: int, type_id: int) -> LeaveBalance | None:
        result = await self.db.execute(
            select(LeaveBalance).where(LeaveBalance.emp_id == emp_id, LeaveBalance.type_id == type_id)
        )
        return result.scalar_one_or_none()
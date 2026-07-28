from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payroll import Payroll
from app.repositories.base import BaseRepository


class PayrollRepository(BaseRepository[Payroll]):
    def __init__(self, db: AsyncSession):
        super().__init__(Payroll, db)

    async def get_by_employee(self, emp_id: int) -> list[Payroll]:
        result = await self.db.execute(select(Payroll).where(Payroll.emp_id == emp_id))
        return list(result.scalars().all())

    async def get_by_employee_and_month(self, emp_id: int, month: str) -> Payroll | None:
        result = await self.db.execute(
            select(Payroll).where(Payroll.emp_id == emp_id, Payroll.month == month)
        )
        return result.scalar_one_or_none()
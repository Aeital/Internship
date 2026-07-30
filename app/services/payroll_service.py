from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.payroll_repository import PayrollRepository
from app.schemas.payroll import PayrollCreate, PayrollUpdate
from app.core.exceptions import AppException


class PayrollService:
    def __init__(self, db: AsyncSession):
        self.repo = PayrollRepository(db)

    async def generate_payroll(self, data: PayrollCreate):
        existing = await self.repo.get_by_employee_and_month(data.emp_id, data.month)
        if existing:
            raise AppException(f"Payroll for {data.month} already exists for this employee", 400)
        return await self.repo.create(data.model_dump())

    async def get_payroll(self, payroll_id: int):
        return await self.repo.get_by_id(payroll_id)

    async def list_payroll(self):
        return await self.repo.get_all()

    async def get_by_employee(self, emp_id: int):
        return await self.repo.get_by_employee(emp_id)

    async def update_payroll(self, payroll_id: int, data: PayrollUpdate):
        return await self.repo.update(payroll_id, data.model_dump(exclude_unset=True))

    async def delete_payroll(self, payroll_id: int):
        return await self.repo.delete(payroll_id)
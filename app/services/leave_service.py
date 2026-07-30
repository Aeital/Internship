from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.leave_repository import LeaveRepository
from app.repositories.leave_type_repository import LeaveTypeRepository
from app.schemas.leave import (
    LeaveTypeCreate, LeaveTypeUpdate,
    LeaveRequestCreate, LeaveRequestUpdate,
    LeaveBalanceCreate, LeaveBalanceUpdate,
)


class LeaveTypeService:
    def __init__(self, db: AsyncSession):
        self.repo = LeaveTypeRepository(db)

    async def create(self, data: LeaveTypeCreate):
        return await self.repo.create(data.model_dump())

    async def get(self, type_id: int):
        return await self.repo.get_by_id(type_id)

    async def list_all(self):
        return await self.repo.get_all()

    async def update(self, type_id: int, data: LeaveTypeUpdate):
        return await self.repo.update(type_id, data.model_dump(exclude_unset=True))

    async def delete(self, type_id: int):
        return await self.repo.delete(type_id)


class LeaveRequestService:
    def __init__(self, db: AsyncSession):
        self.repo = LeaveRepository(db)

    async def create(self, data: LeaveRequestCreate):
        return await self.repo.create(data.model_dump())

    async def get(self, leave_id: int):
        return await self.repo.get_by_id(leave_id)

    async def list_all(self):
        return await self.repo.get_all()

    async def get_by_employee(self, emp_id: int):
        return await self.repo.get_by_employee(emp_id)

    async def get_pending_for_manager(self, manager_id: int):
        return await self.repo.get_pending_for_approval(manager_id)

    async def update(self, leave_id: int, data: LeaveRequestUpdate):
        return await self.repo.update(leave_id, data.model_dump(exclude_unset=True))

    async def delete(self, leave_id: int):
        return await self.repo.delete(leave_id)


class LeaveBalanceService:
    def __init__(self, db: AsyncSession):
        self.repo = LeaveRepository(db)  # LeaveBalance methods live in leave_repository.py

    async def get_balance(self, emp_id: int, type_id: int):
        return await self.repo.get_balance(emp_id, type_id)
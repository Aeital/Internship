from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.employee_repository import EmployeeRepository
from app.core.security import hash_password
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class EmployeeService:
    def __init__(self, db: AsyncSession):
        self.repo = EmployeeRepository(db)

    async def create_employee(self, data: EmployeeCreate):
        payload = data.model_dump(exclude={"password"})
        payload["hashed_password"] = hash_password(data.password)
        return await self.repo.create(payload)

    async def get_employee(self, emp_id: int):
        return await self.repo.get_by_id(emp_id)

    async def list_employees(self):
        return await self.repo.get_all()

    async def update_employee(self, emp_id: int, data: EmployeeUpdate):
        payload = data.model_dump(exclude_unset=True)
        return await self.repo.update(emp_id, payload)

    async def delete_employee(self, emp_id: int):
        return await self.repo.delete(emp_id)
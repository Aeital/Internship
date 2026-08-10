from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.employee_repository import EmployeeRepository
from app.core.security import hash_password
from app.schemas.employee import EmployeeCreate, EmployeeUpdate



class EmployeeService:
    def __init__(self, db: AsyncSession):
        from app.services.audit_service import AuditLogService
        self.repo = EmployeeRepository(db)
        self.audit = AuditLogService(db)

    async def create_employee(self, data: EmployeeCreate):
        payload = data.model_dump(exclude={"password"})
        payload["hashed_password"] = hash_password(data.password)
        employee = await self.repo.create(payload)
        await self.audit.create(AuditLogCreate(
            emp_id=employee.emp_id,
            action_type="CREATE",
            table_affected="employees",
            record_id=employee.emp_id,
            old_value=None,
            new_value=str(payload),
        ))
        return employee

    async def get_employee(self, emp_id: int):
        return await self.repo.get_by_id(emp_id)

    async def list_employees(self):
        return await self.repo.get_all()

    async def update_employee(self, emp_id: int, data: EmployeeUpdate):
        payload = data.model_dump(exclude_unset=True)
        employee = await self.repo.update(emp_id, payload)
        if employee:
            await self.audit.create(AuditLogCreate(
                emp_id=emp_id,
                action_type="UPDATE",
                table_affected="employees",
                record_id=emp_id,
                old_value=None,
                new_value=str(payload),
            ))
        return employee

    async def delete_employee(self, emp_id: int):
        deleted = await self.repo.delete(emp_id)
        if deleted:
            await self.audit.create(AuditLogCreate(
                emp_id=emp_id,
                action_type="DELETE",
                table_affected="employees",
                record_id=emp_id,
                old_value=None,
                new_value=None,
            ))
        return deleted
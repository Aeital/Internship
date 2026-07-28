from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.employee_repository import EmployeeRepository
from app.core.security import verify_password, create_access_token


class AuthService:
    def __init__(self, db: AsyncSession):
        self.employee_repo = EmployeeRepository(db)

    async def login(self, email: str, password: str) -> str | None:
        employee = await self.employee_repo.get_by_email(email)
        if not employee:
            return None
        if not verify_password(password, employee.hashed_password):
            return None

        token = create_access_token(
            data={"emp_id": employee.emp_id, "role": employee.role.value}
        )
        return token
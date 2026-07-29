from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_access_token
from app.repositories.employee_repository import EmployeeRepository
from app.models.models import Employee, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Employee:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    emp_id = payload.get("emp_id")
    employee_repo = EmployeeRepository(db)
    employee = await employee_repo.get_by_id(emp_id)
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return employee


def require_role(*allowed_roles: RoleEnum):
    """
    Factory function returning a dependency that checks the current
    user's role is one of the allowed roles for this route.
    """
    async def role_checker(current_user: Employee = Depends(get_current_user)) -> Employee:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user
    return role_checker
#uses FastAPI's dependency injection system, handles authentication and authorization

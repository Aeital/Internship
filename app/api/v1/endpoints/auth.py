from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={
        401: {
            "description": "Invalid email or password",
            "content": {"application/json": {"example": {"success": False, "error": "Invalid email or password", "status_code": 401}}},
        },
        422: {"description": "Validation failed"},
        500: {"description": "Database or server error"},
    },
)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    token = await auth_service.login(payload.user_email, payload.password)
    if not token:
        raise UnauthorizedException("Invalid email or password")
    return TokenResponse(access_token=token)

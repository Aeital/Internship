from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import UnauthorizedException
from app.core.openapi_responses import UNAUTHORIZED_RESPONSE, VALIDATION_RESPONSE, DB_ERROR_RESPONSE
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={**UNAUTHORIZED_RESPONSE, **VALIDATION_RESPONSE, **DB_ERROR_RESPONSE},
)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    token = await auth_service.login(payload.user_email, payload.password)
    if not token:
        raise UnauthorizedException("Invalid email or password")
    return TokenResponse(access_token=token)
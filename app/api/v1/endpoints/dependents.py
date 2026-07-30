from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.openapi_responses import NOT_FOUND_RESPONSE, VALIDATION_RESPONSE, DB_ERROR_RESPONSE
from app.schemas.dependent import DependentCreate, DependentUpdate, DependentResponse
from app.services.dependent_service import DependentService

router = APIRouter()


@router.post(
    "/",
    response_model=DependentResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**VALIDATION_RESPONSE, **DB_ERROR_RESPONSE},
)
async def create_dependent(payload: DependentCreate, db: AsyncSession = Depends(get_db)):
    service = DependentService(db)
    return await service.create(payload)


@router.get(
    "/employee/{emp_id}",
    response_model=list[DependentResponse],
    responses={**DB_ERROR_RESPONSE},
)
async def get_employee_dependents(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = DependentService(db)
    return await service.get_by_employee(emp_id)


@router.get(
    "/{dep_id}",
    response_model=DependentResponse,
    responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE},
)
async def get_dependent(dep_id: int, db: AsyncSession = Depends(get_db)):
    service = DependentService(db)
    result = await service.get(dep_id)
    if not result:
        raise NotFoundException("Dependent not found")
    return result


@router.put(
    "/{dep_id}",
    response_model=DependentResponse,
    responses={**NOT_FOUND_RESPONSE, **VALIDATION_RESPONSE, **DB_ERROR_RESPONSE},
)
async def update_dependent(dep_id: int, payload: DependentUpdate, db: AsyncSession = Depends(get_db)):
    service = DependentService(db)
    result = await service.update(dep_id, payload)
    if not result:
        raise NotFoundException("Dependent not found")
    return result


@router.delete(
    "/{dep_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE},
)
async def delete_dependent(dep_id: int, db: AsyncSession = Depends(get_db)):
    service = DependentService(db)
    deleted = await service.delete(dep_id)
    if not deleted:
        raise NotFoundException("Dependent not found")
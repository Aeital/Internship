from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.openapi_responses import NOT_FOUND_RESPONSE, VALIDATION_RESPONSE, DB_ERROR_RESPONSE, BAD_REQUEST_RESPONSE
from app.schemas.payroll import PayrollCreate, PayrollUpdate, PayrollResponse
from app.services.payroll_service import PayrollService

router = APIRouter()


@router.post(
    "/",
    response_model=PayrollResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**BAD_REQUEST_RESPONSE, **VALIDATION_RESPONSE, **DB_ERROR_RESPONSE},
)
async def generate_payroll(payload: PayrollCreate, db: AsyncSession = Depends(get_db)):
    service = PayrollService(db)
    return await service.generate_payroll(payload)


@router.get(
    "/",
    response_model=list[PayrollResponse],
    responses={**DB_ERROR_RESPONSE},
)
async def list_payroll(db: AsyncSession = Depends(get_db)):
    service = PayrollService(db)
    return await service.list_payroll()


@router.get(
    "/employee/{emp_id}",
    response_model=list[PayrollResponse],
    responses={**DB_ERROR_RESPONSE},
)
async def get_employee_payroll(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = PayrollService(db)
    return await service.get_by_employee(emp_id)


@router.get(
    "/{payroll_id}",
    response_model=PayrollResponse,
    responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE},
)
async def get_payroll(payroll_id: int, db: AsyncSession = Depends(get_db)):
    service = PayrollService(db)
    record = await service.get_payroll(payroll_id)
    if not record:
        raise NotFoundException("Payroll record not found")
    return record


@router.put(
    "/{payroll_id}",
    response_model=PayrollResponse,
    responses={**NOT_FOUND_RESPONSE, **VALIDATION_RESPONSE, **DB_ERROR_RESPONSE},
)
async def update_payroll(payroll_id: int, payload: PayrollUpdate, db: AsyncSession = Depends(get_db)):
    service = PayrollService(db)
    record = await service.update_payroll(payroll_id, payload)
    if not record:
        raise NotFoundException("Payroll record not found")
    return record


@router.delete(
    "/{payroll_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE},
)
async def delete_payroll(payroll_id: int, db: AsyncSession = Depends(get_db)):
    service = PayrollService(db)
    deleted = await service.delete_payroll(payroll_id)
    if not deleted:
        raise NotFoundException("Payroll record not found")
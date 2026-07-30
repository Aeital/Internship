from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.schemas.leave import (
    LeaveTypeCreate, LeaveTypeUpdate, LeaveTypeResponse,
    LeaveRequestCreate, LeaveRequestUpdate, LeaveRequestResponse,
    LeaveBalanceResponse,
)
from app.services.leave_service import LeaveTypeService, LeaveRequestService, LeaveBalanceService

router = APIRouter()


# --- LeaveType routes ---
@router.post("/types", response_model=LeaveTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_type(payload: LeaveTypeCreate, db: AsyncSession = Depends(get_db)):
    service = LeaveTypeService(db)
    return await service.create(payload)


@router.get("/types", response_model=list[LeaveTypeResponse])
async def list_leave_types(db: AsyncSession = Depends(get_db)):
    service = LeaveTypeService(db)
    return await service.list_all()


@router.get("/types/{type_id}", response_model=LeaveTypeResponse)
async def get_leave_type(type_id: int, db: AsyncSession = Depends(get_db)):
    service = LeaveTypeService(db)
    result = await service.get(type_id)
    if not result:
        raise NotFoundException("Leave type not found")
    return result


# --- LeaveRequest routes ---
@router.post("/requests", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_request(payload: LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    return await service.create(payload)


@router.get("/requests", response_model=list[LeaveRequestResponse])
async def list_leave_requests(db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    return await service.list_all()


@router.get("/requests/employee/{emp_id}", response_model=list[LeaveRequestResponse])
async def get_employee_leave_requests(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    return await service.get_by_employee(emp_id)


@router.get("/requests/pending/{manager_id}", response_model=list[LeaveRequestResponse])
async def get_pending_for_manager(manager_id: int, db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    return await service.get_pending_for_manager(manager_id)


@router.get("/requests/{leave_id}", response_model=LeaveRequestResponse)
async def get_leave_request(leave_id: int, db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    result = await service.get(leave_id)
    if not result:
        raise NotFoundException("Leave request not found")
    return result


@router.put("/requests/{leave_id}", response_model=LeaveRequestResponse)
async def update_leave_request(leave_id: int, payload: LeaveRequestUpdate, db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    result = await service.update(leave_id, payload)
    if not result:
        raise NotFoundException("Leave request not found")
    return result


@router.delete("/requests/{leave_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_leave_request(leave_id: int, db: AsyncSession = Depends(get_db)):
    service = LeaveRequestService(db)
    deleted = await service.delete(leave_id)
    if not deleted:
        raise NotFoundException("Leave request not found")


# --- LeaveBalance routes ---
@router.get("/balance/{emp_id}/{type_id}", response_model=LeaveBalanceResponse)
async def get_leave_balance(emp_id: int, type_id: int, db: AsyncSession = Depends(get_db)):
    service = LeaveBalanceService(db)
    result = await service.get_balance(emp_id, type_id)
    if not result:
        raise NotFoundException("Leave balance not found")
    return result
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.openapi_responses import NOT_FOUND_RESPONSE, VALIDATION_RESPONSE, DB_ERROR_RESPONSE
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.services.attendance_service import AttendanceService
from app.deps import get_current_user, require_role
from app.models.models import Employee, RoleEnum

router = APIRouter()


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED,
             responses={**VALIDATION_RESPONSE, **DB_ERROR_RESPONSE})
async def mark_attendance(payload: AttendanceCreate, db: AsyncSession = Depends(get_db),
                           current_user: Employee = Depends(get_current_user)):
    service = AttendanceService(db)
    return await service.mark_attendance(payload)


@router.get("/", response_model=list[AttendanceResponse], responses={**DB_ERROR_RESPONSE})
async def list_attendance(db: AsyncSession = Depends(get_db),
                           current_user: Employee = Depends(get_current_user)):
    service = AttendanceService(db)
    return await service.list_attendance()


@router.get("/employee/{emp_id}", response_model=list[AttendanceResponse], responses={**DB_ERROR_RESPONSE})
async def get_employee_attendance(emp_id: int, db: AsyncSession = Depends(get_db),
                                   current_user: Employee = Depends(get_current_user)):
    service = AttendanceService(db)
    return await service.get_by_employee(emp_id)


@router.get("/{att_id}", response_model=AttendanceResponse,
            responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE})
async def get_attendance(att_id: int, db: AsyncSession = Depends(get_db),
                          current_user: Employee = Depends(get_current_user)):
    service = AttendanceService(db)
    record = await service.get_attendance(att_id)
    if not record:
        raise NotFoundException("Attendance record not found")
    return record


@router.put("/{att_id}", response_model=AttendanceResponse,
            responses={**NOT_FOUND_RESPONSE, **VALIDATION_RESPONSE, **DB_ERROR_RESPONSE})
async def update_attendance(att_id: int, payload: AttendanceUpdate, db: AsyncSession = Depends(get_db),
                             current_user: Employee = Depends(get_current_user)):
    service = AttendanceService(db)
    record = await service.get_attendance(att_id)
    if not record:
        raise NotFoundException("Attendance record not found")

    is_admin = current_user.role == RoleEnum.ADMIN

    if not is_admin:
        if record.emp_id != current_user.emp_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                 detail="You can only edit your own attendance")
        if record.att_date != date.today():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                 detail="Attendance can only be edited on the same day it was marked")

    updated = await service.update_attendance(att_id, payload, current_user, is_admin)
    return updated


@router.patch("/{att_id}/approve", response_model=AttendanceResponse,
              responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE})
async def approve_attendance(att_id: int, db: AsyncSession = Depends(get_db),
                              current_user: Employee = Depends(require_role(RoleEnum.HR, RoleEnum.ADMIN))):
    service = AttendanceService(db)
    from app.models.models import LeaveStatus
    updated = await service.set_approval(att_id, LeaveStatus.APPROVED, current_user)
    if not updated:
        raise NotFoundException("Attendance record not found")
    return updated


@router.patch("/{att_id}/reject", response_model=AttendanceResponse,
              responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE})
async def reject_attendance(att_id: int, db: AsyncSession = Depends(get_db),
                             current_user: Employee = Depends(require_role(RoleEnum.HR, RoleEnum.ADMIN))):
    service = AttendanceService(db)
    from app.models.models import LeaveStatus
    updated = await service.set_approval(att_id, LeaveStatus.REJECTED, current_user)
    if not updated:
        raise NotFoundException("Attendance record not found")
    return updated


@router.delete("/{att_id}", status_code=status.HTTP_204_NO_CONTENT,
               responses={**NOT_FOUND_RESPONSE, **DB_ERROR_RESPONSE})
async def delete_attendance(att_id: int, db: AsyncSession = Depends(get_db),
                             current_user: Employee = Depends(require_role(RoleEnum.ADMIN))):
    service = AttendanceService(db)
    deleted = await service.delete_attendance(att_id)
    if not deleted:
        raise NotFoundException("Attendance record not found")
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.services.attendance_service import AttendanceService

router = APIRouter()


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(payload: AttendanceCreate, db: AsyncSession = Depends(get_db)):
    service = AttendanceService(db)
    return await service.mark_attendance(payload)


@router.get("/", response_model=list[AttendanceResponse])
async def list_attendance(db: AsyncSession = Depends(get_db)):
    service = AttendanceService(db)
    return await service.list_attendance()


@router.get("/employee/{emp_id}", response_model=list[AttendanceResponse])
async def get_employee_attendance(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = AttendanceService(db)
    return await service.get_by_employee(emp_id)


@router.get("/{att_id}", response_model=AttendanceResponse)
async def get_attendance(att_id: int, db: AsyncSession = Depends(get_db)):
    service = AttendanceService(db)
    record = await service.get_attendance(att_id)
    if not record:
        raise NotFoundException("Attendance record not found")
    return record


@router.put("/{att_id}", response_model=AttendanceResponse)
async def update_attendance(att_id: int, payload: AttendanceUpdate, db: AsyncSession = Depends(get_db)):
    service = AttendanceService(db)
    record = await service.update_attendance(att_id, payload)
    if not record:
        raise NotFoundException("Attendance record not found")
    return record


@router.delete("/{att_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance(att_id: int, db: AsyncSession = Depends(get_db)):
    service = AttendanceService(db)
    deleted = await service.delete_attendance(att_id)
    if not deleted:
        raise NotFoundException("Attendance record not found")
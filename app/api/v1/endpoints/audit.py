from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.audit import ApprovalLogCreate, ApprovalLogResponse, AuditLogCreate, AuditLogResponse
from app.services.audit_service import ApprovalLogService, AuditLogService

router = APIRouter()


@router.post("/approval-logs", response_model=ApprovalLogResponse, status_code=status.HTTP_201_CREATED)
async def create_approval_log(payload: ApprovalLogCreate, db: AsyncSession = Depends(get_db)):
    service = ApprovalLogService(db)
    return await service.create(payload)


@router.get("/approval-logs", response_model=list[ApprovalLogResponse])
async def list_approval_logs(db: AsyncSession = Depends(get_db)):
    service = ApprovalLogService(db)
    return await service.list_all()


@router.get("/approval-logs/leave/{leave_id}", response_model=list[ApprovalLogResponse])
async def get_approval_logs_for_leave(leave_id: int, db: AsyncSession = Depends(get_db)):
    service = ApprovalLogService(db)
    return await service.get_by_leave_request(leave_id)


@router.post("/audit-logs", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(payload: AuditLogCreate, db: AsyncSession = Depends(get_db)):
    service = AuditLogService(db)
    return await service.create(payload)


@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    service = AuditLogService(db)
    return await service.list_all()


@router.get("/audit-logs/employee/{emp_id}", response_model=list[AuditLogResponse])
async def get_audit_logs_for_employee(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = AuditLogService(db)
    return await service.get_by_employee(emp_id)
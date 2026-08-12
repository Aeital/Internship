import json
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.audit_repository import AuditLogRepository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate
from app.models.models import Employee, RoleEnum, LeaveStatus


def _snapshot(record) -> str:
    return json.dumps({
        "check_in": str(record.check_in) if record.check_in else None,
        "check_out": str(record.check_out) if record.check_out else None,
        "att_status": record.att_status.value,
        "approval_status": record.approval_status.value,
    })


class AttendanceService:
    def __init__(self, db: AsyncSession):
        self.repo = AttendanceRepository(db)
        self.audit_repo = AuditLogRepository(db)

    async def mark_attendance(self, data: AttendanceCreate):
        return await self.repo.create(data.model_dump())

    async def get_attendance(self, att_id: int):
        return await self.repo.get_by_id(att_id)

    async def list_attendance(self):
        return await self.repo.get_all()

    async def get_by_employee(self, emp_id: int):
        return await self.repo.get_by_employee(emp_id)

    async def update_attendance(self, att_id: int, data: AttendanceUpdate, current_user: Employee, is_admin: bool):
        record = await self.repo.get_by_id(att_id)
        if not record:
            return None

        old_value = _snapshot(record)
        payload = data.model_dump(exclude_unset=True)

        # Self-edits (staff/manager/hr editing their own record) go to pending approval.
        # Admin edits apply immediately (they're the top of the approval chain).
        payload["approval_status"] = (
            LeaveStatus.APPROVED if is_admin else LeaveStatus.PENDING
        )

        updated = await self.repo.update(att_id, payload)

        await self.audit_repo.create({
            "emp_id": current_user.emp_id,
            "action_type": "update",
            "table_affected": "attendance",
            "record_id": att_id,
            "old_value": old_value,
            "new_value": _snapshot(updated),
        })
        return updated

    async def set_approval(self, att_id: int, new_status: LeaveStatus, current_user: Employee):
        record = await self.repo.get_by_id(att_id)
        if not record:
            return None
        old_value = _snapshot(record)
        updated = await self.repo.update(att_id, {"approval_status": new_status})
        await self.audit_repo.create({
            "emp_id": current_user.emp_id,
            "action_type": "approve" if new_status == LeaveStatus.APPROVED else "reject",
            "table_affected": "attendance",
            "record_id": att_id,
            "old_value": old_value,
            "new_value": _snapshot(updated),
        })
        return updated

    async def delete_attendance(self, att_id: int):
        return await self.repo.delete(att_id)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services.department_service import DepartmentService

router = APIRouter()


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(payload: DepartmentCreate, db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    return await service.create_department(payload)


@router.get("/", response_model=list[DepartmentResponse])
async def list_departments(db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    return await service.list_departments()


@router.get("/{dept_id}", response_model=DepartmentResponse)
async def get_department(dept_id: int, db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    department = await service.get_department(dept_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/{dept_id}", response_model=DepartmentResponse)
async def update_department(dept_id: int, payload: DepartmentUpdate, db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    department = await service.update_department(dept_id, payload)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(dept_id: int, db: AsyncSession = Depends(get_db)):
    service = DepartmentService(db)
    deleted = await service.delete_department(dept_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Department not found")
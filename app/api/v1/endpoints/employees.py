from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.services.employee_service import EmployeeService

router = APIRouter()


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(payload: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    service = EmployeeService(db)
    return await service.create_employee(payload)


@router.get("/", response_model=list[EmployeeResponse])
async def list_employees(db: AsyncSession = Depends(get_db)):
    service = EmployeeService(db)
    return await service.list_employees()


@router.get("/{emp_id}", response_model=EmployeeResponse)
async def get_employee(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = EmployeeService(db)
    employee = await service.get_employee(emp_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/{emp_id}", response_model=EmployeeResponse)
async def update_employee(emp_id: int, payload: EmployeeUpdate, db: AsyncSession = Depends(get_db)):
    service = EmployeeService(db)
    employee = await service.update_employee(emp_id, payload)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.delete("/{emp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(emp_id: int, db: AsyncSession = Depends(get_db)):
    service = EmployeeService(db)
    deleted = await service.delete_employee(emp_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
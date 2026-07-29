from pydantic import BaseModel


class DepartmentBase(BaseModel):
    dept_name: str
    dept_description: str | None = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    dept_name: str | None = None
    dept_description: str | None = None


class DepartmentResponse(DepartmentBase):
    dept_id: int

    class Config:
        from_attributes = True
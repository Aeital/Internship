from pydantic import BaseModel


class DependentBase(BaseModel):
    emp_id: int
    dep_name: str
    relationship_type: str


class DependentCreate(DependentBase):
    pass


class DependentUpdate(BaseModel):
    dep_name: str | None = None
    relationship_type: str | None = None


class DependentResponse(DependentBase):
    dep_id: int

    class Config:
        from_attributes = True
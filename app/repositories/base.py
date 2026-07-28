from typing import TypeVar, Generic, Type, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Base
ModelType = TypeVar("ModelType", bound=Base)
class BaseRepository(Generic[ModelType]):#generic async repo, new entities extended wout modifying
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id: int) -> Optional[ModelType]:
        pk_col = self.model.__table__.c[self._pk_name()]
        result = await self.db.execute(select(self.model).where(pk_col == id))
        return result.scalar_one_or_none()

    async def get_all(self) -> List[ModelType]:
        result = await self.db.execute(select(self.model))
        return list(result.scalars().all())

    async def create(self, obj_data: dict) -> ModelType:
        obj = self.model(**obj_data)
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def update(self, id: int, obj_data: dict) -> Optional[ModelType]:
        obj = await self.get_by_id(id)
        if not obj:
            return None
        for key, value in obj_data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def delete(self, id: int) -> bool:
        obj = await self.get_by_id(id)
        if not obj:
            return False
        await self.db.delete(obj)
        await self.db.commit()
        return True

    def _pk_name(self) -> str:
        return self.model.__table__.primary_key.columns.keys()[0]
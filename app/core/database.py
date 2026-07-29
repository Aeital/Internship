from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings


class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_engine()
        return cls._instance

    def _init_engine(self):
        self.engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_size=10,          # connections kept open and reused
            max_overflow=20,       # extra connections allowed under load
            pool_pre_ping=True,    # checks connection is alive before using it
            pool_recycle=1800,     # recycle connections every 30 min (avoids stale connections)
        )
        self.SessionLocal = async_sessionmaker(
            bind=self.engine, class_=AsyncSession, expire_on_commit=False
        )


db = Database()
engine = db.engine
SessionLocal = db.SessionLocal


async def get_db():
    async with SessionLocal() as session:
        yield session
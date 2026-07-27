from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
class Database:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_engine()
        return cls._instance
    def _init_engine(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )
db = Database()
engine = db.engine
SessionLocal = db.SessionLocal
def get_db():
    """Dependency used in FastAPI routes to get a DB session per request."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
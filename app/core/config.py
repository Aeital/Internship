from pydantic_settings import BaseSettings
from functools import lru_cache
class Settings(BaseSettings):
    PROJECT_NAME: str = "Employee Management System"
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
@lru_cache()
def get_settings() -> Settings: #ensures setting is only instantiated once
    return Settings()
settings = get_settings()
from fastapi import FastAPI
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.api.v1.api import api_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title=settings.PROJECT_NAME)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "EMS backend is running"}
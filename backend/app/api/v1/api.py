from fastapi import APIRouter

from app.api.v1.endpoints.destinations import router as destinations_router
from app.api.v1.endpoints.routes import router as routes_router

api_router = APIRouter()
api_router.include_router(destinations_router)
api_router.include_router(routes_router)

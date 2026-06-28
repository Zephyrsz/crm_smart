from fastapi import APIRouter

from app.api.v1.routes import contacts, dashboard, health, templates

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])

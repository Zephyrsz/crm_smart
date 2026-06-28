from fastapi import APIRouter

from app.api.v1.routes import campaigns, companies, contacts, dashboard, health, imports, templates

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])

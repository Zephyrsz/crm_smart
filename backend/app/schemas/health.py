from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    api_version: str

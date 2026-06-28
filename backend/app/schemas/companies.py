from pydantic import BaseModel


class Company(BaseModel):
    id: str
    name: str
    industry: str
    size: str
    status: str
    progress: int
    contacts_hit: int
    last_contacted: str
    feasibility: str


class CompanyListResponse(BaseModel):
    total: int
    items: list[Company]

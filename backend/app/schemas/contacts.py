from pydantic import BaseModel, EmailStr


class Contact(BaseModel):
    id: str
    name: str
    title: str
    email: EmailStr
    company: str
    email_status: str
    stage: str


class ContactListResponse(BaseModel):
    total: int
    items: list[Contact]

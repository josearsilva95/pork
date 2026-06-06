from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None = None
    phone: str | None = None
    currency: str
    timezone: str
    is_active: bool
    is_verified: bool
    onboarding_done: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    currency: str | None = None
    timezone: str | None = None
    avatar_url: str | None = None
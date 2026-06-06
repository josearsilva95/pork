from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: str
    bank: str | None = None
    bank_code: str | None = None
    initial_balance: Decimal = Decimal("0")
    currency: str = "BRL"
    color: str = "#6366f1"
    icon: str | None = None
    household_id: UUID | None = None
    is_shared: bool = False
    include_in_net: bool = True


class AccountUpdate(BaseModel):
    name: str | None = None
    bank: str | None = None
    color: str | None = None
    icon: str | None = None
    is_active: bool | None = None
    include_in_net: bool | None = None


class AccountOut(BaseModel):
    id: UUID
    user_id: UUID
    household_id: UUID | None
    name: str
    type: str
    bank: str | None
    bank_code: str | None
    initial_balance: Decimal
    balance: Decimal
    currency: str
    color: str | None
    icon: str | None
    is_shared: bool
    is_active: bool
    include_in_net: bool
    created_at: datetime

    model_config = {"from_attributes": True}
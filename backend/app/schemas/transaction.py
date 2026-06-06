from __future__ import annotations

import datetime as dt
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TransactionCreate(BaseModel):
    account_id: UUID | None = None
    card_id: UUID | None = None
    category_id: UUID | None = None
    household_id: UUID | None = None
    type: str
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1, max_length=255)
    notes: str | None = None
    date: dt.date
    due_date: dt.date | None = None
    is_paid: bool = False
    is_recurring: bool = False
    recurrence_rule: str | None = None
    installment_num: int | None = None
    installment_total: int | None = None
    is_shared: bool = False

    @field_validator("description")
    @classmethod
    def sanitize_description(cls, v: str) -> str:
        return v.strip()


class TransactionUpdate(BaseModel):
    category_id: UUID | None = None
    amount: Decimal | None = None
    description: str | None = None
    notes: str | None = None
    date: dt.date | None = None
    is_paid: bool | None = None


class CategoryOut(BaseModel):
    id: UUID
    name: str
    icon: str | None
    color: str
    type: str

    model_config = {"from_attributes": True}


class TransactionOut(BaseModel):
    id: UUID
    user_id: UUID
    account_id: UUID | None
    card_id: UUID | None
    category_id: UUID | None
    household_id: UUID | None
    type: str
    amount: Decimal
    description: str
    notes: str | None
    date: dt.date
    due_date: dt.date | None
    paid_at: dt.datetime | None
    is_paid: bool
    is_recurring: bool
    installment_num: int | None
    installment_total: int | None
    is_shared: bool
    category: CategoryOut | None
    created_at: dt.datetime

    model_config = {"from_attributes": True}


class TransactionFilters(BaseModel):
    account_id: UUID | None = None
    category_id: UUID | None = None
    type: str | None = None
    start_date: dt.date | None = None
    end_date: dt.date | None = None
    is_paid: bool | None = None
    search: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
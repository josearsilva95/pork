from __future__ import annotations

import datetime as dt
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class InvestmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    ticker: str | None = None
    type: str
    broker: str | None = None
    account_id: UUID | None = None
    household_id: UUID | None = None
    quantity: Decimal = Field(ge=0)
    avg_price: Decimal = Field(ge=0)
    invested_amount: Decimal = Field(ge=0)
    current_price: Decimal | None = None
    current_value: Decimal | None = None
    maturity_date: dt.date | None = None


class InvestmentUpdate(BaseModel):
    name: str | None = None
    ticker: str | None = None
    broker: str | None = None
    quantity: Decimal | None = None
    avg_price: Decimal | None = None
    current_price: Decimal | None = None
    current_value: Decimal | None = None
    is_active: bool | None = None


class InvestmentOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    ticker: str | None
    type: str
    broker: str | None
    quantity: Decimal
    avg_price: Decimal
    current_price: Decimal | None
    invested_amount: Decimal
    current_value: Decimal | None
    return_rate: Decimal | None
    maturity_date: dt.date | None
    is_active: bool
    created_at: dt.datetime

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    total_balance: Decimal
    total_income_month: Decimal
    total_expense_month: Decimal
    net_worth: Decimal
    total_invested: Decimal
    monthly_evolution: list[dict]
    expense_by_category: list[dict]
    income_vs_expense: list[dict]
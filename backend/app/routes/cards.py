from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.card import Card
from app.models.user import User

router = APIRouter(prefix="/cards", tags=["Cards"])


class CardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    brand: str | None = None
    last_four: str | None = None
    limit_amount: Decimal = Decimal("0")
    closing_day: int = Field(ge=1, le=31)
    due_day: int = Field(ge=1, le=31)
    color: str = "#6366f1"
    account_id: UUID | None = None
    household_id: UUID | None = None
    is_shared: bool = False


class CardUpdate(BaseModel):
    name: str | None = None
    limit_amount: Decimal | None = None
    closing_day: int | None = None
    due_day: int | None = None
    color: str | None = None
    is_active: bool | None = None


class CardOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    brand: str | None
    last_four: str | None
    limit_amount: Decimal
    used_amount: Decimal
    closing_day: int
    due_day: int
    color: str
    is_shared: bool
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("", response_model=list[CardOut])
async def list_cards(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Card).where(
            Card.user_id == current_user.id,
            Card.is_active == True,
            Card.deleted_at.is_(None),
        ).order_by(Card.name)
    )
    return result.scalars().all()


@router.post("", response_model=CardOut, status_code=status.HTTP_201_CREATED)
async def create_card(
    payload: CardCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    card = Card(user_id=current_user.id, **payload.model_dump())
    db.add(card)
    await db.flush()
    await db.refresh(card)
    return card


@router.patch("/{card_id}", response_model=CardOut)
async def update_card(
    card_id: UUID,
    payload: CardUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Card).where(Card.id == card_id, Card.user_id == current_user.id, Card.deleted_at.is_(None))
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(card, field, value)
    await db.flush()
    await db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone
    result = await db.execute(
        select(Card).where(Card.id == card_id, Card.user_id == current_user.id, Card.deleted_at.is_(None))
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    card.deleted_at = datetime.now(timezone.utc)
    await db.flush()
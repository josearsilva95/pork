from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.investment import Investment
from app.models.user import User
from app.schemas.investment import InvestmentCreate, InvestmentOut, InvestmentUpdate

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.get("", response_model=list[InvestmentOut])
async def list_investments(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Investment).where(
            Investment.user_id == current_user.id,
            Investment.is_active == True,
            Investment.deleted_at.is_(None),
        ).order_by(Investment.name)
    )
    return result.scalars().all()


@router.post("", response_model=InvestmentOut, status_code=status.HTTP_201_CREATED)
async def create_investment(
    payload: InvestmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    inv = Investment(user_id=current_user.id, **payload.model_dump())
    db.add(inv)
    await db.flush()
    await db.refresh(inv)
    return inv


@router.get("/{inv_id}", response_model=InvestmentOut)
async def get_investment(
    inv_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Investment).where(
            Investment.id == inv_id,
            Investment.user_id == current_user.id,
            Investment.deleted_at.is_(None),
        )
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    return inv


@router.patch("/{inv_id}", response_model=InvestmentOut)
async def update_investment(
    inv_id: UUID,
    payload: InvestmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Investment).where(
            Investment.id == inv_id,
            Investment.user_id == current_user.id,
            Investment.deleted_at.is_(None),
        )
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(inv, field, value)
    await db.flush()
    await db.refresh(inv)
    return inv


@router.delete("/{inv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investment(
    inv_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone
    result = await db.execute(
        select(Investment).where(
            Investment.id == inv_id,
            Investment.user_id == current_user.id,
            Investment.deleted_at.is_(None),
        )
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    inv.deleted_at = datetime.now(timezone.utc)
    await db.flush()
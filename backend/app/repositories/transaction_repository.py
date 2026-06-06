from __future__ import annotations

from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionFilters


class TransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, tx_id: UUID, user_id: UUID) -> Transaction | None:
        result = await self.db.execute(
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.id == tx_id, Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def list_with_filters(self, user_id: UUID, filters: TransactionFilters) -> tuple[list[Transaction], int]:
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
        )

        if filters.account_id:
            query = query.where(Transaction.account_id == filters.account_id)
        if filters.category_id:
            query = query.where(Transaction.category_id == filters.category_id)
        if filters.type:
            query = query.where(Transaction.type == filters.type)
        if filters.start_date:
            query = query.where(Transaction.date >= filters.start_date)
        if filters.end_date:
            query = query.where(Transaction.date <= filters.end_date)
        if filters.is_paid is not None:
            query = query.where(Transaction.is_paid == filters.is_paid)
        if filters.search:
            query = query.where(Transaction.description.ilike(f"%{filters.search}%"))

        count_result = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar_one()

        query = query.order_by(Transaction.date.desc()).offset(
            (filters.page - 1) * filters.page_size
        ).limit(filters.page_size)

        result = await self.db.execute(query)
        return result.scalars().all(), total

    async def get_monthly_summary(self, user_id: UUID, year: int, month: int) -> dict:
        result = await self.db.execute(
            select(
                Transaction.type,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.deleted_at.is_(None),
                func.extract("year", Transaction.date) == year,
                func.extract("month", Transaction.date) == month,
            )
            .group_by(Transaction.type)
        )
        rows = result.all()
        return {row.type: row.total or Decimal("0") for row in rows}

    async def get_expense_by_category(self, user_id: UUID, year: int, month: int) -> list[dict]:
        result = await self.db.execute(
            select(
                Transaction.category_id,
                func.sum(Transaction.amount).label("total"),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                Transaction.deleted_at.is_(None),
                func.extract("year", Transaction.date) == year,
                func.extract("month", Transaction.date) == month,
            )
            .group_by(Transaction.category_id)
            .order_by(func.sum(Transaction.amount).desc())
        )
        return [{"category_id": row.category_id, "total": row.total} for row in result.all()]

    async def get_monthly_evolution(self, user_id: UUID, months: int = 12) -> list[dict]:
        result = await self.db.execute(
            select(
                func.date_trunc("month", Transaction.date).label("month"),
                Transaction.type,
                func.sum(Transaction.amount).label("total"),
            )
            .where(Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
            .group_by(func.date_trunc("month", Transaction.date), Transaction.type)
            .order_by(func.date_trunc("month", Transaction.date).desc())
            .limit(months * 3)
        )
        return [{"month": str(row.month), "type": row.type, "total": row.total} for row in result.all()]

    async def create(self, tx: Transaction) -> Transaction:
        self.db.add(tx)
        await self.db.flush()
        await self.db.refresh(tx)
        return tx

    async def soft_delete(self, tx: Transaction) -> None:
        from datetime import datetime, timezone
        tx.deleted_at = datetime.now(timezone.utc)
        await self.db.flush()
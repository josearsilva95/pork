from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.account import Account
from app.models.investment import Investment
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.investment import DashboardSummary


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tx_repo = TransactionRepository(db)

    async def get_summary(self, user_id: UUID) -> DashboardSummary:
        now = datetime.now(timezone.utc)
        year, month = now.year, now.month

        # Total account balances
        balance_result = await self.db.execute(
            select(func.sum(Account.balance))
            .where(
                Account.user_id == user_id,
                Account.is_active == True,
                Account.include_in_net == True,
                Account.deleted_at.is_(None),
            )
        )
        total_balance = balance_result.scalar_one() or Decimal("0")

        # Total invested
        invested_result = await self.db.execute(
            select(func.sum(Investment.invested_amount))
            .where(
                Investment.user_id == user_id,
                Investment.is_active == True,
                Investment.deleted_at.is_(None),
            )
        )
        total_invested = invested_result.scalar_one() or Decimal("0")

        current_value_result = await self.db.execute(
            select(func.sum(Investment.current_value))
            .where(
                Investment.user_id == user_id,
                Investment.is_active == True,
                Investment.deleted_at.is_(None),
            )
        )
        total_current_value = current_value_result.scalar_one() or total_invested

        # Monthly income/expense
        monthly = await self.tx_repo.get_monthly_summary(user_id, year, month)
        income = monthly.get("income", Decimal("0"))
        expense = monthly.get("expense", Decimal("0"))

        net_worth = total_balance + total_current_value

        # Evolution
        evolution_raw = await self.tx_repo.get_monthly_evolution(user_id, 12)
        evolution_map: dict[str, dict] = {}
        for row in evolution_raw:
            m = row["month"][:7]
            if m not in evolution_map:
                evolution_map[m] = {"month": m, "income": 0, "expense": 0}
            evolution_map[m][row["type"]] = float(row["total"])
        monthly_evolution = sorted(evolution_map.values(), key=lambda x: x["month"])

        # Category breakdown
        category_raw = await self.tx_repo.get_expense_by_category(user_id, year, month)
        expense_by_category = [
            {"category_id": str(r["category_id"]), "total": float(r["total"])}
            for r in category_raw
        ]

        # Income vs expense (last 6 months)
        income_vs_expense = monthly_evolution[-6:] if len(monthly_evolution) >= 6 else monthly_evolution

        return DashboardSummary(
            total_balance=total_balance,
            total_income_month=income,
            total_expense_month=expense,
            net_worth=net_worth,
            total_invested=total_invested,
            monthly_evolution=monthly_evolution,
            expense_by_category=expense_by_category,
            income_vs_expense=income_vs_expense,
        )
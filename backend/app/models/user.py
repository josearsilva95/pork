from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import SoftDeleteMixin, TimestampMixin


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="BRL")
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="America/Sao_Paulo")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    onboarding_done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    accounts: Mapped[list["Account"]] = relationship("Account", back_populates="user", lazy="select")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="user", lazy="select")
    investments: Mapped[list["Investment"]] = relationship("Investment", back_populates="user", lazy="select")
    household_memberships: Mapped[list["HouseholdMember"]] = relationship("HouseholdMember", back_populates="user", lazy="select")
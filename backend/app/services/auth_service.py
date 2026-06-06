from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from supabase import create_client, Client

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


def _supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


class AuthService:
    def __init__(self):
        self.supabase: Client = _supabase_client()

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        try:
            response = self.supabase.auth.admin.create_user({
                "email": payload.email.lower(),
                "password": payload.password,
                "email_confirm": False,
                "user_metadata": {"full_name": payload.full_name},
            })
        except Exception as exc:
            if "already registered" in str(exc).lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

        user_id = response.user.id
        access_token = create_access_token(user_id)
        refresh_token = create_refresh_token(user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def login(self, payload: LoginRequest) -> TokenResponse:
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": payload.email.lower(),
                "password": payload.password,
            })
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user_id = response.user.id
        access_token = create_access_token(user_id)
        refresh_token = create_refresh_token(user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Not a refresh token")
            user_id = payload["sub"]
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        new_access = create_access_token(user_id)
        new_refresh = create_refresh_token(user_id)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def forgot_password(self, email: str) -> None:
        try:
            self.supabase.auth.reset_password_email(email.lower())
        except Exception:
            pass  # Don't reveal if email exists
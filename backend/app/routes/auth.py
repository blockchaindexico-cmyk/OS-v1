from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.middleware.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    try:
        user = register_user(db, user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: str):
    payload = verify_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    access_token = create_access_token({"sub": user_id})
    new_refresh_token = create_refresh_token({"sub": user_id})

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

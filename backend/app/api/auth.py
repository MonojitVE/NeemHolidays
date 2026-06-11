from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.models import User
from app.schemas.schemas import UserCreate, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(user); db.commit(); db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.email, user.role), role=user.role, name=user.name)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return TokenResponse(access_token=create_access_token(user.email, user.role), role=user.role, name=user.name)

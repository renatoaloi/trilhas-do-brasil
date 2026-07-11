from fastapi import APIRouter, Depends
from src.application.dto import ProfileCreate, ProfileResponse
from src.application.services import ProfileService
from src.application.dependencies import (
    get_profile_service,
    get_current_user,
)
from src.domain.entities import User
from src.infrastructure.repositories import UserRepository
from src.infrastructure.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    profile_service: ProfileService = Depends(get_profile_service),
    db: Session = Depends(get_db),
):
    profile = profile_service.get_by_user_id(str(current_user.id))
    profile.user = (
        db.query(User).filter(User.id == current_user.id).first()
    )
    return profile


@router.put("/me", response_model=ProfileResponse)
async def upsert_my_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    profile_service: ProfileService = Depends(get_profile_service),
    db: Session = Depends(get_db),
):
    profile = profile_service.upsert(str(current_user.id), data)
    profile.user = (
        db.query(User).filter(User.id == current_user.id).first()
    )
    return profile

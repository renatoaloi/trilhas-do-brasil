import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from src.domain.entities import (
    User, Trail, Pivot, Profile, PivotType, TrailType, PivotMedia,
)
from src.domain.enums import DificuldadeEnum, CondicoesEnum


def _to_uuid(value: str) -> uuid.UUID:
    if isinstance(value, uuid.UUID):
        return value
    return uuid.UUID(value)


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == _to_uuid(user_id)).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user


class TrailRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, trail_id: str) -> Optional[Trail]:
        return self.db.query(Trail).filter(Trail.id == _to_uuid(trail_id)).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Trail]:
        return self.db.query(Trail).offset(skip).limit(limit).all()

    def get_by_name(self, name: str) -> List[Trail]:
        return (
            self.db.query(Trail)
            .filter(
                or_(
                    Trail.nome.ilike(f"%{name}%"),
                    Trail.nome_social.ilike(f"%{name}%"),
                )
            )
            .all()
        )

    def get_by_region(
        self, latitude: float, longitude: float, radius_km: float = 50
    ) -> List[Trail]:
        approx_deg = radius_km / 111.0
        return (
            self.db.query(Trail)
            .filter(
                Trail.latitude.between(
                    latitude - approx_deg, latitude + approx_deg
                ),
                Trail.longitude.between(
                    longitude - approx_deg, longitude + approx_deg
                ),
            )
            .all()
        )

    def create(self, trail: Trail) -> Trail:
        self.db.add(trail)
        self.db.commit()
        self.db.refresh(trail)
        return trail

    def update(self, trail: Trail) -> Trail:
        self.db.commit()
        self.db.refresh(trail)
        return trail

    def delete(self, trail_id: str) -> None:
        trail_id_uuid = _to_uuid(trail_id)
        trail = self.get_by_id(trail_id)
        if trail:
            self.db.query(PivotMedia).filter(
                PivotMedia.pivot_id.in_(
                    self.db.query(Pivot.id).filter(Pivot.trail_id == trail_id_uuid)
                )
            ).delete(synchronize_session=False)
            self.db.query(Pivot).filter(Pivot.trail_id == trail_id_uuid).delete(
                synchronize_session=False
            )
            self.db.delete(trail)
            self.db.commit()


class PivotRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, pivot_id: str) -> Optional[Pivot]:
        return self.db.query(Pivot).filter(Pivot.id == _to_uuid(pivot_id)).first()

    def get_by_trail(self, trail_id: str) -> List[Pivot]:
        return (
            self.db.query(Pivot)
            .filter(Pivot.trail_id == _to_uuid(trail_id))
            .order_by(Pivot.created_at.desc())
            .all()
        )

    def create(self, pivot: Pivot) -> Pivot:
        self.db.add(pivot)
        self.db.commit()
        self.db.refresh(pivot)
        return pivot

    def delete(self, pivot_id: str) -> None:
        pivot_id_uuid = _to_uuid(pivot_id)
        pivot = self.get_by_id(pivot_id)
        if pivot:
            self.db.query(PivotMedia).filter(
                PivotMedia.pivot_id == pivot_id_uuid
            ).delete(synchronize_session=False)
            self.db.delete(pivot)
            self.db.commit()


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str) -> Optional[Profile]:
        return (
            self.db.query(Profile).filter(Profile.user_id == _to_uuid(user_id)).first()
        )

    def create(self, profile: Profile) -> Profile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, profile: Profile) -> Profile:
        self.db.commit()
        self.db.refresh(profile)
        return profile


class PivotTypeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[PivotType]:
        return self.db.query(PivotType).all()

    def get_by_id(self, pivot_type_id: str) -> Optional[PivotType]:
        return (
            self.db.query(PivotType)
            .filter(PivotType.id == _to_uuid(pivot_type_id))
            .first()
        )


class TrailTypeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[TrailType]:
        return self.db.query(TrailType).all()

    def get_by_id(self, trail_type_id: str) -> Optional[TrailType]:
        return (
            self.db.query(TrailType)
            .filter(TrailType.id == _to_uuid(trail_type_id))
            .first()
        )
